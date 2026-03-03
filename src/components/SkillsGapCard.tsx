import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, Target, Zap, GraduationCap, TrendingUp } from 'lucide-react';

export interface SkillsGapData {
  targetRole: string;
  readinessScore: number;
  skillsHave: { skill: string; reason: string }[];
  skillsDevelop: { skill: string; reason: string; howToLearn: string }[];
  actionPlan: { step: string; timeline: string }[];
  bsuResources: string[];
  quickWins: string[];
}

export function parseSkillsGapData(content: string): SkillsGapData | null {
  try {
    // Try to find JSON block in the content
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    // Try direct parse
    const parsed = JSON.parse(content);
    if (parsed.targetRole && parsed.readinessScore !== undefined) return parsed;
  } catch {}
  return null;
}

interface SkillsGapCardProps {
  data: SkillsGapData;
}

const SkillsGapCard = ({ data }: SkillsGapCardProps) => {
  const scoreColor =
    data.readinessScore >= 75 ? 'text-emerald' :
    data.readinessScore >= 50 ? 'text-warm' : 'text-primary';

  const progressColor =
    data.readinessScore >= 75 ? 'bg-emerald' :
    data.readinessScore >= 50 ? 'bg-warm' : 'bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
        <TrendingUp className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 space-y-4 max-w-[90%]">
        {/* Header with score */}
        <div className="p-5 rounded-2xl border border-border bg-card">
          <h2 className="font-display font-bold text-lg mb-1">
            📊 Skills Gap Analysis
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{data.targetRole}</p>

          {/* Readiness Score */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Readiness Score</span>
                <span className={`text-2xl font-display font-bold ${scoreColor}`}>{data.readinessScore}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.readinessScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className={`h-full rounded-full ${progressColor}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills You Have */}
        <div className="p-5 rounded-2xl border border-emerald/20 bg-emerald/5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald" />
            <h3 className="font-display font-semibold text-sm">Skills You Have</h3>
          </div>
          <div className="space-y-3">
            {data.skillsHave.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.5 }}
                className="flex gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald mt-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium">{s.skill}</span>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skills to Develop */}
        <div className="p-5 rounded-2xl border border-warm/20 bg-warm/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warm" />
            <h3 className="font-display font-semibold text-sm">Skills to Develop</h3>
          </div>
          <div className="space-y-4">
            {data.skillsDevelop.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.8 }}
              >
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-warm mt-2 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium">{s.skill}</span>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.reason}</p>
                    <p className="text-xs text-primary mt-1 italic">💡 {s.howToLearn}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Action Plan</h3>
          </div>
          <div className="space-y-3">
            {data.actionPlan.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i + 1 }}
                className="flex gap-3 items-start"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">{step.step}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">⏱️ {step.timeline}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BSU Resources & Quick Wins side-by-side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-xs">BSU Resources</h3>
            </div>
            <ul className="space-y-1.5">
              {data.bsuResources.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-1.5">
                  <span>🐻</span> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-emerald/20 bg-emerald/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald" />
              <h3 className="font-display font-semibold text-xs">Quick Wins</h3>
            </div>
            <ul className="space-y-1.5">
              {data.quickWins.map((w, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-1.5">
                  <span>⚡</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillsGapCard;
