
import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { characterNames } from '@/types/gameTypes';

interface GameHUDProps {
  p1: string;
  p2: string;
  player1Health: number;
  player2Health: number;
  gameTimer: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ 
  p1, 
  p2, 
  player1Health, 
  player2Health, 
  gameTimer 
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-20">
      {/* P1 Health and Info */}
      <div className="flex items-center gap-3 w-1/3">
        <Card className="h-16 w-16 bg-arcade-dark/50 border-2 border-arcade-accent overflow-hidden flex items-center justify-center pixel-corners">
          <img 
            src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=80&h=80`} 
            alt={characterNames[p1]}
            className="w-full h-full object-cover"
          />
        </Card>
        <div className="flex-grow">
          <p className="font-pixel text-sm text-white mb-1">{characterNames[p1]}</p>
          <div className="relative">
            <Progress 
              value={player1Health} 
              className="h-6 bg-arcade-dark/50 border-2 border-arcade-accent"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-arcade-neon" 
              style={{ width: `${player1Health}%`, transition: "width 0.3s" }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Timer */}
      <div className="font-pixel text-4xl text-white bg-arcade-dark/70 px-6 py-2 border-2 border-arcade-accent">
        {Math.ceil(gameTimer).toString().padStart(2, '0')}
      </div>
      
      {/* P2 Health and Info */}
      <div className="flex items-center gap-3 w-1/3 flex-row-reverse">
        <Card className="h-16 w-16 bg-arcade-dark/50 border-2 border-arcade-purple overflow-hidden flex items-center justify-center pixel-corners">
          <img 
            src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=80&h=80`} 
            alt={characterNames[p2]}
            className="w-full h-full object-cover"
          />
        </Card>
        <div className="flex-grow">
          <p className="font-pixel text-sm text-white mb-1 text-right">{characterNames[p2]}</p>
          <div className="relative">
            <Progress 
              value={player2Health} 
              className="h-6 bg-arcade-dark/50 border-2 border-arcade-purple"
            />
            <div 
              className="absolute top-0 right-0 h-full bg-arcade-purple" 
              style={{ width: `${player2Health}%`, transition: "width 0.3s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
