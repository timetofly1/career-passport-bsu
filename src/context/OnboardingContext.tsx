import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  major: string;
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
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be inside OnboardingProvider');
  return ctx;
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('career-passport-profile');
    return saved ? JSON.parse(saved) : { name: '', major: '', year: '', goals: [], interests: [] };
  });
  const [isOnboarded, setIsOnboarded] = useState(() => localStorage.getItem('career-passport-onboarded') === 'true');

  const completeOnboarding = () => {
    localStorage.setItem('career-passport-profile', JSON.stringify(profile));
    localStorage.setItem('career-passport-onboarded', 'true');
    setIsOnboarded(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('career-passport-profile');
    localStorage.removeItem('career-passport-onboarded');
    setIsOnboarded(false);
    setProfile({ name: '', major: '', year: '', goals: [], interests: [] });
  };

  return (
    <OnboardingContext.Provider value={{ profile, setProfile, isOnboarded, completeOnboarding, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};
