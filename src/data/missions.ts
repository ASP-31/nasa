import type { Experiment } from '../types/game';

// ─────────────────────────────────────────────────────────────
// Scientific experiments and mission objectives.
// ─────────────────────────────────────────────────────────────

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'atmosphere',
    name: 'Atmospheric Composition Study',
    description: 'Long-duration MET monitoring of CO2, argon and trace gases above Jezero.',
    status: 'pending',
    duration: 3,
    progress: 0,
    energyPerSol: 0.6,
  },
  {
    id: 'soil',
    name: 'Martian Soil Analysis',
    description: 'X-ray diffraction pass on delta sediments for clay minerals and perchlorates.',
    status: 'pending',
    duration: 2,
    progress: 0,
    energyPerSol: 0.5,
  },
  {
    id: 'waterice',
    name: 'Subsurface Water-Ice Survey',
    description: 'Ground-penetrating radar sweep for shallow ice along the crater rim.',
    status: 'pending',
    duration: 3,
    progress: 0,
    energyPerSol: 0.7,
  },
];

export const PRIMARY_OBJECTIVES = [
  { id: 'crew', label: 'Keep all four crew members alive', target: '4 of 4' },
  { id: 'habitat', label: 'Maintain habitat integrity above 60%', target: '≥ 60%' },
  { id: 'experiments', label: 'Complete three scientific experiments', target: '3 / 3' },
  { id: 'samples', label: 'Collect five geological samples', target: '5 / 5' },
  { id: 'survive', label: 'Survive 30 Martian sols', target: '30 / 30' },
] as const;

export const NASA_REFERENCES = [
  {
    name: 'NASA Mars Exploration',
    url: 'https://science.nasa.gov/mars/',
    note: 'Mission archive and current Mars exploration programs.',
  },
  {
    name: 'NASA Mars Facts',
    url: 'https://science.nasa.gov/mars/facts/',
    note: 'Gravity, temperature, atmosphere and day-length data used to ground this simulation.',
  },
  {
    name: 'NASA Space Apps Challenge',
    url: 'https://www.spaceappschallenge.org/',
    note: 'The global hackathon this project was built for.',
  },
] as const;

export const MISSION_FACTS = [
  {
    label: 'Gravity',
    value: '3.71 m/s²',
    real: 'About 38% of Earth’s surface gravity.',
  },
  {
    label: 'Average temperature',
    value: '−63 °C',
    real: 'Surface temperatures range roughly −140 °C to +30 °C.',
  },
  {
    label: 'Atmosphere',
    value: '95% CO₂',
    real: 'Less than 1% the pressure of Earth’s atmosphere.',
  },
  {
    label: 'Sol length',
    value: '24 h 37 m',
    real: 'A Martian day is called a “sol”.',
  },
  {
    label: 'Radiation',
    value: '0.7 mSv/day',
    real: 'Roughly the dose measured by Curiosity — hence the shelter mechanics in-game.',
  },
  {
    label: 'Earth delay',
    value: '4–24 min',
    real: 'One-way signal time varies with orbital distance.',
  },
] as const;
