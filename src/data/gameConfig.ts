import type { WeatherCondition, WeatherState } from '../types/game';

// ─────────────────────────────────────────────────────────────
// Tunable simulation constants — all gameplay balance lives here.
// ─────────────────────────────────────────────────────────────

export const MISSION = {
  name: 'ARES-01',
  title: 'MARS OUTPOST',
  duration: 30, // sols
  crewSize: 4,
  destination: 'Mars',
  landingSite: 'Jezero Crater',
} as const;

export const TOTAL_SOL = MISSION.duration;

/** Per-person, per-sol consumption of consumables. */
export const CONSUMPTION_PER_PERSON = {
  waterLiters: 0.5,
  oxygenLiters: 0.6,
  foodKg: 0.3,
} as const;

/** Base power draw of essential habitat systems, per sol. */
export const ESSENTIAL_ENERGY_PER_SOL = 11.0;

/** Life-support output while the corresponding subsystem is healthy. */
export const GREENHOUSE_PRODUCTION = { nominal: 1.1, degraded: 0.5, failed: 0 } as const;
export const OXYGEN_PRODUCTION = { nominal: 1.4, degraded: 0.6, failed: 0 } as const;

/** Extra draw while a scientific experiment is running. */
export const EXPERIMENT_ENERGY_PER_SOL = 0.6;

/** Energy consumed when the engineer performs a repair. */
export const REPAIR_ENERGY_COST = 5;

export const CAPACITY = {
  energy: 160, // kWh battery bank
  water: 300, // liters
  oxygen: 250, // liters
  food: 30, // kg
} as const;

export const START_RESOURCES = {
  energy: 100,
  water: 240,
  oxygen: 180,
  food: 22,
  radiationProtection: 100,
} as const;

/** Water recovered per sol as a fraction of what is consumed. */
export const RECYCLING_NOMINAL = 0.9;
export const RECYCLING_DEGRADED = 0.55;
export const RECYCLING_FAILED = 0.15;

/** Solar generation (kWh/sol) by weather condition. */
export const SOLAR_GENERATION: Record<WeatherCondition, number> = {
  clear: 20,
  dusty: 12,
  moderate_storm: 6,
  severe_storm: 2,
  solar_storm: 1,
};

export const RADIATION_LEVEL: Record<WeatherCondition, number> = {
  clear: 1.0,
  dusty: 1.1,
  moderate_storm: 1.2,
  severe_storm: 1.3,
  solar_storm: 2.6,
};

export const WEATHER_META: Record<
  WeatherCondition,
  { label: string; description: string; temperature: number }
> = {
  clear: {
    label: 'Clear Skies',
    description: 'Atmosphere thin and calm. Solar arrays at full output.',
    temperature: -63,
  },
  dusty: {
    label: 'Dusty Conditions',
    description: 'Airborne dust is dimming the arrays.',
    temperature: -70,
  },
  moderate_storm: {
    label: 'Moderate Dust Storm',
    description: 'Regional dust storm moving through the area.',
    temperature: -74,
  },
  severe_storm: {
    label: 'Severe Dust Storm',
    description: 'Opacity critical. Solar output at minimum.',
    temperature: -79,
  },
  solar_storm: {
    label: 'Solar Particle Event',
    description: 'Radiation rising. Crew shelter advised.',
    temperature: -61,
  },
};

export const CRITICAL_THRESHOLDS = {
  energy: 10, // below this, essential systems begin to fail
  water: 25,
  oxygen: 30,
  food: 6,
  habitat: 60, // mission objective floor
  radiation: 40,
  crewHealth: 55,
} as const;

/** Weather weights by mission phase — dust season kicks in after sol 10. */
export function weatherPoolForSol(sol: number): Array<{ condition: WeatherCondition; weight: number }> {
  if (sol < 5) {
    return [
      { condition: 'clear', weight: 6 },
      { condition: 'dusty', weight: 2 },
      { condition: 'moderate_storm', weight: 1 },
    ];
  }
  if (sol < 10) {
    return [
      { condition: 'clear', weight: 4 },
      { condition: 'dusty', weight: 3 },
      { condition: 'moderate_storm', weight: 1.5 },
      { condition: 'severe_storm', weight: 0.5 },
    ];
  }
  if (sol < 20) {
    return [
      { condition: 'clear', weight: 2.5 },
      { condition: 'dusty', weight: 3 },
      { condition: 'moderate_storm', weight: 2.5 },
      { condition: 'severe_storm', weight: 1.2 },
    ];
  }
  return [
    { condition: 'clear', weight: 2 },
    { condition: 'dusty', weight: 2.5 },
    { condition: 'moderate_storm', weight: 2.5 },
    { condition: 'severe_storm', weight: 1.6 },
  ];
}

export function buildWeatherState(condition: WeatherCondition): WeatherState {
  const meta = WEATHER_META[condition];
  return {
    condition,
    description: meta.description,
    solarGeneration: SOLAR_GENERATION[condition],
    radiationLevel: RADIATION_LEVEL[condition],
    temperature: meta.temperature,
  };
}

export const MILESTONES: Array<{ sol: number; title: string; message: string }> = [
  { sol: 5, title: 'HABITAT FULLY OPERATIONAL', message: 'All primary habitat systems verified. First major mission milestone complete.' },
  { sol: 10, title: 'DUST STORM SEASON', message: 'Mars enters its dust season. Expect reduced solar generation and more frequent storms.' },
  { sol: 15, title: 'MID-MISSION REVIEW', message: 'Mission control requests a full resource audit. Halfway point reached.' },
  { sol: 20, title: 'COMMUNICATION DELAY', message: 'Earth signal delay now 22 minutes one-way. Decisions must be made independently.' },
  { sol: 25, title: 'FINAL PHASE', message: 'Five sols remain. Prioritize closing out scientific objectives.' },
];
