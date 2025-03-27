import React, { useEffect, useReducer, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import EndMenu from "@/components/EndMenu";
import GameHUD from "@/components/GameHUD";
import FightCharacter from "@/components/FightCharacter";
import DebugInfo from "@/components/DebugInfo";
import PauseMenu from "@/components/PauseMenu";
import { useGameInput } from "@/hooks/useGameInput";
import { gameReducer, initialGameState } from "@/reducers/gameReducer";
import { handleInputP1, handleInputP2, checkCollisions } from "@/utils/gameEngine";
import { stageBgs, STAGE_HEIGHT, characterNames } from "@/types/gameTypes";

// Define the types for our location state
interface FightState {
  p1: string;
  p2: string;
  stage: string;
}

const Fight = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  // Get the fight state from location, or use defaults if not available
  const { p1, p2, stage } = (location.state as FightState) || { 
    p1: "drake", 
    p2: "kendrick", 
    stage: "sf" 
  };
  
  // Use reducer for game state
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState(STAGE_HEIGHT));
  
  // Destructure game state for easier access
  const {
    player1Pos, player2Pos,
    player1Health, player2Health,
    player1State, player2State,
    activeHitboxesP1, activeHitboxesP2,
    gameTimer, isPaused, matchOver, winner
  } = gameState;
  
  // Setup keyboard input handling
  const { p1Keys, p2Keys } = useGameInput(matchOver, isPaused, player1State, player2State, dispatch);
  
  // Game loop
  const gameTick = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds
      
      if (!isPaused && !matchOver) {
        // Handle input based on current key states
        handleInputP1(p1Keys, gameState, dispatch);
        handleInputP2(p2Keys, gameState, dispatch);
        
        // Update physics - Apply gravity, update positions
        dispatch({ type: 'UPDATE_POSITION', deltaTime });
        
        // Check for hits
        checkCollisions(gameState, dispatch);
        
        // Update timer
        dispatch({ type: 'UPDATE_TIMER', deltaTime: deltaTime });
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
  
  // Handle play again / rematch
  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_MATCH' });
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
          p1Name={characterNames[p1]}
          p2Name={characterNames[p2]}
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
      {/* HUD - Top */}
      <GameHUD 
        p1={p1}
        p2={p2}
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
