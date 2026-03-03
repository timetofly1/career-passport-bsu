import { useOnboarding } from '@/context/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Map, User, ArrowRight, Settings, Mic, BarChart3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: MessageSquare, label: 'AI Career Chat', desc: 'Get personalized career advice', path: '/chat', color: 'bg-primary/10 text-primary' },
  { icon: Map, label: 'Career Roadmap', desc: 'Step-by-step career path planning', path: '/roadmap', color: 'bg-emerald/10 text-emerald' },
  { icon: FileText, label: 'Resume Builder', desc: 'Generate & edit your resume', path: '/resume', color: 'bg-violet/10 text-violet' },
  { icon: Mic, label: 'Interview Prep', desc: 'Mock questions & AI feedback', path: '/interview', color: 'bg-warm/10 text-warm' },
  { icon: BarChart3, label: 'Skills Gap Analyzer', desc: 'Compare skills to job requirements', path: '/skills-gap', color: 'bg-primary/10 text-primary' },
  { icon: User, label: 'About You', desc: 'AI-powered personal profile', path: '/chat?mode=about', color: 'bg-violet/10 text-violet' },
];

const bsuResources = [
  { label: 'Access Handshake', url: 'https://bridgew.joinhandshake.com/edu', emoji: '🤝' },
  { label: 'Schedule Appointment', url: 'https://bridgew.joinhandshake.com/stu/appointments', emoji: '📅' },
  { label: 'Find an Internship', url: 'https://bridgewater.uconnectlabs.com/channels/find-an-internship/', emoji: '💼' },
  { label: 'Internship Funding', url: 'https://careers.bridgew.edu/channels/find-funding-opportunities/', emoji: '💰' },
  { label: 'Resume & Cover Letter', url: 'https://careers.bridgew.edu/channels/create-a-resume-cover-letter/', emoji: '📝' },
  { label: 'Interview Preparation', url: 'https://careers.bridgew.edu/channels/prepare-for-an-interview/', emoji: '🎤' },
  { label: 'Career Fairs & Events', url: 'https://careers.bridgew.edu/channels/career-fairs-events/', emoji: '📣' },
  { label: 'Expand Your Network', url: 'https://careers.bridgew.edu/channels/expand-your-network-mentor/', emoji: '🌐' },
];

const Dashboard = () => {
  const { profile, resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-xs">BSU</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">Career Passport</h1>
            <p className="text-[10px] text-muted-foreground">Career Services & Internship Office</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={resetOnboarding} title="Reset onboarding">
          <Settings className="w-4 h-4" />
        </Button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-3xl font-display font-bold mb-1">
            Welcome back, {profile.name.split(' ')[0]} 🐻
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

        {/* BSU Career Services Resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">BSU Career Services Resources</h3>
            <a
              href="https://careers.bridgew.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Visit careers.bridgew.edu <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {bsuResources.map(r => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 transition-all text-sm"
              >
                <span>{r.emoji}</span>
                <span className="text-xs font-medium">{r.label}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Profile Snapshot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-6 rounded-2xl bg-card border border-border"
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

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground border-t border-border">
        Bridgewater State University · Career Services & Internship Office · <a href="https://careers.bridgew.edu/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">careers.bridgew.edu</a>
      </footer>
    </div>
  );
};

export default Dashboard;
