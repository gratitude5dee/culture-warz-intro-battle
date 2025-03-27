
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EndMenuProps {
  winner: "P1" | "P2" | "Draw";
  onPlayAgain: () => void;
  p1Name: string;
  p2Name: string;
}

const EndMenu: React.FC<EndMenuProps> = ({ winner, onPlayAgain, p1Name, p2Name }) => {
  const navigate = useNavigate();

  // Determine the result text based on the winner
  const getResultText = () => {
    switch (winner) {
      case "P1":
        return `${p1Name} WINS!`;
      case "P2":
        return `${p2Name} WINS!`;
      case "Draw":
        return "DRAW!";
      default:
        return "GAME OVER";
    }
  };

  const handleCharacterSelect = () => {
    navigate("/select");
  };

  const handleMainMenu = () => {
    navigate("/menu");
  };

  return (
    <div className="fixed inset-0 z-50 bg-arcade-dark/85 flex items-center justify-center scanlines">
      <div className="flex flex-col items-center max-w-md w-full p-8 bg-arcade-dark/90 border-2 border-arcade-accent pixel-corners">
        <h1 className="font-pixel text-4xl mb-6 text-center">
          {winner === "P1" && <span className="text-arcade-accent">{getResultText()}</span>}
          {winner === "P2" && <span className="text-arcade-purple">{getResultText()}</span>}
          {winner === "Draw" && <span className="text-arcade-blue">{getResultText()}</span>}
        </h1>
        
        <div className="space-y-4 w-full max-w-xs mt-4">
          <Button 
            onClick={onPlayAgain}
            className="w-full font-pixel text-white bg-arcade-accent/20 border-2 border-arcade-accent py-3 hover:bg-arcade-accent/40 transition-all duration-300 h-auto"
          >
            PLAY AGAIN
          </Button>
          
          <Button 
            onClick={handleCharacterSelect}
            className="w-full font-pixel text-white bg-arcade-blue/20 border-2 border-arcade-blue py-3 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
          >
            CHARACTER SELECT
          </Button>
          
          <Button 
            onClick={handleMainMenu}
            className="w-full font-pixel text-white bg-arcade-purple/20 border-2 border-arcade-purple py-3 hover:bg-arcade-purple/40 transition-all duration-300 h-auto"
          >
            MAIN MENU
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EndMenu;
