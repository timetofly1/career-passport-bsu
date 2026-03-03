import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { streamChat } from '@/lib/stream-chat';
import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import ChatInput from '@/components/ChatInput';
import { ArrowLeft, Mic, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const interviewTypes = [
  { label: '🎯 Behavioral', prompt: 'Give me a behavioral interview question based on my profile. After I answer, provide detailed feedback using the STAR method.' },
  { label: '💻 Technical', prompt: 'Give me a technical interview question relevant to my major and interests. After I answer, evaluate my response and suggest improvements.' },
  { label: '🤝 Case Study', prompt: 'Give me a case study interview question based on my career goals. Guide me through solving it step by step.' },
  { label: '⚡ Quick Fire', prompt: 'Give me 5 rapid-fire common interview questions. I\'ll answer each one and you provide brief feedback after each.' },
];

const InterviewPrep = () => {
  const { profile } = useOnboarding();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Welcome to Interview Prep! 🎤\n\nI'll give you mock interview questions and provide detailed feedback on your answers. Choose a question type below, or describe the role you're interviewing for." },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
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
      mode: 'interview',
      profile: profile as unknown as Record<string, unknown>,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setIsLoading(false);
        toast.error(err);
      },
    });
  };

  const resetSession = () => {
    setMessages([
      { role: 'assistant', content: "Fresh start! 🎤 Choose a question type or tell me about the role you're preparing for." },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="p-2 rounded-xl bg-accent">
          <Mic className="w-4 h-4 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="font-display font-semibold text-sm">Interview Prep</h1>
          <p className="text-xs text-muted-foreground">Mock questions & AI feedback</p>
        </div>
        <Button variant="ghost" size="icon" onClick={resetSession} title="New session">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <MessageCard
            key={i}
            content={m.content}
            role={m.role}
            isStreaming={isLoading && i === messages.length - 1 && m.role === 'assistant'}
          />
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 ml-11">
            {interviewTypes.map(t => (
              <button
                key={t.label}
                onClick={() => send(t.prompt)}
                className="px-3 py-1.5 text-xs rounded-full border border-border bg-card hover:border-primary/40 transition-colors"
              >
                {t.label}
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
              <span className="text-sm text-muted-foreground">Preparing question...</span>
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
            placeholder="Type your answer or ask for a question..."
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
