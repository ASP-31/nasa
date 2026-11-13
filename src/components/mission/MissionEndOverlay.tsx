import { motion } from 'framer-motion';
import type { GameState } from '../../types/game';
import { TOTAL_SOL } from '../../data/gameConfig';
import { computeRating } from '../../engine/scoring';

export function MissionEndOverlay({ state, onOpenReport }: { state: GameState; onOpenReport: () => void }) {
  const rating = computeRating(state, state.score);
  const won = state.status === 'won';

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-deep/90 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.94, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="panel max-w-lg p-8 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-mist">
            ARES-01 · Sol {Math.min(state.sol, TOTAL_SOL)}
          </p>
          <h2 className={`font-display text-4xl font-bold uppercase tracking-[0.08em] ${won ? 'text-solar' : 'text-alert'}`}>
            {won ? 'Mission Complete' : 'Mission Failed'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            {state.log[0]?.message ?? (won ? 'The crew survived all 30 sols.' : 'The outpost was lost.')}
          </p>
          <div className="mt-6 rounded-md border border-haze/40 bg-deep/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-mist">Final Rating</p>
            <p className={`mt-1 font-display text-xl font-bold ${rating.tone === 'critical' ? 'text-alert' : 'text-solar'}`}>
              {rating.label}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-mist">{rating.description}</p>
          </div>
          <button type="button" onClick={onOpenReport} className="btn-primary mt-6 w-full">
            View Full Mission Report
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
