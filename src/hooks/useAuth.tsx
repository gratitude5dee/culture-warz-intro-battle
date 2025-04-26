
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Update user status in profile when logging in/out
        if (event === 'SIGNED_IN' && session?.user) {
          await supabase
            .from('profiles')
            .update({ status: 'online' })
            .eq('id', session.user.id);
        } else if (event === 'SIGNED_OUT') {
          // We don't have user ID at this point, so we can't update the status
          // This will be handled by the Supabase function when the session expires
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Update user status to online if logged in
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ status: 'online' })
          .eq('id', session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      // Update status to offline when component unmounts if user is logged in
      if (user) {
        supabase
          .from('profiles')
          .update({ status: 'offline' })
          .eq('id', user.id)
          .then();
      }
      subscription.unsubscribe();
    };
  }, []);

  // Function to sign out and update status
  const signOut = async () => {
    if (user) {
      // Set status to offline before signing out
      await supabase
        .from('profiles')
        .update({ status: 'offline' })
        .eq('id', user.id);
    }
    return supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
};
