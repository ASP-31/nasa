import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Resource } from '../../types/game';
import { AnimatedNumber } from './AnimatedNumber';
import { clamp } from '../../utils/calculations';

interface ResourceBarProps {
  icon: LucideIcon;
  label: string;
  resource: Resource;
  unit: string;
  decimals?: number;
  critical: boolean;
  statusLabel: string;
  /** Fill colour override; defaults to solar accent. */
  barColor?: string;
}

export function ResourceBar({
  icon: Icon,
  label,
  resource,
  unit,
  decimals = 0,
  critical,
  statusLabel,
  barColor,
}: ResourceBarProps) {
  const ratio = clamp(resource.value / resource.max, 0, 1);
  const fill = critical ? 'bg-alert' : (barColor ?? 'bg-solar');
  const textColor = critical ? 'text-alert' : 'text-ink';

  return (
    <div className="rounded-md border border-haze/30 bg-deep/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon
            className={`h-4 w-4 ${critical ? 'text-alert' : 'text-solar'} ${critical ? 'animate-pulse-solar' : ''}`}
            aria-hidden="true"
          />
          <span className="font-display text-xs font-semibold uppercase tracking-wider text-mist">{label}</span>
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${critical ? 'text-alert' : 'text-mist'}`}>
          {statusLabel}
        </span>
      </div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className={`font-display text-lg font-semibold leading-none ${textColor}`}>
          <AnimatedNumber value={resource.value} decimals={decimals} />
        </span>
        <span className="text-xs text-mist">
          / {resource.max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate/60" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <motion.div
          className={`h-full rounded-full ${fill}`}
          initial={false}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
      {critical ? (
        <p className="mt-1.5 text-[11px] font-medium text-alert" role="alert">
          Low {label.toLowerCase()} — act before advancing the next sol.
        </p>
      ) : null}
    </div>
  );
}
