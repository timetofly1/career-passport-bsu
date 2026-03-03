import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboarding } from '@/context/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles, GraduationCap, Target, Heart } from 'lucide-react';

const GOALS = ['Get an Internship', 'Land a Full-Time Job', 'Build a Portfolio', 'Network with Professionals', 'Explore Career Options', 'Start a Business'];
const INTERESTS = ['Technology', 'Business', 'Design', 'Healthcare', 'Engineering', 'Arts & Media', 'Science', 'Education', 'Finance', 'Law'];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Recent Graduate'];

const Onboarding = () => {
  const { profile, setProfile, completeOnboarding } = useOnboarding();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const totalSteps = 4;
  const canProceed = [
    profile.name.trim().length > 0,
    profile.major.trim().length > 0 && profile.year.length > 0,
    profile.goals.length > 0,
    profile.interests.length > 0,
  ];

  const handleFinish = () => {
    completeOnboarding();
    navigate('/dashboard');
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const stepIcons = [Sparkles, GraduationCap, Target, Heart];
  const StepIcon = stepIcons[step];

  const advance = useCallback(() => {
    if (!canProceed[step]) return;
    if (step < totalSteps - 1) setStep(s => s + 1);
    else handleFinish();
  }, [step, canProceed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'BODY') {
          e.preventDefault();
          advance();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-accent">
                <StepIcon className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Step {step + 1} of {totalSteps}</span>
            </div>

            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">Welcome to Career Passport</h1>
                  <p className="text-muted-foreground">Your AI-powered career navigator. Let's start with your name.</p>
                </div>
                <Input
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">Tell us about your studies</h1>
                  <p className="text-muted-foreground">This helps us tailor career advice to your background.</p>
                </div>
                <Input
                  placeholder="Your major (e.g., Computer Science)"
                  value={profile.major}
                  onChange={e => setProfile(p => ({ ...p, major: e.target.value }))}
                  className="h-12 text-base"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2">
                  {YEARS.map(y => (
                    <button
                      key={y}
                      onClick={() => setProfile(p => ({ ...p, year: y }))}
                      className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                        profile.year === y
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">What are your goals?</h1>
                  <p className="text-muted-foreground">Select all that apply. We'll shape your roadmap around these.</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g}
                      onClick={() => setProfile(p => ({ ...p, goals: toggleArrayItem(p.goals, g) }))}
                      className={`p-3 rounded-xl text-sm font-medium border text-left transition-all ${
                        profile.goals.includes(g)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">Your interests</h1>
                  <p className="text-muted-foreground">Pick fields that excite you. This fuels smarter recommendations.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(i => (
                    <button
                      key={i}
                      onClick={() => setProfile(p => ({ ...p, interests: toggleArrayItem(p.interests, i) }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        profile.interests.includes(i)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < totalSteps - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed[step]}
              className="gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!canProceed[step]}
              className="gap-2"
            >
              Launch My Passport <Sparkles className="w-4 h-4" />
            </Button>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground/50 text-center mt-4 select-none">
          Press <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Enter</kbd> to continue
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
