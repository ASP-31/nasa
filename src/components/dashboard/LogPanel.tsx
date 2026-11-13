import { ScrollText } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameState } from '../../types/game';
import { SectionCard } from '../common/SectionCard';

const TYPE_COLOR: Record<string, string> = {
  info: 'text-mist',
  warning: 'text-solar',
  critical: 'text-alert',
  success: 'text-solar',
};

const TYPE_MARKER: Record<string, string> = {
  info: 'bg-haze',
  warning: 'bg-solar',
  critical: 'bg-alert',
  success: 'bg-solar',
};

export function LogPanel({ state }: { state: GameState }) {
  return (
    <SectionCard title="Activity Log" icon={ScrollText} bodyClassName="p-0">
      <div className="max-h-64 overflow-y-auto px-4 py-3">
        <AnimatePresence initial={false}>
          <ul className="space-y-2.5">
            {state.log.slice(0, 24).map((entry, index) => (
              <motion.li
                key={`${entry.sol}-${entry.id}-${index}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-2.5 text-sm leading-snug"
              >
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_MARKER[entry.type] ?? 'bg-haze'}`} />
                <span className={TYPE_COLOR[entry.type] ?? 'text-mist'}>
                  <span className="font-display font-semibold">SOL {String(entry.sol).padStart(2, '0')}</span>
                  <span className="text-haze"> — </span>
                  {entry.message}
                </span>
              </motion.li>
            ))}
          </ul>
        </AnimatePresence>
      </div>
    </SectionCard>
  );
}
