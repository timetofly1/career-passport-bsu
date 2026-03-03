import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { streamChat } from '@/lib/stream-chat';
import MessageCard from '@/components/MessageCard';
import SkillsGapCard, { parseSkillsGapData, SkillsGapData } from '@/components/SkillsGapCard';
import { Button } from '@/components/ui/button';
import ChatInput from '@/components/ChatInput';
import { ArrowLeft, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const jobExamples = [
  { label: '💻 Software Engineer', prompt: 'Analyze my skills gap for a Software Engineer role at a top tech company.' },
  { label: '📊 Data Analyst', prompt: 'Analyze my skills gap for a Data Analyst position.' },
  { label: '📈 Product Manager', prompt: 'Analyze my skills gap for a Product Manager role.' },
  { label: '🎨 UX Designer', prompt: 'Analyze my skills gap for a UX Designer position.' },
  { label: '🔐 Cybersecurity Analyst', prompt: 'Analyze my skills gap for a Cybersecurity Analyst role.' },
  { label: '🧬 Biotech Researcher', prompt: 'Analyze my skills gap for a Biotechnology Research position.' },
];

const SkillsGap = () => {
  const { profile } = useOnboarding();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Welcome to the Skills Gap Analyzer! 📊\n\nI'll compare your current profile against target job requirements and show you exactly where to focus your growth.\n\nChoose a role below or tell me the specific job title you're targeting." },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedAnalyses, setParsedAnalyses] = useState<Map<number, SkillsGapData>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Try to parse skills gap data whenever messages change
  useEffect(() => {
    const newParsed = new Map(parsedAnalyses);
    messages.forEach((m, i) => {
      if (m.role === 'assistant' && !newParsed.has(i)) {
        const data = parseSkillsGapData(m.content);
        if (data) newParsed.set(i, data);
      }
    });
    if (newParsed.size !== parsedAnalyses.size) {
      setParsedAnalyses(newParsed);
    }
  }, [messages]);

  const send = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;
    setInput('');

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
      mode: 'skills-gap',
      profile: profile as unknown as Record<string, unknown>,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setIsLoading(false);
        toast.error(err);
      },
    });
  };

  const renderMessage = (m: Msg, i: number) => {
    // If we have parsed skills gap data for this message, render the visual card
    const parsedData = parsedAnalyses.get(i);
    if (parsedData && m.role === 'assistant') {
      return <SkillsGapCard key={i} data={parsedData} />;
    }

    // Otherwise render the normal message card
    return (
      <MessageCard
        key={i}
        content={m.content}
        role={m.role}
        isStreaming={isLoading && i === messages.length - 1 && m.role === 'assistant'}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="p-2 rounded-xl bg-accent">
          <BarChart3 className="w-4 h-4 text-accent-foreground" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-sm">Skills Gap Analyzer</h1>
          <p className="text-xs text-muted-foreground">Compare your skills to job requirements</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.map((m, i) => renderMessage(m, i))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 ml-11">
            {jobExamples.map(j => (
              <button
                key={j.label}
                onClick={() => send(j.prompt)}
                className="px-3 py-2 text-xs rounded-full border border-border bg-card hover:border-primary/40 transition-colors"
              >
                {j.label}
              </button>
            ))}
          </div>
        )}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">Analyzing skills...</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => send()}
            placeholder="Enter a job title or paste a job description..."
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default SkillsGap;
