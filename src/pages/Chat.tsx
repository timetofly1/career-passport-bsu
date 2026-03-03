import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { streamChat } from '@/lib/stream-chat';
import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import ChatInput from '@/components/ChatInput';
import { ArrowLeft, User, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const modeConfig: Record<string, { label: string; icon: typeof Sparkles; placeholder: string; greeting: string }> = {
  default: { label: 'Career Chat', icon: Sparkles, placeholder: 'Ask me anything about your career...', greeting: "Hi! I'm your Career Passport AI — your personal career advisor. Ask me about job searching, salary negotiation, networking strategies, industry trends, or any career question you have!" },
  about: { label: 'About You', icon: User, placeholder: 'Tell me about yourself or ask for your profile...', greeting: "I'll analyze your profile and create a detailed career profile card. Just say \"create my profile\" or tell me more about yourself!" },
};

const quickActions = [
  { label: '💼 Job search strategies', mode: 'default' },
  { label: '💰 Salary negotiation tips', mode: 'default' },
  { label: '🤝 Networking advice', mode: 'default' },
  { label: '📧 Cold email templates', mode: 'default' },
  { label: '🎯 Build my profile', mode: 'about' },
];

const Chat = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'default';
  const config = modeConfig[mode] || modeConfig.default;
  const { profile } = useOnboarding();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: config.greeting },
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
      mode,
      profile: profile as unknown as Record<string, unknown>,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setIsLoading(false);
        toast.error(err);
      },
    });
  };

  const ModeIcon = config.icon;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="p-2 rounded-xl bg-accent">
          <ModeIcon className="w-4 h-4 text-accent-foreground" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-sm">{config.label}</h1>
          <p className="text-xs text-muted-foreground">Powered by AI</p>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <MessageCard
            key={i}
            content={m.content}
            role={m.role}
            isStreaming={isLoading && i === messages.length - 1 && m.role === 'assistant'}
          />
        ))}

        {/* Quick actions on first message */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 ml-11">
            {quickActions.map(a => (
              <button
                key={a.label}
                onClick={() => {
                  if (a.mode !== mode) navigate(`/chat?mode=${a.mode}`);
                  send(a.label);
                }}
                className="px-3 py-1.5 text-xs rounded-full border border-border bg-card hover:border-primary/40 transition-colors"
              >
                {a.label}
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
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => send()}
            placeholder={config.placeholder}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
