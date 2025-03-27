
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn, delay } from "@/lib/utils";

const IntroScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const animationSequence = async () => {
      await delay(500);
      setShowTitle(true);
      
      await delay(1500);
      setShowSubtitle(true);
      
      await delay(2000);
      setShowPrompt(true);
    };
    
    animationSequence();
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        handleContinue();
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleContinue = async () => {
    if (isExiting) return;
    
    setIsExiting(true);
    
    // Play exit animations
    setShowPrompt(false);
    await delay(100);
    setShowSubtitle(false);
    await delay(100);
    setShowTitle(false);
    
    // Wait for animations to complete
    await delay(500);
    
    // Navigate to menu
    navigate("/menu");
  };

  return (
    <div 
      onClick={handleContinue}
      className="relative w-full h-screen flex flex-col items-center justify-center bg-arcade-dark overflow-hidden scanlines scanline-effect noise-bg cursor-pointer"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 noise-bg"></div>
      <div className="absolute inset-0 bg-gradient-radial from-arcade-dark/40 to-arcade-dark/90 z-0"></div>
      
      <div className="absolute w-full h-full flex flex-col items-center justify-center z-10 px-6">
        {/* Main Title */}
        <div 
          className={cn(
            "relative transition-all duration-700 transform",
            showTitle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20"
          )}
        >
          <h1 
            data-text="CULTURE WARZ"
            className="font-pixel text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 glitch-text"
          >
            CULTURE WARZ
          </h1>
          <div className="absolute -inset-1 bg-arcade-accent/20 blur-md -z-10 animate-pulse-soft"></div>
        </div>
        
        {/* Subtitle */}
        <div 
          className={cn(
            "relative transition-all duration-700 delay-300 transform",
            showSubtitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 
            className="font-pixel text-xl sm:text-2xl md:text-3xl text-arcade-blue mt-2 animate-glitch-accent"
          >
            HIP HOP STREET FIGHTER
          </h2>
        </div>
        
        {/* Press Start Prompt */}
        <div 
          className={cn(
            "absolute bottom-20 transition-all duration-500 delay-500 transform",
            showPrompt ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <p className="font-pixel text-white text-xl animate-blink">
            PRESS START
          </p>
        </div>
      </div>
      
      {/* Bottom CRT Line Effect */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/40 to-transparent"></div>
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none"></div>
    </div>
  );
};

export default IntroScreen;
