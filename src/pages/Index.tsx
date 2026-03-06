import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, FileText, Map, Mic, BarChart3, ExternalLink } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import bsuBear from '@/assets/bsu-bear.png';
import bsuMascot from '@/assets/bsu-mascot.png';

const BSU_LINKS = [
  { label: 'Handshake', url: 'https://bridgew.joinhandshake.com/edu' },
  { label: 'Schedule Appointment', url: 'https://bridgew.joinhandshake.com/stu/appointments' },
  { label: 'Academics & Majors', url: 'https://www.bridgew.edu/academics' },
  { label: 'Career Services', url: 'https://careers.bridgew.edu/' },
];

const FEATURES = [
  {
    icon: MessageSquare,
    label: 'AI Career Chat',
    bg: 'bg-accent',
    color: 'text-primary',
    description: 'Get personalized career advice tailored to your major, year, and goals — with direct links to BSU resources like Handshake and Big Interview.',
  },
  {
    icon: Map,
    label: 'Career Roadmap',
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
    description: 'Generate a step-by-step career plan with phases, milestones, and BSU resources — customized for your timeline from 6 months to 5 years.',
  },
  {
    icon: FileText,
    label: 'Resume Builder',
    bg: 'bg-violet-50',
    color: 'text-violet-600',
    description: 'Build and edit your resume with AI assistance, live preview, multiple templates, and one-click PDF export.',
  },
  {
    icon: Mic,
    label: 'Interview Prep',
    bg: 'bg-orange-50',
    color: 'text-orange-600',
    description: 'Practice behavioral, technical, and case study questions with AI feedback using the STAR method — personalized to your background.',
  },
  {
    icon: BarChart3,
    label: 'Skills Gap Analyzer',
    bg: 'bg-accent',
    color: 'text-primary',
    description: 'See your readiness score for any role, identify skill gaps, and get a prioritized action plan with BSU resources to close the gaps.',
  },
];

const StatsBar = () => (
  <section className="bg-accent w-full">
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="md:border-r md:border-primary/15">
          <p className="text-2xl font-bold text-foreground">5 AI-Powered Tools</p>
          <p className="text-sm text-muted-foreground mt-1">Built for BSU students</p>
        </div>
        <div className="md:border-r md:border-primary/15">
          <p className="text-2xl font-bold text-foreground">100% Free</p>
          <p className="text-sm text-muted-foreground mt-1">For all BSU Bears</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">Connected to BSU</p>
          <p className="text-sm text-muted-foreground mt-1">Handshake, Big Interview & more</p>
        </div>
      </div>
    </div>
  </section>
);

const Index = () => {
  const navigate = useNavigate();
  const { isOnboarded, loading } = useOnboarding();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }
  if (isOnboarded) return <Navigate to="/dashboard" replace />;

  const handleGetStarted = () => navigate('/onboarding');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img src={bsuBear} alt="BSU Bear" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-display font-bold text-sm">Career Passport</span>
            <p className="text-[10px] text-muted-foreground leading-none">Career Services & Internship Office</p>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-16" style={{ background: 'radial-gradient(ellipse at center, hsl(348 83% 97%) 0%, transparent 70%)' }}>
        <div className="max-w-2xl text-center animate-fade-in">
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
          <Button size="lg" onClick={handleGetStarted} className="gap-2 text-base px-8">
            Start Your Passport <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="mt-6">
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              See what's inside ↓
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-3">Everything you need for your career journey</h2>
            <p className="text-muted-foreground">AI-powered tools built specifically for BSU Bears</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.slice(0, 3).map(f => (
              <div key={f.label} aria-label={f.label} className="bg-card border border-border rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.label}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-[calc(66.666%+0.75rem)] lg:mx-auto">
            {FEATURES.slice(3).map(f => (
              <div key={f.label} aria-label={f.label} className="bg-card border border-border rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.label}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatsBar />

      {/* Final CTA */}
      <section className="bg-background py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <img src={bsuMascot} alt="BSU Bear Mascot" className="w-20 h-20 mx-auto" />
          <h2 className="text-3xl font-display font-bold mt-4">Ready to launch your career?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mt-3">
            Join BSU Bears already using Career Passport to land internships, build resumes, and prepare for interviews.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="gap-2 text-lg px-8 py-3 rounded-full mt-6">
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* BSU Quick Links */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-lg font-semibold text-center mb-4">BSU Career Services Resources</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {BSU_LINKS.map(l => (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-primary/20 text-primary hover:bg-accent hover:border-primary/50 transition-colors">
                {l.label} <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Bridgewater State University · Career Services & Internship Office · Career Passport © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Index;
