import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface UserProfile {
  name: string;
  major: string;
  minor: string[];
  year: string;
  goals: string[];
  interests: string[];
}

interface OnboardingContextType {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isOnboarded: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  loading: boolean;
}

const defaultProfile: UserProfile = { name: '', major: '', minor: [], year: '', goals: [], interests: [] };

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be inside OnboardingProvider');
  return ctx;
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile from DB when user logs in
  useEffect(() => {
    if (!user) {
      setProfile(defaultProfile);
      setIsOnboarded(false);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: any; error: any };

      if (data && !error) {
        setProfile({
          name: data.name || '',
          major: data.major || '',
          minor: data.minor || [],
          year: data.year || '',
          goals: data.goals || [],
          interests: data.interests || [],
        });
        setIsOnboarded(data.is_onboarded || false);
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const completeOnboarding = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        major: profile.major,
        minor: profile.minor,
        year: profile.year,
        goals: profile.goals,
        interests: profile.interests,
        is_onboarded: true,
      })
      .eq('user_id', user.id);

    if (!error) {
      setIsOnboarded(true);
    }
  };

  const resetOnboarding = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({
        major: '',
        minor: [],
        year: '',
        goals: [],
        interests: [],
        is_onboarded: false,
      })
      .eq('user_id', user.id);

    setIsOnboarded(false);
    setProfile(p => ({ ...p, major: '', minor: [], year: '', goals: [], interests: [] }));
  };

  return (
    <OnboardingContext.Provider value={{ profile, setProfile, isOnboarded, completeOnboarding, resetOnboarding, loading }}>
      {children}
    </OnboardingContext.Provider>
  );
};
