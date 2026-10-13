// ============================================================================
// ReVento - Authentication & Authorization Context
// Supports Supabase Auth & Multi-Account Switching for Testing
// ============================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile, UserRole } from '../types/database';
import {
  isSupabaseConfigured,
  supabase,
  getProfileById,
  updateProfile,
} from '../lib/supabase';
import { INITIAL_PROFILES, getLocalStore, setLocalStore } from '../lib/storageFallback';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    email: string;
    password?: string;
    fullName: string;
    companyName?: string;
    role: UserRole;
    city: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<Profile>) => Promise<void>;
  switchDemoAccount: (profileId: string) => void;
  availableDemoAccounts: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'revento_active_user_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load available demo accounts from store
  const availableDemoAccounts = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            const p = await getProfileById(session.user.id);
            if (p && mounted) {
              setProfile(p);
              setIsLoading(false);
              return;
            }
          }

          // Supabase auth state listener
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (newSession?.user) {
                setUser({ id: newSession.user.id, email: newSession.user.email || '' });
                const p = await getProfileById(newSession.user.id);
                setProfile(p);
              } else {
                setUser(null);
                setProfile(null);
              }
            }
          );
        }

        // Check local persisted session
        const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY) || 'usr-organizer-demo';
        const profiles = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);
        const matched = profiles.find((p) => p.id === storedUserId) || profiles[0];

        if (mounted && matched) {
          setUser({ id: matched.id, email: `${matched.role}@revento-events.com` });
          setProfile(matched);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || email });
          const p = await getProfileById(data.user.id);
          setProfile(p);
          localStorage.setItem(AUTH_STORAGE_KEY, data.user.id);
          return { success: true };
        }
      }

      // Local fallback sign in
      const profiles = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);
      const matched =
        profiles.find((p) => p.full_name.toLowerCase().includes(email.split('@')[0].toLowerCase())) ||
        profiles.find((p) => p.id === email) ||
        profiles[0];

      if (matched) {
        setUser({ id: matched.id, email });
        setProfile(matched);
        localStorage.setItem(AUTH_STORAGE_KEY, matched.id);
        return { success: true };
      }

      return { success: false, error: 'User not found' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: {
    email: string;
    password?: string;
    fullName: string;
    companyName?: string;
    role: UserRole;
    city: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && data.password) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              company_name: data.companyName,
              role: data.role,
              city: data.city,
            },
          },
        });
        if (error) return { success: false, error: error.message };
        if (authData.user) {
          setUser({ id: authData.user.id, email: authData.user.email || data.email });
          // Ensure profile is recorded
          const newP = await updateProfile(authData.user.id, {
            full_name: data.fullName,
            company_name: data.companyName || null,
            role: data.role,
            city: data.city,
          });
          setProfile(newP);
          localStorage.setItem(AUTH_STORAGE_KEY, authData.user.id);
          return { success: true };
        }
      }

      // Local store new profile
      const newId = 'usr-' + Math.random().toString(36).substring(2, 9);
      const newP: Profile = {
        id: newId,
        role: data.role,
        full_name: data.fullName,
        company_name: data.companyName || null,
        phone: null,
        city: data.city,
        address: null,
        bio: null,
        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const profiles = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);
      profiles.unshift(newP);
      setLocalStore('profiles', profiles);

      setUser({ id: newId, email: data.email });
      setProfile(newP);
      localStorage.setItem(AUTH_STORAGE_KEY, newId);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = await updateProfile(profile.id, updates);
    setProfile(updated);
  };

  const switchDemoAccount = (profileId: string) => {
    const profiles = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setUser({ id: target.id, email: `${target.role}@revento-events.com` });
      setProfile(target);
      localStorage.setItem(AUTH_STORAGE_KEY, target.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || 'organizer',
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
        switchDemoAccount,
        availableDemoAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
