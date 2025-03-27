
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Fighter data
const fighters = [
  { id: "drake", name: "Drake", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: "kendrick", name: "Kendrick", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: "future", name: "Future", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: "meg", name: "Meg", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: "nicki", name: "Nicki", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=150&h=150" },
];

// Stage data
const stages = [
  { id: "sf", name: "SF", image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=150&h=80" },
  { id: "la", name: "LA", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=150&h=80" },
  { id: "nyc", name: "NYC", image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&q=80&w=150&h=80" },
];

const CharacterSelect = () => {
  const navigate = useNavigate();
  const [p1Fighter, setP1Fighter] = useState("");
  const [p2Fighter, setP2Fighter] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [p1Index, setP1Index] = useState(0);
  const [p2Index, setP2Index] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  // Handle keydown events for selection
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // P1 Controls (WASD + G)
      if (e.key === "a" || e.key === "A") {
        setP1Index((prev) => (prev > 0 ? prev - 1 : fighters.length - 1));
      } else if (e.key === "d" || e.key === "D") {
        setP1Index((prev) => (prev < fighters.length - 1 ? prev + 1 : 0));
      } else if (e.key === "g" || e.key === "G") {
        setP1Fighter(fighters[p1Index].id);
        toast({
          title: "Player 1 Selected",
          description: `${fighters[p1Index].name} selected as Player 1`,
        });
      }

      // P2 Controls (Arrow keys + NumPad 1)
      if (e.key === "ArrowLeft") {
        setP2Index((prev) => (prev > 0 ? prev - 1 : fighters.length - 1));
      } else if (e.key === "ArrowRight") {
        setP2Index((prev) => (prev < fighters.length - 1 ? prev + 1 : 0));
      } else if (e.key === "1" || e.key === "NumPad1") {
        setP2Fighter(fighters[p2Index].id);
        toast({
          title: "Player 2 Selected",
          description: `${fighters[p2Index].name} selected as Player 2`,
        });
      }

      // Background controls
      if (e.key === "," || e.key === "<") {
        setStageIndex((prev) => (prev > 0 ? prev - 1 : stages.length - 1));
      } else if (e.key === "." || e.key === ">") {
        setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : 0));
      } else if (e.key === "/") {
        setSelectedStage(stages[stageIndex].id);
        toast({
          title: "Stage Selected",
          description: `${stages[stageIndex].name} selected as fighting stage`,
        });
      }
      
      // Start fight with Enter key if all selections are made
      if (e.key === "Enter" && p1Fighter && p2Fighter && selectedStage) {
        handleStartFight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [p1Index, p2Index, stageIndex, p1Fighter, p2Fighter, selectedStage]);

  // Get the actual fighter objects
  const p1Selected = fighters.find((f) => f.id === p1Fighter);
  const p2Selected = fighters.find((f) => f.id === p2Fighter);
  const stageSelected = stages.find((s) => s.id === selectedStage);

  // Check if all selections are made
  const allSelected = p1Fighter && p2Fighter && selectedStage;

  // Start fight
  const handleStartFight = () => {
    if (allSelected) {
      // Navigate to fight page with selected characters and stage
      navigate("/fight", { 
        state: { 
          p1: p1Fighter, 
          p2: p2Fighter, 
          stage: selectedStage 
        } 
      });
    } else {
      // Show what's missing
      const missing = [];
      if (!p1Fighter) missing.push("Player 1");
      if (!p2Fighter) missing.push("Player 2");
      if (!selectedStage) missing.push("Stage");
      
      toast({
        title: "Selection incomplete",
        description: `Please select: ${missing.join(", ")}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-between bg-arcade-dark overflow-hidden scanlines noise-bg p-4">
      {/* Title */}
      <div className="relative z-10 text-center w-full pt-4">
        <h1 className="font-pixel text-3xl md:text-4xl text-white mb-2">SELECT YOUR FIGHTER & STAGE</h1>
      </div>

      {/* Character & Stage Selection Area */}
      <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-around gap-4 flex-grow">
        {/* P1 Selection */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <h2 className="font-pixel text-xl text-red-500 mb-2">PLAYER 1</h2>
          
          {/* Selected fighter display */}
          <Card className="w-48 h-48 bg-arcade-dark border-2 border-red-500 mb-4 relative overflow-hidden">
            {p1Selected ? (
              <div className="flex flex-col items-center h-full">
                <img 
                  src={p1Selected.image} 
                  alt={p1Selected.name}
                  className="w-full h-5/6 object-cover pixel-corners"
                />
                <p className="font-pixel text-white text-center py-2">{p1Selected.name}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="font-pixel text-red-500 text-center">SELECT<br/>FIGHTER</p>
              </div>
            )}
            <div className="absolute top-0 right-0 bg-red-500 text-black font-pixel text-xs px-2 py-1">
              P1
            </div>
          </Card>

          {/* Fighter Selection */}
          <div className="flex flex-row items-center gap-2">
            <Button 
              onClick={() => setP1Index((prev) => (prev > 0 ? prev - 1 : fighters.length - 1))}
              className="font-pixel bg-arcade-blue/20 border-2 border-arcade-blue h-auto p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Card 
              onClick={() => {
                setP1Fighter(fighters[p1Index].id);
                toast({
                  title: "Player 1 Selected",
                  description: `${fighters[p1Index].name} selected as Player 1`,
                });
              }}
              className={`w-20 h-20 bg-arcade-dark border-2 cursor-pointer transition-all duration-300 ${
                p1Fighter === fighters[p1Index].id 
                  ? "border-arcade-neon shadow-[0_0_10px_#39FF14]" 
                  : "border-red-500 hover:border-arcade-neon"
              }`}
            >
              <img 
                src={fighters[p1Index].image} 
                alt={fighters[p1Index].name}
                className="w-full h-4/5 object-cover"
              />
              <p className="font-pixel text-white text-center text-[10px] py-1">{fighters[p1Index].name}</p>
            </Card>
            
            <Button 
              onClick={() => setP1Index((prev) => (prev < fighters.length - 1 ? prev + 1 : 0))}
              className="font-pixel bg-arcade-blue/20 border-2 border-arcade-blue h-auto p-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="font-pixel text-xs text-arcade-blue mt-2">(USE A/D + G KEYS)</p>
        </div>

        {/* P2 Selection */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <h2 className="font-pixel text-xl text-purple-500 mb-2">PLAYER 2</h2>
          
          {/* Selected fighter display */}
          <Card className="w-48 h-48 bg-arcade-dark border-2 border-purple-500 mb-4 relative overflow-hidden">
            {p2Selected ? (
              <div className="flex flex-col items-center h-full">
                <img 
                  src={p2Selected.image} 
                  alt={p2Selected.name}
                  className="w-full h-5/6 object-cover pixel-corners"
                />
                <p className="font-pixel text-white text-center py-2">{p2Selected.name}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="font-pixel text-purple-500 text-center">SELECT<br/>FIGHTER</p>
              </div>
            )}
            <div className="absolute top-0 right-0 bg-purple-500 text-black font-pixel text-xs px-2 py-1">
              P2
            </div>
          </Card>

          {/* Fighter Selection */}
          <div className="flex flex-row items-center gap-2">
            <Button 
              onClick={() => setP2Index((prev) => (prev > 0 ? prev - 1 : fighters.length - 1))}
              className="font-pixel bg-arcade-blue/20 border-2 border-arcade-blue h-auto p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Card 
              onClick={() => {
                setP2Fighter(fighters[p2Index].id);
                toast({
                  title: "Player 2 Selected",
                  description: `${fighters[p2Index].name} selected as Player 2`,
                });
              }}
              className={`w-20 h-20 bg-arcade-dark border-2 cursor-pointer transition-all duration-300 ${
                p2Fighter === fighters[p2Index].id 
                  ? "border-arcade-neon shadow-[0_0_10px_#39FF14]" 
                  : "border-purple-500 hover:border-arcade-neon"
              }`}
            >
              <img 
                src={fighters[p2Index].image} 
                alt={fighters[p2Index].name}
                className="w-full h-4/5 object-cover"
              />
              <p className="font-pixel text-white text-center text-[10px] py-1">{fighters[p2Index].name}</p>
            </Card>
            
            <Button 
              onClick={() => setP2Index((prev) => (prev < fighters.length - 1 ? prev + 1 : 0))}
              className="font-pixel bg-arcade-blue/20 border-2 border-arcade-blue h-auto p-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="font-pixel text-xs text-arcade-blue mt-2">(USE ARROW KEYS + 1)</p>
        </div>
      </div>
      
      {/* Stage Selection Area */}
      <div className="relative z-10 w-full flex flex-col items-center mb-4">
        <h2 className="font-pixel text-xl text-arcade-blue mb-2">SELECT STAGE</h2>
        
        {/* Stages */}
        <div className="flex flex-row items-center gap-4 mb-2">
          <Button 
            onClick={() => setStageIndex((prev) => (prev > 0 ? prev - 1 : stages.length - 1))}
            className="font-pixel bg-arcade-blue/20 border-2 border-arcade-blue h-auto p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          {stages.map((stage, index) => (
            <Card 
              key={stage.id}
              onClick={() => {
                setSelectedStage(stage.id);
                toast({
                  title: "Stage Selected",
                  description: `${stage.name} selected as fighting stage`,
                });
              }}
              className={`w-36 h-24 bg-arcade-dark border-2 cursor-pointer transition-all duration-300 ${
                stageIndex === index ? "scale-110" : "scale-100"
              } ${
                selectedStage === stage.id 
                  ? "border-arcade-neon shadow-[0_0_10px_#39FF14]" 
                  : stageIndex === index 
                    ? "border-arcade-blue" 
                    : "border-arcade-dark/50 opacity-50"
              }`}
              style={{ display: Math.abs(stageIndex - index) > 1 ? "none" : "block" }}
            >
              <img 
                src={stage.image} 
                alt={stage.name}
                className="w-full h-4/5 object-cover"
              />
              <p className="font-pixel text-white text-center text-xs py-1">{stage.name}</p>
            </Card>
          ))}
          
          <Button 
            onClick={() => setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : 0))}
            className="font-pixel bg-arcade-blue/20 border-2 border-arcade-blue h-auto p-2"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="font-pixel text-xs text-arcade-blue">(USE &lt;/&gt; KEYS + / TO SELECT)</p>
      </div>
      
      {/* Selection Status */}
      <div className="relative z-10 w-full text-center mb-4">
        <div className="flex justify-center gap-4">
          <div className={`px-3 py-1 rounded font-pixel ${p1Fighter ? "bg-green-500" : "bg-red-500"}`}>
            {p1Fighter ? "P1 ✓" : "P1 ✗"}
          </div>
          <div className={`px-3 py-1 rounded font-pixel ${p2Fighter ? "bg-green-500" : "bg-red-500"}`}>
            {p2Fighter ? "P2 ✓" : "P2 ✗"}
          </div>
          <div className={`px-3 py-1 rounded font-pixel ${selectedStage ? "bg-green-500" : "bg-red-500"}`}>
            {selectedStage ? "Stage ✓" : "Stage ✗"}
          </div>
        </div>
        <p className="font-pixel text-white text-xs mt-2">
          {allSelected ? "Press ENTER to start the fight!" : "Select all options to continue"}
        </p>
      </div>
      
      {/* Bottom Buttons */}
      <div className="relative z-10 w-full flex justify-between px-8 pb-6">
        <Button 
          onClick={() => navigate("/menu")}
          className="font-pixel text-white bg-arcade-blue/20 border-2 border-arcade-blue px-6 py-3 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
        >
          BACK TO MENU
        </Button>
        
        <Button 
          onClick={handleStartFight}
          disabled={!allSelected}
          className={`font-pixel text-white px-6 py-3 h-auto ${
            allSelected 
              ? "bg-arcade-neon/20 border-2 border-arcade-neon hover:bg-arcade-neon/40" 
              : "bg-gray-500/20 border-2 border-gray-500 cursor-not-allowed"
          } transition-all duration-300`}
        >
          {allSelected ? "START FIGHT!" : "SELECT ALL OPTIONS"}
        </Button>
      </div>
    </div>
  );
};

export default CharacterSelect;
