import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { CrewActivity } from '../types/game';
import type { UseGameState } from '../hooks/useGameState';
import type { useAudio } from '../hooks/useAudio';
import { GameHeader } from '../components/dashboard/GameHeader';
import { EnvironmentPanel } from '../components/dashboard/EnvironmentPanel';
import { ResourcesPanel } from '../components/dashboard/ResourcesPanel';
import { CrewPanel } from '../components/dashboard/CrewPanel';
import { ObjectivesPanel } from '../components/dashboard/ObjectivesPanel';
import { ResearchPanel } from '../components/dashboard/ResearchPanel';
import { TelemetryPanel } from '../components/dashboard/TelemetryPanel';
import { AdvisorPanel } from '../components/dashboard/AdvisorPanel';
import { LogPanel } from '../components/dashboard/LogPanel';
import { ActionPanel } from '../components/dashboard/ActionPanel';
import { EventModal } from '../components/events/EventModal';
import { MissionEndOverlay } from '../components/mission/MissionEndOverlay';

interface GamePageProps {
  game: UseGameState;
  audio: ReturnType<typeof useAudio>;
  onQuit: () => void;
  onOpenReport: () => void;
}

export function GamePage({ game, audio, onQuit, onOpenReport }: GamePageProps) {
  const { state } = game;
  const [paused, setPaused] = useState(false);
  const prevEventId = useRef<string | null>(null);
  const prevStatus = useRef(state?.status ?? 'playing');

  // Sound: new event incoming.
  useEffect(() => {
    if (!state) return;
    const eventId = state.activeEvent?.def.id ?? null;
    if (eventId && eventId !== prevEventId.current) audio.play('event');
    prevEventId.current = eventId;
  }, [state, audio]);

  // Sound: mission end.
  useEffect(() => {
    if (!state) return;
    if (state.status !== 'playing' && prevStatus.current === 'playing') {
      audio.play(state.status === 'won' ? 'success' : 'failure');
    }
    prevStatus.current = state.status;
  }, [state, audio]);

  if (!state) return null;

  const gameOver = state.status !== 'playing';

  const handleAdvance = () => {
    audio.play('advance');
    game.advanceSol();
  };

  const handleEventChoice = (choiceId: string) => {
    audio.play('alert');
    game.respondToEvent(choiceId);
  };

  return (
    <div className="min-h-screen bg-deep">
      <GameHeader
        state={state}
        paused={paused}
        onTogglePause={() => {
          audio.play('click');
          setPaused((p) => !p);
        }}
        muted={audio.muted}
        onToggleMute={audio.toggleMute}
        onQuit={onQuit}
      />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <EnvironmentPanel state={state} />
            <ResourcesPanel state={state} />
            <CrewPanel
              state={state}
              onAssignActivity={(crewId: string, activity: CrewActivity) => {
                audio.play('click');
                game.assignActivity(crewId, activity);
              }}
            />
            <ResearchPanel state={state} onStartExperiment={game.startExperiment} />
          </div>

          <div className="space-y-4">
            <ObjectivesPanel state={state} />
            <TelemetryPanel state={state} />
            <AdvisorPanel state={state} requestAdvice={game.requestAdvice} />
            <LogPanel state={state} />
          </div>
        </div>

        <ActionPanel state={state} paused={paused} onAdvance={handleAdvance} />

        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-haze">
          Progress autosaves to this device · ARES-01 · Jezero Crater
        </p>
      </main>

      <AnimatePresence>
        {state.activeEvent && !gameOver ? <EventModal state={state} onChoose={handleEventChoice} /> : null}
      </AnimatePresence>

      <AnimatePresence>
        {gameOver ? <MissionEndOverlay state={state} onOpenReport={onOpenReport} /> : null}
      </AnimatePresence>
    </div>
  );
}
