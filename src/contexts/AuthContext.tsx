import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile, Merchant } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  merchant: Merchant | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setMerchant(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // Handle specific error cases
        if (profileError.code === 'PGRST116') {
          // No profile found - this is expected for new users
          console.log('No profile found for user:', userId);
          setProfile(null);
          setMerchant(null);
          setLoading(false);
          return;
        }
        
        // For other errors (like 500), log but don't show toast to prevent spam
        console.error('Profile fetch error:', profileError);
        setProfile(null);
        setMerchant(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch merchant if user has one
      if (profileData.merchant_id) {
        try {
          const { data: merchantData, error: merchantError } = await supabase
            .from('merchants')
            .select('*')
            .eq('id', profileData.merchant_id)
            .single();

          if (merchantError) {
            console.error('Merchant fetch error:', merchantError);
            setMerchant(null);
          } else {
            setMerchant(merchantData);
          }
        } catch (merchantError) {
          console.error('Exception fetching merchant:', merchantError);
          setMerchant(null);
        }
      } else {
        setMerchant(null);
      }
    } catch (error) {
      console.error('Exception in fetchProfile:', error);
      setProfile(null);
      setMerchant(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    toast.success('Successfully signed in!');
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw error;
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      toast.success('Check your email for the confirmation link!');
    } else if (data.session) {
      toast.success('Account created successfully! Welcome!');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    
    setUser(null);
    setProfile(null);
    setMerchant(null);
    toast.success('Successfully signed out!');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    setProfile(prev => prev ? { ...prev, ...updates } : null);
    toast.success('Profile updated successfully!');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    toast.success('Password reset email sent! Check your inbox.');
  };

  const value = {
    user,
    profile,
    merchant,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
