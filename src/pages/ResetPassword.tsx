import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import bsuBear from '@/assets/bsu-bear.png';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check for recovery token in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      const msg = err.message || 'Failed to update password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="px-6 py-4 flex items-center gap-3 border-b border-border">
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img src={bsuBear} alt="BSU Bear" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-display font-bold text-sm">Career Passport</span>
            <p className="text-[10px] text-muted-foreground leading-none">Career Services & Internship Office</p>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Password Updated! 🎉</h1>
            <p className="text-muted-foreground text-sm mb-6">Your password has been reset successfully. You can now sign in with your new password.</p>
            <Button className="w-full h-12" onClick={() => navigate('/auth')}>
              Go to Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="px-6 py-4 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-lg overflow-hidden">
          <img src={bsuBear} alt="BSU Bear" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="font-display font-bold text-sm">Career Passport</span>
          <p className="text-[10px] text-muted-foreground leading-none">Career Services & Internship Office</p>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src={bsuBear} alt="BSU Bear" className="w-16 h-16 mx-auto mb-4 rounded-full" />
            <h1 className="text-3xl font-display font-bold mb-2">Set New Password</h1>
            <p className="text-muted-foreground text-sm">Enter your new password below.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="h-12 pl-10"
                minLength={6}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                className="h-12 pl-10"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 gap-2" disabled={loading || !!error && error.includes('Invalid')}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
              ) : (
                <>Update Password <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </motion.div>
      </main>
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Bridgewater State University · Career Services & Internship Office
      </footer>
    </div>
  );
};

export default ResetPassword;
