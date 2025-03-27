
import React from 'react';
import { Hitbox, PlayerState } from '@/types/gameTypes';

interface FightCharacterProps {
  player: 'P1' | 'P2';
  position: { x: number, y: number };
  state: PlayerState;
  activeHitboxes: Hitbox[];
}

const FightCharacter: React.FC<FightCharacterProps> = ({ 
  player, 
  position, 
  state,
  activeHitboxes 
}) => {
  const isP1 = player === 'P1';
  
  return (
    <>
      <div 
        className={`absolute h-[64px] w-[48px] transition-all duration-100 ${
          isP1 
            ? 'bg-arcade-accent/30 border-2 border-arcade-accent' 
            : 'bg-arcade-purple/30 border-2 border-arcade-purple'
        } ${
          state === 'attacking' ? 'border-white' : 
          state === 'blocking' ? 'border-yellow-400' :
          state === 'hit' ? 'border-red-500' :
          state === 'knockedDown' ? 'border-red-800' : ''
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className={`font-pixel text-xs ${isP1 ? 'text-arcade-accent' : 'text-arcade-purple'}`}>{state}</p>
        </div>
      </div>
      
      {/* Display active hitboxes */}
      {activeHitboxes.map((hitbox, index) => (
        <div 
          key={`${player}-hitbox-${index}`}
          className={`absolute ${isP1 ? 'border-red-500 bg-red-500/30' : 'border-blue-500 bg-blue-500/30'} border-2`}
          style={{
            left: `${hitbox.x}px`,
            top: `${hitbox.y}px`,
            width: `${hitbox.width}px`,
            height: `${hitbox.height}px`,
          }}
        />
      ))}
    </>
  );
};

export default FightCharacter;
