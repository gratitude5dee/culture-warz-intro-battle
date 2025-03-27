
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
  
  let p1WasHit = false;
  let p2WasHit = false;
  
  // Check P1 hitboxes against P2
  activeHitboxesP1.forEach(hitbox => {
    // Convert hitbox to world coordinates
    const worldHitbox = {
      x: player1Pos.x + hitbox.x,
      y: player1Pos.y + hitbox.y,
      width: hitbox.width,
      height: hitbox.height
    };
    
    // Get P2 hurtbox (simplified as the character box for now)
    const p2Hurtbox = {
      x: player2Pos.x,
      y: player2Pos.y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    };
    
    // Check if P2 is blocking
    const isBlocking = player2State === 'blocking';
    
    // Simple AABB collision check
    if (rectOverlap(worldHitbox, p2Hurtbox) && !isBlocking) {
      applyDamage('P2', hitbox.damage, hitbox.hitstun || 500, hitbox.knockback, dispatch);
      p2WasHit = true;
    } else if (rectOverlap(worldHitbox, p2Hurtbox) && isBlocking) {
      // Reduce damage when blocking
      applyDamage('P2', Math.floor(hitbox.damage * 0.25), 
                  Math.floor((hitbox.hitstun || 250) * 0.5), 
                  { x: (hitbox.knockback?.x || 0) * 0.3, y: 0 }, 
                  dispatch);
      p2WasHit = true;
    }
  });
  
  // Check P2 hitboxes against P1
  activeHitboxesP2.forEach(hitbox => {
    // Convert hitbox to world coordinates
    const worldHitbox = {
      x: player2Pos.x + hitbox.x,
      y: player2Pos.y + hitbox.y,
      width: hitbox.width,
      height: hitbox.height
    };
    
    // Get P1 hurtbox (simplified as the character box for now)
    const p1Hurtbox = {
      x: player1Pos.x,
      y: player1Pos.y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    };
    
    // Check if P1 is blocking
    const isBlocking = player1State === 'blocking';
    
    // Simple AABB collision check
    if (rectOverlap(worldHitbox, p1Hurtbox) && !isBlocking) {
      applyDamage('P1', hitbox.damage, hitbox.hitstun || 500, hitbox.knockback, dispatch);
      p1WasHit = true;
    } else if (rectOverlap(worldHitbox, p1Hurtbox) && isBlocking) {
      // Reduce damage when blocking
      applyDamage('P1', Math.floor(hitbox.damage * 0.25), 
                  Math.floor((hitbox.hitstun || 250) * 0.5), 
                  { x: (hitbox.knockback?.x || 0) * 0.3, y: 0 }, 
                  dispatch);
      p1WasHit = true;
    }
  });
  
  return { p1Hit: p1WasHit, p2Hit: p2WasHit };
};

// Helper function to check if two rectangles overlap
const rectOverlap = (rect1: { x: number, y: number, width: number, height: number },
                    rect2: { x: number, y: number, width: number, height: number }): boolean => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

// Apply damage to a player
export const applyDamage = (
  player: 'P1' | 'P2',
  damage: number,
  hitstun: number,
  knockback: { x: number, y: number } | undefined,
  dispatch: React.Dispatch<GameAction>
) => {
  // Apply damage
  dispatch({ type: 'APPLY_DAMAGE', player, damage });
  
  // Apply knockback if specified
  if (knockback) {
    const velocity = { 
      x: player === 'P1' ? -Math.abs(knockback.x) : Math.abs(knockback.x), 
      y: knockback.y 
    };
    dispatch({ type: 'MOVE_PLAYER', player, velocity });
  }
  
  // Set player to hit state
  dispatch({ type: 'SET_PLAYER_STATE', player, state: damage > 10 ? 'knockedDown' : 'hit' });
  
  // After hit stun, return to idle
  setTimeout(() => {
    dispatch({ type: 'SET_PLAYER_STATE', player, state: 'idle' });
  }, hitstun);
};

// Calculate world position for a hitbox based on player position and facing direction
export const calculateWorldBox = (
  box: { x: number, y: number, width: number, height: number },
  playerPos: { x: number, y: number },
  facingRight: boolean
) => {
  if (facingRight) {
    return {
      x: playerPos.x + box.x,
      y: playerPos.y + box.y,
      width: box.width,
      height: box.height
    };
  } else {
    // Flip X coordinates if facing left
    return {
      x: playerPos.x + PLAYER_WIDTH - box.x - box.width,
      y: playerPos.y + box.y,
      width: box.width,
      height: box.height
    };
  }
};
