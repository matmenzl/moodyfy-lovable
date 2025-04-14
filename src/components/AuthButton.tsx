
import React from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthButtonProps {
  isAuthenticated: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ isAuthenticated }) => {
  const { toast } = useToast();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich abgemeldet."
    });
  };

  return isAuthenticated ? (
    <Button variant="outline" className="bg-transparent border-white/20" onClick={handleLogout}>
      Abmelden
    </Button>
  ) : (
    <Button 
      className="bg-moodyfy-blue hover:bg-moodyfy-blue/80" 
      onClick={handleLogin}
    >
      Anmelden
    </Button>
  );
};

export default AuthButton;
