
import { 
  GameState, 
  GameAction, 
  STAGE_WIDTH, 
  STAGE_HEIGHT, 
  GRAVITY, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT,
  PlayerIntent
} from '@/types/gameTypes';

const DEFAULT_INTENT: PlayerIntent = {
  moveDirection: 'none',
  verticalIntent: 'none',
  attackIntent: null,
  blockIntent: false
};

// Game state reducer
export const gameReducer = (state: GameState, action: GameAction): GameState => {
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
      
      // Check if player landed (was in air, now on ground)
      const wasP1InAir = state.player1Pos.y < STAGE_HEIGHT - PLAYER_HEIGHT;
      const isP1OnGround = newP1Pos.y >= STAGE_HEIGHT - PLAYER_HEIGHT;
      if (wasP1InAir && isP1OnGround && state.player1State === 'jumping') {
        return {
          ...state,
          player1Pos: newP1Pos,
          player2Pos: newP2Pos,
          player1Velocity: newP1Velocity,
          player2Velocity: newP2Velocity,
          player1State: 'idle' // Reset to idle when landing
        };
      }
      
      const wasP2InAir = state.player2Pos.y < STAGE_HEIGHT - PLAYER_HEIGHT;
      const isP2OnGround = newP2Pos.y >= STAGE_HEIGHT - PLAYER_HEIGHT;
      if (wasP2InAir && isP2OnGround && state.player2State === 'jumping') {
        return {
          ...state,
          player1Pos: newP1Pos,
          player2Pos: newP2Pos,
          player1Velocity: newP1Velocity,
          player2Velocity: newP2Velocity,
          player2State: 'idle' // Reset to idle when landing
        };
      }
      
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
      
    case 'SET_PLAYER_INTENT':
      if (action.player === 'P1') {
        return { ...state, player1Intent: action.intent };
      } else {
        return { ...state, player2Intent: action.intent };
      }
      
    case 'START_ATTACK':
      // Create a sample hitbox for the attack
      const newHitbox = {
        x: action.player === 'P1' ? state.player1Pos.x + PLAYER_WIDTH : state.player2Pos.x - 20,
        y: action.player === 'P1' ? state.player1Pos.y + 20 : state.player2Pos.y + 20,
        width: 30,
        height: 20,
        damage: action.attackType === 'light' ? 5 : action.attackType === 'medium' ? 10 : 15,
        type: action.attackType,
        hitstun: action.attackType === 'light' ? 200 : action.attackType === 'medium' ? 400 : 600,
        knockback: { 
          x: action.attackType === 'light' ? 2 : action.attackType === 'medium' ? 4 : 6, 
          y: action.attackType === 'light' ? 0 : action.attackType === 'medium' ? -1 : -3 
        }
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
        winner: null,
        player1Intent: {...DEFAULT_INTENT},
        player2Intent: {...DEFAULT_INTENT}
      };
      
    default:
      return state;
  }
};

// Initial game state
export const initialGameState = (stageHeight: number): GameState => ({
  player1Pos: { x: 100, y: stageHeight - PLAYER_HEIGHT },
  player2Pos: { x: STAGE_WIDTH - 100 - PLAYER_WIDTH, y: stageHeight - PLAYER_HEIGHT },
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
  winner: null,
  player1Intent: {...DEFAULT_INTENT},
  player2Intent: {...DEFAULT_INTENT}
});
