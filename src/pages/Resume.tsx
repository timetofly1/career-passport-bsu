import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
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

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('career-chat', {
        body: {
          messages: [{ role: 'user', content: `Generate resume content for me. Fill in each section with compelling, professional content. Use bullet points with action verbs. Return ONLY the content for each section separated by "---SECTION---" markers in this order: Professional Summary, Education, Experience, Skills, Projects. Make it specific to my background.` }],
          mode: 'resume',
          profile,
        },
      });

      if (error) throw error;

      // Parse the non-streaming response
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      // For streaming responses, we'd need different handling, but for invoke we get the full response
      const sectionContents = text.split('---SECTION---').map((s: string) => s.trim()).filter(Boolean);
      
      if (sectionContents.length >= 1) {
        setSections(prev => prev.map((s, i) => ({
          ...s,
          content: sectionContents[i] || s.content,
        })));
      }
      toast.success('Resume content generated!');
    } catch (err) {
      // Fallback: generate sample content
      setSections(prev => prev.map(s => {
        const samples: Record<string, string> = {
          'Professional Summary': `Motivated ${profile.year} student majoring in ${profile.major} with a passion for ${profile.interests.slice(0, 2).join(' and ')}. Seeking opportunities in ${profile.goals[0]?.toLowerCase() || 'professional growth'}. Strong analytical and communication skills with hands-on project experience.`,
          'Education': `${profile.major}\nUniversity Name | Expected Graduation: 2026\n• GPA: 3.X/4.0\n• Relevant Coursework: [Add your courses]\n• Dean's List: [Add semesters]`,
          'Experience': `[Job Title] | [Company Name]\n[Month Year] – Present\n• Collaborated with cross-functional teams to deliver [project/result]\n• Implemented [specific technology/process] resulting in [measurable outcome]\n• Managed [responsibility] for [scope/team size]`,
          'Skills': `Technical: [Programming languages, tools, frameworks]\nSoft Skills: Communication, Leadership, Problem-Solving, Teamwork\nTools: Microsoft Office, Google Suite, [Industry-specific tools]\nLanguages: English (Native), [Other languages]`,
          'Projects': `[Project Name] | [Technologies Used]\n• Developed [what you built] serving [purpose/users]\n• Implemented [key feature] using [technology]\n• Achieved [measurable result or learning outcome]`,
        };
        return { ...s, content: s.content || samples[s.title] || s.content };
      }));
      toast.success('Sample resume content generated! Customize it with your details.');
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
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-display font-semibold">Resume Builder</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateWithAI} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI Generate
          </Button>
          <Button size="sm" onClick={downloadPDF} className="gap-2">
            <Download className="w-3 h-3" /> Download PDF
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Edit Resume</h2>
          <div className="space-y-3">
            <Input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-border bg-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <Input
                  value={section.title}
                  onChange={e => updateSection(section.id, 'title', e.target.value)}
                  className="border-0 p-0 h-auto font-display font-semibold text-sm bg-transparent focus-visible:ring-0"
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSection(section.id)}>
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
              <Textarea
                value={section.content}
                onChange={e => updateSection(section.id, 'content', e.target.value)}
                placeholder="Add your content here..."
                className="min-h-[100px] text-sm border-0 p-0 bg-transparent focus-visible:ring-0 resize-none"
              />
            </motion.div>
          ))}

          <Button variant="outline" onClick={addSection} className="w-full gap-2">
            <Plus className="w-3 h-3" /> Add Section
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Preview</h2>
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
  );
};

export default Resume;
