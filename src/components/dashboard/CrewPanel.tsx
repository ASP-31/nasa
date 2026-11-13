import { Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CrewActivity, GameState } from '../../types/game';
import { SectionCard } from '../common/SectionCard';
import { StatusChip } from '../common/StatusChip';

interface CrewPanelProps {
  state: GameState;
  onAssignActivity: (crewId: string, activity: CrewActivity) => void;
}

const ACTIVITY_OPTIONS: Array<{ id: CrewActivity; label: string }> = [
  { id: 'sleep', label: 'Rest / Sleep' },
  { id: 'command', label: 'Mission Coordination' },
  { id: 'medical', label: 'Medical Duty' },
  { id: 'maintenance', label: 'System Maintenance' },
  { id: 'repair', label: 'Repair Systems' },
  { id: 'science', label: 'Field Science (Samples)' },
  { id: 'experiment', label: 'Lab Work (Experiments)' },
];

const STATUS_TONE = {
  healthy: 'success',
  injured: 'warning',
  sick: 'critical',
  deceased: 'critical',
} as const;

const STATUS_LABEL = {
  healthy: 'Healthy',
  injured: 'Impaired',
  sick: 'Ill',
  deceased: 'Lost',
} as const;

export function CrewPanel({ state, onAssignActivity }: CrewPanelProps) {
  return (
    <SectionCard title="Crew Manifest" icon={Users}>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {state.crew.map((member, index) => {
          const deceased = member.status === 'deceased';
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: deceased ? 0.55 : 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-md border border-haze/30 bg-deep/60 p-3"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-sm font-semibold leading-tight text-ink">
                    {member.callsign}
                  </div>
                  <div className="text-[11px] text-mist">{member.role}</div>
                </div>
                <StatusChip tone={STATUS_TONE[member.status]} pulse={member.status === 'sick'}>
                  {STATUS_LABEL[member.status]}
                </StatusChip>
              </div>

              <div className="mb-1 flex items-baseline justify-between">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-mist">
                  <Activity className="h-3 w-3" aria-hidden="true" /> Health
                </span>
                <span className={`font-display text-sm font-semibold ${member.health < 40 ? 'text-alert' : member.health < 70 ? 'text-solar' : 'text-ink'}`}>
                  {Math.round(member.health)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate/60">
                <motion.div
                  className={`h-full rounded-full ${member.health < 40 ? 'bg-alert' : member.health < 70 ? 'bg-solar' : 'bg-slate'}`}
                  initial={false}
                  animate={{ width: `${member.health}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-wider text-mist">Morale</span>
                <span className="text-xs text-mist">{Math.round(member.morale)}%</span>
              </div>

              <label className="mt-2 block">
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-mist">Assigned Activity</span>
                <select
                  value={member.activity}
                  disabled={deceased}
                  onChange={(event) => onAssignActivity(member.id, event.target.value as CrewActivity)}
                  className="w-full rounded-md border border-haze/50 bg-slate/50 px-2 py-1.5 text-xs text-ink transition-colors hover:border-solar/50 focus:border-solar focus:outline-none disabled:opacity-50"
                  aria-label={`Assign activity for ${member.name}`}
                >
                  {ACTIVITY_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <p className="mt-1.5 text-[10px] leading-snug text-mist">{member.abilityDescription}</p>
            </motion.div>
          );
        })}
      </div>
    </SectionCard>
  );
}
