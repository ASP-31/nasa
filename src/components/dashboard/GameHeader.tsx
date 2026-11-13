import { Pause, Play, Volume2, VolumeX, LogOut, Rocket } from 'lucide-react';
import type { GameState } from '../../types/game';
import { MISSION, TOTAL_SOL } from '../../data/gameConfig';
import { StatusChip } from '../common/StatusChip';

interface GameHeaderProps {
  state: GameState;
  paused: boolean;
  onTogglePause: () => void;
  muted: boolean;
  onToggleMute: () => void;
  onQuit: () => void;
}

export function GameHeader({ state, paused, onTogglePause, muted, onToggleMute, onQuit }: GameHeaderProps) {
  const statusTone = state.status === 'won' ? 'success' : state.status === 'lost' ? 'critical' : 'alive';

  return (
    <header className="sticky top-0 z-40 border-b border-haze/40 bg-deep/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-solar/50 bg-solar/10">
            <Rocket className="h-5 w-5 text-solar" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold uppercase tracking-[0.22em] text-ink">Mission Control</div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-mist">{MISSION.title}</div>
          </div>
        </div>

        <div className="hidden items-center gap-4 border-l border-haze/40 pl-6 md:flex">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-mist">Mission</div>
            <div className="font-display text-sm font-semibold text-solar">{MISSION.name}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-mist">Sol</div>
            <div className="font-display text-sm font-semibold text-ink">
              {state.sol} <span className="text-mist">/ {TOTAL_SOL}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-mist">Status</div>
            <StatusChip tone={statusTone} pulse={state.status === 'playing'}>
              {state.status === 'playing' ? 'In Progress' : state.status === 'won' ? 'Complete' : 'Failed'}
            </StatusChip>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className="btn-ghost h-9 w-9 px-0"
            title={paused ? 'Resume simulation' : 'Pause simulation'}
            aria-label={paused ? 'Resume simulation' : 'Pause simulation'}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="btn-ghost h-9 w-9 px-0"
            title={muted ? 'Unmute sound' : 'Mute sound'}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onQuit}
            className="btn-ghost h-9 w-9 px-0"
            title="Return to landing"
            aria-label="Return to landing"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
