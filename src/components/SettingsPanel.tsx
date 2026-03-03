import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Settings, LogOut, User, KeyRound, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SettingsPanel = () => {
  const { user, signOut } = useAuth();
  const { profile, resetOnboarding } = useOnboarding();
  const [open, setOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const isEmailUser = user?.app_metadata?.provider === 'email';

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully');
      setNewPassword('');
      setChangingPassword(false);
    }
  };

  if (!open) {
    return (
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="Settings">
        <Settings className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">Settings</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Account Info */}
          <section>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Account</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{profile.name || 'BSU Student'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 rounded-xl bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-0.5">Major</p>
                  <p className="font-medium text-xs truncate">{profile.major || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-0.5">Year</p>
                  <p className="font-medium text-xs">{profile.year || '—'}</p>
                </div>
              </div>
              {profile.minor && profile.minor.length > 0 && (
                <div className="p-3 rounded-xl bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">Minor(s)</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.minor.map(m => (
                      <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Password Change (email users only) */}
          {isEmailUser && (
            <section>
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Security</h3>
              {!changingPassword ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setChangingPassword(true)}
                >
                  <KeyRound className="w-4 h-4" /> Change Password
                </Button>
              ) : (
                <div className="space-y-3 p-4 rounded-xl border border-border">
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handlePasswordChange} disabled={saving} className="flex-1">
                      {saving ? 'Saving…' : 'Update'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setChangingPassword(false); setNewPassword(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Actions */}
          <section>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => { resetOnboarding(); setOpen(false); }}
              >
                <RotateCcw className="w-4 h-4" /> Redo Onboarding
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </section>
        </div>

        <div className="px-6 py-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            BSU Career Passport · Career Services & Internship Office
          </p>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
