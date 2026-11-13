import {
  Battery,
  Droplets,
  Wind,
  Utensils,
  Radiation,
  HeartPulse,
  Home,
} from 'lucide-react';
import type { GameState } from '../../types/game';
import { CRITICAL_THRESHOLDS } from '../../data/gameConfig';
import { ResourceBar } from '../common/ResourceBar';
import { SectionCard } from '../common/SectionCard';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface ResourcesPanelProps {
  state: GameState;
}

export function ResourcesPanel({ state }: ResourcesPanelProps) {
  const r = state.resources;
  const below = (value: number, threshold: number) => value <= threshold;

  const integrity = state.habitat.integrity;
  const integrityCritical = integrity < CRITICAL_THRESHOLDS.habitat;
  const integrityBar = integrityCritical ? 'bg-alert' : 'bg-slate';

  return (
    <SectionCard
      title="Life Support Resources"
      icon={Battery}
      action={
        <span className="text-[11px] uppercase tracking-wider text-mist">
          Sol {state.sol} snapshot
        </span>
      }
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        <ResourceBar
          icon={Battery}
          label="Energy"
          resource={r.energy}
          unit="kWh"
          decimals={1}
          critical={below(r.energy.value, CRITICAL_THRESHOLDS.energy)}
          statusLabel={statusFor(r.energy.value, r.energy.max)}
        />
        <ResourceBar
          icon={Droplets}
          label="Water"
          resource={r.water}
          unit="L"
          decimals={1}
          critical={below(r.water.value, CRITICAL_THRESHOLDS.water)}
          statusLabel={statusFor(r.water.value, r.water.max)}
        />
        <ResourceBar
          icon={Wind}
          label="Oxygen"
          resource={r.oxygen}
          unit="L"
          decimals={1}
          critical={below(r.oxygen.value, CRITICAL_THRESHOLDS.oxygen)}
          statusLabel={statusFor(r.oxygen.value, r.oxygen.max)}
        />
        <ResourceBar
          icon={Utensils}
          label="Food"
          resource={r.food}
          unit="kg"
          decimals={1}
          critical={below(r.food.value, CRITICAL_THRESHOLDS.food)}
          statusLabel={statusFor(r.food.value, r.food.max)}
        />
        <ResourceBar
          icon={Radiation}
          label="Radiation Protection"
          resource={r.radiationProtection}
          unit="%"
          critical={below(r.radiationProtection.value, CRITICAL_THRESHOLDS.radiation)}
          statusLabel={r.radiationProtection.value >= 80 ? 'Shielded' : 'Exposed'}
        />
        <ResourceBar
          icon={HeartPulse}
          label="Crew Health"
          resource={r.crewHealth}
          unit="%"
          critical={below(r.crewHealth.value, CRITICAL_THRESHOLDS.crewHealth)}
          statusLabel={r.crewHealth.value >= 75 ? 'Stable' : r.crewHealth.value >= 50 ? 'Strained' : 'Critical'}
        />
      </div>

      {/* Habitat integrity — tracked separately from consumables. */}
      <div className="mt-3 rounded-md border border-haze/30 bg-deep/60 p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className={`h-4 w-4 ${integrityCritical ? 'text-alert' : 'text-solar'}`} aria-hidden="true" />
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-mist">
              Habitat Integrity
            </span>
          </div>
          <span className={`font-display text-lg font-semibold ${integrityCritical ? 'text-alert' : 'text-ink'}`}>
            <AnimatedNumber value={integrity} decimals={1} />
            <span className="text-xs text-mist"> %</span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ${integrityBar}`}
            style={{ width: `${integrity}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-mist">
          {integrityCritical
            ? 'Below the 60% mission floor — repairs required to keep the outpost viable.'
            : 'Structural integrity of the pressurized outpost. Objective: stay above 60%.'}
        </p>
      </div>
    </SectionCard>
  );
}

function statusFor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio > 0.6) return 'Nominal';
  if (ratio > 0.3) return 'Low';
  return 'Critical';
}
