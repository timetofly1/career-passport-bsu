import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, Plus, Trash2, Sparkles, Loader2, Wand2, Save, FolderOpen, FilePlus, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ResumePreview, { templates, TemplateId } from '@/components/ResumePreview';

interface ResumeSection {
  id: string;
  title: string;
  content: string;
}

interface SavedResume {
  id: string;
  title: string;
  updated_at: string;
}

const defaultSections: ResumeSection[] = [
  { id: '1', title: 'Professional Summary', content: '' },
  { id: '2', title: 'Education', content: '' },
  { id: '3', title: 'Experience', content: '' },
  { id: '4', title: 'Skills', content: '' },
  { id: '5', title: 'Projects', content: '' },
];

const Resume = () => {
  const { profile } = useOnboarding();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile.name);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sections, setSections] = useState<ResumeSection[]>(defaultSections);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('classic');
  const resumeRef = useRef<HTMLDivElement>(null);

  // Save/Load state
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastSavedLabel, setLastSavedLabel] = useState('');

  // Load saved resumes list on mount
  useEffect(() => {
    if (user) loadResumesList();
  }, [user]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      saveResumeQuiet();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, resumeTitle, fullName, email, phone, sections, activeTemplate, currentResumeId]);

  // Update "last saved" label every 10s
  useEffect(() => {
    if (!lastSavedAt) { setLastSavedLabel(''); return; }
    const update = () => {
      const diffSec = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      if (diffSec < 5) setLastSavedLabel('Just saved');
      else if (diffSec < 60) setLastSavedLabel(`Saved ${diffSec}s ago`);
      else setLastSavedLabel(`Saved ${Math.floor(diffSec / 60)}m ago`);
    };
    update();
    const t = setInterval(update, 10000);
    return () => clearInterval(t);
  }, [lastSavedAt]);

  const loadResumesList = async () => {
    if (!user) return;
    setIsLoadingResumes(true);
    const { data } = await supabase
      .from('resumes')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setSavedResumes(data);
    setIsLoadingResumes(false);
  };

  const saveResumeInner = async (quiet: boolean) => {
    if (!user) return;
    if (!quiet) setIsSaving(true);
    try {
      const payload = {
        user_id: user.id,
        title: resumeTitle,
        full_name: fullName,
        email,
        phone,
        template: activeTemplate,
        sections: sections as any,
      };

      if (currentResumeId) {
        const { error } = await supabase
          .from('resumes')
          .update(payload)
          .eq('id', currentResumeId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('resumes')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        if (data) setCurrentResumeId(data.id);
      }

      if (!quiet) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
        toast.success('Resume saved!');
      }
      setLastSavedAt(new Date());
      loadResumesList();
    } catch (err: any) {
      if (!quiet) toast.error(err.message || 'Failed to save');
    }
    if (!quiet) setIsSaving(false);
  };

  const saveResume = () => saveResumeInner(false);
  const saveResumeQuiet = () => saveResumeInner(true);

  const loadResume = async (id: string) => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Failed to load resume');
      return;
    }

    setCurrentResumeId(data.id);
    setResumeTitle(data.title);
    setFullName(data.full_name);
    setEmail(data.email);
    setPhone(data.phone);
    setActiveTemplate((data.template as TemplateId) || 'classic');
    setSections(data.sections as unknown as ResumeSection[]);
    setShowSavedPanel(false);
    toast.success(`Loaded "${data.title}"`);
  };

  const deleteResume = async (id: string) => {
    await supabase.from('resumes').delete().eq('id', id);
    if (currentResumeId === id) {
      setCurrentResumeId(null);
      setResumeTitle('Untitled Resume');
    }
    toast.success('Resume deleted');
    loadResumesList();
  };

  const startNewResume = () => {
    setCurrentResumeId(null);
    setResumeTitle('Untitled Resume');
    setFullName(profile.name);
    setEmail('');
    setPhone('');
    setSections(defaultSections);
    setActiveTemplate('classic');
    setShowSavedPanel(false);
    toast.success('Started new resume');
  };

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSection = () => {
    setSections(prev => [...prev, { id: Date.now().toString(), title: 'New Section', content: '' }]);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const gatherContext = () => sections.filter(s => s.content.trim()).map(s => `${s.title}:\n${s.content}`).join('\n\n');

  const generateSectionContent = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    setGeneratingSection(sectionId);
    try {
      const existingContext = gatherContext();
      const existingContent = section.content.trim();
      let prompt = '';
      const t = section.title.toLowerCase();

      if (t.includes('summary') || t.includes('objective')) {
        prompt = `Write a concise, compelling professional summary (3-4 sentences) for a ${profile.year} ${profile.major} student at Bridgewater State University. Goals: ${profile.goals.join(', ')}. Interests: ${profile.interests.join(', ')}. ${existingContent ? `Enhance: "${existingContent}"` : ''} ${existingContext ? `Context:\n${existingContext}` : ''} Return ONLY the summary text.`;
      } else if (t.includes('education')) {
        prompt = `Write education content for a ${profile.year} ${profile.major} student at Bridgewater State University. ${existingContent ? `Enhance: "${existingContent}"` : ''} Return ONLY the content.`;
      } else if (t.includes('experience')) {
        prompt = `Generate experience bullet points. ${existingContent ? `User wrote: "${existingContent}". Generate 3-4 strong bullets for that role.` : `Create 2 example roles for a ${profile.major} student.`} ${existingContext ? `Context:\n${existingContext}` : ''} Return ONLY content.`;
      } else if (t.includes('skill')) {
        const exp = sections.find(s => s.title.toLowerCase().includes('experience'));
        const proj = sections.find(s => s.title.toLowerCase().includes('project'));
        const ctx = [exp?.content, proj?.content].filter(Boolean).join('\n');
        prompt = `Generate organized skills for a ${profile.major} student. ${ctx ? `Based on:\n"${ctx}"` : `Relevant to ${profile.interests.slice(0, 4).join(', ')}.`} ${existingContent ? `Already listed: "${existingContent}". Add to these.` : ''} Return ONLY content.`;
      } else if (t.includes('project')) {
        prompt = `Generate project descriptions for a ${profile.major} student. ${existingContent ? `Enhance: "${existingContent}"` : `Create 2 examples for ${profile.interests.slice(0, 3).join(', ')}.`} Return ONLY content.`;
      } else {
        prompt = `Generate resume content for "${section.title}" for a ${profile.year} ${profile.major} student. ${existingContent ? `Enhance: "${existingContent}"` : ''} Return ONLY content.`;
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-chat`;
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], mode: 'resume', profile }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || `Error: ${resp.status}`);
      }
      // Parse SSE stream and collect all content
      let fullText = '';
      if (resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buf.indexOf('\n')) !== -1) {
            let line = buf.slice(0, idx);
            buf = buf.slice(idx + 1);
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (!line.startsWith('data: ')) continue;
            const json = line.slice(6).trim();
            if (json === '[DONE]') break;
            try {
              const parsed = JSON.parse(json);
              const c = parsed.choices?.[0]?.delta?.content;
              if (c) fullText += c;
            } catch { /* partial */ }
          }
        }
      }
      updateSection(sectionId, 'content', fullText.replace(/---SECTION---/g, '').trim());
      toast.success(`${section.title} generated!`);
    } catch {
      const samples: Record<string, string> = {
        'Professional Summary': `Motivated ${profile.year} student majoring in ${profile.major} at BSU.`,
        'Education': `BS ${profile.major}\nBridgewater State University | Expected 2026`,
        'Experience': `[Job Title] | [Company]\n• Key achievement`,
        'Skills': `Technical: [Skills]\nSoft Skills: Communication, Leadership`,
        'Projects': `[Project] | [Tech]\n• Built [feature]`,
      };
      if (!section.content) updateSection(sectionId, 'content', samples[section.title] || '');
      toast.success('Sample generated — customize it!');
    }
    setGeneratingSection(null);
  };

  const generateAll = async () => {
    setIsGenerating(true);
    for (const s of sections) await generateSectionContent(s.id);
    setIsGenerating(false);
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await (html2pdf() as any).set({
        margin: [0.5, 0.6, 0.5, 0.6] as [number, number, number, number],
        filename: `${fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
      }).from(resumeRef.current).save();
      toast.success('Resume downloaded!');
    } catch {
      toast.error('Download failed.');
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <Input
              value={resumeTitle}
              onChange={e => setResumeTitle(e.target.value)}
              className="border-0 p-0 h-auto font-display font-semibold text-sm bg-transparent focus-visible:ring-0 w-48"
              placeholder="Resume title..."
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              {lastSavedLabel || (currentResumeId ? 'Saved draft' : 'New resume')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSavedPanel(!showSavedPanel)} className="gap-2">
            <FolderOpen className="w-3 h-3" />
            <span className="hidden sm:inline">My Resumes</span>
            {savedResumes.length > 0 && (
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{savedResumes.length}</span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={saveResume} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : justSaved ? <Check className="w-3 h-3 text-emerald" /> : <Save className="w-3 h-3" />}
            <span className="hidden sm:inline">{justSaved ? 'Saved!' : 'Save'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={generateAll} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span className="hidden sm:inline">AI Generate</span>
          </Button>
          <Button size="sm" onClick={downloadPDF} className="gap-2">
            <Download className="w-3 h-3" /> <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </header>

      {/* Saved Resumes Panel */}
      <AnimatePresence>
        {showSavedPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-card overflow-hidden"
          >
            <div className="max-w-5xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm">My Saved Resumes</h3>
                <Button variant="outline" size="sm" onClick={startNewResume} className="gap-2 text-xs">
                  <FilePlus className="w-3 h-3" /> New Resume
                </Button>
              </div>
              {isLoadingResumes ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                </div>
              ) : savedResumes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3">No saved resumes yet. Click <strong>Save</strong> to create your first draft.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {savedResumes.map(r => (
                    <button
                      key={r.id}
                      onClick={() => loadResume(r.id)}
                      className={`group p-3 rounded-xl border text-left transition-all hover:border-primary/40 ${
                        currentResumeId === r.id ? 'border-primary bg-primary/5' : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.title}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" /> {formatDate(r.updated_at)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => { e.stopPropagation(); deleteResume(r.id); }}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Edit Resume</h2>
          <div className="space-y-3">
            <Input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="h-12" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          {sections.map((section, i) => {
            const isSectionGenerating = generatingSection === section.id;
            const hasContent = section.content.trim().length > 0;
            const isTyping = section.content.trim().length > 5;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <Input
                    value={section.title}
                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                    className="border-0 p-0 h-auto font-display font-semibold text-sm bg-transparent focus-visible:ring-0 flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="sm"
                      className={`h-7 gap-1.5 text-xs transition-all ${isSectionGenerating ? 'text-primary' : isTyping ? 'text-primary' : hasContent ? 'text-muted-foreground opacity-60 hover:opacity-100' : 'text-primary'}`}
                      onClick={() => generateSectionContent(section.id)}
                      disabled={isSectionGenerating || !!generatingSection}
                    >
                      {isSectionGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      <span className="hidden sm:inline">{isSectionGenerating ? 'Generating...' : hasContent ? 'Enhance' : 'AI Fill'}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSection(section.id)}>
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <Textarea
                    value={section.content}
                    onChange={e => updateSection(section.id, 'content', e.target.value)}
                    placeholder={getPlaceholder(section.title)}
                    className="min-h-[100px] text-sm border-0 p-0 bg-transparent focus-visible:ring-0 resize-none"
                  />
                  {!hasContent && !isSectionGenerating && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Start typing or click <Wand2 className="w-2.5 h-2.5 inline" /> to auto-generate</p>
                  )}
                  {isTyping && !isSectionGenerating && (
                    <p className="text-[10px] text-primary/60 mt-1">💡 Click <span className="font-medium">Enhance</span> to polish with AI</p>
                  )}
                </div>
              </motion.div>
            );
          })}

          <Button variant="outline" onClick={addSection} className="w-full gap-2">
            <Plus className="w-3 h-3" /> Add Section
          </Button>

          <p className="text-[10px] text-muted-foreground/50 text-center">
            Tip: Type content then click <Wand2 className="w-2.5 h-2.5 inline" /> to enhance · Your work auto-saves when you click Save
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Preview</h2>
          <div className="flex gap-2">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                  activeTemplate === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className={`text-xs font-display font-semibold block ${activeTemplate === t.id ? 'text-primary' : 'text-foreground'}`}>{t.name}</span>
                <span className="text-[10px] text-muted-foreground">{t.description}</span>
              </button>
            ))}
          </div>
          <div className="sticky top-20">
            <ResumePreview ref={resumeRef} template={activeTemplate} fullName={fullName} email={email} phone={phone} sections={sections} />
          </div>
        </div>
      </div>
    </div>
  );
};

function getPlaceholder(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('summary')) return 'Write a brief summary or click AI Fill...';
  if (t.includes('education')) return 'e.g., BS Computer Science, Bridgewater State University...';
  if (t.includes('experience')) return 'e.g., Software Intern | Google\nJun 2025 – Aug 2025\n• Built...';
  if (t.includes('skill')) return 'e.g., Python, React, Leadership...';
  if (t.includes('project')) return 'e.g., Career Passport App | React, TypeScript...';
  return 'Add your content here...';
}

export default Resume;
