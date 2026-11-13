import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, icon: Icon, action, children, className, bodyClassName }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`panel overflow-hidden ${className ?? ''}`}
    >
      <header className="panel-header justify-between">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 text-solar" aria-hidden="true" /> : null}
          <h2 className="panel-title">{title}</h2>
        </div>
        {action}
      </header>
      <div className={bodyClassName ?? 'p-4'}>{children}</div>
    </motion.section>
  );
}
