import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, PlayCircle, FileText, X, ChevronRight, Link2, Clock3, Users, MapPin } from 'lucide-react';
import { MarsBackdrop } from '../components/mars/MarsBackdrop';
import { MISSION, TOTAL_SOL } from '../data/gameConfig';
import { NASA_REFERENCES } from '../data/missions';

interface LandingPageProps {
  hasSave: boolean;
  onStart: () => void;
  onBriefing: () => void;
}

const HOW_TO_STEPS = [
  {
    title: 'Assign the crew',
    text: 'Each sol, choose what every astronaut does — rest, field science, lab work, maintenance or repairs. Assignments are the engine of the outpost.',
  },
  {
    title: 'Manage six resources',
    text: 'Energy, water, oxygen, food, radiation protection and crew health all drain every sol. Solar output depends on the weather, so watch the forecast.',
  },
  {
    title: 'Respond to events',
    text: 'Dust storms, leaks and malfunctions demand a decision before the simulation can advance. Every choice changes the state — there are no fake options.',
  },
  {
    title: 'Close out the science',
    text: 'Surviving is not enough. Collect five geological samples and complete three experiments across 30 sols to earn the top rating.',
  },
];

export function LandingPage({ hasSave, onStart, onBriefing }: LandingPageProps) {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MarsBackdrop />

      {/* Nav */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-solar/50 bg-solar/10">
            <Rocket className="h-5 w-5 text-solar" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold uppercase tracking-[0.22em] text-ink">Mission Control</div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-mist">Mars Outpost</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={() => setShowHowTo(true)} className="btn-ghost text-xs">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            How to Play
          </button>
          <button type="button" onClick={onBriefing} className="btn-ghost text-xs">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Mission Briefing
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-16 pt-14 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-solar">
            NASA Space Apps Challenge 2026
          </p>
          <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-[0.04em] text-ink sm:text-7xl">
            Mission Control
          </h1>
          <p className="mt-3 font-display text-base font-medium uppercase tracking-[0.34em] text-mist sm:text-lg">
            Mars Outpost Survival Simulation
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
            Humanity’s next frontier is waiting. Lead your crew, manage your resources, and survive the unforgiving
            Martian environment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-10 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
        >
          <button type="button" onClick={onStart} className="btn-primary h-12 flex-1 text-base shadow-solar">
            <Rocket className="h-5 w-5" aria-hidden="true" />
            {hasSave ? 'Resume Mission' : 'Start Mission'}
          </button>
          <button type="button" onClick={() => setShowHowTo(true)} className="btn-secondary h-12 flex-1">
            How to Play
          </button>
          <button type="button" onClick={onBriefing} className="btn-secondary h-12 flex-1">
            Mission Briefing
          </button>
        </motion.div>

        {hasSave ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-xs text-solar">
            A mission in progress was found on this device — continuing will resume it.
          </motion.p>
        ) : null}

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="panel mt-14 grid w-full max-w-3xl grid-cols-2 divide-haze/30 p-1 sm:grid-cols-4 sm:divide-x"
        >
          <HeroStat icon={Clock3} value={`${TOTAL_SOL}`} label="Sols to survive" />
          <HeroStat icon={Users} value={`${MISSION.crewSize}`} label="Astronauts alive" />
          <HeroStat icon={MapPin} value="Jezero" label="Landing crater" />
          <HeroStat icon={FileText} value="13" label="Dynamic events" />
        </motion.div>

        {/* References */}
        <footer className="mt-16 w-full max-w-3xl border-t border-haze/30 pt-6 text-left">
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-mist">
            <Link2 className="h-3.5 w-3.5 text-solar" aria-hidden="true" /> Scientific References
          </h2>
          <ul className="grid gap-2 sm:grid-cols-3">
            {NASA_REFERENCES.map((reference) => (
              <li key={reference.url}>
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-md border border-haze/40 bg-elevated/60 px-3 py-2.5 text-xs text-mist transition-colors hover:border-solar/60 hover:text-ink"
                >
                  <span className="font-semibold">{reference.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-haze group-hover:text-solar" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-haze">
            ARES-01 is a fictional mission. Game mechanics are simplified for playability and are not an engineering
            model. Environmental figures referenced in-game are drawn from published NASA Mars fact sheets.
          </p>
        </footer>
      </main>

      {/* How to play modal */}
      <AnimatePresence>
        {showHowTo ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-deep/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHowTo(false)}
            role="dialog"
            aria-modal="true"
            aria-label="How to play"
          >
            <motion.div
              className="panel w-full max-w-lg p-6"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="panel-title">How to Play</h2>
                <button
                  type="button"
                  onClick={() => setShowHowTo(false)}
                  className="btn-ghost h-8 w-8 px-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="space-y-3">
                {HOW_TO_STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-solar/50 bg-solar/10 font-display text-sm font-bold text-solar">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-display text-sm font-semibold text-ink">{step.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-mist">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <button type="button" onClick={() => { setShowHowTo(false); onBriefing(); }} className="btn-primary mt-5 w-full">
                Continue to Briefing
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function HeroStat({ icon: Icon, value, label }: { icon: typeof Clock3; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-4">
      <Icon className="mb-1.5 h-4 w-4 text-solar" aria-hidden="true" />
      <span className="font-display text-2xl font-bold text-ink">{value}</span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-mist">{label}</span>
    </div>
  );
}
