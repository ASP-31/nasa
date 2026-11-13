import type {
  GameState,
  ResourceDelta,
  Resource,
  CrewActivity,
  SubsystemId,
  SubsystemCondition,
} from '../types/game';
import {
  CAPACITY,
  CONSUMPTION_PER_PERSON,
  ESSENTIAL_ENERGY_PER_SOL,
  EXPERIMENT_ENERGY_PER_SOL,
  GREENHOUSE_PRODUCTION,
  OXYGEN_PRODUCTION,
  RECYCLING_DEGRADED,
  RECYCLING_FAILED,
  RECYCLING_NOMINAL,
  REPAIR_ENERGY_COST,
  CRITICAL_THRESHOLDS,
} from '../data/gameConfig';
import { CREW } from '../data/crew';
import { clamp, mean, round1 } from '../utils/calculations';

// ─────────────────────────────────────────────────────────────
// Resource management — every mutation of quantities, crew,
// habitat and subsystems flows through this module.
// ─────────────────────────────────────────────────────────────

export function makeResource(value: number, max: number): Resource {
  return { value: clamp(value, 0, max), max };
}

function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

function subsystemById(subsystems: SubsystemCondition[], id: SubsystemId): SubsystemCondition {
  const found = subsystems.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown subsystem: ${id}`);
  return found;
}

/** Water-recovery fraction implied by the recycler's condition. */
export function recyclingEfficiency(state: GameState): number {
  const recycler = subsystemById(state.subsystems, 'waterRecycler');
  if (recycler.status === 'nominal') return RECYCLING_NOMINAL;
  if (recycler.status === 'degraded') return RECYCLING_DEGRADED;
  return RECYCLING_FAILED;
}

/** Solar output modifier implied by the array condition. */
export function solarEfficiency(state: GameState): number {
  const panels = subsystemById(state.subsystems, 'solarPanels');
  return 0.55 + (panels.condition / 100) * 0.45;
}

export function isRunningExperiment(state: GameState) {
  return state.experiments.find((e) => e.status === 'running') ?? null;
}

/**
 * Applies a ResourceDelta to a cloned state and returns it.
 * All resulting quantities are validated and clamped — no
 * negative resources can ever exist.
 */
export function applyDelta(state: GameState, delta: ResourceDelta): GameState {
  const next = cloneState(state);
  const r = next.resources;

  if (delta.energy !== undefined) r.energy.value = clamp(r.energy.value + delta.energy, 0, CAPACITY.energy);
  if (delta.water !== undefined) r.water.value = clamp(r.water.value + delta.water, 0, CAPACITY.water);
  if (delta.oxygen !== undefined) r.oxygen.value = clamp(r.oxygen.value + delta.oxygen, 0, CAPACITY.oxygen);
  if (delta.food !== undefined) r.food.value = clamp(r.food.value + delta.food, 0, CAPACITY.food);
  if (delta.radiation !== undefined) {
    r.radiationProtection.value = clamp(r.radiationProtection.value + delta.radiation, 0, 100);
  }
  if (delta.samples !== undefined) {
    next.objectives.samplesCollected = clamp(next.objectives.samplesCollected + delta.samples, 0, 5);
  }
  if (delta.flags) {
    next.flags = { ...next.flags, ...delta.flags };
  }
  if (delta.habitatIntegrity !== undefined) {
    next.habitat.integrity = clamp(next.habitat.integrity + delta.habitatIntegrity, 0, 100);
  }
  if (delta.temperature !== undefined) {
    next.habitat.temperature = clamp(next.habitat.temperature + delta.temperature, 8, 28);
  }
  if (delta.pressure !== undefined) {
    next.habitat.pressure = clamp(next.habitat.pressure + delta.pressure, 0.55, 1.05);
  }
  if (delta.subsystems) {
    for (const [id, amount] of Object.entries(delta.subsystems)) {
      const subsystem = next.subsystems.find((s) => s.id === id);
      if (subsystem && amount !== undefined) {
        subsystem.condition = clamp(subsystem.condition + amount, 0, 100);
      }
    }
    next.subsystems = next.subsystems.map(refreshSubsystemStatus);
  }

  // Crew health / morale can target everyone, the sickest member, or one member.
  if (delta.crewHealth !== undefined || delta.morale !== undefined) {
    const indices = resolveCrewTargets(next, delta);
    for (const index of indices) {
      const member = next.crew[index];
      if (member.status === 'deceased') continue;
      if (delta.crewHealth !== undefined) {
        member.health = clamp(member.health + delta.crewHealth, 0, member.maxHealth);
      }
      if (delta.morale !== undefined) {
        member.morale = clamp(member.morale + delta.morale, 0, 100);
      }
    }
    refreshCrewStatuses(next);
    r.crewHealth.value = aggregateCrewHealth(next);
  }

  return next;
}

function resolveCrewTargets(state: GameState, delta: ResourceDelta): number[] {
  if (delta.memberId) {
    const index = state.crew.findIndex((c) => c.id === delta.memberId);
    return index >= 0 ? [index] : [];
  }
  if (delta.targetSickest) {
    let worst = -1;
    let lowest = Infinity;
    state.crew.forEach((member, index) => {
      if (member.status !== 'deceased' && member.health < lowest) {
        lowest = member.health;
        worst = index;
      }
    });
    return worst >= 0 ? [worst] : [];
  }
  return state.crew.map((_, index) => index);
}

export function aggregateCrewHealth(state: GameState): number {
  const alive = state.crew.filter((c) => c.status !== 'deceased');
  if (alive.length === 0) return 0;
  return Math.round(mean(alive.map((c) => c.health)));
}

export function refreshCrewStatuses(state: GameState): void {
  for (const member of state.crew) {
    if (member.status === 'deceased') continue;
    if (member.health <= 0) {
      member.status = 'deceased';
      member.health = 0;
      member.activity = 'sleep';
    } else if (member.health < 40) {
      member.status = 'sick';
    } else if (member.health < 65) {
      member.status = 'injured';
    } else {
      member.status = 'healthy';
    }
  }
}

function refreshSubsystemStatus(subsystem: SubsystemCondition): SubsystemCondition {
  const status: SubsystemCondition['status'] =
    subsystem.condition >= 70 ? 'nominal' : subsystem.condition >= 35 ? 'degraded' : 'failed';
  return { ...subsystem, status };
}

export function decaySubsystems(state: GameState): void {
  for (const subsystem of state.subsystems) {
    if (subsystem.id === 'solarPanels') continue; // only degraded by events / cleaning
    subsystem.condition = clamp(subsystem.condition - 2.0, 0, 100);
  }
  state.subsystems = state.subsystems.map(refreshSubsystemStatus);
}

/** Consumes one sol's worth of consumables and adds solar generation. */
export function consumeAndGenerate(state: GameState): void {
  const crewCount = state.crew.filter((c) => c.status !== 'deceased').length || 1;
  const r = state.resources;

  // ── Energy ──
  const generation = state.weather.solarGeneration * solarEfficiency(state);
  let consumption = ESSENTIAL_ENERGY_PER_SOL;
  const running = isRunningExperiment(state);
  if (running) consumption += EXPERIMENT_ENERGY_PER_SOL;
  if (state.flags.reducedOperations) consumption *= 0.85;
  r.energy.value = clamp(round1(r.energy.value + generation - consumption), 0, CAPACITY.energy);

  // ── Water (consumption minus recycling recovery) ──
  const waterUse = CONSUMPTION_PER_PERSON.waterLiters * crewCount;
  const recycled = waterUse * recyclingEfficiency(state);
  r.water.value = clamp(round1(r.water.value + recycled - waterUse), 0, CAPACITY.water);

  // ── Oxygen (consumption minus oxygen-generation output) ──
  const pump = subsystemById(state.subsystems, 'oxygenPump');
  const oxygenProduction = OXYGEN_PRODUCTION[pump.status];
  const oxygenUse = CONSUMPTION_PER_PERSON.oxygenLiters * crewCount;
  r.oxygen.value = clamp(round1(r.oxygen.value + oxygenProduction - oxygenUse), 0, CAPACITY.oxygen);

  // ── Food (consumption minus greenhouse yield) ──
  const greenhouse = subsystemById(state.subsystems, 'greenhouse');
  const foodProduction = GREENHOUSE_PRODUCTION[greenhouse.status];
  let foodUse = CONSUMPTION_PER_PERSON.foodKg * crewCount;
  if (state.flags.rationMeals) foodUse *= 0.55;
  r.food.value = clamp(round1(r.food.value + foodProduction - foodUse), 0, CAPACITY.food);
}

export interface CrewSolResult {
  sampleProgress: number; // points added toward the next sample
  experimentProgress: number; // sols of work added
  logMessages: string[];
}

/** Applies crew activities: recovery, science, repairs, medicine. */
export function applyCrewActivities(state: GameState): CrewSolResult {
  const result: CrewSolResult = { sampleProgress: 0, experimentProgress: 0, logMessages: [] };

  for (const member of state.crew) {
    if (member.status === 'deceased') continue;
    const engineer = member.id === 'morgan';
    const medic = member.id === 'chen';
    const geologist = member.id === 'williams';

    switch (member.activity as CrewActivity) {
      case 'sleep':
        member.health = clamp(member.health + 2.5, 0, member.maxHealth);
        member.morale = clamp(member.morale + 2, 0, 100);
        break;
      case 'science': {
        if (geologist) {
          result.sampleProgress += member.status === 'healthy' ? 40 : 22;
          member.morale = clamp(member.morale + 1, 0, 100);
        }
        break;
      }
      case 'experiment': {
        const running = isRunningExperiment(state);
        if (running && geologist) {
          result.experimentProgress += 1;
          member.morale = clamp(member.morale + 1, 0, 100);
        }
        break;
      }
      case 'maintenance': {
        if (engineer) {
          for (const subsystem of state.subsystems) {
            subsystem.condition = clamp(subsystem.condition + 2.6, 0, 100);
          }
          state.habitat.integrity = clamp(state.habitat.integrity + 0.8, 0, 100);
        }
        break;
      }
      case 'repair': {
        if (engineer) {
          const damaged = [...state.subsystems]
            .filter((s) => s.condition < 70)
            .sort((a, b) => a.condition - b.condition)[0];
          if (damaged) {
            const canPay = state.resources.energy.value >= REPAIR_ENERGY_COST;
            if (canPay) {
              state.resources.energy.value = clamp(
                state.resources.energy.value - REPAIR_ENERGY_COST * 0.6,
                0,
                CAPACITY.energy,
              );
              damaged.condition = clamp(damaged.condition + 32, 0, 100);
              state.habitat.integrity = clamp(state.habitat.integrity + 1.5, 0, 100);
              result.logMessages.push(`${member.callsign} repaired the ${damaged.name.toLowerCase()} to ${Math.round(damaged.condition)}%.`);
            } else {
              result.logMessages.push('Repair aborted — insufficient stored energy.');
            }
          }
        }
        break;
      }
      case 'medical': {
        if (medic) {
          const patient = [...state.crew]
            .filter((c) => c.status !== 'deceased' && c.health < 70)
            .sort((a, b) => a.health - b.health)[0];
          if (patient) {
            patient.health = clamp(patient.health + 7, 0, patient.maxHealth);
            patient.morale = clamp(patient.morale + 2, 0, 100);
            result.logMessages.push(`Dr. Chen stabilized ${patient.name.split(' ').slice(-1)[0]} (+9 health).`);
          }
        }
        break;
      }
      case 'command': {
        for (const other of state.crew) {
          if (other.id !== member.id && other.status !== 'deceased') {
            other.morale = clamp(other.morale + 1.5, 0, 100);
          }
        }
        member.morale = clamp(member.morale + 1, 0, 100);
        break;
      }
      default:
        break;
    }
  }

  refreshCrewStatuses(state);
  state.resources.crewHealth.value = aggregateCrewHealth(state);
  return result;
}

/** Environmental damage: radiation, temperature, failing life support. */
export function applyEnvironmentEffects(state: GameState): string[] {
  const messages: string[] = [];
  const r = state.resources;

  // Radiation shielding decays with exposure, storms hit hardest.
  const exposure = Math.max(0, state.weather.radiationLevel - 1) * 22;
  if (exposure > 0) {
    r.radiationProtection.value = clamp(r.radiationProtection.value - exposure, 0, 100);
  }
  const sheltered = state.crew.every(
    (c) => c.status === 'deceased' || c.activity === 'sleep' || c.activity === 'medical',
  );
  if (state.weather.radiationLevel >= 2.5 && !sheltered) {
    r.radiationProtection.value = clamp(r.radiationProtection.value - 15, 0, 100);
  }
  if (r.radiationProtection.value <= 0) {
    for (const member of state.crew) {
      if (member.status === 'deceased') continue;
      member.health = clamp(member.health - 10, 0, member.maxHealth);
    }
    messages.push('Radiation exposure is harming the crew — shelter immediately.');
  } else if (r.radiationProtection.value <= 50) {
    for (const member of state.crew) {
      if (member.status === 'deceased') continue;
      member.health = clamp(member.health - 2, 0, member.maxHealth);
    }
    messages.push('Radiation shielding is weakening — crew absorbing low-level exposure.');
  } else {
    // Steady recovery while conditions are calm.
    r.radiationProtection.value = clamp(r.radiationProtection.value + 6, 0, 100);
  }

  // Thermal control.
  const thermal = subsystemById(state.subsystems, 'thermal');
  if (thermal.status === 'failed') {
    state.habitat.temperature = clamp(state.habitat.temperature - 3, 5, 28);
    state.habitat.integrity = clamp(state.habitat.integrity - 1.5, 0, 100);
    if (state.habitat.temperature < 12) {
      for (const member of state.crew) {
        if (member.status !== 'deceased') member.health = clamp(member.health - 2, 0, member.maxHealth);
      }
      messages.push('Habitat temperature is critically low — repair thermal control.');
    }
  } else if (thermal.status === 'degraded') {
    state.habitat.temperature = clamp(state.habitat.temperature - 1, 5, 28);
  } else {
    state.habitat.temperature = clamp(state.habitat.temperature + 1.5, 18, 23);
  }

  // Pressure drifts if the habitat is damaged.
  if (state.habitat.integrity < 50) {
    state.habitat.pressure = clamp(state.habitat.pressure - 0.03, 0.55, 1.05);
  } else if (state.habitat.pressure < 1) {
    state.habitat.pressure = clamp(state.habitat.pressure + 0.04, 0.55, 1.05);
  }

  // Degraded and failed subsystems strain the habitat structure itself.
  const structuralLoad = state.subsystems.filter((s) => s.id !== 'solarPanels').reduce((load, s) => {
    if (s.status === 'failed') return load + 2.5;
    if (s.status === 'degraded') return load + 0.4;
    return load;
  }, 0);
  if (structuralLoad > 0) {
    state.habitat.integrity = clamp(state.habitat.integrity - structuralLoad, 0, 100);
  }

  // A compromised habitat endangers everyone inside it.
  if (state.habitat.integrity < 25) {
    for (const member of state.crew) {
      if (member.status !== 'deceased') member.health = clamp(member.health - 2, 0, member.maxHealth);
    }
    messages.push('Habitat integrity critical — the outpost structure is failing.');
  }

  // Critical resource effects on crew health.
  const alive = state.crew.filter((c) => c.status !== 'deceased');
  for (const member of alive) {
    if (r.oxygen.value <= CRITICAL_THRESHOLDS.oxygen * 0.4) member.health -= 8;
    else if (r.oxygen.value <= CRITICAL_THRESHOLDS.oxygen) member.health -= 4;
    if (r.water.value <= CRITICAL_THRESHOLDS.water * 0.4) member.health -= 6;
    else if (r.water.value <= CRITICAL_THRESHOLDS.water) member.health -= 2;
    if (r.food.value <= CRITICAL_THRESHOLDS.food * 0.5) member.health -= 4;
    if (r.energy.value <= CRITICAL_THRESHOLDS.energy * 0.5) {
      member.health -= 3;
      member.morale = clamp(member.morale - 3, 0, 100);
    }
    if (member.morale < 30) member.health -= 1.5;
    member.health = clamp(member.health, 0, member.maxHealth);
  }

  // Hazard warnings for the log.
  if (r.oxygen.value <= CRITICAL_THRESHOLDS.oxygen) messages.push('Oxygen reserves critically low.');
  if (r.water.value <= CRITICAL_THRESHOLDS.water) messages.push('Potable water critically low.');
  if (r.food.value <= CRITICAL_THRESHOLDS.food) messages.push('Food stores critically low.');
  if (r.energy.value <= CRITICAL_THRESHOLDS.energy) messages.push('Battery bank nearly depleted.');
  if (state.habitat.integrity < CRITICAL_THRESHOLDS.habitat) {
    messages.push(`Habitat integrity below the 60% mission floor (${Math.round(state.habitat.integrity)}%).`);
  }

  refreshCrewStatuses(state);
  r.crewHealth.value = aggregateCrewHealth(state);
  return messages;
}

/** Fresh crew instances (so a new mission never mutates the manifest). */
export function freshCrew() {
  return structuredClone(CREW) as GameState['crew'];
}
