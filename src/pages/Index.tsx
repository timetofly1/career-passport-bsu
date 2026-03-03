import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, FileText, Map, Mic, BarChart3, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';

const BSU_LINKS = [
  { label: 'Handshake', url: 'https://bridgew.joinhandshake.com/edu' },
  { label: 'Schedule Appointment', url: 'https://bridgew.joinhandshake.com/stu/appointments' },
  { label: 'Academics & Majors', url: 'https://www.bridgew.edu/academics' },
  { label: 'Career Services', url: 'https://careers.bridgew.edu/' },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isOnboarded, loading: onboardingLoading } = useOnboarding();

  // Redirect authenticated users away from landing page
  if (authLoading || onboardingLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }
  if (user && isOnboarded) return <Navigate to="/dashboard" replace />;
  if (user && !isOnboarded) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">BSU</span>
          </div>
          <div>
            <span className="font-display font-bold text-sm">Career Passport</span>
            <p className="text-[10px] text-muted-foreground leading-none">Career Services & Internship Office</p>
          </div>
        </div>
        <Button size="sm" onClick={() => navigate('/auth')} className="gap-2">
          Get Started <ArrowRight className="w-3 h-3" />
        </Button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
              🐻 Bridgewater State University · Career Services & Internships
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-4">
              Your career journey,{' '}
              <span className="text-primary">powered by BSU</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              AI-powered career coaching built for BSU Bears. Get personalized roadmaps, mock interviews, resume help, and skills analysis — all connected to BSU Career Services resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 text-base px-8">
                Start Your Passport <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-12"
          >
            {[
              { icon: MessageSquare, label: 'AI Career Chat' },
              { icon: Map, label: 'Career Roadmaps' },
              { icon: FileText, label: 'Resume Builder' },
              { icon: Mic, label: 'Interview Prep' },
              { icon: BarChart3, label: 'Skills Gap Analyzer' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm">
                <f.icon className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </motion.div>

          {/* BSU Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            {BSU_LINKS.map(l => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-primary/20 text-primary hover:bg-accent transition-colors"
              >
                {l.label} <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </motion.div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Bridgewater State University · Career Services & Internship Office · Career Passport © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Index;
