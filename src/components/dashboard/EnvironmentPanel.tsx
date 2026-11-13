import { Sun, Thermometer, Gauge, ShieldAlert, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GameState } from '../../types/game';
import { CRITICAL_THRESHOLDS, WEATHER_META } from '../../data/gameConfig';
import { HabitatScene } from '../mars/HabitatScene';
import { StatusChip } from '../common/StatusChip';
import { SectionCard } from '../common/SectionCard';

interface EnvironmentPanelProps {
  state: GameState;
}

export function EnvironmentPanel({ state }: EnvironmentPanelProps) {
  const weather = state.weather;
  const meta = WEATHER_META[weather.condition];
  const solarTone =
    weather.condition === 'clear' ? 'success' : weather.condition === 'solar_storm' ? 'critical' : 'warning';
  const radiationCritical = state.resources.radiationProtection.value <= CRITICAL_THRESHOLDS.radiation;
  const integrityCritical = state.habitat.integrity < CRITICAL_THRESHOLDS.habitat;

  const activeThreats: string[] = [];
  if (state.activeEvent) activeThreats.push(state.activeEvent.def.title);
  if (radiationCritical) activeThreats.push('Radiation shielding low');
  if (integrityCritical) activeThreats.push('Habitat integrity below 60%');
  const degraded = state.subsystems.filter((s) => s.status !== 'nominal');

  return (
    <SectionCard title="Environment & Habitat" icon={Wind} bodyClassName="p-4 space-y-3">
      <HabitatScene
        weather={weather}
        habitatIntegrity={state.habitat.integrity}
        temperature={state.habitat.temperature}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric icon={Sun} label="Solar Output" value={`${weather.solarGeneration} kWh/sol`} chip={{ tone: solarTone, text: meta.label }} />
        <Metric icon={Thermometer} label="External Temp" value={`${weather.temperature}°C`} />
        <Metric icon={Gauge} label="Habitat Pressure" value={`${state.habitat.pressure.toFixed(2)} atm`} />
        <Metric
          icon={ShieldAlert}
          label="Radiation Shield"
          value={`${Math.round(state.resources.radiationProtection.value)}%`}
          critical={radiationCritical}
        />
      </div>

      <div className="rounded-md border border-haze/30 bg-deep/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-mist">Active Threats</span>
          {activeThreats.length === 0 ? <StatusChip tone="success">None</StatusChip> : null}
        </div>
        {activeThreats.length > 0 ? (
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
            {activeThreats.map((threat) => (
              <li key={threat} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-alert" />
                <span className="text-alert">{threat}</span>
              </li>
            ))}
          </motion.ul>
        ) : (
          <p className="text-sm text-mist">{meta.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {state.subsystems.map((subsystem) => (
          <div key={subsystem.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-mist">{subsystem.name}</span>
            <span
              className={
                subsystem.status === 'nominal'
                  ? 'font-semibold text-mist'
                  : subsystem.status === 'degraded'
                    ? 'font-semibold text-solar'
                    : 'font-semibold text-alert'
              }
            >
              {Math.round(subsystem.condition)}%
            </span>
          </div>
        ))}
      </div>
      {degraded.length > 0 ? (
        <p className="text-[11px] text-mist">
          Degraded systems:{' '}
          {degraded.map((s) => s.name).join(', ')}. Assign Morgan to <span className="text-solar">repair</span> to restore them.
        </p>
      ) : null}
    </SectionCard>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  chip,
  critical,
}: {
  icon: typeof Sun;
  label: string;
  value: string;
  chip?: { tone: 'success' | 'warning' | 'critical'; text: string };
  critical?: boolean;
}) {
  return (
    <div className="rounded-md border border-haze/30 bg-deep/60 p-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${critical ? 'text-alert' : 'text-solar'}`} aria-hidden="true" />
        <span className="text-[10px] uppercase tracking-wider text-mist">{label}</span>
      </div>
      <div className="font-display text-sm font-semibold text-ink">{value}</div>
      {chip ? <div className="mt-1"><StatusChip tone={chip.tone}>{chip.text}</StatusChip></div> : null}
    </div>
  );
}
