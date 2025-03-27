
// Define player state types
export type PlayerState = 
  | 'idle' 
  | 'walking' 
  | 'jumping' 
  | 'attacking' 
  | 'blocking' 
  | 'hit' 
  | 'knockedDown'
  | 'walkingForward'
  | 'walkingBackward'
  | 'crouching'
  | 'jumpingUp'
  | 'jumpingForward'
  | 'jumpingBackward'
  | 'landing'
  | 'lightAttack'
  | 'mediumAttack'
  | 'heavyAttack'
  | 'specialAttack'
  | 'blockingStand'
  | 'blockingCrouch'
  | 'hitStunStand'
  | 'hitStunCrouch'
  | 'gettingUp';

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

// Define character stats
export interface CharacterStats {
  name: string;
  maxHealth: number;
  walkSpeed: number;
  jumpVelocity: Vector2D;
  attackPower: {
    light: number;
    medium: number;
    heavy: number;
    special: number;
  };
}

// Define player data
export interface PlayerData {
  id: 'P1' | 'P2';
  characterName: string;
  stats: CharacterStats;
  position: Vector2D;
  velocity: Vector2D;
  health: number;
  state: PlayerState;
  isFacingRight: boolean;
  activeHitboxes: Hitbox[];
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
  player1Data?: PlayerData;
  player2Data?: PlayerData;
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

// Character stats
export const characterStats: Record<string, CharacterStats> = {
  drake: {
    name: "DRAKE",
    maxHealth: 100,
    walkSpeed: 5,
    jumpVelocity: { x: 0, y: -10 },
    attackPower: { light: 5, medium: 10, heavy: 15, special: 20 }
  },
  kendrick: {
    name: "KENDRICK",
    maxHealth: 90,
    walkSpeed: 6,
    jumpVelocity: { x: 0, y: -11 },
    attackPower: { light: 6, medium: 12, heavy: 14, special: 18 }
  },
  future: {
    name: "FUTURE",
    maxHealth: 95,
    walkSpeed: 5.5,
    jumpVelocity: { x: 0, y: -10.5 },
    attackPower: { light: 5, medium: 11, heavy: 15, special: 19 }
  },
  meg: {
    name: "MEG",
    maxHealth: 85,
    walkSpeed: 7,
    jumpVelocity: { x: 0, y: -12 },
    attackPower: { light: 7, medium: 9, heavy: 13, special: 21 }
  },
  nicki: {
    name: "NICKI",
    maxHealth: 80,
    walkSpeed: 8,
    jumpVelocity: { x: 0, y: -12.5 },
    attackPower: { light: 8, medium: 10, heavy: 12, special: 22 }
  }
};

export const stageBgs: Record<string, string> = {
  sf: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
  la: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  nyc: "https://images.unsplash.com/photo-1487252665478-49b61b47f302",
};
