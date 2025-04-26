
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/menu');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-arcade-dark overflow-hidden scanlines noise-bg">
      <div className="relative z-10 flex flex-col items-center">
        <h1 
          data-text="CULTURE WARZ"
          className="font-pixel text-5xl sm:text-6xl md:text-7xl text-white mb-8 glitch-text"
        >
          CULTURE WARZ
        </h1>
        <p className="font-pixel text-arcade-blue text-xl sm:text-2xl mb-12">
          HIP HOP STREET FIGHTER
        </p>
        <Button 
          onClick={handleStart}
          className="font-pixel text-2xl text-white bg-arcade-accent/20 border-4 border-arcade-accent px-8 py-6 hover:bg-arcade-accent/40 transition-all duration-300 h-auto animate-pulse"
        >
          PRESS START
        </Button>
      </div>
    </div>
  );
};

export default Index;
