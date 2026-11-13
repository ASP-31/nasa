import type { Severity } from '../../types/game';

const TONE_CLASSES: Record<Severity | 'success' | 'neutral' | 'alive', string> = {
  info: 'border-haze/50 bg-slate/40 text-mist',
  warning: 'border-solar/60 bg-solar/15 text-solar',
  critical: 'border-alert/60 bg-alert/15 text-alert',
  success: 'border-solar/60 bg-solar/20 text-solar',
  neutral: 'border-haze/50 bg-slate/40 text-mist',
  alive: 'border-solar/60 bg-solar/15 text-solar',
};

export function StatusChip({
  tone,
  children,
  pulse,
}: {
  tone: Severity | 'success' | 'neutral' | 'alive';
  children: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <span
      className={`chip ${TONE_CLASSES[tone]} ${pulse ? 'animate-pulse-solar' : ''}`}
    >
      {children}
    </span>
  );
}
