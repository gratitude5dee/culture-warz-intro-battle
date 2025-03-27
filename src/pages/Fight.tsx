
import React, { useState, useEffect, useReducer, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import EndMenu from "@/components/EndMenu";

// Define the types for our location state
interface FightState {
  p1: string;
  p2: string;
  stage: string;
}

// Map character IDs to display names
const characterNames: Record<string, string> = {
  drake: "DRAKE",
  kendrick: "KENDRICK",
  future: "FUTURE",
  meg: "MEG",
  nicki: "NICKI",
};

// Map stage IDs to background images
const stageBgs: Record<string, string> = {
  sf: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
  la: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  nyc: "https://images.unsplash.com/photo-1487252665478-49b61b47f302",
};

// Define player state types
type PlayerState = 'idle' | 'walking' | 'jumping' | 'attacking' | 'blocking' | 'hit' | 'knockedDown';

// Define hitbox type
interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  type: 'light' | 'medium' | 'heavy' | 'special';
}

// Define position and velocity types
interface Vector2D {
  x: number;
  y: number;
}

// Define game state interface
interface GameState {
  player1Pos: Vector2D;
  player2Pos: Vector2D;
  player1Velocity: Vector2D;
  player2Velocity: Vector2D;
  player1Health: number;
  player2Health: number;
  player1State: PlayerState;
  player2State: PlayerState;
  activeHitboxesP1: Hitbox[];
  activeHitboxesP2: Hitbox[];
  gameTimer: number;
  isPaused: boolean;
  matchOver: boolean;
  winner: "P1" | "P2" | "Draw" | null;
}

// Define game action types
type GameAction =
  | { type: 'MOVE_PLAYER', player: 'P1' | 'P2', velocity: Vector2D }
  | { type: 'UPDATE_POSITION', deltaTime: number }
  | { type: 'SET_PLAYER_STATE', player: 'P1' | 'P2', state: PlayerState }
  | { type: 'START_ATTACK', player: 'P1' | 'P2', attackType: 'light' | 'medium' | 'heavy' | 'special' }
  | { type: 'CLEAR_HITBOXES', player: 'P1' | 'P2' }
  | { type: 'APPLY_DAMAGE', player: 'P1' | 'P2', damage: number }
  | { type: 'UPDATE_TIMER', deltaTime: number }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'END_MATCH', winner: "P1" | "P2" | "Draw" }
  | { type: 'RESET_MATCH' };

// Constants for game mechanics
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 300;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 64;

