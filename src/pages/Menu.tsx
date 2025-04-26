
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Menu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Log that we've reached the menu page
    console.log("Menu page loaded");
  }, []);

  const handleStartGame = () => {
    navigate("/select");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleExit = async () => {
    if (user) {
      await signOut();
    }
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-arcade-dark overflow-hidden scanlines noise-bg">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-arcade-dark/40 to-arcade-dark/90 z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-4">
        {/* Game Title */}
        <div className="mb-12 text-center">
          <h1 
            data-text="CULTURE WARZ"
            className="font-pixel text-4xl sm:text-5xl md:text-6xl text-white mb-4 glitch-text"
          >
            CULTURE WARZ
          </h1>
          <p className="font-pixel text-arcade-blue text-sm sm:text-base md:text-xl">
            HIP HOP STREET FIGHTER
          </p>
          
          {/* User status */}
          {user ? (
            <p className="font-pixel text-green-500 text-xs mt-2">
              ONLINE: {user.email}
            </p>
          ) : (
            <p className="font-pixel text-arcade-accent text-xs mt-2">
              OFFLINE: LOG IN TO PLAY ONLINE
            </p>
          )}
        </div>
        
        {/* Menu Options */}
        <div className="flex flex-col space-y-4 w-full max-w-xs">
          <Button 
            onClick={handleStartGame}
            className="font-pixel w-full text-white bg-arcade-accent/20 border-2 border-arcade-accent py-6 hover:bg-arcade-accent/40 transition-all duration-300 h-auto"
          >
            {user ? "PLAY ONLINE" : "PRACTICE MODE"}
          </Button>
          
          <Button 
            onClick={handleSettings}
            className="font-pixel w-full text-white bg-arcade-purple/20 border-2 border-arcade-purple py-6 hover:bg-arcade-purple/40 transition-all duration-300 h-auto"
          >
            SETTINGS
          </Button>
          
          {user ? (
            <Button 
              onClick={handleExit}
              className="font-pixel w-full text-white bg-arcade-blue/20 border-2 border-arcade-blue py-6 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
            >
              LOGOUT
            </Button>
          ) : (
            <Button 
              onClick={handleLogin}
              className="font-pixel w-full text-white bg-arcade-blue/20 border-2 border-arcade-blue py-6 hover:bg-arcade-blue/40 transition-all duration-300 h-auto"
            >
              LOGIN / SIGNUP
            </Button>
          )}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-4 left-0 w-full text-center">
        <p className="font-pixel text-white/30 text-xs">© 2023 CULTURE WARZ</p>
      </div>
    </div>
  );
};

export default Menu;
