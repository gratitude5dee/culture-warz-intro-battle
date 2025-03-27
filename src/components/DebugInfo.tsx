
import React from 'react';
import { GameState, characterStats } from '@/types/gameTypes';

interface DebugInfoProps {
  gameState: GameState;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ gameState }) => {
  const { 
    player1State, player1Pos, player1Health, player1Velocity, player1Intent,
    player2State, player2Pos, player2Health, player2Velocity, player2Intent,
    gameTimer, isPaused
  } = gameState;
  
  return (
    <div className="absolute bottom-4 left-4 bg-black/70 p-2 text-white text-xs font-mono max-h-80 overflow-y-auto">
      <div className="mb-2 border-b border-white/50 pb-1">
        <span className="text-arcade-accent">Game Status:</span> {isPaused ? 'PAUSED' : 'RUNNING'} | <span>Timer: {Math.ceil(gameTimer)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-arcade-accent border-b border-arcade-accent/50 mb-1">PLAYER 1</h3>
          <div>State: {player1State}</div>
          <div>Position: {Math.round(player1Pos.x)}, {Math.round(player1Pos.y)}</div>
          <div>Velocity: {Math.round(player1Velocity.x)}, {Math.round(player1Velocity.y)}</div>
          <div>Health: {player1Health}</div>
          <div className="mt-1 text-emerald-300">
            <div>Move: {player1Intent.moveDirection}</div>
            <div>Vertical: {player1Intent.verticalIntent}</div>
            <div>Attack: {player1Intent.attackIntent || 'none'}</div>
            <div>Block: {player1Intent.blockIntent ? 'yes' : 'no'}</div>
          </div>
        </div>
        
        <div>
          <h3 className="text-arcade-purple border-b border-arcade-purple/50 mb-1">PLAYER 2</h3>
          <div>State: {player2State}</div>
          <div>Position: {Math.round(player2Pos.x)}, {Math.round(player2Pos.y)}</div>
          <div>Velocity: {Math.round(player2Velocity.x)}, {Math.round(player2Velocity.y)}</div>
          <div>Health: {player2Health}</div>
          <div className="mt-1 text-emerald-300">
            <div>Move: {player2Intent.moveDirection}</div>
            <div>Vertical: {player2Intent.verticalIntent}</div>
            <div>Attack: {player2Intent.attackIntent || 'none'}</div>
            <div>Block: {player2Intent.blockIntent ? 'yes' : 'no'}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 pt-1 border-t border-white/50">
        <div>Controls: WASD + U,I,O (P1) / Arrows + 1,2,3 (P2)</div>
        <div className="text-yellow-300 text-[10px] mt-1">Press ESC to pause/unpause</div>
      </div>
    </div>
  );
};

export default DebugInfo;
