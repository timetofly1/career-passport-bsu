import React from 'react';

export type TemplateId = 'classic' | 'modern' | 'minimal';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
}

export const templates: TemplateInfo[] = [
  { id: 'classic', name: 'Classic', description: 'Traditional serif layout' },
  { id: 'modern', name: 'Modern', description: 'Bold sidebar accent' },
  { id: 'minimal', name: 'Minimal', description: 'Clean sans-serif' },
];

interface ResumeSection {
  id: string;
  title: string;
  content: string;
}

interface ResumePreviewProps {
  template: TemplateId;
  fullName: string;
  email: string;
  phone: string;
  sections: ResumeSection[];
  innerRef?: React.Ref<HTMLDivElement>;
}

/* ── Classic ─────────────────────────────────────────── */
const ClassicPreview = ({ fullName, email, phone, sections }: Omit<ResumePreviewProps, 'template' | 'innerRef'>) => (
  <div style={{ fontFamily: 'Georgia, serif', fontSize: '11px', lineHeight: '1.6', color: '#222' }}>
    <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #222', paddingBottom: '12px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, letterSpacing: '1.5px' }}>{fullName || 'Your Name'}</h1>
      <p style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        {[email, phone].filter(Boolean).join(' | ') || 'email@example.com | (555) 123-4567'}
      </p>
    </div>
    {sections.map(s => s.content && (
      <div key={s.id} style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #444', paddingBottom: '2px', marginBottom: '6px', color: '#111' }}>
          {s.title}
        </h2>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: '#333' }}>{s.content}</div>
      </div>
    ))}
  </div>
);

/* ── Modern ──────────────────────────────────────────── */
const ModernPreview = ({ fullName, email, phone, sections }: Omit<ResumePreviewProps, 'template' | 'innerRef'>) => (
  <div style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", fontSize: '11px', lineHeight: '1.6', color: '#222' }}>
    {/* Crimson header bar */}
    <div style={{ background: '#9B1B30', color: '#fff', margin: '-32px -32px 20px -32px', padding: '28px 32px 20px 32px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>{fullName || 'Your Name'}</h1>
      <p style={{ fontSize: '11px', marginTop: '4px', opacity: 0.85 }}>
        {[email, phone].filter(Boolean).join('  •  ') || 'email@example.com  •  (555) 123-4567'}
      </p>
    </div>
    {sections.map(s => s.content && (
      <div key={s.id} style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9B1B30', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px solid #9B1B30' }}>
          {s.title}
        </h2>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: '#333' }}>{s.content}</div>
      </div>
    ))}
  </div>
);

/* ── Minimal ─────────────────────────────────────────── */
const MinimalPreview = ({ fullName, email, phone, sections }: Omit<ResumePreviewProps, 'template' | 'innerRef'>) => (
  <div style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '11px', lineHeight: '1.7', color: '#333' }}>
    <div style={{ marginBottom: '20px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, color: '#111' }}>{fullName || 'Your Name'}</h1>
      <p style={{ fontSize: '10px', color: '#888', marginTop: '2px', letterSpacing: '0.5px' }}>
        {[email, phone].filter(Boolean).join('  ·  ') || 'email@example.com  ·  (555) 123-4567'}
      </p>
      <div style={{ width: '40px', height: '2px', background: '#111', marginTop: '10px' }} />
    </div>
    {sections.map(s => s.content && (
      <div key={s.id} style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '3px', color: '#555', marginBottom: '6px' }}>
          {s.title}
        </h2>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: '#333' }}>{s.content}</div>
      </div>
    ))}
  </div>
);

const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ template, fullName, email, phone, sections }, ref) => {
    const sharedProps = { fullName, email, phone, sections };

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 rounded-xl border shadow-lg min-h-[700px]"
      >
        {template === 'classic' && <ClassicPreview {...sharedProps} />}
        {template === 'modern' && <ModernPreview {...sharedProps} />}
        {template === 'minimal' && <MinimalPreview {...sharedProps} />}
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
