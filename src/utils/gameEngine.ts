
import { GameState, GameAction, Hitbox, PLAYER_WIDTH, PLAYER_HEIGHT, JUMP_FORCE, MOVE_SPEED } from '@/types/gameTypes';

// Process player 1 input
export const handleInputP1 = (
  p1Keys: Set<string>,
  gameState: GameState,
  dispatch: React.Dispatch<GameAction>
) => {
  const { isPaused, matchOver, player1State } = gameState;
  
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
export const handleInputP2 = (
  p2Keys: Set<string>,
  gameState: GameState,
  dispatch: React.Dispatch<GameAction>
) => {
  const { isPaused, matchOver, player2State } = gameState;
  
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
