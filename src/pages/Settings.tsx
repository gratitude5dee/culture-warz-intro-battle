
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-arcade-dark overflow-hidden scanlines noise-bg">
      <div className="relative z-10 text-center">
        <h1 className="font-pixel text-4xl text-white mb-8">SETTINGS</h1>
        <p className="font-pixel text-arcade-blue mb-12">COMING SOON</p>
        
        <Button 
          onClick={() => navigate("/menu")}
          className="font-pixel text-white bg-arcade-accent/20 border-2 border-arcade-accent px-6 py-3 hover:bg-arcade-accent/40 transition-all duration-300 h-auto"
        >
          BACK TO MENU
        </Button>
      </div>
    </div>
  );
};

export default Settings;
