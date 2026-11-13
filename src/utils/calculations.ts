// ─────────────────────────────────────────────────────────────
// Pure math helpers shared by the simulation engine and UI.
// ─────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Weighted random selection from a pool. */
export function weightedPick<T extends { weight: number }>(pool: T[], rng: () => number = Math.random): T | null {
  if (pool.length === 0) return null;
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return pool[pool.length - 1];
}

export function pct(value: number, max: number): number {
  if (max <= 0) return 0;
  return clamp((value / max) * 100, 0, 100);
}

export function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Deterministic-feeling event chance: never 0, never guaranteed. */
export function eventChance(sol: number): number {
  if (sol <= 2) return 0.16;
  if (sol <= 10) return 0.28;
  if (sol <= 20) return 0.36;
  return 0.44;
}
