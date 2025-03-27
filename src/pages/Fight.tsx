import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import EndMenu from "@/components/EndMenu";

// Define the types for our location state
interface FightState {
  p1: string;
  p2: string;
  stage: string;
}

// Map character IDs to display names
const characterNames: Record<string, string> = {
  drake: "DRAKE",
  kendrick: "KENDRICK",
  future: "FUTURE",
  meg: "MEG",
  nicki: "NICKI",
};

// Map stage IDs to background images
const stageBgs: Record<string, string> = {
  sf: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
  la: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  nyc: "https://images.unsplash.com/photo-1487252665478-49b61b47f302",
};

const Fight = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the fight state from location, or use defaults if not available
  const { p1, p2, stage } = (location.state as FightState) || { 
    p1: "drake", 
    p2: "kendrick", 
    stage: "sf" 
  };
  
  // State for health values
  const [p1Health, setP1Health] = useState(100);
  const [p2Health, setP2Health] = useState(100);
  
  // Timer state
  const [timer, setTimer] = useState(99);
  const [isPaused, setIsPaused] = useState(false);
  
  // End match state
  const [matchOver, setMatchOver] = useState(false);
  const [winner, setWinner] = useState<"P1" | "P2" | "Draw" | null>(null);
  
  // Setup timer countdown
  useEffect(() => {
    if (isPaused || timer <= 0 || matchOver) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Game ends when timer reaches 0
          endMatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer, isPaused, matchOver]);
  
  // Listen for Escape key to open pause menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !matchOver) {
        setIsPaused((prev) => !prev);
      }
      
      // For testing: Press 'O' to end match
      if (e.key === "o" && !matchOver && !isPaused) {
        endMatch();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [matchOver, isPaused]);
  
  // Function to determine winner and end the match
  const endMatch = () => {
    let matchWinner: "P1" | "P2" | "Draw";
    
    if (p1Health > p2Health) {
      matchWinner = "P1";
    } else if (p2Health > p1Health) {
      matchWinner = "P2";
    } else {
      matchWinner = "Draw";
    }
    
    setWinner(matchWinner);
    setMatchOver(true);
    setIsPaused(false); // Ensure pause menu is closed
  };
  
  // Handle play again / rematch
  const handlePlayAgain = () => {
    setP1Health(100);
    setP2Health(100);
    setTimer(99);
    setMatchOver(false);
    setWinner(null);
  };
  
  if (matchOver && winner) {
    return (
      <div 
        className="relative w-full h-screen overflow-hidden scanlines noise-bg" 
        style={{
          backgroundImage: `url(${stageBgs[stage]}?auto=format&fit=crop&w=1920&h=1080)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Keep the UI visible in the background */}
        <div className="opacity-50">
          {/* HUD - Top */}
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
                    value={p1Health} 
                    className="h-6 bg-arcade-dark/50 border-2 border-arcade-accent"
                  />
                  <div 
                    className="absolute top-0 left-0 h-full bg-arcade-neon" 
                    style={{ width: `${p1Health}%`, transition: "width 0.3s" }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="font-pixel text-4xl text-white bg-arcade-dark/70 px-6 py-2 border-2 border-arcade-accent">
              {timer.toString().padStart(2, '0')}
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
                    value={p2Health} 
                    className="h-6 bg-arcade-dark/50 border-2 border-arcade-purple"
                  />
                  <div 
                    className="absolute top-0 right-0 h-full bg-arcade-purple" 
                    style={{ width: `${p2Health}%`, transition: "width 0.3s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Character Area - Middle */}
          <div className="absolute inset-0 flex items-center justify-between px-20 z-10">
            {/* P1 Character */}
            <div className="h-64 w-48 bg-arcade-accent/30 border-2 border-arcade-accent relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-pixel text-arcade-accent">{characterNames[p1]}</p>
              </div>
            </div>
            
            {/* P2 Character */}
            <div className="h-64 w-48 bg-arcade-purple/30 border-2 border-arcade-purple relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-pixel text-arcade-purple">{characterNames[p2]}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* End Menu Overlay */}
        <EndMenu 
          winner={winner} 
          onPlayAgain={handlePlayAgain} 
          p1Name={characterNames[p1]}
          p2Name={characterNames[p2]}
        />
      </div>
    );
  }
  
  return (
    <div 
      className="relative w-full h-screen overflow-hidden scanlines noise-bg" 
      style={{
        backgroundImage: `url(${stageBgs[stage]}?auto=format&fit=crop&w=1920&h=1080)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* HUD - Top */}
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
                value={p1Health} 
                className="h-6 bg-arcade-dark/50 border-2 border-arcade-accent"
              />
              <div 
                className="absolute top-0 left-0 h-full bg-arcade-neon" 
                style={{ width: `${p1Health}%`, transition: "width 0.3s" }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Timer */}
        <div className="font-pixel text-4xl text-white bg-arcade-dark/70 px-6 py-2 border-2 border-arcade-accent">
          {timer.toString().padStart(2, '0')}
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
                value={p2Health} 
                className="h-6 bg-arcade-dark/50 border-2 border-arcade-purple"
              />
              <div 
                className="absolute top-0 right-0 h-full bg-arcade-purple" 
                style={{ width: `${p2Health}%`, transition: "width 0.3s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Character Area - Middle */}
      <div className="absolute inset-0 flex items-center justify-between px-20 z-10">
        {/* P1 Character */}
        <div className="h-64 w-48 bg-arcade-accent/30 border-2 border-arcade-accent relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-pixel text-arcade-accent">{characterNames[p1]}</p>
          </div>
        </div>
        
        {/* P2 Character */}
        <div className="h-64 w-48 bg-arcade-purple/30 border-2 border-arcade-purple relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-pixel text-arcade-purple">{characterNames[p2]}</p>
          </div>
        </div>
      </div>
      
      {/* Pause Button */}
      <div className="absolute top-4 right-4 z-30">
        <Sheet open={isPaused} onOpenChange={setIsPaused}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="bg-arcade-dark/70 border-2 border-arcade-accent hover:bg-arcade-dark/90"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </SheetTrigger>
          <SheetContent 
            className="w-full max-w-md border-l-2 border-arcade-accent bg-arcade-dark/95 p-0 scanlines"
            side="right"
            hideCloseButton={true}
          >
            <div className="flex flex-col items-center justify-center h-full p-6">
              <h2 className="font-pixel text-3xl text-arcade-accent mb-8">PAUSED</h2>
              
              <div className="space-y-4 w-full max-w-xs">
                <Button 
                  onClick={() => setIsPaused(false)}
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
        </Sheet>
      </div>
    </div>
  );
};

export default Fight;
