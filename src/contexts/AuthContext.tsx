import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signIn: (emailOrPhone: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  demoSignIn: () => void;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { full_name: 'Sandeep Sah', phone: '+91 98765 43210' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'sandeep@virtualnumber.in',
  role: 'authenticated'
} as unknown as User;

const DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Sandeep Sah',
  phone: '+91 98765 43210',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DEMO_SESSION: Session = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: DEMO_USER
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('vn_demo_auth') === 'true') {
      setUser(DEMO_USER);
      setSession(DEMO_SESSION);
      setProfile(DEMO_PROFILE);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('vn_demo_auth') === 'true') return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data as Profile);
  };

  const demoSignIn = () => {
    localStorage.setItem('vn_demo_auth', 'true');
    setUser(DEMO_USER);
    setSession(DEMO_SESSION);
    setProfile(DEMO_PROFILE);
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } }
    });
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({ id: user.id, full_name: fullName, phone });
      }
    }
    return { error };
  };

  const signIn = async (emailOrPhone: string, password: string) => {
    const isEmail = emailOrPhone.includes('@');
    if (isEmail) {
      const { error } = await supabase.auth.signInWithPassword({ email: emailOrPhone, password });
      return { error };
    } else {
      const { error } = await supabase.auth.signInWithPassword({ phone: emailOrPhone, password });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem('vn_demo_auth');
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    if (user.id === DEMO_USER.id) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) setProfile(prev => prev ? { ...prev, ...updates } : null);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signInWithGoogle, demoSignIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
