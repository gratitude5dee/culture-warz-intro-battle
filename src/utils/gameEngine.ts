import { 
  GameState, 
  GameAction, 
  Hitbox, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT, 
  JUMP_FORCE, 
  MOVE_SPEED,
  PlayerIntent
} from '@/types/gameTypes';

// Handle Player 1 intents and translate to game state changes
export const handlePlayerIntents = (
  gameState: GameState,
  dispatch: React.Dispatch<GameAction>
) => {
  const { isPaused, matchOver, player1State, player2State, player1Intent, player2Intent } = gameState;
  
  if (isPaused || matchOver) return;
  
  // Process Player 1 intent
  if (!(player1State === 'hit' || player1State === 'knockedDown')) {
    handlePlayerIntent('P1', player1Intent, player1State, gameState, dispatch);
  }
  
  // Process Player 2 intent
  if (!(player2State === 'hit' || player2State === 'knockedDown')) {
    handlePlayerIntent('P2', player2Intent, player2State, gameState, dispatch);
  }
};

// Handle a single player's intent
const handlePlayerIntent = (
  player: 'P1' | 'P2',
  intent: PlayerIntent,
  currentState: string,
  gameState: GameState,
  dispatch: React.Dispatch<GameAction>
) => {
  // Get the current velocity
  const currentVelocity = player === 'P1' ? gameState.player1Velocity : gameState.player2Velocity;
  
  // Handle movement intent
  let velocityX = 0;
  if (intent.moveDirection === 'left') {
    velocityX = -MOVE_SPEED;
    if (currentState !== 'jumping' && currentState !== 'attacking') {
      dispatch({ type: 'SET_PLAYER_STATE', player, state: 'walking' });
    }
  } else if (intent.moveDirection === 'right') {
    velocityX = MOVE_SPEED;
    if (currentState !== 'jumping' && currentState !== 'attacking') {
      dispatch({ type: 'SET_PLAYER_STATE', player, state: 'walking' });
    }
  } else if (currentState === 'walking') {
    dispatch({ type: 'SET_PLAYER_STATE', player, state: 'idle' });
  }
  
  // Handle jump intent
  if (intent.verticalIntent === 'jump' && currentState !== 'jumping' && currentState !== 'attacking') {
    dispatch({ type: 'MOVE_PLAYER', player, velocity: { x: velocityX, y: JUMP_FORCE } });
    dispatch({ type: 'SET_PLAYER_STATE', player, state: 'jumping' });
  } else {
    dispatch({ type: 'MOVE_PLAYER', player, velocity: { x: velocityX, y: currentVelocity.y } });
  }
  
  // Handle attack intent
  if (currentState !== 'attacking' && intent.attackIntent) {
    dispatch({ type: 'START_ATTACK', player, attackType: intent.attackIntent });
    
    // After attack animation time, clear hitboxes and return to idle
    const attackDuration = 
      intent.attackIntent === 'light' ? 300 :
      intent.attackIntent === 'medium' ? 500 :
      intent.attackIntent === 'heavy' ? 700 : 1000; // Special
    
    setTimeout(() => {
      dispatch({ type: 'CLEAR_HITBOXES', player });
      dispatch({ type: 'SET_PLAYER_STATE', player, state: 'idle' });
    }, attackDuration);
  }
  
  // Handle block intent
  if (intent.blockIntent && currentState !== 'jumping' && currentState !== 'attacking') {
    dispatch({ type: 'SET_PLAYER_STATE', player, state: 'blocking' });
  } else if (currentState === 'blocking' && !intent.blockIntent) {
    dispatch({ type: 'SET_PLAYER_STATE', player, state: 'idle' });
  }
};

// Check for collisions between hitboxes and players
export const checkCollisions = (
  gameState: GameState,
  dispatch: React.Dispatch<GameAction>
) => {
  const { activeHitboxesP1, activeHitboxesP2, player1Pos, player2Pos, player1State, player2State } = gameState;
  
  // Check P1 hitboxes against P2
  activeHitboxesP1.forEach(hitbox => {
    // Simple AABB collision check
    if (
      player2State !== 'blocking' &&
      hitbox.x < player2Pos.x + PLAYER_WIDTH &&
      hitbox.x + hitbox.width > player2Pos.x &&
      hitbox.y < player2Pos.y + PLAYER_HEIGHT &&
      hitbox.y + hitbox.height > player2Pos.y
    ) {
      applyDamage('P2', hitbox.damage, dispatch);
    }
  });
  
  // Check P2 hitboxes against P1
  activeHitboxesP2.forEach(hitbox => {
    if (
      player1State !== 'blocking' &&
      hitbox.x < player1Pos.x + PLAYER_WIDTH &&
      hitbox.x + hitbox.width > player1Pos.x &&
      hitbox.y < player1Pos.y + PLAYER_HEIGHT &&
      hitbox.y + hitbox.height > player1Pos.y
    ) {
      applyDamage('P1', hitbox.damage, dispatch);
    }
  });
};

// Apply damage to a player
export const applyDamage = (
  player: 'P1' | 'P2',
  damage: number,
  dispatch: React.Dispatch<GameAction>
) => {
  dispatch({ type: 'APPLY_DAMAGE', player, damage });
  
  // After hit stun, return to idle
  setTimeout(() => {
    dispatch({ type: 'SET_PLAYER_STATE', player, state: 'idle' });
  }, damage > 10 ? 1000 : 500);
};
