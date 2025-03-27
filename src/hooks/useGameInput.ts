
import { useState, useEffect, useRef } from 'react';
import { GameAction, JUMP_FORCE, MOVE_SPEED, P1_INPUT_MAP, P2_INPUT_MAP, PlayerIntent } from '@/types/gameTypes';

type KeySet = Set<string>;
type GameDispatch = React.Dispatch<GameAction>;

const DEFAULT_INTENT: PlayerIntent = {
  moveDirection: 'none',
  verticalIntent: 'none',
  attackIntent: null,
  blockIntent: false
};

export const useGameInput = (
  matchOver: boolean,
  isPaused: boolean,
  player1State: string,
  player2State: string,
  dispatch: GameDispatch
) => {
  const [p1Keys, setP1Keys] = useState<KeySet>(new Set());
  const [p2Keys, setP2Keys] = useState<KeySet>(new Set());

  // Handle key down events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (matchOver) return;
    
    if (e.key === "Escape") {
      dispatch({ type: 'TOGGLE_PAUSE' });
      return;
    }
    
    // Player 1 keys (WASD + attack keys)
    if (['w', 'a', 's', 'd', 'u', 'i', 'o', 'p', 'j', 'k', 'l'].includes(e.key.toLowerCase())) {
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
    if (['w', 'a', 's', 'd', 'u', 'i', 'o', 'p', 'j', 'k', 'l'].includes(e.key.toLowerCase())) {
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

  // Process P1 inputs to determine intent
  const processP1Intent = (keys: KeySet): PlayerIntent => {
    const intent: PlayerIntent = {...DEFAULT_INTENT};
    
    // Movement intent
    if (keys.has('a')) {
      intent.moveDirection = 'left';
    } else if (keys.has('d')) {
      intent.moveDirection = 'right';
    }
    
    // Vertical intent
    if (keys.has('w')) {
      intent.verticalIntent = 'jump';
    } else if (keys.has('s')) {
      intent.verticalIntent = 'crouch';
    }
    
    // Attack intent (prioritized)
    if (keys.has('u')) {
      intent.attackIntent = 'light';
    } else if (keys.has('i')) {
      intent.attackIntent = 'medium';
    } else if (keys.has('o')) {
      intent.attackIntent = 'heavy';
    } else if (keys.has('p')) {
      intent.attackIntent = 'special';
    }
    
    // Block intent (simplified version)
    intent.blockIntent = keys.has('s') && (player1State !== 'jumping' && player1State !== 'attacking');
    
    return intent;
  };

  // Process P2 inputs to determine intent
  const processP2Intent = (keys: KeySet): PlayerIntent => {
    const intent: PlayerIntent = {...DEFAULT_INTENT};
    
    // Movement intent
    if (keys.has('arrowleft')) {
      intent.moveDirection = 'left';
    } else if (keys.has('arrowright')) {
      intent.moveDirection = 'right';
    }
    
    // Vertical intent
    if (keys.has('arrowup')) {
      intent.verticalIntent = 'jump';
    } else if (keys.has('arrowdown')) {
      intent.verticalIntent = 'crouch';
    }
    
    // Attack intent (prioritized)
    if (keys.has('1')) {
      intent.attackIntent = 'light';
    } else if (keys.has('2')) {
      intent.attackIntent = 'medium';
    } else if (keys.has('3')) {
      intent.attackIntent = 'heavy';
    } else if (keys.has('4')) {
      intent.attackIntent = 'special';
    }
    
    // Block intent (simplified version)
    intent.blockIntent = keys.has('arrowdown') && (player2State !== 'jumping' && player2State !== 'attacking');
    
    return intent;
  };

  // Process and dispatch intents
  const processInputs = () => {
    if (isPaused || matchOver) return;
    
    const p1Intent = processP1Intent(p1Keys);
    const p2Intent = processP2Intent(p2Keys);
    
    dispatch({ type: 'SET_PLAYER_INTENT', player: 'P1', intent: p1Intent });
    dispatch({ type: 'SET_PLAYER_INTENT', player: 'P2', intent: p2Intent });
  };

  // Setup event listeners for keyboard
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, matchOver, player1State, player2State]);

  return { p1Keys, p2Keys, processInputs };
};
