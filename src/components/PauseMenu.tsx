
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GameAction } from '@/types/gameTypes';

interface PauseMenuProps {
  dispatch: React.Dispatch<GameAction>;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ dispatch }) => {
  const navigate = useNavigate();
  
  return (
    <SheetContent 
      className="w-full max-w-md border-l-2 border-arcade-accent bg-arcade-dark/95 p-0 scanlines"
      side="right"
    >
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="font-pixel text-3xl text-arcade-accent mb-8">PAUSED</h2>
        
        <div className="space-y-4 w-full max-w-xs">
          <Button 
            onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
            className="w-full font-pixel text-white bg-arcade-accent/20 border-2 border-arcade-accent py-3 hover:bg-arcade-accent/40 transition-all duration-300 h-auto"
          >
            RESUME
          </Button>
          
          <Button 
            onClick={() => navigate("/select")}
            className="w-full font-pixel text-white bg-arcade-blue/20 border-2 border-arcade-blue py-3 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
          >
            CHARACTER SELECT
          </Button>
          
          <Button 
            onClick={() => navigate("/menu")}
            className="w-full font-pixel text-white bg-arcade-blue/20 border-2 border-arcade-blue py-3 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
          >
            MAIN MENU
          </Button>
        </div>
      </div>
    </SheetContent>
  );
};

export default PauseMenu;
