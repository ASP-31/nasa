import { useState } from 'react';
import { BrainCircuit, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GameState } from '../../types/game';
import { SectionCard } from '../common/SectionCard';
import { StatusChip } from '../common/StatusChip';

interface AdvisorPanelProps {
  state: GameState;
  requestAdvice: () => Promise<{ id: string; priority: string; message: string; source: 'rule' | 'llm' }>;
}

export function AdvisorPanel({ state, requestAdvice }: AdvisorPanelProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<{ priority: string; message: string; source: 'rule' | 'llm' } | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await requestAdvice();
      setAdvice(result);
    } finally {
      setLoading(false);
    }
  };

  const shown = advice ?? { priority: 'MISSION ADVISOR', message: '', source: 'rule' as const };

  return (
    <SectionCard
      title="Mission Advisor"
      icon={BrainCircuit}
      action={
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-ghost h-7 gap-1.5 px-2 text-[11px]"
          aria-label="Request advisor update"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {loading ? 'Analyzing' : 'Update'}
        </button>
      }
    >
      <p className="mb-2 text-xs leading-snug text-mist">
        <span className="font-display font-semibold uppercase tracking-wider text-solar">Commander:</span>{' '}
        “We are at sol {state.sol}. Assess our situation and recommend priorities.”
      </p>
      <div className="rounded-md border border-haze/30 bg-deep/60 p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-solar" aria-hidden="true" />
          <StatusChip tone="warning">{shown.priority}</StatusChip>
          {shown.source === 'llm' ? (
            <span className="text-[10px] uppercase tracking-wider text-mist">AI model</span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-mist">Onboard analysis</span>
          )}
        </div>
        {loading && !advice ? (
          <p className="text-sm text-mist">Consulting mission systems…</p>
        ) : advice ? (
          <motion.p
            key={advice.message.slice(0, 24)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm leading-relaxed text-ink"
          >
            {advice.message}
          </motion.p>
        ) : (
          <p className="text-sm leading-relaxed text-ink">
            Advisor standing by. Press <span className="text-solar">Update</span> for a live assessment of resources, crew
            health and active threats — or keep advancing sols and the advisor will weigh in automatically when a critical
            threshold is crossed.
          </p>
        )}
      </div>
    </SectionCard>
  );
}
