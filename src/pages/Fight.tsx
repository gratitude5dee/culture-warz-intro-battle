import React, { useEffect, useReducer, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pause, Play, Wifi, WifiOff } from "lucide-react";
import EndMenu from "@/components/EndMenu";
import GameHUD from "@/components/GameHUD";
import FightCharacter from "@/components/FightCharacter";
import DebugInfo from "@/components/DebugInfo";
import PauseMenu from "@/components/PauseMenu";
import { useGameInput } from "@/hooks/useGameInput";
import { gameReducer, initialGameState } from "@/reducers/gameReducer";
import { handlePlayerIntents } from "@/utils/gameEngine";
import { stageBgs, STAGE_HEIGHT, characterNames } from "@/types/gameTypes";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

// Define the types for our location state
interface FightState {
  matchId: string;
  p1: string;
  p2: string;
  stage: string;
  isPlayer1: boolean;
}

// Define the match type with proper relationship structures
interface MatchWithProfiles {
  id: string;
  current_state: any;
  player1: {
    username: string;
  } | null;
  player2: {
    username: string;
  } | null;
  // Add other match fields as needed
}

const Fight = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const [isConnected, setIsConnected] = useState(true);
  const [opponentName, setOpponentName] = useState("Opponent");
  const [inputSequence, setInputSequence] = useState(0);
  const { user } = useAuth();
  
  // Get the fight state from location, or use defaults if not available
  const { matchId, p1, p2, stage, isPlayer1 } = (location.state as FightState) || { 
    matchId: null, 
    p1: "drake", 
    p2: "kendrick", 
    stage: "sf",
    isPlayer1: true 
  };
  
  // If no matchId is provided, redirect to character select
  useEffect(() => {
    if (!matchId || !user) {
      toast.error("Match not found");
      navigate("/select");
    }
  }, [matchId, navigate, user]);
  
  // Use reducer for game state
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState(STAGE_HEIGHT));
  
  // Destructure game state for easier access
  const {
    player1Pos, player2Pos,
    player1Health, player2Health,
    player1State, player2State,
    activeHitboxesP1, activeHitboxesP2,
    gameTimer, isPaused, matchOver, winner,
    player1Intent, player2Intent
  } = gameState;
  
  // Setup keyboard input handling - we only control our character (P1 or P2)
  const { p1Keys, p2Keys, processInputs } = useGameInput(matchOver, isPaused, player1State, player2State, dispatch);
  
  // Get opponent's username
  useEffect(() => {
    if (!matchId) return;
    
    const getMatchDetails = async () => {
      try {
        // Fixed query with proper column hints for relationships
        const { data: match, error } = await supabase
          .from('matches')
          .select('*, player1:player1_id(username), player2:player2_id(username)')
          .eq('id', matchId)
          .single();
          
        if (error) {
          console.error("Error fetching match details:", error);
          return;
        }
          
        if (match) {
          // Properly access the username from the related profile with type assertion
          const typedMatch = match as unknown as MatchWithProfiles;
          const opponentProfile = isPlayer1 ? typedMatch.player2 : typedMatch.player1;
          setOpponentName(opponentProfile?.username || "Opponent");
          
          // Initialize with match state if available
          if (match.current_state) {
            dispatch({ 
              type: 'APPLY_AUTHORITATIVE_STATE', 
              state: match.current_state 
            });
          }
        }
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };
    
    getMatchDetails();
  }, [matchId, isPlayer1]);
  
  // Subscribe to match updates
  useEffect(() => {
    if (!matchId) return;
    
    const matchChannel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          const updatedMatch = payload.new;
          
          if (updatedMatch.current_state) {
            // Apply the authoritative state from the server
            dispatch({ 
              type: 'APPLY_AUTHORITATIVE_STATE', 
              state: updatedMatch.current_state 
            });
          }
          
          // Check if match has ended
          if (updatedMatch.status !== 'active' && updatedMatch.status !== 'waiting') {
            let winnerPlayer: "P1" | "P2" | "Draw" = "Draw";
            
            if (updatedMatch.status === 'p1_won') {
              winnerPlayer = "P1";
            } else if (updatedMatch.status === 'p2_won') {
              winnerPlayer = "P2";
            }
            
            dispatch({ 
              type: 'END_MATCH', 
              winner: winnerPlayer 
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });
      
    return () => {
      if (matchChannel) {
        supabase.removeChannel(matchChannel);
      }
    };
  }, [matchId]);
  
  // Send player input to server
  const sendPlayerIntent = async (intent: typeof player1Intent, playerNumber: 'P1' | 'P2') => {
    if (!matchId || !user || matchOver) return;
    
    try {
      const nextSequence = inputSequence + 1;
      setInputSequence(nextSequence);
      
      await supabase.functions.invoke('process-game-tick', {
        body: {
          matchId,
          playerId: user.id,
          playerNumber: isPlayer1 ? 'P1' : 'P2',
          intent,
          sequenceNumber: nextSequence
        }
      });
    } catch (error) {
      console.error("Error sending player intent:", error);
    }
  };
  
  // Game loop
  const gameTick = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds
      
      if (!isPaused && !matchOver) {
        // Process local inputs
        processInputs();
        
        // Send our intent to the server for authoritative processing
        if (isPlayer1) {
          sendPlayerIntent(player1Intent, 'P1');
        } else {
          sendPlayerIntent(player2Intent, 'P2');
        }
        
        // For smooth local gameplay, we still update positions locally
        // These will be corrected by the server's authoritative state
        dispatch({ type: 'UPDATE_POSITION', deltaTime });
      }
    }
    
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(gameTick);
  };
  
  // Start and stop game loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameTick);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPaused, matchOver]);
  
  // Cleanup match when unmounting
  useEffect(() => {
    return () => {
      if (user && !matchOver) {
        // Update user status back to online
        supabase
          .from('profiles')
          .update({ status: 'online' })
          .eq('id', user.id)
          .then();
      }
    };
  }, [user, matchOver]);
  
  // Handle rematch
  const handlePlayAgain = async () => {
    // Navigate back to character select
    navigate("/select");
  };
  
  if (matchOver && winner) {
    return (
      <div 
        className="relative w-full h-screen overflow-hidden scanlines noise-bg" 
        style={{
          backgroundImage: `url(${stageBgs[stage]}?auto=format&fit=crop&w=1920&h=1080)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Keep the UI visible in the background */}
        <div className="opacity-50">
          <GameHUD 
            p1={p1}
            p2={p2}
            player1Health={player1Health}
            player2Health={player2Health}
            gameTimer={gameTimer}
          />
          
          {/* Character Area */}
          <div className="absolute inset-0 flex items-center justify-between px-20 z-10">
            {/* P1 Character */}
            <div className="h-64 w-48 bg-arcade-accent/30 border-2 border-arcade-accent relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-pixel text-arcade-accent">{characterNames[p1]}</p>
              </div>
            </div>
            
            {/* P2 Character */}
            <div className="h-64 w-48 bg-arcade-purple/30 border-2 border-arcade-purple relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-pixel text-arcade-purple">{characterNames[p2]}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* End Menu Overlay */}
        <EndMenu 
          winner={winner} 
          onPlayAgain={handlePlayAgain} 
          p1Name={isPlayer1 ? `YOU (${characterNames[p1]})` : opponentName}
          p2Name={isPlayer1 ? opponentName : `YOU (${characterNames[p2]})`}
        />
      </div>
    );
  }
  
  return (
    <div 
      className="relative w-full h-screen overflow-hidden scanlines noise-bg" 
      style={{
        backgroundImage: `url(${stageBgs[stage]}?auto=format&fit=crop&w=1920&h=1080)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Connection Status */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-arcade-dark/80 px-3 py-1 rounded">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-400" />
        )}
        <span className="font-pixel text-xs">
          {isConnected ? "CONNECTED" : "RECONNECTING..."}
        </span>
      </div>
      
      {/* HUD - Top */}
      <GameHUD 
        p1={isPlayer1 ? `YOU (${p1})` : opponentName}
        p2={isPlayer1 ? opponentName : `YOU (${p2})`}
        player1Health={player1Health}
        player2Health={player2Health}
        gameTimer={gameTimer}
      />
      
      {/* Character Area - Middle */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-full max-w-[800px] h-[300px]">
          {/* Player Characters */}
          <FightCharacter 
            player="P1"
            position={player1Pos}
            state={player1State}
            activeHitboxes={activeHitboxesP1}
          />
          
          <FightCharacter 
            player="P2"
            position={player2Pos}
            state={player2State}
            activeHitboxes={activeHitboxesP2}
          />
        </div>
      </div>
      
      {/* Pause Button */}
      <div className="absolute top-4 right-4 z-30">
        <Sheet open={isPaused} onOpenChange={(open) => dispatch({ type: 'TOGGLE_PAUSE' })}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="bg-arcade-dark/70 border-2 border-arcade-accent hover:bg-arcade-dark/90"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </SheetTrigger>
          <PauseMenu dispatch={dispatch} />
        </Sheet>
      </div>
      
      {/* Debug Info */}
      <DebugInfo gameState={gameState} />
    </div>
  );
};

export default Fight;
