import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  RotateCcw,
  BarChart3,
  Share2,
  Users,
  Home,
  FlaskConical,
  MapPin,
  Zap,
  Droplets,
  Wind,
  Utensils,
  AlertTriangle,
  Check,
  Link2,
} from 'lucide-react';
import type { GameState } from '../../types/game';
import { computeRating } from '../../engine/scoring';
import { MISSION, TOTAL_SOL, CRITICAL_THRESHOLDS } from '../../data/gameConfig';
import { NASA_REFERENCES } from '../../data/missions';
import { MarsBackdrop } from '../mars/MarsBackdrop';
import { SectionCard } from '../common/SectionCard';
import { TelemetryPanel } from '../dashboard/TelemetryPanel';

interface MissionReportProps {
  state: GameState;
  onPlayAgain: () => void;
}

export function MissionReport({ state, onPlayAgain }: MissionReportProps) {
  const rating = computeRating(state, state.score);
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);
  const won = state.status === 'won';

  const crewAlive = state.crew.filter((c) => c.status !== 'deceased').length;
  const stats = useMemo(
    () => [
      { icon: Trophy, label: 'Final Score', value: `${state.score.total} / 100`, critical: false },
      { icon: Users, label: 'Crew Survived', value: `${crewAlive} / 4`, critical: crewAlive < 4 },
      { icon: Home, label: 'Habitat Integrity', value: `${Math.round(state.habitat.integrity)}%`, critical: state.habitat.integrity < CRITICAL_THRESHOLDS.habitat },
      { icon: MapPin, label: 'Samples Collected', value: `${state.objectives.samplesCollected} / 5`, critical: state.objectives.samplesCollected < 5 },
      { icon: FlaskConical, label: 'Experiments', value: `${state.objectives.experimentsCompleted} / 3`, critical: state.objectives.experimentsCompleted < 3 },
      { icon: Zap, label: 'Energy Remaining', value: `${Math.round(state.resources.energy.value)} kWh`, critical: false },
      { icon: Droplets, label: 'Water Remaining', value: `${Math.round(state.resources.water.value)} L`, critical: false },
      { icon: Wind, label: 'Oxygen Remaining', value: `${Math.round(state.resources.oxygen.value)} L`, critical: false },
      { icon: Utensils, label: 'Food Remaining', value: `${Math.round(state.resources.food.value)} kg`, critical: false },
      { icon: AlertTriangle, label: 'Major Incidents', value: `${state.incidents.length}`, critical: state.incidents.length > 8 },
    ],
    [state, crewAlive],
  );

  const scoreBars = [
    { label: 'Survival', value: state.score.survival, max: 40 },
    { label: 'Samples', value: state.score.samples, max: 20 },
    { label: 'Experiments', value: state.score.experiments, max: 20 },
    { label: 'Habitat', value: state.score.habitat, max: 10 },
    { label: 'Crew Health', value: state.score.crew, max: 10 },
  ];

  const shareText = [
    `MISSION CONTROL: MARS OUTPOST — ${rating.label}`,
    `Sols survived: ${Math.min(state.sol, TOTAL_SOL)}/${TOTAL_SOL} · Crew: ${crewAlive}/4 · Habitat: ${Math.round(state.habitat.integrity)}%`,
    `Samples: ${state.objectives.samplesCollected}/5 · Experiments: ${state.objectives.experimentsCompleted}/3 · Score: ${state.score.total}/100`,
    `Rating: ${rating.label} — ARES-01, Jezero Crater`,
  ].join('\n');

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mission Control: Mars Outpost', text: shareText });
        setCopied(true);
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
      }
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // User dismissed the share dialog — ignore.
    }
  };

  return (
    <div className="relative min-h-screen">
      <MarsBackdrop storm={!won} className="opacity-40" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-mist">
            {MISSION.name} · {MISSION.landingSite} · Final Report
          </p>
          <h1
            className={`font-display text-4xl font-bold uppercase tracking-[0.06em] sm:text-5xl ${won ? 'text-solar' : 'text-alert'}`}
          >
            {rating.label}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist">{rating.description}</p>
          <p className="mt-2 text-xs text-haze">
            Survived {Math.min(state.sol, TOTAL_SOL)} of {TOTAL_SOL} sols · {state.incidents.length} incidents resolved
          </p>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="panel mx-auto mt-8 max-w-xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="panel-title">Mission Score</span>
            <span className={`font-display text-3xl font-bold ${state.score.total >= 60 ? 'text-solar' : 'text-ink'}`}>
              {state.score.total}
              <span className="text-sm text-mist"> / 100</span>
            </span>
          </div>
          <div className="space-y-2.5">
            {scoreBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="uppercase tracking-wider text-mist">{bar.label}</span>
                  <span className="text-ink">
                    {bar.value} / {bar.max}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate/60">
                  <motion.div
                    className="h-full rounded-full bg-solar"
                    initial={{ width: 0 }}
                    animate={{ width: `${(bar.value / bar.max) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.04 }}
              className="panel p-4"
            >
              <stat.icon className={`mb-2 h-4 w-4 ${stat.critical ? 'text-alert' : 'text-solar'}`} aria-hidden="true" />
              <div className="font-display text-lg font-semibold text-ink">{stat.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-mist">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Crew status + incidents */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Crew Status" icon={Users}>
            <ul className="space-y-2">
              {state.crew.map((member) => (
                <li key={member.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {member.name}
                    <span className="ml-2 text-[11px] text-mist">{member.role}</span>
                  </span>
                  <span className={member.status === 'deceased' ? 'text-alert' : 'text-solar'}>
                    {member.status === 'deceased' ? 'Lost' : `${Math.round(member.health)}%`}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Major Incidents" icon={AlertTriangle}>
            {state.incidents.length === 0 ? (
              <p className="text-sm text-mist">No major incidents. A remarkably quiet mission.</p>
            ) : (
              <ul className="max-h-44 space-y-1.5 overflow-y-auto text-sm">
                {state.incidents.map((incident, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="shrink-0 font-display text-[11px] font-semibold text-solar">
                      SOL {String(incident.sol).padStart(2, '0')}
                    </span>
                    <span className="text-mist">
                      {incident.title} — {incident.resolution.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Optional statistics */}
        {showStats ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <TelemetryPanel state={state} />
            <SectionCard title="Collected Samples" icon={MapPin} className="mt-4">
              {state.samples.length === 0 ? (
                <p className="text-sm text-mist">No geological samples were collected.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {state.samples.map((sample) => (
                    <li key={sample.id} className="rounded-md border border-haze/30 bg-deep/60 p-3 text-sm">
                      <div className="font-display font-semibold text-ink">{sample.label}</div>
                      <div className="text-[11px] text-mist">
                        SOL {sample.sol} · {sample.location}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </motion.div>
        ) : null}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onPlayAgain} className="btn-primary">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Play Again
          </button>
          <button type="button" onClick={() => setShowStats((v) => !v)} className="btn-secondary">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            {showStats ? 'Hide' : 'View'} Mission Statistics
          </button>
          <button type="button" onClick={share} className="btn-secondary">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
            {copied ? 'Results Copied' : 'Share Results'}
          </button>
        </div>

        {/* Scientific references */}
        <footer className="mt-12 border-t border-haze/30 pt-6">
          <h2 className="panel-title mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-solar" aria-hidden="true" /> Scientific References
          </h2>
          <ul className="grid gap-2 sm:grid-cols-3">
            {NASA_REFERENCES.map((reference) => (
              <li key={reference.url} className="panel p-3">
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display text-sm font-semibold text-solar hover:underline"
                >
                  {reference.name}
                </a>
                <p className="mt-1 text-[11px] leading-snug text-mist">{reference.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-haze">
            Game mechanics (energy budgets, recycling rates and event outcomes) are simplified for playability and are
            not an engineering model. Environmental figures above are drawn from published NASA Mars fact sheets.
          </p>
        </footer>
      </div>
    </div>
  );
}
