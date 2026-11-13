import { FlaskConical, Play, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GameState } from '../../types/game';
import { SectionCard } from '../common/SectionCard';
import { StatusChip } from '../common/StatusChip';

interface ResearchPanelProps {
  state: GameState;
  onStartExperiment: (experimentId: string) => void;
}

export function ResearchPanel({ state, onStartExperiment }: ResearchPanelProps) {
  const geologist = state.crew.find((c) => c.id === 'williams');
  const geologistAvailable = Boolean(geologist && geologist.status !== 'deceased');
  const running = state.experiments.find((e) => e.status === 'running');
  const canStart = geologistAvailable && !running;

  return (
    <SectionCard title="Research & Samples" icon={FlaskConical}>
      <div className="space-y-2.5">
        {state.experiments.map((experiment) => (
          <div key={experiment.id} className="rounded-md border border-haze/30 bg-deep/60 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-display text-sm font-semibold text-ink">{experiment.name}</span>
              <StatusChip tone={experiment.status === 'completed' ? 'success' : experiment.status === 'running' ? 'warning' : 'neutral'}>
                {experiment.status}
              </StatusChip>
            </div>
            <p className="mb-2 text-[11px] leading-snug text-mist">{experiment.description}</p>
            {experiment.status === 'running' ? (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate/60">
                  <motion.div
                    className="h-full rounded-full bg-solar"
                    initial={false}
                    animate={{ width: `${(experiment.progress / experiment.duration) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
                <span className="text-[11px] text-mist">
                  {experiment.progress}/{experiment.duration} sols
                </span>
              </div>
            ) : experiment.status === 'pending' ? (
              <button
                type="button"
                onClick={() => onStartExperiment(experiment.id)}
                disabled={!canStart}
                className="btn-secondary h-8 gap-1.5 px-3 text-[11px]"
                title={
                  !geologistAvailable
                    ? 'Dr. Williams is unavailable'
                    : running
                      ? 'Another experiment is already running'
                      : `Requires ${experiment.duration} sols of lab work by Dr. Williams`
                }
              >
                <Play className="h-3 w-3" aria-hidden="true" />
                Start experiment
              </button>
            ) : null}
          </div>
        ))}

        {/* Sample collection progress */}
        <div className="rounded-md border border-haze/30 bg-deep/60 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5 text-solar" aria-hidden="true" />
              <span className="font-display font-semibold text-ink">Next geological sample</span>
            </span>
            <span className="text-[11px] text-mist">
              {state.objectives.samplesCollected} / 5 collected
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate/60">
            <motion.div
              className="h-full rounded-full bg-solar"
              initial={false}
              animate={{ width: `${state.objectives.sampleProgress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-mist">
            {geologistAvailable
              ? 'Dr. Williams contributes field progress every sol while assigned to “Field Science”.'
              : 'No geologist available — Dr. Williams must remain healthy to collect samples.'}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
