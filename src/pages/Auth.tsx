
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/menu');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        toast.success('Account created! Please check your email.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-arcade-dark overflow-hidden scanlines noise-bg">
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-4">
        <h1 className="font-pixel text-4xl sm:text-5xl text-white mb-8">
          CULTURE WARZ
        </h1>

        <form onSubmit={handleAuth} className="w-full space-y-4">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-pixel bg-black/50 border-arcade-accent text-white"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="font-pixel bg-black/50 border-arcade-accent text-white"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-pixel bg-black/50 border-arcade-accent text-white"
          />
          
          <Button 
            type="submit"
            className="font-pixel w-full text-white bg-arcade-accent/20 border-2 border-arcade-accent py-6 hover:bg-arcade-accent/40 transition-all duration-300 h-auto"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </Button>
        </form>

        <Button
          onClick={() => setIsLogin(!isLogin)}
          variant="link"
          className="font-pixel text-arcade-blue mt-4"
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </Button>

        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="font-pixel text-white/50 mt-8"
        >
          BACK TO TITLE
        </Button>
      </div>
    </div>
  );
};

export default Auth;