// Game state reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE_PLAYER':
      if (action.player === 'P1') {
        return { ...state, player1Velocity: action.velocity };
      } else {
        return { ...state, player2Velocity: action.velocity };
      }
    
    case 'UPDATE_POSITION':
      // Calculate new positions based on velocities
      const newP1Pos = {
        x: Math.max(0, Math.min(STAGE_WIDTH - PLAYER_WIDTH, state.player1Pos.x + state.player1Velocity.x * action.deltaTime)),
        y: Math.max(STAGE_HEIGHT - PLAYER_HEIGHT, Math.min(STAGE_HEIGHT, state.player1Pos.y + state.player1Velocity.y * action.deltaTime))
      };
      
      const newP2Pos = {
        x: Math.max(0, Math.min(STAGE_WIDTH - PLAYER_WIDTH, state.player2Pos.x + state.player2Velocity.x * action.deltaTime)),
        y: Math.max(STAGE_HEIGHT - PLAYER_HEIGHT, Math.min(STAGE_HEIGHT, state.player2Pos.y + state.player2Velocity.y * action.deltaTime))
      };
      
      // Apply gravity if in air
      const newP1Velocity = {
        x: state.player1Velocity.x,
        y: state.player1Pos.y < STAGE_HEIGHT - PLAYER_HEIGHT ? state.player1Velocity.y + GRAVITY : 0
      };
      
      const newP2Velocity = {
        x: state.player2Velocity.x,
        y: state.player2Pos.y < STAGE_HEIGHT - PLAYER_HEIGHT ? state.player2Velocity.y + GRAVITY : 0
      };
      
      return {
        ...state,
        player1Pos: newP1Pos,
        player2Pos: newP2Pos,
        player1Velocity: newP1Velocity,
        player2Velocity: newP2Velocity
      };
      
    case 'SET_PLAYER_STATE':
      if (action.player === 'P1') {
        return { ...state, player1State: action.state };
      } else {
        return { ...state, player2State: action.state };
      }
      
    case 'START_ATTACK':
      // Create a sample hitbox for the attack
      const newHitbox: Hitbox = {
        x: action.player === 'P1' ? state.player1Pos.x + PLAYER_WIDTH : state.player2Pos.x - 20,
        y: state.player1Pos.y + 20,
        width: 30,
        height: 20,
        damage: action.attackType === 'light' ? 5 : action.attackType === 'medium' ? 10 : 15,
        type: action.attackType
      };
      
      if (action.player === 'P1') {
        return {
          ...state,
          player1State: 'attacking',
          activeHitboxesP1: [...state.activeHitboxesP1, newHitbox]
        };
      } else {
        return {
          ...state,
          player2State: 'attacking',
          activeHitboxesP2: [...state.activeHitboxesP2, newHitbox]
        };
      }
      
    case 'CLEAR_HITBOXES':
      if (action.player === 'P1') {
        return { ...state, activeHitboxesP1: [] };
      } else {
        return { ...state, activeHitboxesP2: [] };
      }
      
    case 'APPLY_DAMAGE':
      if (action.player === 'P1') {
        const newHealth = Math.max(0, state.player1Health - action.damage);
        const matchOver = newHealth <= 0;
        return {
          ...state,
          player1Health: newHealth,
          player1State: action.damage > 10 ? 'knockedDown' : 'hit',
          matchOver: matchOver,
          winner: matchOver ? 'P2' : state.winner
        };
      } else {
        const newHealth = Math.max(0, state.player2Health - action.damage);
        const matchOver = newHealth <= 0;
        return {
          ...state,
          player2Health: newHealth,
          player2State: action.damage > 10 ? 'knockedDown' : 'hit',
          matchOver: matchOver,
          winner: matchOver ? 'P1' : state.winner
        };
      }
      
    case 'UPDATE_TIMER':
      if (state.isPaused || state.matchOver) return state;
      
      const newTimer = state.gameTimer - action.deltaTime;
      if (newTimer <= 0) {
        // Determine winner based on health
        let timeUpWinner: "P1" | "P2" | "Draw";
        if (state.player1Health > state.player2Health) {
          timeUpWinner = "P1";
        } else if (state.player2Health > state.player1Health) {
          timeUpWinner = "P2";
        } else {
          timeUpWinner = "Draw";
        }
        
        return {
          ...state,
          gameTimer: 0,
          matchOver: true,
          winner: timeUpWinner
        };
      }
      
      return { ...state, gameTimer: newTimer };
      
    case 'TOGGLE_PAUSE':
      return { ...state, isPaused: !state.isPaused };
      
    case 'END_MATCH':
      return {
        ...state,
        matchOver: true,
        winner: action.winner
      };
      
    case 'RESET_MATCH':
      return {
        ...state,
        player1Health: 100,
        player2Health: 100,
        player1Pos: { x: 100, y: STAGE_HEIGHT - PLAYER_HEIGHT },
        player2Pos: { x: STAGE_WIDTH - 100 - PLAYER_WIDTH, y: STAGE_HEIGHT - PLAYER_HEIGHT },
        player1Velocity: { x: 0, y: 0 },
        player2Velocity: { x: 0, y: 0 },
        player1State: 'idle',
        player2State: 'idle',
        activeHitboxesP1: [],
        activeHitboxesP2: [],
        gameTimer: 99,
        isPaused: false,
        matchOver: false,
        winner: null
      };
      
    default:
      return state;
  }
};

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
  
  // Define initial game state
  const initialGameState: GameState = {
    player1Pos: { x: 100, y: STAGE_HEIGHT - PLAYER_HEIGHT },
    player2Pos: { x: STAGE_WIDTH - 100 - PLAYER_WIDTH, y: STAGE_HEIGHT - PLAYER_HEIGHT },
    player1Velocity: { x: 0, y: 0 },
    player2Velocity: { x: 0, y: 0 },
    player1Health: 100,
    player2Health: 100,
    player1State: 'idle',
    player2State: 'idle',
    activeHitboxesP1: [],
    activeHitboxesP2: [],
    gameTimer: 99,
    isPaused: false,
    matchOver: false,
    winner: null
  };
  
  // Player input states
  const [p1Keys, setP1Keys] = useState<Set<string>>(new Set());
  const [p2Keys, setP2Keys] = useState<Set<string>>(new Set());
  
  // Use reducer for game state
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  // Destructure game state for easier access
  const {
    player1Pos, player2Pos,
    player1Health, player2Health,
    player1State, player2State,
    gameTimer, isPaused, matchOver, winner
  } = gameState;
  
  // Handle key down events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (matchOver) return;
    
    if (e.key === "Escape") {
      dispatch({ type: 'TOGGLE_PAUSE' });
      return;
    }
    
    // Test key for ending match
    if (e.key === "o" && !isPaused) {
      dispatch({ type: 'END_MATCH', winner: Math.random() > 0.5 ? "P1" : "P2" });
      return;
    }
    
    // Player 1 keys (WASD + attack keys)
    if (['w', 'a', 's', 'd', 'u', 'i', 'o', 'j', 'k', 'l'].includes(e.key.toLowerCase())) {
      setP1Keys(prev => new Set([...prev, e.key.toLowerCase()]));
    }
    
    // Player 2 keys (Arrows + numpad)
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', '1', '2', '3', '4', '5', '6'].includes(e.key.toLowerCase())) {
      setP2Keys(prev => new Set([...prev, e.key.toLowerCase()]));
    }
  };
  
  // Handle key up events
  const handleKeyUp = (e: KeyboardEvent) => {
    // Player 1 keys
    if (['w', 'a', 's', 'd', 'u', 'i', 'o', 'j', 'k', 'l'].includes(e.key.toLowerCase())) {
      setP1Keys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    }
    
    // Player 2 keys
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', '1', '2', '3', '4', '5', '6'].includes(e.key.toLowerCase())) {
      setP2Keys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    }
  };
  
  // Process player 1 input
  const handleInputP1 = () => {
    if (isPaused || matchOver || player1State === 'hit' || player1State === 'knockedDown') return;
    
    // Handle movement
    let velocityX = 0;
    
    if (p1Keys.has('a')) {
      velocityX = -MOVE_SPEED;
      if (player1State !== 'jumping' && player1State !== 'attacking') {
        dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'walking' });
      }
    } else if (p1Keys.has('d')) {
      velocityX = MOVE_SPEED;
      if (player1State !== 'jumping' && player1State !== 'attacking') {
        dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'walking' });
      }
    } else if (player1State === 'walking') {
      dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'idle' });
    }
    
    // Handle jumping
    if (p1Keys.has('w') && player1State !== 'jumping' && player1State !== 'attacking') {
      dispatch({ type: 'MOVE_PLAYER', player: 'P1', velocity: { x: velocityX, y: JUMP_FORCE } });
      dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'jumping' });
    } else {
      dispatch({ type: 'MOVE_PLAYER', player: 'P1', velocity: { x: velocityX, y: gameState.player1Velocity.y } });
    }
    
    // Handle attacks
    if (player1State !== 'attacking') {
      if (p1Keys.has('u')) {
        dispatch({ type: 'START_ATTACK', player: 'P1', attackType: 'light' });
        // After attack animation time, clear hitboxes and return to idle
        setTimeout(() => {
          dispatch({ type: 'CLEAR_HITBOXES', player: 'P1' });
          dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'idle' });
        }, 300);
      } else if (p1Keys.has('i')) {
        dispatch({ type: 'START_ATTACK', player: 'P1', attackType: 'medium' });
        setTimeout(() => {
          dispatch({ type: 'CLEAR_HITBOXES', player: 'P1' });
          dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'idle' });
        }, 500);
      } else if (p1Keys.has('o')) {
        dispatch({ type: 'START_ATTACK', player: 'P1', attackType: 'heavy' });
        setTimeout(() => {
          dispatch({ type: 'CLEAR_HITBOXES', player: 'P1' });
          dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'idle' });
        }, 700);
      }
    }
    
    // Handle blocking
    if (p1Keys.has('s') && player1State !== 'jumping' && player1State !== 'attacking') {
      dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'blocking' });
    } else if (player1State === 'blocking' && !p1Keys.has('s')) {
      dispatch({ type: 'SET_PLAYER_STATE', player: 'P1', state: 'idle' });
    }
  };
  
  // Process player 2 input
  const handleInputP2 = () => {
    if (isPaused || matchOver || player2State === 'hit' || player2State === 'knockedDown') return;
    
    // Handle movement
    let velocityX = 0;
    
    if (p2Keys.has('arrowleft')) {
      velocityX = -MOVE_SPEED;
      if (player2State !== 'jumping' && player2State !== 'attacking') {
        dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'walking' });
      }
    } else if (p2Keys.has('arrowright')) {
      velocityX = MOVE_SPEED;
      if (player2State !== 'jumping' && player2State !== 'attacking') {
        dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'walking' });
      }
    } else if (player2State === 'walking') {
      dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'idle' });
    }
    
    // Handle jumping
    if (p2Keys.has('arrowup') && player2State !== 'jumping' && player2State !== 'attacking') {
      dispatch({ type: 'MOVE_PLAYER', player: 'P2', velocity: { x: velocityX, y: JUMP_FORCE } });
      dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'jumping' });
    } else {
      dispatch({ type: 'MOVE_PLAYER', player: 'P2', velocity: { x: velocityX, y: gameState.player2Velocity.y } });
    }
    
    // Handle attacks
    if (player2State !== 'attacking') {
      if (p2Keys.has('1')) {
        dispatch({ type: 'START_ATTACK', player: 'P2', attackType: 'light' });
        setTimeout(() => {
          dispatch({ type: 'CLEAR_HITBOXES', player: 'P2' });
          dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'idle' });
        }, 300);
      } else if (p2Keys.has('2')) {
        dispatch({ type: 'START_ATTACK', player: 'P2', attackType: 'medium' });
        setTimeout(() => {
          dispatch({ type: 'CLEAR_HITBOXES', player: 'P2' });
          dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'idle' });
        }, 500);
      } else if (p2Keys.has('3')) {
        dispatch({ type: 'START_ATTACK', player: 'P2', attackType: 'heavy' });
        setTimeout(() => {
          dispatch({ type: 'CLEAR_HITBOXES', player: 'P2' });
          dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'idle' });
        }, 700);
      }
    }
    
    // Handle blocking
    if (p2Keys.has('arrowdown') && player2State !== 'jumping' && player2State !== 'attacking') {
      dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'blocking' });
    } else if (player2State === 'blocking' && !p2Keys.has('arrowdown')) {
      dispatch({ type: 'SET_PLAYER_STATE', player: 'P2', state: 'idle' });
    }
  };
  
  // Check for collisions between hitboxes and players
  const checkCollisions = () => {
    // Check P1 hitboxes against P2
    gameState.activeHitboxesP1.forEach(hitbox => {
      // Simple AABB collision check
      if (
        player2State !== 'blocking' &&
        hitbox.x < player2Pos.x + PLAYER_WIDTH &&
        hitbox.x + hitbox.width > player2Pos.x &&
        hitbox.y < player2Pos.y + PLAYER_HEIGHT &&
        hitbox.y + hitbox.height > player2Pos.y
      ) {
        applyDamage('P2', hitbox.damage);
      }
    });
    
    // Check P2 hitboxes against P1
    gameState.activeHitboxesP2.forEach(hitbox => {
      if (
        player1State !== 'blocking' &&
        hitbox.x < player1Pos.x + PLAYER_WIDTH &&
        hitbox.x + hitbox.width > player1Pos.x &&
        hitbox.y < player1Pos.y + PLAYER_HEIGHT &&
        hitbox.y + hitbox.height > player1Pos.y
      ) {
        applyDamage('P1', hitbox.damage);
      }
    });
  };
  
  // Apply damage to a player
  const applyDamage = (player: 'P1' | 'P2', damage: number) => {
    dispatch({ type: 'APPLY_DAMAGE', player, damage });
    
    // After hit stun, return to idle
    setTimeout(() => {
      dispatch({ type: 'SET_PLAYER_STATE', player, state: 'idle' });
    }, damage > 10 ? 1000 : 500);
  };
  
  // Game loop
  const gameTick = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds
      
      if (!isPaused && !matchOver) {
        // Handle input based on current key states
        handleInputP1();
        handleInputP2();
        
        // Update physics - Apply gravity, update positions
        dispatch({ type: 'UPDATE_POSITION', deltaTime });
        
        // Check for hits
        checkCollisions();
        
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
  
  // Setup event listeners for keyboard
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, matchOver, player1State, player2State]);
  
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
          {/* HUD - Top */}
          <div className="absolute top-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-20">
            {/* P1 Health and Info */}
            <div className="flex items-center gap-3 w-1/3">
              <Card className="h-16 w-16 bg-arcade-dark/50 border-2 border-arcade-accent overflow-hidden flex items-center justify-center pixel-corners">
                <img 
                  src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=80&h=80`} 
                  alt={characterNames[p1]}
                  className="w-full h-full object-cover"
                />
              </Card>
              <div className="flex-grow">
                <p className="font-pixel text-sm text-white mb-1">{characterNames[p1]}</p>
                <div className="relative">
                  <Progress 
                    value={player1Health} 
                    className="h-6 bg-arcade-dark/50 border-2 border-arcade-accent"
                  />
                  <div 
                    className="absolute top-0 left-0 h-full bg-arcade-neon" 
                    style={{ width: `${player1Health}%`, transition: "width 0.3s" }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="font-pixel text-4xl text-white bg-arcade-dark/70 px-6 py-2 border-2 border-arcade-accent">
              {Math.ceil(gameTimer).toString().padStart(2, '0')}
            </div>
            
            {/* P2 Health and Info */}
            <div className="flex items-center gap-3 w-1/3 flex-row-reverse">
              <Card className="h-16 w-16 bg-arcade-dark/50 border-2 border-arcade-purple overflow-hidden flex items-center justify-center pixel-corners">
                <img 
                  src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=80&h=80`} 
                  alt={characterNames[p2]}
                  className="w-full h-full object-cover"
                />
              </Card>
              <div className="flex-grow">
                <p className="font-pixel text-sm text-white mb-1 text-right">{characterNames[p2]}</p>
                <div className="relative">
                  <Progress 
                    value={player2Health} 
                    className="h-6 bg-arcade-dark/50 border-2 border-arcade-purple"
                  />
                  <div 
                    className="absolute top-0 right-0 h-full bg-arcade-purple" 
                    style={{ width: `${player2Health}%`, transition: "width 0.3s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Character Area - Middle */}
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
      <div className="absolute top-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-20">
        {/* P1 Health and Info */}
        <div className="flex items-center gap-3 w-1/3">
          <Card className="h-16 w-16 bg-arcade-dark/50 border-2 border-arcade-accent overflow-hidden flex items-center justify-center pixel-corners">
            <img 
              src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=80&h=80`} 
              alt={characterNames[p1]}
              className="w-full h-full object-cover"
            />
          </Card>
          <div className="flex-grow">
            <p className="font-pixel text-sm text-white mb-1">{characterNames[p1]}</p>
            <div className="relative">
              <Progress 
                value={player1Health} 
                className="h-6 bg-arcade-dark/50 border-2 border-arcade-accent"
              />
              <div 
                className="absolute top-0 left-0 h-full bg-arcade-neon" 
                style={{ width: `${player1Health}%`, transition: "width 0.3s" }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Timer */}
        <div className="font-pixel text-4xl text-white bg-arcade-dark/70 px-6 py-2 border-2 border-arcade-accent">
          {Math.ceil(gameTimer).toString().padStart(2, '0')}
        </div>
        
        {/* P2 Health and Info */}
        <div className="flex items-center gap-3 w-1/3 flex-row-reverse">
          <Card className="h-16 w-16 bg-arcade-dark/50 border-2 border-arcade-purple overflow-hidden flex items-center justify-center pixel-corners">
            <img 
              src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=80&h=80`} 
              alt={characterNames[p2]}
              className="w-full h-full object-cover"
            />
          </Card>
          <div className="flex-grow">
            <p className="font-pixel text-sm text-white mb-1 text-right">{characterNames[p2]}</p>
            <div className="relative">
              <Progress 
                value={player2Health} 
                className="h-6 bg-arcade-dark/50 border-2 border-arcade-purple"
              />
              <div 
                className="absolute top-0 right-0 h-full bg-arcade-purple" 
                style={{ width: `${player2Health}%`, transition: "width 0.3s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Character Area - Middle */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-full max-w-[800px] h-[300px]">
          {/* P1 Character */}
          <div 
            className={`absolute h-[64px] w-[48px] bg-arcade-accent/30 border-2 border-arcade-accent transition-all duration-100 ${
              player1State === 'attacking' ? 'border-white' : 
              player1State === 'blocking' ? 'border-yellow-400' :
              player1State === 'hit' ? 'border-red-500' :
              player1State === 'knockedDown' ? 'border-red-800' : ''
            }`}
            style={{
              left: `${player1Pos.x}px`,
              top: `${player1Pos.y}px`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-pixel text-arcade-accent text-xs">{player1State}</p>
            </div>
          </div>
          
          {/* P2 Character */}
          <div 
            className={`absolute h-[64px] w-[48px] bg-arcade-purple/30 border-2 border-arcade-purple transition-all duration-100 ${
              player2State === 'attacking' ? 'border-white' : 
              player2State === 'blocking' ? 'border-yellow-400' :
              player2State === 'hit' ? 'border-red-500' :
              player2State === 'knockedDown' ? 'border-red-800' : ''
            }`}
            style={{
              left: `${player2Pos.x}px`,
              top: `${player2Pos.y}px`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-pixel text-arcade-purple text-xs">{player2State}</p>
            </div>
          </div>
          
          {/* Debug: Display active hitboxes */}
          {gameState.activeHitboxesP1.map((hitbox, index) => (
            <div 
              key={`p1-hitbox-${index}`}
              className="absolute border-2 border-red-500 bg-red-500/30"
              style={{
                left: `${hitbox.x}px`,
                top: `${hitbox.y}px`,
                width: `${hitbox.width}px`,
                height: `${hitbox.height}px`,
              }}
            />
          ))}
          
          {gameState.activeHitboxesP2.map((hitbox, index) => (
            <div 
              key={`p2-hitbox-${index}`}
              className="absolute border-2 border-blue-500 bg-blue-500/30"
              style={{
                left: `${hitbox.x}px`,
                top: `${hitbox.y}px`,
                width: `${hitbox.width}px`,
                height: `${hitbox.height}px`,
              }}
            />
          ))}
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
          <SheetContent 
            className="w-full max-w-md border-l-2 border-arcade-accent bg-arcade-dark/95 p-0 scanlines"
            side="right"
          >
            <div className="flex flex-col items-center justify-center h-full p-6">
              <h2 className="font-pixel text-3xl text-arcade-accent mb-8">PAUSED</h2>
              
              <div className="space-y-4 w-full max-w-xs">
                <Button 
                  onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                  className="w-full font-pixel text-white bg-arcade-accent/20 border-2 border-arcade-accent py-3 hover:bg-arcade-accent/40 transition-all duration-300 h-auto"
                >
                  RESUME
                </Button>
                
                <Button 
                  onClick={() => navigate("/select")}
                  className="w-full font-pixel text-white bg-arcade-blue/20 border-2 border-arcade-blue py-3 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
                >
                  CHARACTER SELECT
                </Button>
                
                <Button 
                  onClick={() => navigate("/menu")}
                  className="w-full font-pixel text-white bg-arcade-blue/20 border-2 border-arcade-blue py-3 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
                >
                  MAIN MENU
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Debug Info */}
      <div className="absolute bottom-4 left-4 bg-black/70 p-2 text-white text-xs font-mono">
        <div>P1 State: {player1State}</div>
        <div>P1 Pos: {Math.round(player1Pos.x)}, {Math.round(player1Pos.y)}</div>
        <div>P1 Health: {player1Health}</div>
        <div>P2 State: {player2State}</div>
        <div>P2 Pos: {Math.round(player2Pos.x)}, {Math.round(player2Pos.y)}</div>
        <div>P2 Health: {player2Health}</div>
        <div>Timer: {Math.ceil(gameTimer)}</div>
        <div>Controls: WASD + U,I,O (P1) / Arrows + 1,2,3 (P2)</div>
      </div>
    </div>
  );
};

export default Fight;
