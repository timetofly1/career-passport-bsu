import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, MessageSquare, FileText, Map, Mic, BarChart3 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">Career Passport</span>
        </div>
        <Button size="sm" onClick={() => navigate('/onboarding')} className="gap-2">
          Get Started <ArrowRight className="w-3 h-3" />
        </Button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" /> AI-Powered Career Navigation
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-4">
              Your career journey,{' '}
              <span className="text-primary">intelligently mapped</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Get personalized career roadmaps, AI-powered coaching, and a professional resume builder — all tailored to your unique background.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/onboarding')} className="gap-2 text-base px-8">
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
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Built with AI · Career Passport © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Index;
