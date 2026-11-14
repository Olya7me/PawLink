import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { isSupabaseConfigured, supabase } from '@/services/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setIsLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    })();

    if (!isSupabaseConfigured) {
      return () => {
        mounted = false;
      };
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isConfigured: isSupabaseConfigured,
      isAuthenticated: Boolean(session?.user),
      refreshSession,
    }),
    [session, isLoading, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
