
// Define player state types
export type PlayerState = 'idle' | 'walking' | 'jumping' | 'attacking' | 'blocking' | 'hit' | 'knockedDown';

// Define hitbox type
export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  type: 'light' | 'medium' | 'heavy' | 'special';
}

// Define position and velocity types
export interface Vector2D {
  x: number;
  y: number;
}

// Define game state interface
export interface GameState {
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
export type GameAction =
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
export const STAGE_WIDTH = 800;
export const STAGE_HEIGHT = 300;
export const GRAVITY = 0.5;
export const JUMP_FORCE = -10;
export const MOVE_SPEED = 5;
export const PLAYER_WIDTH = 48;
export const PLAYER_HEIGHT = 64;

// Character and stage mappings
export const characterNames: Record<string, string> = {
  drake: "DRAKE",
  kendrick: "KENDRICK",
  future: "FUTURE",
  meg: "MEG",
  nicki: "NICKI",
};

export const stageBgs: Record<string, string> = {
  sf: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
  la: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  nyc: "https://images.unsplash.com/photo-1487252665478-49b61b47f302",
};
