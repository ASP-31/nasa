import type { CrewMember } from '../types/game';

// ─────────────────────────────────────────────────────────────
// ARES-01 crew manifest. Each specialist has a gameplay ability.
// ─────────────────────────────────────────────────────────────

export const CREW: CrewMember[] = [
  {
    id: 'vasquez',
    name: 'Commander Elena Vasquez',
    callsign: 'VASQUEZ',
    role: 'Mission Commander',
    specialization: 'Flight operations & mission coordination',
    bio: 'Veteran of two long-duration ISS expeditions. Known for keeping crews calm under comms blackouts.',
    health: 100,
    maxHealth: 100,
    status: 'healthy',
    morale: 82,
    activity: 'command',
    ability: 'Mission Coordination',
    abilityDescription: 'While coordinating, crew morale recovers faster and event penalties are softened.',
  },
  {
    id: 'chen',
    name: 'Dr. Marcus Chen',
    callsign: 'CHEN',
    role: 'Medical Officer',
    specialization: 'Flight surgery & life-support medicine',
    bio: 'Flight surgeon who trained the first Martian EVA medics. Insists on daily exercise and clean water.',
    health: 100,
    maxHealth: 100,
    status: 'healthy',
    morale: 78,
    activity: 'medical',
    ability: 'Trauma Care',
    abilityDescription: 'While on medical duty, sick or injured crew members recover significantly faster.',
  },
  {
    id: 'morgan',
    name: 'Alex Morgan',
    callsign: 'MORGAN',
    role: 'Systems Engineer',
    specialization: 'Habitat, power & ECLSS maintenance',
    bio: 'Built two of the Antarctic winter-over habitats this outpost is modeled on. Talks to machines; they listen.',
    health: 100,
    maxHealth: 100,
    status: 'healthy',
    morale: 80,
    activity: 'maintenance',
    ability: 'Rapid Repair',
    abilityDescription: 'Repairs restore more subsystem condition per action and cost less stored energy.',
  },
  {
    id: 'williams',
    name: 'Dr. Sarah Williams',
    callsign: 'WILLIAMS',
    role: 'Planetary Geologist',
    specialization: 'Sedimentology & astrobiology',
    bio: 'Selected sample sites for the Perseverance follow-up. Believes Jezero kept its best secrets buried.',
    health: 100,
    maxHealth: 100,
    status: 'healthy',
    morale: 85,
    activity: 'science',
    ability: 'Field Survey',
    abilityDescription: 'Collects geological samples faster and extracts more value from experiments.',
  },
];

export const SAMPLE_LABELS = [
  'Delta Sediment Core',
  'Carbonate Outcrop Chip',
  'Olivine Basalt Fragment',
  'Clay-Rich Mudstone',
  'Sulfate Vein Sample',
];

export const SAMPLE_LOCATIONS = [
  'Western Delta',
  'Kodiak Butte',
  'Crater Rim Ridge',
  'Ceiba Outcrop',
  'Séítah Dune Field',
];
