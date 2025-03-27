
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import CharacterSelect from "./pages/CharacterSelect";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/select" element={<CharacterSelect />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/fight" element={<FightPlaceholder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Temporary placeholder for the fight screen
const FightPlaceholder = () => {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-arcade-dark overflow-hidden scanlines noise-bg">
      <div className="relative z-10 text-center">
        <h1 className="font-pixel text-4xl text-white mb-8">FIGHT!</h1>
        <p className="font-pixel text-arcade-blue mb-12">COMING SOON</p>
        
        <a 
          href="/menu"
          className="font-pixel text-white bg-arcade-accent/20 border-2 border-arcade-accent px-6 py-3 hover:bg-arcade-accent/40 transition-all duration-300 inline-block"
        >
          BACK TO MENU
        </a>
      </div>
    </div>
  );
};

export default App;
