import { Target, CheckCircle2, Circle } from 'lucide-react';
import type { GameState } from '../../types/game';
import { CRITICAL_THRESHOLDS, TOTAL_SOL } from '../../data/gameConfig';
import { SectionCard } from '../common/SectionCard';

interface ObjectivesPanelProps {
  state: GameState;
}

export function ObjectivesPanel({ state }: ObjectivesPanelProps) {
  const crewAlive = state.crew.filter((c) => c.status !== 'deceased').length;
  const habitatOk = state.habitat.integrity >= CRITICAL_THRESHOLDS.habitat;
  const expDone = state.objectives.experimentsCompleted;
  const samples = state.objectives.samplesCollected;
  const solsDone = state.sol >= TOTAL_SOL;

  const objectives = [
    {
      id: 'crew',
      label: 'Keep the crew alive',
      detail: `${crewAlive} / 4 crew healthy`,
      done: crewAlive === 4,
      progress: (crewAlive / 4) * 100,
    },
    {
      id: 'habitat',
      label: 'Habitat integrity above 60%',
      detail: `${Math.round(state.habitat.integrity)}% integrity`,
      done: habitatOk,
      progress: state.habitat.integrity,
    },
    {
      id: 'experiments',
      label: 'Complete 3 experiments',
      detail: `${expDone} / 3 completed`,
      done: expDone >= 3,
      progress: (expDone / 3) * 100,
    },
    {
      id: 'samples',
      label: 'Collect 5 geological samples',
      detail: `${samples} / 5 collected`,
      done: samples >= 5,
      progress: (samples / 5) * 100,
    },
    {
      id: 'survive',
      label: 'Survive 30 sols',
      detail: `Sol ${state.sol} / ${TOTAL_SOL}`,
      done: solsDone,
      progress: (state.sol / TOTAL_SOL) * 100,
    },
  ];

  return (
    <SectionCard title="Mission Objectives" icon={Target}>
      <ul className="space-y-2.5">
        {objectives.map((objective) => (
          <li key={objective.id}>
            <div className="mb-1 flex items-center gap-2">
              {objective.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-solar" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-haze" aria-hidden="true" />
              )}
              <span className={`text-sm ${objective.done ? 'text-ink' : 'text-mist'}`}>{objective.label}</span>
              <span className="ml-auto text-[11px] text-mist">{objective.detail}</span>
            </div>
            <div className="ml-6 h-1 overflow-hidden rounded-full bg-slate/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${objective.done ? 'bg-solar' : 'bg-slate'}`}
                style={{ width: `${Math.min(100, objective.progress)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
