import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Map, User, Bot } from 'lucide-react';

interface MessageCardProps {
  content: string;
  role: 'user' | 'assistant';
  isStreaming?: boolean;
}

const MessageCard = ({ content, role, isStreaming }: MessageCardProps) => {
  const isRoadmap = content.includes('Career Path Roadmap') || content.includes('🗺️');
  const isAbout = content.includes('Career Profile') || content.includes('✨ Your');

  if (role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-primary text-primary-foreground text-sm">
          {content}
        </div>
      </motion.div>
    );
  }

  // Special card for roadmap
  if (isRoadmap) {
    return (
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center mt-1">
          <Map className="w-4 h-4 text-emerald" />
        </div>
        <div className="flex-1 p-5 rounded-2xl border-2 border-emerald/20 bg-emerald/5 overflow-hidden">
          <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-h2:text-emerald prose-h3:text-emerald/80 prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {isStreaming && <span className="inline-block w-2 h-4 bg-emerald animate-pulse rounded-sm ml-1" />}
        </div>
      </motion.div>
    );
  }

  // Special card for about
  if (isAbout) {
    return (
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet/10 flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-violet" />
        </div>
        <div className="flex-1 p-5 rounded-2xl border-2 border-violet/20 bg-violet/5 overflow-hidden">
          <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-h2:text-violet prose-h3:text-violet/80 prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {isStreaming && <span className="inline-block w-2 h-4 bg-violet animate-pulse rounded-sm ml-1" />}
        </div>
      </motion.div>
    );
  }

  // Default assistant message
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 max-w-[85%] overflow-hidden">
        <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        {isStreaming && <span className="inline-block w-2 h-4 bg-primary animate-pulse rounded-sm ml-1" />}
      </div>
    </motion.div>
  );
};

export default MessageCard;
