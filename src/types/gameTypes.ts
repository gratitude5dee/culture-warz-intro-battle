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

// Define hitbox type with enhanced properties
export interface Hitbox {
  x: number;         // Offset X from player position
  y: number;         // Offset Y from player position
  width: number;
  height: number;
  damage: number;
  type: 'light' | 'medium' | 'heavy' | 'special';
  hitstun?: number;  // Duration in ms opponent is stunned
  knockback?: { x: number; y: number }; // Velocity applied to opponent on hit
  priority?: number; // Higher priority attacks beat lower ones
}

// Define hurtbox type (similar to hitbox but without damage properties)
export interface Hurtbox {
  x: number;       // Offset X from player position
  y: number;       // Offset Y from player position
  width: number;
  height: number;
}

// Define move data structure
export interface MoveData {
  name: string;             // e.g., "Light Punch"
  startupFrames: number;    // Frames before attack becomes active
  activeFrames: number;     // Frames the attack hitbox is active
  recoveryFrames: number;   // Frames after attack before next action
  totalFrames: number;      // startup + active + recovery
  hitboxes: Hitbox[];       // Can have multiple hitboxes active at different times
  cancelsInto?: string[];   // List of moves this can cancel into
  specialCancelable?: boolean; // Whether this move can cancel into specials
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
  currentMove?: MoveData | null;
  moveFrameCounter?: number;
  activeHitboxIds?: number[];
}

// Define action intents
export interface PlayerIntent {
  moveDirection: 'left' | 'right' | 'none';
  verticalIntent: 'jump' | 'crouch' | 'none';
  attackIntent: 'light' | 'medium' | 'heavy' | 'special' | null;
  blockIntent: boolean;
}

// Mapping keys to logical inputs
export const P1_INPUT_MAP: Record<string, string> = {
  'w': 'up',
  's': 'down',
  'a': 'left',
  'd': 'right',
  'u': 'lightAttack',
  'i': 'mediumAttack',
  'o': 'heavyAttack',
  'p': 'specialAttack'
};

export const P2_INPUT_MAP: Record<string, string> = {
  'arrowup': 'up',
  'arrowdown': 'down',
  'arrowleft': 'left',
  'arrowright': 'right',
  '1': 'lightAttack',
  '2': 'mediumAttack',
  '3': 'heavyAttack',
  '4': 'specialAttack'
};

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
  player1Intent: PlayerIntent;
  player2Intent: PlayerIntent;
  player1MoveData?: MoveData | null;
  player2MoveData?: MoveData | null;
  player1MoveFrame?: number;
  player2MoveFrame?: number;
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
  | { type: 'RESET_MATCH' }
  | { type: 'SET_PLAYER_INTENT', player: 'P1' | 'P2', intent: PlayerIntent }
  | { type: 'UPDATE_MOVE_FRAME', player: 'P1' | 'P2' }
  | { type: 'APPLY_AUTHORITATIVE_STATE', state: any }; // We use 'any' here as the state structure can evolve

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

// Move data definitions per character
export const movesData: Record<string, Record<string, MoveData>> = {
  drake: {
    lightAttack: {
      name: "Quick Jab",
      startupFrames: 3,
      activeFrames: 2,
      recoveryFrames: 5,
      totalFrames: 10,
      hitboxes: [
        {
          x: PLAYER_WIDTH, // In front of the player
          y: 20, // At shoulder height
          width: 30,
          height: 20,
          damage: 5,
          type: 'light',
          hitstun: 200,
          knockback: { x: 2, y: 0 }
        }
      ]
    },
    mediumAttack: {
      name: "Straight Punch",
      startupFrames: 6,
      activeFrames: 3,
      recoveryFrames: 8,
      totalFrames: 17,
      hitboxes: [
        {
          x: PLAYER_WIDTH,
          y: 25,
          width: 40,
          height: 25,
          damage: 10,
          type: 'medium',
          hitstun: 400,
          knockback: { x: 4, y: -1 }
        }
      ]
    },
    heavyAttack: {
      name: "Power Hook",
      startupFrames: 10,
      activeFrames: 5,
      recoveryFrames: 15,
      totalFrames: 30,
      hitboxes: [
        {
          x: PLAYER_WIDTH - 10,
          y: 15,
          width: 50,
          height: 30,
          damage: 15,
          type: 'heavy',
          hitstun: 600,
          knockback: { x: 6, y: -3 }
        }
      ]
    },
    specialAttack: {
      name: "Diss Track",
      startupFrames: 15,
      activeFrames: 10,
      recoveryFrames: 20,
      totalFrames: 45,
      hitboxes: [
        {
          x: PLAYER_WIDTH,
          y: 10,
          width: 80,
          height: 40,
          damage: 20,
          type: 'special',
          hitstun: 800,
          knockback: { x: 8, y: -5 }
        }
      ]
    }
  },
  // Similar move data for other characters would go here
  // For now, we'll just make them all use the same moves as Drake
  kendrick: { /* Copy drake's moves for now */ },
  future: { /* Copy drake's moves for now */ },
  meg: { /* Copy drake's moves for now */ },
  nicki: { /* Copy drake's moves for now */ }
};

// Initialize all character moves to use Drake's moves for now
for (const character of Object.keys(characterStats)) {
  if (character !== 'drake' && !movesData[character]) {
    movesData[character] = { ...movesData.drake };
  }
}

export const stageBgs: Record<string, string> = {
  sf: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
  la: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  nyc: "https://images.unsplash.com/photo-1487252665478-49b61b47f302",
};

// Helper function to get the correct hurtboxes based on player state
export const getActiveHurtboxes = (playerData: PlayerData): Hurtbox[] => {
  // Default standing hurtbox (simplified for now)
  const defaultHurtbox: Hurtbox = {
    x: 0,
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT
  };
  
  // Different hurtboxes based on state
  switch (playerData.state) {
    case 'crouching':
      return [
        {
          x: 0,
          y: PLAYER_HEIGHT / 2, // Lower half of the player
          width: PLAYER_WIDTH,
          height: PLAYER_HEIGHT / 2
        }
      ];
    case 'jumping':
    case 'jumpingUp':
    case 'jumpingForward':
    case 'jumpingBackward':
      return [
        {
          x: PLAYER_WIDTH * 0.1,
          y: 0,
          width: PLAYER_WIDTH * 0.8, // Slightly smaller when jumping
          height: PLAYER_HEIGHT
        }
      ];
    default:
      return [defaultHurtbox];
  }
};
