
import { useState, useEffect } from 'react';
import { GameAction, JUMP_FORCE, MOVE_SPEED } from '@/types/gameTypes';

type KeySet = Set<string>;
type GameDispatch = React.Dispatch<GameAction>;

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

  // Setup event listeners for keyboard
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, matchOver, player1State, player2State]);

  return { p1Keys, p2Keys };
};
