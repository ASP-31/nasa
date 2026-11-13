import type { GameState, Experiment } from '../types/game';
import {
  CAPACITY,
  MILESTONES,
  START_RESOURCES,
  TOTAL_SOL,
  buildWeatherState,
} from '../data/gameConfig';
import { EXPERIMENTS } from '../data/missions';
import { SAMPLE_LABELS, SAMPLE_LOCATIONS } from '../data/crew';
import { freshCrew } from './resourceManager';
import { clamp, mean } from '../utils/calculations';

// ─────────────────────────────────────────────────────────────
// Mission lifecycle — creation, milestones, experiments,
// sample collection and end-condition evaluation.
// ─────────────────────────────────────────────────────────────

export function createInitialMissionState(): GameState {
  return {
    status: 'playing',
    sol: 1,
    resources: {
      energy: { value: START_RESOURCES.energy, max: CAPACITY.energy },
      water: { value: START_RESOURCES.water, max: CAPACITY.water },
      oxygen: { value: START_RESOURCES.oxygen, max: CAPACITY.oxygen },
      food: { value: START_RESOURCES.food, max: CAPACITY.food },
      radiationProtection: { value: START_RESOURCES.radiationProtection, max: 100 },
      crewHealth: { value: 100, max: 100 },
    },
    crew: freshCrew(),
    habitat: { integrity: 100, temperature: 21, pressure: 1.0 },
    weather: buildWeatherState('clear'),
    subsystems: [
      { id: 'oxygenPump', name: 'Oxygen Generation', condition: 100, status: 'nominal' },
      { id: 'waterRecycler', name: 'Water Recycler', condition: 100, status: 'nominal' },
      { id: 'greenhouse', name: 'Hydroponic Greenhouse', condition: 100, status: 'nominal' },
      { id: 'power', name: 'Power Distribution', condition: 100, status: 'nominal' },
      { id: 'thermal', name: 'Thermal Control', condition: 100, status: 'nominal' },
      { id: 'solarPanels', name: 'Solar Arrays', condition: 100, status: 'nominal' },
    ],
    activeEvent: null,
    eventCooldowns: {},
    log: [
      {
        id: 1,
        sol: 1,
        message: 'ARES-01 deployed at Jezero Crater. All systems nominal.',
        type: 'success',
      },
    ],
    samples: [],
    experiments: structuredClone(EXPERIMENTS),
    objectives: { experimentsCompleted: 0, samplesCollected: 0, sampleProgress: 0 },
    incidents: [],
    score: { total: 0, survival: 0, samples: 0, experiments: 0, habitat: 0, crew: 0 },
    telemetry: [],
    flags: { rationMeals: false, reducedOperations: false },
    startedAt: Date.now(),
    milestone: 0,
  };
}

/** Applies milestone events at sols 5/10/15/20/25 — each has gameplay weight. */
export function applyMilestones(state: GameState): string[] {
  const messages: string[] = [];
  for (const milestone of MILESTONES) {
    if (state.sol === milestone.sol) {
      messages.push(`${milestone.title}: ${milestone.message}`);
    }
  }
  return messages;
}

/** Progresses experiments each sol (requires a crew member assigned to 'experiment'). */
export function advanceExperiments(state: GameState, progressSols: number): string[] {
  const messages: string[] = [];
  const hasScientist = state.crew.some(
    (c) => c.status !== 'deceased' && c.activity === 'experiment' && c.id === 'williams',
  );
  const running = state.experiments.find((e) => e.status === 'running');
  if (!running) return messages;

  if (hasScientist && progressSols > 0) {
    running.progress = Math.min(running.progress + progressSols, running.duration);
    if (running.progress >= running.duration) {
      running.status = 'completed';
      state.objectives.experimentsCompleted = clamp(state.objectives.experimentsCompleted + 1, 0, 3);
      messages.push(`Experiment completed: ${running.name}.`);
      // Send the geologist back to the field (or rest) once the lab work ends.
      const williams = state.crew.find((c) => c.id === 'williams');
      if (williams && williams.status !== 'deceased') {
        williams.activity = state.objectives.samplesCollected < 5 ? 'science' : 'sleep';
      }
    }
  }
  return messages;
}

