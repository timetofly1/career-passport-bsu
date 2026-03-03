import { useOnboarding } from '@/context/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Map, User, Sparkles, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: MessageSquare, label: 'AI Career Chat', desc: 'Get personalized career advice', path: '/chat', color: 'bg-primary/10 text-primary' },
  { icon: Map, label: 'Career Roadmap', desc: 'Visual career path planning', path: '/chat?mode=roadmap', color: 'bg-emerald/10 text-emerald' },
  { icon: FileText, label: 'Resume Builder', desc: 'Generate & edit your resume', path: '/resume', color: 'bg-violet/10 text-violet' },
  { icon: User, label: 'About You', desc: 'AI-powered personal profile', path: '/chat?mode=about', color: 'bg-warm/10 text-warm' },
];

const Dashboard = () => {
  const { profile, resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-lg">Career Passport</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={resetOnboarding} title="Reset onboarding">
          <Settings className="w-4 h-4" />
        </Button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-3xl font-display font-bold mb-1">
            Welcome back, {profile.name.split(' ')[0]} 👋
          </h2>
          <p className="text-muted-foreground mb-8">
            {profile.major} · {profile.year} · Ready to explore your career path
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.button
              key={f.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              onClick={() => navigate(f.path)}
              className="group p-6 rounded-2xl border border-border bg-card text-left hover:border-primary/40 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-lg mt-4">{f.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 rounded-2xl bg-card border border-border"
        >
          <h3 className="font-display font-semibold mb-4">Your Profile Snapshot</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Goals</p>
              <div className="flex flex-wrap gap-1">
                {profile.goals.map(g => (
                  <span key={g} className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">{g}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Interests</p>
              <div className="flex flex-wrap gap-1">
                {profile.interests.map(i => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">{i}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Year</p>
              <span className="text-sm font-medium">{profile.year}</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
