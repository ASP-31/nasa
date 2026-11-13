import type { LucideIcon } from 'lucide-react';
import {
  Wind,
  Radiation,
  Droplets,
  Leaf,
  HeartPulse,
  Satellite,
  Zap,
  Mountain,
  Thermometer,
  Sun,
  FlaskConical,
  Utensils,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  wind: Wind,
  radiation: Radiation,
  droplets: Droplets,
  leaf: Leaf,
  'heart-pulse': HeartPulse,
  satellite: Satellite,
  zap: Zap,
  mountain: Mountain,
  thermometer: Thermometer,
  sun: Sun,
  flask: FlaskConical,
  utensils: Utensils,
};

export function GameIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? FlaskConical;
  return <Icon className={className} aria-hidden="true" />;
}
