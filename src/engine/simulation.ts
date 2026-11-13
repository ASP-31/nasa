import type { GameState } from '../types/game';
import { buildWeatherState, TOTAL_SOL, weatherPoolForSol, WEATHER_META } from '../data/gameConfig';
import {
  applyCrewActivities,
  applyEnvironmentEffects,
  consumeAndGenerate,
  decaySubsystems,
} from './resourceManager';
import { maybeSpawnEvent, tickActiveEvent } from './eventManager';
import {
  advanceExperiments,
  advanceSampleCollection,
  applyMilestones,
  completeMission,
  evaluateEnd,
} from './missionManager';
import { computeScore } from './scoring';
import { clamp, weightedPick } from '../utils/calculations';

// ─────────────────────────────────────────────────────────────
// Simulation core. advanceSol() executes one full sol tick:
//   1. tick/expire the active event
//   2. roll weather
//   3. decay subsystems
//   4. consume resources / generate energy
//   5. apply crew activities
//   6. advance science (experiments + samples)
//   7. apply environmental effects
//   8. process milestones
//   9. spawn the next event
//  10. evaluate win/loss
// ─────────────────────────────────────────────────────────────

export function advanceSol(state: GameState): GameState {
  if (state.status !== 'playing') return state;

  // Work on a deep copy so React state is never mutated in place.
  let next = structuredClone(state);

  // 1 — tick the active event; it may expire with consequences.
  next = tickActiveEvent(next).state;

  // 2 — roll the new sol's weather.
  next.sol = clamp(next.sol + 1, 1, TOTAL_SOL);
  if (!next.activeEvent) {
    const weather = weightedPick(weatherPoolForSol(next.sol));
    if (weather) next.weather = buildWeatherState(weather.condition);
  } else if (next.activeEvent.def.id === 'solar_storm') {
    next.weather = buildWeatherState('solar_storm');
  } else if (next.activeEvent.def.id === 'dust_storm') {
    next.weather = buildWeatherState('severe_storm');
  }

  // 3 — subsystem wear.
  decaySubsystems(next);

  // 4 — consumption and generation.
  consumeAndGenerate(next);
  // Reduced operations is a one-sol power-saving measure.
  next.flags.reducedOperations = false;

  // 5 — crew activities (recovery, science progress, repairs).
  const crewResult = applyCrewActivities(next);

  // 6 — science progression.
  const scienceMessages = [
    ...advanceExperiments(next, crewResult.experimentProgress),
    ...advanceSampleCollection(next, crewResult.sampleProgress),
  ];

  // 7 — environmental effects (radiation, thermal, critical supplies).
  const hazardMessages = applyEnvironmentEffects(next);

  // 8 — milestone logs.
  const milestoneMessages = applyMilestones(next);

  // Assemble the sol's log.
  const logEntries = [...milestoneMessages, ...scienceMessages, ...hazardMessages, ...crewResult.logMessages].map(
    (message, index) => ({
      id: next.log.length + 1 + index,
      sol: next.sol,
      message,
      type: (hazardMessages.includes(message) ? 'warning' : 'info') as 'warning' | 'info',
    }),
  );
  if (logEntries.length > 0) {
    next.log = [...logEntries, ...next.log].slice(0, 120);
  }

  // Weather description for the log when it changed.
  const meta = WEATHER_META[next.weather.condition];
  const weatherEntry = {
    id: next.log.length + 1,
    sol: next.sol,
    message: `SOL ${next.sol} — ${meta.label.toLowerCase()}. Solar output ${next.weather.solarGeneration} kWh/sol.`,
    type: 'info' as const,
  };
  next.log = [weatherEntry, ...next.log].slice(0, 120);

  // Telemetry snapshot for the chart.
  next.telemetry = [
    ...next.telemetry,
    {
      sol: next.sol,
      energy: Math.round(next.resources.energy.value),
      oxygen: Math.round(next.resources.oxygen.value),
      water: Math.round(next.resources.water.value),
      habitat: Math.round(next.habitat.integrity),
    },
  ].slice(-30);

  // 9 — spawn the next event.
  const spawn = maybeSpawnEvent(next);
  next = spawn.state;

  // 10 — evaluate end conditions.
  const evaluation = evaluateEnd(next);
  if (evaluation.ended) {
    const ended = completeMission(next, evaluation);
    ended.score = computeScore(ended);
    return ended;
  }

  return next;
}
