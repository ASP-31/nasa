/**
 * Headless balance harness — NOT shipped to the browser.
 * Verifies that the mission is winnable with sensible play,
 * losable with reckless play, and that state stays valid.
 *
 * Run:  npx esbuild scripts/balance-check.ts --bundle --platform=node --outfile=scripts/.balance.cjs && node scripts/.balance.cjs
 */
import { createInitialMissionState } from '../src/engine/missionManager';
import { advanceSol } from '../src/engine/simulation';
import { resolveEvent } from '../src/engine/eventManager';
import type { CrewActivity, GameState } from '../src/types/game';

type Policy = 'good' | 'random' | 'reckless' | 'neglect';

function pickChoice(state: GameState, policy: Policy): string {
  const choices = state.activeEvent!.def.choices;
  if (policy === 'reckless') return choices[choices.length - 1].id;
  if (policy === 'random') return choices[Math.floor(Math.random() * choices.length)].id;
  // good: avoid obviously harmful options (crew health penalties with no upside)
  const safe = choices.filter((c) => (c.consequence.crewHealth ?? 0) >= 0);
  const pool = safe.length > 0 ? safe : choices;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function goodActivities(state: GameState): Array<{ id: string; activity: CrewActivity }> {
  const running = state.experiments.find((e) => e.status === 'running');
  const geologist = state.crew.find((c) => c.id === 'williams')!;
  const engineer = state.crew.find((c) => c.id === 'morgan')!;
  const medic = state.crew.find((c) => c.id === 'chen')!;

  const assignments: Array<{ id: string; activity: CrewActivity }> = [
    { id: 'vasquez', activity: 'command' },
    { id: 'chen', activity: medic.health < 70 || state.crew.some((c) => c.health < 70) ? 'medical' : 'command' },
  ];

  const damaged = state.subsystems.some((s) => s.condition < 55);
  assignments.push({ id: 'morgan', activity: damaged ? 'repair' : 'maintenance' });

  if (running) {
    assignments.push({ id: geologist.id, activity: 'experiment' });
  } else if (state.objectives.samplesCollected < 5) {
    assignments.push({ id: geologist.id, activity: 'science' });
  } else {
    const nextPending = state.experiments.find((e) => e.status === 'pending');
    if (nextPending && geologist.health > 60) {
      // Signal the harness to start it; fall back to science if blocked.
      assignments.push({ id: geologist.id, activity: 'experiment' });
    } else {
      assignments.push({ id: geologist.id, activity: 'sleep' });
    }
  }
  return assignments;
}

function runMission(policy: Policy): { sol: number; status: string; samples: number; experiments: number; habitat: number; crewHealth: number; events: number; minEnergy: number } {
  let state = createInitialMissionState();
  let eventCount = 0;
  let minEnergy = state.resources.energy.value;

  while (state.status === 'playing' && state.sol < 30) {
    // Respond to any active event first.
    if (state.activeEvent) {
      eventCount += 1;
      state = resolveEvent(state, pickChoice(state, policy));
    }

    if (policy === 'good') {
      for (const assignment of goodActivities(state)) {
        const member = state.crew.find((c) => c.id === assignment.id)!;
        member.activity = assignment.activity;
      }
      const running = state.experiments.find((e) => e.status === 'running');
      const williamsIdle = state.crew.find((c) => c.id === 'williams')!.activity === 'experiment';
      const pending = state.experiments.find((e) => e.status === 'pending');
      if (!running && williamsIdle && pending && state.objectives.samplesCollected >= 5) {
        const started = requireStart(state, pending.id);
        if (started.ok) state = started.state;
      }
    } else if (policy === 'neglect') {
      for (const member of state.crew) member.activity = 'sleep';
    }

    state = advanceSol(state);
    minEnergy = Math.min(minEnergy, state.resources.energy.value);
  }

  return {
    sol: state.sol,
    status: state.status,
    samples: state.objectives.samplesCollected,
    experiments: state.objectives.experimentsCompleted,
    habitat: Math.round(state.habitat.integrity),
    crewHealth: Math.round(state.resources.crewHealth.value),
    events: eventCount,
    minEnergy: Math.round(minEnergy),
  };
}

// Lazy import to avoid a circular lint concern; direct call is fine at runtime.
import { startExperiment } from '../src/engine/missionManager';
function requireStart(state: GameState, id: string) {
  return startExperiment(state, id);
}

function summarize(label: string, results: ReturnType<typeof runMission>[]) {
  const wins = results.filter((r) => r.status === 'won').length;
  const avgSamples = (results.reduce((s, r) => s + r.samples, 0) / results.length).toFixed(1);
  const avgExp = (results.reduce((s, r) => s + r.experiments, 0) / results.length).toFixed(1);
  const avgHabitat = (results.reduce((s, r) => s + r.habitat, 0) / results.length).toFixed(0);
  const avgHealth = (results.reduce((s, r) => s + r.crewHealth, 0) / results.length).toFixed(0);
  const avgMinEnergy = (results.reduce((s, r) => s + r.minEnergy, 0) / results.length).toFixed(0);
  console.log(
    `${label}: wins ${wins}/${results.length} · samples ${avgSamples}/5 · experiments ${avgExp}/3 · habitat ${avgHabitat}% · health ${avgHealth}% · minEnergy ${avgMinEnergy}`,
  );
  console.log('  sample run:', JSON.stringify(results[0]));
}

const runs = 12;
console.log('== GOOD POLICY ==');
summarize('good', Array.from({ length: runs }, () => runMission('good')));
console.log('== RANDOM POLICY ==');
summarize('random', Array.from({ length: runs }, () => runMission('random')));
console.log('== RECKLESS POLICY ==');
summarize('reckless', Array.from({ length: runs }, () => runMission('reckless')));
console.log('== NEGLECT POLICY (everyone sleeps, random choices) ==');
summarize('neglect', Array.from({ length: runs }, () => runMission('neglect')));
