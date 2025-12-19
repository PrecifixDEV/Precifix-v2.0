import React, { useState, useEffect, useContext, createContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  subscriptionStatus: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Lista de rotas públicas que não exigem autenticação
const PUBLIC_ROUTES = ['/login', '/quote/view/', '/signup'];

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isPublicRoute = (pathname: string) => {
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  };

  const checkTrialStatus = async (currentUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setSubscriptionStatus(profile?.subscription_status || null);

      if (profile?.subscription_status === 'trial') {
        const createdAt = new Date(currentUser.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
          await supabase.auth.signOut();
          toast({
            title: "Período de teste expirado",
            description: "Seus 7 dias gratuitos acabaram. Por favor, assine um plano para continuar.",
            variant: "destructive",
          });
          navigate('/login');
        }
      }
    } catch (err) {
      console.error('Unexpected error checking trial status:', err);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);

        // Check trial status whenever session updates/user signs in
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await checkTrialStatus(currentSession.user);
        }

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Redirect authenticated users from login/signup page to home
          if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/');
          }
        }
      } else {
        setSession(null);
        setUser(null);
        setSubscriptionStatus(null);
        // Redirect unauthenticated users to login page, unless they are on a public route
        if (!isPublicRoute(location.pathname)) {
          navigate('/login');
        }
      }
      setIsLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        checkTrialStatus(initialSession.user);

        // Redirect authenticated users trying to access login or signup
        if (location.pathname === '/login' || location.pathname === '/signup') {
          navigate('/');
        }
      } else {
        if (!isPublicRoute(location.pathname)) {
          navigate('/login');
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <SessionContext.Provider value={{ session, user, isLoading, subscriptionStatus }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};