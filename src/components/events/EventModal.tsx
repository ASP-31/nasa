import { motion } from 'framer-motion';
import type { GameState } from '../../types/game';
import { GameIcon } from '../common/GameIcon';
import { StatusChip } from '../common/StatusChip';

interface EventModalProps {
  state: GameState;
  onChoose: (choiceId: string) => void;
}

const SEVERITY_RING = {
  info: 'ring-haze/60',
  warning: 'ring-solar/60',
  critical: 'ring-alert/70',
} as const;

const SEVERITY_LABEL = {
  info: 'Advisory',
  warning: 'Warning',
  critical: 'Critical',
} as const;

/**
 * Blocking event overlay. The simulation cannot advance until
 * the commander responds — every choice applies real state changes.
 */
export function EventModal({ state, onChoose }: EventModalProps) {
  const active = state.activeEvent;
  if (!active) return null;
  const def = active.def;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep/80 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={def.title}
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="panel max-h-[92vh] w-full max-w-2xl overflow-y-auto ring-1 ring-inset ring-offset-0 bg-elevated"
        style={{ boxShadow: '0 24px 64px -12px rgba(0,0,0,0.7)' }}
      >
        <div className={`border-b border-haze/40 p-5 ring-1 ring-inset ${SEVERITY_RING[def.severity]}`}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusChip tone={def.severity} pulse={def.severity === 'critical'}>
              {SEVERITY_LABEL[def.severity]}
            </StatusChip>
            {def.duration ? (
              <StatusChip tone="neutral">
                {active.solsRemaining} sol{active.solsRemaining > 1 ? 's' : ''} remaining
              </StatusChip>
            ) : null}
            <StatusChip tone="neutral">SOL {state.sol}</StatusChip>
          </div>
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-md border border-haze/50 bg-deep ${def.severity === 'critical' ? 'text-alert' : 'text-solar'}`}>
              <GameIcon name={def.icon} className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em] text-ink">{def.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-mist">{def.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 p-5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-mist">
            Commander, choose a response —
          </p>
          {def.choices.map((choice, index) => (
            <motion.button
              key={choice.id}
              type="button"
              onClick={() => onChoose(choice.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.06 }}
              className="group w-full rounded-md border border-haze/40 bg-deep/60 p-3.5 text-left transition-all duration-200 hover:border-solar/70 hover:bg-slate/50 focus-visible:border-solar"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-sm font-semibold text-ink group-hover:text-solar">
                  {String.fromCharCode(65 + index)}. {choice.label}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-haze group-hover:text-solar">Select →</span>
              </div>
              {choice.detail ? <p className="mt-1 text-xs leading-snug text-mist">{choice.detail}</p> : null}
            </motion.button>
          ))}
          <p className="pt-1 text-[11px] leading-snug text-haze">
            Choices alter resources, crew condition and long-term outcomes. If no response is given before the event
            expires, its default consequence is applied automatically.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
