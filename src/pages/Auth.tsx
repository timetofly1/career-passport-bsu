import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import bsuBear from '@/assets/bsu-bear.png';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { isOnboarded, loading: onboardingLoading } = useOnboarding();

  // Redirect authenticated users properly
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <img src={bsuBear} alt="BSU Bear" className="w-12 h-12 rounded-full" />
        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
        <p className="text-sm text-muted-foreground">Loading your career tools...</p>
      </div>
    );
  }
  if (user && isOnboarded) return <Navigate to="/dashboard" replace />;
  if (user && !isOnboarded) return <Navigate to="/onboarding" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) throw resetError;
        setSignupSuccess(true); // reuse success view
        toast.success('Password reset email sent! Check your inbox.');
      } else if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (signUpError) throw signUpError;
        setSignupSuccess(true);
        toast.success('Account created! Check your email to verify.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Incorrect email or password. Please try again or create a new account.');
          }
          if (signInError.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the confirmation link before signing in.');
          }
          throw signInError;
        }
        toast.success('Welcome back, Bear! 🐻');
      }
    } catch (err: any) {
      const msg = err.message || 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  // Email confirmation success view
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="px-6 py-4 flex items-center gap-3 border-b border-border">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg overflow-hidden">
              <img src={bsuBear} alt="BSU Bear" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-display font-bold text-sm">Career Passport</span>
              <p className="text-[10px] text-muted-foreground leading-none">Career Services & Internship Office</p>
            </div>
          </a>
        </nav>
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">
              {mode === 'forgot' ? 'Reset link sent! 📧' : 'Check your email! 📧'}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {mode === 'forgot'
                ? <>We sent a password reset link to <strong className="text-foreground">{email}</strong>. Click it to set a new password.</>
                : <>We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click it to verify your account, then come back here to sign in.</>
              }
            </p>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => {
                setSignupSuccess(false);
                setMode('login');
              }}
            >
              Back to Sign In
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center gap-3 border-b border-border">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img src={bsuBear} alt="BSU Bear" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-display font-bold text-sm">Career Passport</span>
            <p className="text-[10px] text-muted-foreground leading-none">Career Services & Internship Office</p>
          </div>
        </a>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <img src={bsuBear} alt="BSU Bear" className="w-16 h-16 mx-auto mb-4 rounded-full" />
            <h1 className="text-3xl font-display font-bold mb-2">
              {mode === 'forgot' ? 'Reset Password' : mode === 'login' ? 'Welcome back, Bear!' : 'Join Career Passport'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'forgot'
                ? "Enter your email and we'll send you a reset link"
                : mode === 'login'
                ? 'Sign in to access your career tools'
                : 'Create your account to get started'}
            </p>
          </div>

          {/* Inline error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative pb-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Full name"
                      value={fullName}
                      onChange={e => { setFullName(e.target.value); setError(''); }}
                      className="h-12 pl-10"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="h-12 pl-10"
                required
              />
            </div>
            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="h-12 pl-10"
                  minLength={6}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              <button
                onClick={() => { setMode('forgot'); setError(''); }}
                className="text-primary font-medium hover:underline"
              >
                Forgot your password?
              </button>
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground mt-4">
            {mode === 'forgot' ? 'Remember your password? ' : mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signup' ? 'login' : mode === 'forgot' ? 'login' : 'signup'); setError(''); }}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'forgot' ? 'Sign in' : mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

        </motion.div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Bridgewater State University · Career Services & Internship Office
      </footer>
    </div>
  );
};

export default Auth;
