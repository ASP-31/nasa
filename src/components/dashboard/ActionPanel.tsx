import { ArrowRight, Pause, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GameState } from '../../types/game';
import { ESSENTIAL_ENERGY_PER_SOL } from '../../data/gameConfig';

interface ActionPanelProps {
  state: GameState;
  paused: boolean;
  onAdvance: () => void;
}

export function ActionPanel({ state, paused, onAdvance }: ActionPanelProps) {
  const blockedByEvent = Boolean(state.activeEvent);
  const gameOver = state.status !== 'playing';
  const disabled = paused || blockedByEvent || gameOver;

  const hint = gameOver
    ? state.status === 'won'
      ? 'Mission complete — view the report.'
      : 'Mission failed — view the report.'
    : blockedByEvent
      ? `${state.activeEvent?.def.title ?? 'Event'} requires a response`
      : paused
        ? 'Simulation paused'
        : `Advance to SOL ${state.sol + 1}`;

  return (
    <div className="sticky bottom-3 z-30 mt-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel flex flex-col gap-3 border-haze/60 bg-elevated/95 p-3 backdrop-blur-md sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-2 sm:w-56">
          <Zap className={`h-4 w-4 ${paused ? 'text-mist' : 'text-solar'}`} aria-hidden="true" />
          <div className="leading-tight">
            <div className="font-display text-xs font-semibold uppercase tracking-wider text-ink">
              {paused ? 'Paused' : 'Next Sol Preview'}
            </div>
            <div className="text-[11px] text-mist">
              Solar +{state.weather.solarGeneration} kWh · Life support −{ESSENTIAL_ENERGY_PER_SOL} kWh
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdvance}
          disabled={disabled}
          className="btn-primary h-12 flex-1 text-base tracking-[0.14em] shadow-solar"
          aria-label="Advance to next sol"
        >
          {paused ? <Pause className="h-5 w-5" aria-hidden="true" /> : null}
          {gameOver ? 'Mission Ended' : paused ? 'Resume To Advance' : 'Advance To Next Sol'}
          {!gameOver && !paused ? <ArrowRight className="h-5 w-5" aria-hidden="true" /> : null}
        </button>

        <p className="text-center text-[11px] text-mist sm:w-56 sm:text-right" role="status">
          {hint}
        </p>
      </motion.div>
    </div>
  );
}
