import { motion } from 'framer-motion';
import {
  Rocket,
  ArrowLeft,
  Target,
  Users,
  Clock3,
  MapPin,
  Globe2,
  CheckCircle2,
  Thermometer,
  Scale,
  Cloud,
} from 'lucide-react';
import { MarsBackdrop } from '../components/mars/MarsBackdrop';
import { MISSION, TOTAL_SOL } from '../data/gameConfig';
import { CREW } from '../data/crew';
import { MISSION_FACTS, PRIMARY_OBJECTIVES } from '../data/missions';

interface BriefingPageProps {
  onDeploy: () => void;
  onBack: () => void;
}

const MISSION_PARAMS = [
  { icon: Rocket, label: 'Mission Name', value: MISSION.name },
  { icon: Globe2, label: 'Destination', value: MISSION.destination },
  { icon: MapPin, label: 'Landing Location', value: MISSION.landingSite },
  { icon: Clock3, label: 'Mission Duration', value: `${TOTAL_SOL} sols` },
  { icon: Users, label: 'Crew Size', value: `${MISSION.crewSize} astronauts` },
  { icon: Target, label: 'Mission Class', value: 'Surface research outpost' },
];

export function BriefingPage({ onDeploy, onBack }: BriefingPageProps) {
  return (
    <div className="relative min-h-screen">
      <MarsBackdrop className="opacity-60" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <button type="button" onClick={onBack} className="btn-ghost mb-6 text-xs">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-solar">Mission Briefing</p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-[0.04em] text-ink sm:text-5xl">
            ARES-01 · Jezero Crater
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mist sm:text-base">
            “Establish and maintain a functioning research outpost on Mars while conducting scientific exploration and
            ensuring crew survival.” You are the commander. Every resource decision, repair and event response over the
            next {TOTAL_SOL} sols is yours to make.
          </p>
        </motion.header>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {/* Parameters */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="panel p-5"
          >
            <h2 className="panel-title mb-4">Mission Parameters</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {MISSION_PARAMS.map((param) => (
                <div key={param.label} className="rounded-md border border-haze/30 bg-deep/60 p-3">
                  <dt className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-mist">
                    <param.icon className="h-3.5 w-3.5 text-solar" aria-hidden="true" />
                    {param.label}
                  </dt>
                  <dd className="font-display text-sm font-semibold text-ink">{param.value}</dd>
                </div>
              ))}
            </dl>
          </motion.section>

          {/* Objectives */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="panel p-5"
          >
            <h2 className="panel-title mb-4">Primary Objectives</h2>
            <ol className="space-y-3">
              {PRIMARY_OBJECTIVES.map((objective, index) => (
                <li key={objective.id} className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-solar/50 bg-solar/10 font-display text-xs font-bold text-solar">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-ink">{objective.label}</div>
                    <div className="text-[11px] uppercase tracking-wider text-haze">Target: {objective.target}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-start gap-2 rounded-md border border-solar/30 bg-solar/5 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-solar" aria-hidden="true" />
              <p className="text-[11px] leading-snug text-mist">
                Meeting all five objectives earns the <span className="text-solar">Outstanding Commander</span> rating.
                The crew can survive without full science — but that is not the mission.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Crew */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel mt-4 p-5"
        >
          <h2 className="panel-title mb-4">Crew Manifest · ARES-01</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CREW.map((member) => (
              <div key={member.id} className="rounded-md border border-haze/30 bg-deep/60 p-3">
                <div className="font-display text-sm font-semibold text-ink">{member.name}</div>
                <div className="text-[11px] uppercase tracking-wider text-solar">{member.role}</div>
                <p className="mt-2 text-[11px] leading-snug text-mist">{member.specialization}</p>
                <div className="mt-2 border-t border-haze/30 pt-2 text-[10px] leading-snug text-haze">
                  <span className="font-semibold text-solar">{member.ability}:</span> {member.abilityDescription}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Science grounding */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="panel mt-4 p-5"
        >
          <h2 className="panel-title mb-1">Operating Environment (NASA Fact Sheet)</h2>
          <p className="mb-4 text-[11px] text-haze">
            Real measurements your simplified game mechanics are loosely inspired by — this simulation is a game, not an
            engineering model.
          </p>
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {MISSION_FACTS.map((fact) => (
              <li key={fact.label} className="rounded-md border border-haze/30 bg-deep/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-mist">{fact.label}</span>
                  {fact.label === 'Average temperature' ? (
                    <Thermometer className="h-3.5 w-3.5 text-solar" aria-hidden="true" />
                  ) : fact.label === 'Atmosphere' ? (
                    <Cloud className="h-3.5 w-3.5 text-solar" aria-hidden="true" />
                  ) : (
                    <Scale className="h-3.5 w-3.5 text-solar" aria-hidden="true" />
                  )}
                </div>
                <div className="font-display text-sm font-semibold text-ink">{fact.value}</div>
                <div className="mt-1 text-[11px] leading-snug text-haze">{fact.real}</div>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Deploy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <button type="button" onClick={onDeploy} className="btn-primary h-14 w-full max-w-md text-base tracking-[0.14em] shadow-solar">
            <Rocket className="h-5 w-5" aria-hidden="true" />
            Deploy Mission
          </button>
          <p className="text-[11px] text-mist">
            Progress saves automatically to this device. You can pause and resume at any sol.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
