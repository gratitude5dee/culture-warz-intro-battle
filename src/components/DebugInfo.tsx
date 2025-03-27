
import React from 'react';
import { GameState } from '@/types/gameTypes';

interface DebugInfoProps {
  gameState: GameState;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ gameState }) => {
  const { player1State, player1Pos, player1Health, player2State, player2Pos, player2Health, gameTimer } = gameState;
  
  return (
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
  );
};

export default DebugInfo;
