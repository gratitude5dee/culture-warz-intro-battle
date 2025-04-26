
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  const [p1Fighter, setP1Fighter] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [p1Index, setP1Index] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const [foundMatch, setFoundMatch] = useState(false);

  // Handle keydown events for selection
  useEffect(() => {
    if (searching) return; // Disable controls while searching

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only P1 Controls for online play
      if (e.key === "a" || e.key === "A") {
        setP1Index((prev) => (prev > 0 ? prev - 1 : fighters.length - 1));
      } else if (e.key === "d" || e.key === "D") {
        setP1Index((prev) => (prev < fighters.length - 1 ? prev + 1 : 0));
      } else if (e.key === "g" || e.key === "G") {
        setP1Fighter(fighters[p1Index].id);
        toast(`${fighters[p1Index].name} selected as your Fighter`, {
          description: "Press Enter when ready to find a match.",
        });
      }

      // Background controls
      if (e.key === "," || e.key === "<") {
        setStageIndex((prev) => (prev > 0 ? prev - 1 : stages.length - 1));
      } else if (e.key === "." || e.key === ">") {
        setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : 0));
      } else if (e.key === "/") {
        setSelectedStage(stages[stageIndex].id);
        toast(`${stages[stageIndex].name} selected as fighting stage`, {
          description: "Press Enter when ready to find a match.",
        });
      }
      
      // Start matchmaking with Enter key if all selections are made
      if (e.key === "Enter" && p1Fighter && selectedStage) {
        handleFindMatch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [p1Index, stageIndex, p1Fighter, selectedStage, searching]);
  
  // Subscribe to profile status changes and match creation
  useEffect(() => {
    if (!user || !searching) return;

    // Listen for changes to the user's profile (status updates)
    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          // Check if status now contains in_match:
          const status = payload.new.status;
          if (status && status.startsWith('in_match:')) {
            const matchId = status.split(':')[1];
            
            // Get match details
            const { data: match } = await supabase
              .from('matches')
              .select('*')
              .eq('id', matchId)
              .single();
              
            if (match) {
              setFoundMatch(true);
              // Navigate to fight screen with match data
              navigate("/fight", { 
                state: { 
                  matchId,
                  p1: match.player1_id === user.id ? match.p1_character : match.p2_character,
                  p2: match.player1_id === user.id ? match.p2_character : match.p1_character,
                  stage: match.stage,
                  isPlayer1: match.player1_id === user.id
                } 
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
    };
  }, [user, searching, navigate]);

  // Get the actual fighter objects
  const p1Selected = fighters.find((f) => f.id === p1Fighter);
  const stageSelected = stages.find((s) => s.id === selectedStage);

  // Check if all selections are made
  const allSelected = p1Fighter && selectedStage;

  // Find a match
  const handleFindMatch = async () => {
    if (!user) {
      toast.error("You must be logged in to find a match");
      navigate("/auth");
      return;
    }
    
    if (!allSelected) {
      // Show what's missing
      const missing = [];
      if (!p1Fighter) missing.push("Fighter");
      if (!selectedStage) missing.push("Stage");
      
      toast.error(`Please select: ${missing.join(", ")}`);
      return;
    }

    setSearching(true);
    
    try {
      // Clear any existing queue entries for this user
      await supabase
        .from('queue')
        .delete()
        .eq('user_id', user.id);

      // Add to matchmaking queue
      await supabase
        .from('queue')
        .insert({
          user_id: user.id,
          character: p1Fighter,
          stage: selectedStage
        });
      
      // Update user status
      await supabase
        .from('profiles')
        .update({ status: 'searching' })
        .eq('id', user.id);
      
      // Invoke the find-match function
      await supabase.functions.invoke('find-match');
      
      toast("Looking for opponents...", {
        description: "This might take a moment."
      });
    } catch (error) {
      console.error("Error finding match:", error);
      toast.error("Failed to start matchmaking");
      setSearching(false);
    }
  };

  // Cancel matchmaking
  const handleCancelSearch = async () => {
    if (!user) return;
    
    try {
      // Remove from queue
      await supabase
        .from('queue')
        .delete()
        .eq('user_id', user.id);
      
      // Update status back to online
      await supabase
        .from('profiles')
        .update({ status: 'online' })
        .eq('id', user.id);
      
      setSearching(false);
      toast("Matchmaking canceled");
    } catch (error) {
      console.error("Error canceling matchmaking:", error);
      toast.error("Failed to cancel matchmaking");
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-between bg-arcade-dark overflow-hidden scanlines noise-bg p-4">
      {/* Title */}
      <div className="relative z-10 text-center w-full pt-4">
        <h1 className="font-pixel text-3xl md:text-4xl text-white mb-2">
          {searching ? "FINDING A MATCH..." : "SELECT YOUR FIGHTER & STAGE"}
        </h1>
        {searching && (
          <p className="font-pixel text-arcade-blue animate-pulse">
            Searching for opponents...
          </p>
        )}
      </div>

      {/* Character & Stage Selection Area */}
      <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-around gap-4 flex-grow">
        {/* P1 Selection */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <h2 className="font-pixel text-xl text-red-500 mb-2">YOUR FIGHTER</h2>
          
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
              YOU
            </div>
          </Card>

          {/* Fighter Selection */}
          {!searching && (
            <>
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
                    toast(`${fighters[p1Index].name} selected as your Fighter`);
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
            </>
          )}
        </div>
      </div>
      
      {/* Stage Selection Area */}
      <div className="relative z-10 w-full flex flex-col items-center mb-4">
        <h2 className="font-pixel text-xl text-arcade-blue mb-2">SELECT STAGE</h2>
        
        {/* Stages */}
        {!searching && (
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
                  toast(`${stage.name} selected as fighting stage`);
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
        )}
        {!searching && (
          <p className="font-pixel text-xs text-arcade-blue">(USE &lt;/&gt; KEYS + / TO SELECT)</p>
        )}
      </div>
      
      {/* Selection Status */}
      {!searching && (
        <div className="relative z-10 w-full text-center mb-4">
          <div className="flex justify-center gap-4">
            <div className={`px-3 py-1 rounded font-pixel ${p1Fighter ? "bg-green-500" : "bg-red-500"}`}>
              {p1Fighter ? "Fighter ✓" : "Fighter ✗"}
            </div>
            <div className={`px-3 py-1 rounded font-pixel ${selectedStage ? "bg-green-500" : "bg-red-500"}`}>
              {selectedStage ? "Stage ✓" : "Stage ✗"}
            </div>
          </div>
          <p className="font-pixel text-white text-xs mt-2">
            {allSelected ? "Press ENTER to find a match!" : "Select all options to continue"}
          </p>
        </div>
      )}
      
      {/* Searching Status */}
      {searching && (
        <div className="relative z-10 w-full text-center mb-8 flex flex-col items-center">
          <div className="animate-spin mb-4">
            <Loader2 size={48} className="text-arcade-accent" />
          </div>
          <p className="font-pixel text-white text-lg">SEARCHING FOR OPPONENT</p>
          <p className="font-pixel text-arcade-blue text-sm mt-2">Wait time: 0:00</p>
        </div>
      )}
      
      {/* Bottom Buttons */}
      <div className="relative z-10 w-full flex justify-between px-8 pb-6">
        {searching ? (
          <div className="w-full flex justify-center">
            <Button 
              onClick={handleCancelSearch}
              className="font-pixel text-white bg-arcade-accent/20 border-2 border-arcade-accent px-6 py-3 hover:bg-arcade-accent/40 transition-all duration-300 h-auto"
            >
              CANCEL SEARCH
            </Button>
          </div>
        ) : (
          <>
            <Button 
              onClick={() => navigate("/menu")}
              className="font-pixel text-white bg-arcade-blue/20 border-2 border-arcade-blue px-6 py-3 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
            >
              BACK TO MENU
            </Button>
            
            <Button 
              onClick={handleFindMatch}
              disabled={!allSelected}
              className={`font-pixel text-white px-6 py-3 h-auto ${
                allSelected 
                  ? "bg-arcade-neon/20 border-2 border-arcade-neon hover:bg-arcade-neon/40" 
                  : "bg-gray-500/20 border-2 border-gray-500 cursor-not-allowed"
              } transition-all duration-300`}
            >
              {allSelected ? "FIND MATCH" : "SELECT ALL OPTIONS"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CharacterSelect;
