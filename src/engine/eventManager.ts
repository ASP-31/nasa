import type { ActiveEvent, GameState, ResourceDelta } from '../types/game';
import { EVENTS, EVENT_BY_ID } from '../data/events';
import { applyDelta } from './resourceManager';
import { clamp, eventChance, weightedPick } from '../utils/calculations';

// ─────────────────────────────────────────────────────────────
// Event manager — spawning, resolving and expiring events.
// Every resolution mutates the simulation via ResourceDelta.
// ─────────────────────────────────────────────────────────────

/** Attempts to spawn a random eligible event. Returns the updated state. */
export function maybeSpawnEvent(state: GameState): { state: GameState; spawned: ActiveEvent | null } {
  if (state.activeEvent) return { state, spawned: null };
  if (Math.random() > eventChance(state.sol)) return { state, spawned: null };

  const pool = EVENTS.filter((def) => {
    if (state.sol < def.minSol || state.sol > def.maxSol) return false;
    const cooldownUntil = state.eventCooldowns[def.id] ?? 0;
    return state.sol >= cooldownUntil;
  });
  const chosen = weightedPick(pool);
  if (!chosen) return { state, spawned: null };

  const spawned: ActiveEvent = {
    def: chosen,
    spawnedSol: state.sol,
    solsRemaining: chosen.duration ?? 1,
  };
  // The event strikes first (onset damage), then the player responds.
  const stateWithOnset = chosen.onsetConsequence ? applyDelta(state, chosen.onsetConsequence) : state;
  return { state: { ...stateWithOnset, activeEvent: spawned }, spawned };
}

export function resolveEvent(state: GameState, choiceId: string): GameState {
  if (!state.activeEvent) return state;
  const def = state.activeEvent.def;
  const choice = def.choices.find((c) => c.id === choiceId) ?? def.choices[0];

  let next = applyDelta(state, choice.consequence);
  next = {
    ...next,
    activeEvent: null,
    eventCooldowns: { ...next.eventCooldowns, [def.id]: next.sol + def.cooldown },
    incidents: [...next.incidents, { sol: next.sol, title: def.title, resolution: choice.label }],
  };
  next.log = [
    {
      id: next.log.length + 1,
      sol: next.sol,
      message: `${def.title} — response: ${choice.label.toLowerCase()}.`,
      type: def.severity,
    },
    ...next.log,
  ];
  return next;
}

/** Applies the automatic consequence of an event running out of time. */
export function expireEvent(state: GameState): GameState {
  if (!state.activeEvent) return state;
  const def = state.activeEvent.def;
  const consequence: ResourceDelta = def.expireConsequence ?? {};
  let next = Object.keys(consequence).length > 0 ? applyDelta(state, consequence) : state;
  next = {
    ...next,
    activeEvent: null,
    eventCooldowns: { ...next.eventCooldowns, [def.id]: next.sol + def.cooldown },
    incidents: [...next.incidents, { sol: next.sol, title: def.title, resolution: 'No response — event expired' }],
  };
  next.log = [
    {
      id: next.log.length + 1,
      sol: next.sol,
      message: `${def.title} resolved without intervention.`,
      type: def.severity,
    },
    ...next.log,
  ];
  return next;
}

/** Events with duration tick down each sol; expiry resolves them automatically. */
export function tickActiveEvent(state: GameState): { state: GameState; expired: boolean } {
  if (!state.activeEvent) return { state, expired: false };
  const active: ActiveEvent = {
    ...state.activeEvent,
    solsRemaining: clamp(state.activeEvent.solsRemaining - 1, 0, 99),
  };
  const next = { ...state, activeEvent: active };
  if (active.solsRemaining <= 0) {
    return { state: expireEvent(next), expired: true };
  }
  return { state: next, expired: false };
}

export function eventById(id: string) {
  return EVENT_BY_ID[id];
}
