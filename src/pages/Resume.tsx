import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, Plus, Trash2, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ResumeSection {
  id: string;
  title: string;
  content: string;
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
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile.name);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sections, setSections] = useState<ResumeSection[]>(defaultSections);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSection = () => {
    setSections(prev => [...prev, { id: Date.now().toString(), title: 'New Section', content: '' }]);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  // Gather context from all sections for AI to reference
  const gatherContext = () => {
    const filledSections = sections.filter(s => s.content.trim());
    const sectionSummary = filledSections.map(s => `${s.title}:\n${s.content}`).join('\n\n');
    return sectionSummary;
  };

  const generateSectionContent = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setGeneratingSection(sectionId);
    try {
      const existingContext = gatherContext();
      const existingContent = section.content.trim();

      let prompt = '';
      const sectionTitle = section.title.toLowerCase();

      if (sectionTitle.includes('summary') || sectionTitle.includes('objective')) {
        prompt = `Write a concise, compelling professional summary (3-4 sentences) for a ${profile.year} ${profile.major} student at Bridgewater State University. Their career goals include: ${profile.goals.join(', ')}. Their interests are: ${profile.interests.join(', ')}. ${existingContent ? `They've already written: "${existingContent}" — enhance and polish this.` : ''} ${existingContext ? `Context from their resume:\n${existingContext}` : ''}. Return ONLY the summary text, no labels or headers.`;
      } else if (sectionTitle.includes('education')) {
        prompt = `Write education section content for a ${profile.year} student majoring in ${profile.major} at Bridgewater State University. Include the degree, university, expected graduation, and placeholder bullets for GPA and relevant coursework. ${existingContent ? `Enhance what they've written: "${existingContent}"` : ''} Return ONLY the content, no labels.`;
      } else if (sectionTitle.includes('experience')) {
        prompt = `Generate professional experience bullet points. ${existingContent ? `The user has started writing: "${existingContent}". If it contains a job title or company, generate 3-4 strong bullet points using action verbs and quantifiable achievements for that role. Keep what they wrote and add polished bullets beneath each role.` : `Create a template with 2 example roles relevant to a ${profile.major} student interested in ${profile.interests.slice(0, 3).join(', ')}. Each with 3 bullets using action verbs.`} ${existingContext ? `Context:\n${existingContext}` : ''} Return ONLY the content.`;
      } else if (sectionTitle.includes('skill')) {
        const experienceSection = sections.find(s => s.title.toLowerCase().includes('experience'));
        const projectSection = sections.find(s => s.title.toLowerCase().includes('project'));
        const relevantContent = [experienceSection?.content, projectSection?.content].filter(Boolean).join('\n');
        prompt = `Generate a well-organized skills section for a ${profile.major} student. ${relevantContent ? `Based on their experience and projects:\n"${relevantContent}"\nExtract and expand relevant skills.` : `Generate skills relevant to ${profile.interests.slice(0, 4).join(', ')}.`} ${existingContent ? `They've already listed: "${existingContent}". Add to and organize these.` : ''} Organize into categories like Technical Skills, Soft Skills, Tools & Technologies. Return ONLY the content.`;
      } else if (sectionTitle.includes('project')) {
        prompt = `Generate project descriptions for a ${profile.major} student. ${existingContent ? `They've written: "${existingContent}". If it contains a project name or description, enhance it with 2-3 bullet points highlighting technologies used and outcomes.` : `Create 2 example project entries relevant to ${profile.interests.slice(0, 3).join(', ')} with technologies and bullet points.`} ${existingContext ? `Context:\n${existingContext}` : ''} Return ONLY the content.`;
      } else {
        prompt = `Generate professional resume content for a section titled "${section.title}" for a ${profile.year} ${profile.major} student. ${existingContent ? `Enhance: "${existingContent}"` : 'Create compelling content.'} Return ONLY the content.`;
      }

      const { data, error } = await supabase.functions.invoke('career-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          mode: 'resume',
          profile,
        },
      });

      if (error) throw error;

      const text = typeof data === 'string' ? data : (data?.content || data?.text || JSON.stringify(data));
      // Clean up any markers
      const cleaned = text.replace(/---SECTION---/g, '').trim();
      
      if (existingContent) {
        // If user had content, replace with enhanced version
        updateSection(sectionId, 'content', cleaned);
      } else {
        updateSection(sectionId, 'content', cleaned);
      }
      toast.success(`${section.title} content generated!`);
    } catch (err) {
      // Fallback content
      const samples: Record<string, string> = {
        'Professional Summary': `Motivated ${profile.year} student majoring in ${profile.major} at Bridgewater State University with a passion for ${profile.interests.slice(0, 2).join(' and ')}. Seeking opportunities in ${profile.goals[0]?.toLowerCase() || 'professional growth'}. Strong analytical and communication skills with hands-on project experience.`,
        'Education': `Bachelor of Science in ${profile.major}\nBridgewater State University | Expected Graduation: 2026\n• GPA: 3.X/4.0\n• Relevant Coursework: [Add your courses]\n• Dean's List: [Add semesters]`,
        'Experience': `[Job Title] | [Company Name]\n[Month Year] – Present\n• Collaborated with cross-functional teams to deliver key results\n• Implemented process improvements resulting in measurable outcomes\n• Managed responsibilities across multiple projects`,
        'Skills': `Technical: [Programming languages, tools, frameworks]\nSoft Skills: Communication, Leadership, Problem-Solving, Teamwork\nTools: Microsoft Office, Google Suite\nLanguages: English (Native)`,
        'Projects': `[Project Name] | [Technologies Used]\n• Developed application serving [purpose]\n• Implemented key features using modern technologies\n• Achieved measurable results`,
      };
      const fallback = samples[section.title] || `[Add your ${section.title.toLowerCase()} content here]`;
      if (!section.content) updateSection(sectionId, 'content', fallback);
      toast.success('Sample content generated — customize with your details!');
    }
    setGeneratingSection(null);
  };

  const generateAll = async () => {
    setIsGenerating(true);
    for (const section of sections) {
      await generateSectionContent(section.id);
    }
    setIsGenerating(false);
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [0.5, 0.6, 0.5, 0.6] as [number, number, number, number],
        filename: `${fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
      };
      await (html2pdf() as any).set(opt).from(resumeRef.current).save();
      toast.success('Resume downloaded!');
    } catch {
      toast.error('Download failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-display font-semibold">Resume Builder</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateAll} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI Generate All
          </Button>
          <Button size="sm" onClick={downloadPDF} className="gap-2">
            <Download className="w-3 h-3" /> Download PDF
          </Button>
        </div>
      </header>

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
                {/* Section header */}
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <Input
                    value={section.title}
                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                    className="border-0 p-0 h-auto font-display font-semibold text-sm bg-transparent focus-visible:ring-0 flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 gap-1.5 text-xs transition-all ${
                        isSectionGenerating
                          ? 'text-primary'
                          : isTyping
                          ? 'text-primary opacity-100'
                          : hasContent
                          ? 'text-muted-foreground opacity-60 hover:opacity-100'
                          : 'text-primary'
                      }`}
                      onClick={() => generateSectionContent(section.id)}
                      disabled={isSectionGenerating || !!generatingSection}
                      title={hasContent ? 'Enhance with AI' : 'Generate with AI'}
                    >
                      {isSectionGenerating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      <span className="hidden sm:inline">
                        {isSectionGenerating ? 'Generating...' : hasContent ? 'Enhance' : 'AI Fill'}
                      </span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSection(section.id)}>
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Content area */}
                <div className="px-4 pb-3 relative">
                  <Textarea
                    value={section.content}
                    onChange={e => updateSection(section.id, 'content', e.target.value)}
                    placeholder={getPlaceholder(section.title)}
                    className="min-h-[100px] text-sm border-0 p-0 bg-transparent focus-visible:ring-0 resize-none"
                  />
                  {!hasContent && !isSectionGenerating && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      Start typing or click <Wand2 className="w-2.5 h-2.5 inline" /> to auto-generate
                    </p>
                  )}
                  {isTyping && !isSectionGenerating && (
                    <p className="text-[10px] text-primary/60 mt-1">
                      💡 Click <span className="font-medium">Enhance</span> to polish your content with AI
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}

          <Button variant="outline" onClick={addSection} className="w-full gap-2">
            <Plus className="w-3 h-3" /> Add Section
          </Button>

          <p className="text-[10px] text-muted-foreground/50 text-center">
            Tip: Type a job title and basic info, then click <Wand2 className="w-2.5 h-2.5 inline" /> to generate polished bullet points
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Preview</h2>
          <div className="sticky top-20">
            <div
              ref={resumeRef}
              className="bg-white text-black p-8 rounded-xl border shadow-lg min-h-[700px]"
              style={{ fontFamily: 'Georgia, serif', fontSize: '11px', lineHeight: '1.5' }}
            >
              <div className="text-center mb-4 border-b pb-3" style={{ borderColor: '#333' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>{fullName || 'Your Name'}</h1>
                <p style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                  {[email, phone].filter(Boolean).join(' | ') || 'email@example.com | (555) 123-4567'}
                </p>
              </div>

              {sections.map(section => (
                section.content && (
                  <div key={section.id} className="mb-3">
                    <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '6px' }}>
                      {section.title}
                    </h2>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: '#333' }}>
                      {section.content}
                    </div>
                  </div>
                )
              ))}
            </div>
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
