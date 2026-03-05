import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const STORAGE_KEY = 'career-passport-profile';
const ONBOARDED_KEY = 'career-passport-onboarded';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be inside OnboardingProvider');
  return ctx;
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem(ONBOARDED_KEY) === 'true';
  });
  const [loading] = useState(false);

  // Persist profile to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setIsOnboarded(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDED_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, major: '', minor: [], year: '', goals: [], interests: [] }));
    setIsOnboarded(false);
    setProfile(p => ({ ...p, major: '', minor: [], year: '', goals: [], interests: [] }));
  };

  return (
    <OnboardingContext.Provider value={{ profile, setProfile, isOnboarded, completeOnboarding, resetOnboarding, loading }}>
      {children}
    </OnboardingContext.Provider>
  );
};
