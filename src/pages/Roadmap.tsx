import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { streamChat } from '@/lib/stream-chat';
import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatInput from '@/components/ChatInput';
import { ArrowLeft, Map, Loader2, RotateCcw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const careerPaths = [
  { label: '💻 Software Engineering', prompt: 'Create a detailed career roadmap for becoming a Software Engineer, from my current profile to a senior role.' },
  { label: '📊 Data Science', prompt: 'Create a career roadmap for breaking into Data Science, including skills, certifications, and milestones.' },
  { label: '📈 Product Management', prompt: 'Create a career roadmap for becoming a Product Manager, with phases from my current background.' },
  { label: '🎨 UX/UI Design', prompt: 'Create a career roadmap for becoming a UX/UI Designer with actionable steps.' },
  { label: '💼 Management Consulting', prompt: 'Create a career roadmap for entering Management Consulting from my background.' },
  { label: '🏥 Healthcare Admin', prompt: 'Create a career roadmap for Healthcare Administration.' },
];

const timelineOptions = [
  { label: '6 months', value: '6-month' },
  { label: '1 year', value: '1-year' },
  { label: '2 years', value: '2-year' },
  { label: '5 years', value: '5-year' },
];

const Roadmap = () => {
  const { profile } = useOnboarding();
  const navigate = useNavigate();

  const [step, setStep] = useState<'select' | 'timeline' | 'generating' | 'result'>('select');
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, step]);

  const generateRoadmap = async (pathPrompt: string, timeline: string) => {
    setStep('generating');
    const fullPrompt = `${pathPrompt} Make it a ${timeline} plan. Be very specific with timelines, milestones, and resources.`;
    const userMsg: Msg = { role: 'user', content: fullPrompt };
    const newMessages = [userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      mode: 'roadmap',
      profile: profile as unknown as Record<string, unknown>,
      onDelta: upsertAssistant,
      onDone: () => { setIsLoading(false); setStep('result'); },
      onError: (err) => { setIsLoading(false); toast.error(err); setStep('select'); },
    });
  };

  const sendFollowUp = async (text?: string) => {
    const msgText = text || followUpInput.trim();
    if (!msgText || isLoading) return;
    setFollowUpInput('');

    const userMsg: Msg = { role: 'user', content: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length === newMessages.length + 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      mode: 'roadmap',
      profile: profile as unknown as Record<string, unknown>,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (err) => { setIsLoading(false); toast.error(err); },
    });
  };

  const reset = () => {
    setStep('select');
    setSelectedPath('');
    setSelectedTimeline('');
    setCustomPath('');
    setMessages([]);
  };

  const followUpSuggestions = [
    'Expand on Phase 1 with more detail',
    'What certifications should I prioritize?',
    'Add networking strategies to each phase',
    'How do I build a portfolio alongside this?',
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="p-2 rounded-xl bg-emerald/10">
          <Map className="w-4 h-4 text-emerald" />
        </div>
        <div className="flex-1">
          <h1 className="font-display font-semibold text-sm">Career Roadmap</h1>
          <p className="text-xs text-muted-foreground">Visual career path planning</p>
        </div>
        {step !== 'select' && (
          <Button variant="ghost" size="icon" onClick={reset} title="Start over">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Step 1: Select career path */}
        {step === 'select' && (
          <div className="max-w-2xl mx-auto p-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-display font-bold mb-2">Where do you want to go?</h2>
              <p className="text-muted-foreground mb-6">Choose a career path or describe your own. I'll build a personalized roadmap with phases, milestones, and resources.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {careerPaths.map(cp => (
                  <button
                    key={cp.label}
                    onClick={() => { setSelectedPath(cp.prompt); setStep('timeline'); }}
                    className="group p-4 rounded-xl border border-border bg-card text-left hover:border-emerald/40 hover:bg-emerald/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{cp.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald transition-colors" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">Or describe your own career goal:</p>
                <form onSubmit={e => {
                  e.preventDefault();
                  if (customPath.trim()) {
                    setSelectedPath(`Create a career roadmap for: ${customPath}`);
                    setStep('timeline');
                  }
                }} className="flex gap-2">
                  <Input
                    value={customPath}
                    onChange={e => setCustomPath(e.target.value)}
                    placeholder="e.g., AI/ML researcher at a top lab..."
                    className="flex-1 h-11"
                  />
                  <Button type="submit" disabled={!customPath.trim()} className="gap-2">
                    Next <ChevronRight className="w-3 h-3" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Step 2: Select timeline */}
        {step === 'timeline' && (
          <div className="max-w-2xl mx-auto p-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-display font-bold mb-2">What's your timeline?</h2>
              <p className="text-muted-foreground mb-6">How far out should we plan? This helps tailor the depth and pace of your roadmap.</p>

              <div className="grid grid-cols-2 gap-3">
                {timelineOptions.map(t => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setSelectedTimeline(t.value);
                      generateRoadmap(selectedPath, t.value);
                    }}
                    className="group p-6 rounded-xl border border-border bg-card text-center hover:border-emerald/40 hover:bg-emerald/5 transition-all"
                  >
                    <span className="text-2xl font-display font-bold block mb-1">{t.label}</span>
                    <span className="text-xs text-muted-foreground">roadmap</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Step 3: Generating / Result */}
        {(step === 'generating' || step === 'result') && (
          <div className="p-4 space-y-4">
            {/* Show only assistant messages (hide the prompt) */}
            {messages.filter(m => m.role === 'assistant').length === 0 && isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-emerald animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Building your personalized roadmap...</p>
                  <p className="text-xs text-muted-foreground mt-1">Analyzing your profile: {profile.major}, {profile.year}</p>
                </div>
              </div>
            )}

            {messages.filter(m => m.role !== 'user' || messages.indexOf(m) > 0).map((m, i) => {
              if (m === messages[0] && m.role === 'user') return null;
              return (
                <MessageCard
                  key={i}
                  content={m.content}
                  role={m.role}
                  isStreaming={isLoading && m === messages[messages.length - 1] && m.role === 'assistant'}
                />
              );
            })}

            {/* Follow-up suggestions after result */}
            {step === 'result' && !isLoading && messages.length <= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="ml-11">
                <p className="text-xs text-muted-foreground mb-2">Refine your roadmap:</p>
                <div className="flex flex-wrap gap-2">
                  {followUpSuggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => sendFollowUp(s)}
                      className="px-3 py-1.5 text-xs rounded-full border border-emerald/20 bg-emerald/5 hover:border-emerald/40 transition-colors text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {isLoading && messages[messages.length - 1]?.role === 'user' && messages.length > 1 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-emerald animate-spin" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">Updating roadmap...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input - only show in result step */}
      {(step === 'result' || (step === 'generating' && !isLoading)) && (
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              value={followUpInput}
              onChange={setFollowUpInput}
              onSubmit={() => sendFollowUp()}
              placeholder="Ask to refine, expand, or adjust your roadmap..."
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