/** Applies accumulated sample progress; a full bar yields a new geological sample. */
export function advanceSampleCollection(state: GameState, progress: number): string[] {
  const messages: string[] = [];
  if (progress <= 0 || state.objectives.samplesCollected >= 5) return messages;

  state.objectives.sampleProgress = clamp(state.objectives.sampleProgress + progress, 0, 100);
  while (state.objectives.sampleProgress >= 100 && state.objectives.samplesCollected < 5) {
    state.objectives.sampleProgress -= 100;
    const index = state.objectives.samplesCollected;
    state.samples.push({
      id: index + 1,
      sol: state.sol,
      label: SAMPLE_LABELS[index] ?? `Sample ${index + 1}`,
      location: SAMPLE_LOCATIONS[index] ?? 'Jezero Crater',
    });
    state.objectives.samplesCollected += 1;
    messages.push(`Geological sample collected: ${SAMPLE_LABELS[index] ?? `Sample ${index + 1}`}.`);
  }
  return messages;
}

/** Starts a pending experiment if a scientist is available. */
export function startExperiment(state: GameState, experimentId: string): { state: GameState; ok: boolean; message: string } {
  const experiment = state.experiments.find((e) => e.id === experimentId);
  if (!experiment) return { state, ok: false, message: 'Unknown experiment.' };
  if (experiment.status !== 'pending') return { state, ok: false, message: 'Experiment already started.' };
  if (state.experiments.some((e) => e.status === 'running')) {
    return { state, ok: false, message: 'Another experiment is already running.' };
  }
  const geologist = state.crew.find((c) => c.id === 'williams' && c.status !== 'deceased');
  if (!geologist) return { state, ok: false, message: 'No geologist available to run experiments.' };

  const next = structuredClone(state);
  const target = next.experiments.find((e) => e.id === experimentId) as Experiment;
  target.status = 'running';
  // Send the geologist to the lab so progress begins immediately.
  const williams = next.crew.find((c) => c.id === 'williams');
  if (williams && williams.status !== 'deceased') williams.activity = 'experiment';
  next.log = [
    {
      id: next.log.length + 1,
      sol: next.sol,
      message: `Experiment started: ${target.name} (${target.duration} sols). Dr. Williams assigned to the lab.`,
      type: 'info',
    },
    ...next.log,
  ];
  return { state: next, ok: true, message: `${target.name} started.` };
}

export interface EndEvaluation {
  ended: boolean;
  status: 'playing' | 'won' | 'lost';
  outcome?: 'mission_success' | 'mission_failure';
  reason?: string;
}

/** Win / loss evaluation. Failures always have an explicit, logged reason. */
export function evaluateEnd(state: GameState): EndEvaluation {
  const deceased = state.crew.filter((c) => c.status === 'deceased');
  if (deceased.length > 0) {
    return {
      ended: true,
      status: 'lost',
      outcome: 'mission_failure',
      reason: `${deceased.length === 1 ? deceased[0].name : 'Crew members'} did not survive the mission.`,
    };
  }
  if (state.habitat.integrity <= 0) {
    return {
      ended: true,
      status: 'lost',
      outcome: 'mission_failure',
      reason: 'Habitat integrity reached zero. The outpost could no longer sustain life.',
    };
  }
  if (state.sol >= TOTAL_SOL) {
    return {
      ended: true,
      status: 'won',
      outcome: 'mission_success',
      reason: 'The ARES-01 crew survived all 30 Martian sols.',
    };
  }
  return { ended: false, status: 'playing' };
}

export function completeMission(state: GameState, evaluation: EndEvaluation): GameState {
  const ended = structuredClone(state);
  ended.status = evaluation.status;
  ended.outcome = evaluation.outcome;
  ended.endedAt = Date.now();
  if (evaluation.reason) {
    ended.log = [
      {
        id: ended.log.length + 1,
        sol: ended.sol,
        message: evaluation.reason,
        type: evaluation.status === 'won' ? 'success' : 'critical',
      },
      ...ended.log,
    ];
  }
  return ended;
}

export function averageMorale(state: GameState): number {
  const alive = state.crew.filter((c) => c.status !== 'deceased');
  if (alive.length === 0) return 0;
  return Math.round(mean(alive.map((c) => c.morale)));
}
