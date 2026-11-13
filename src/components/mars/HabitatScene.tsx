import { motion } from 'framer-motion';
import type { WeatherState } from '../../types/game';
import { WEATHER_META } from '../../data/gameConfig';

interface HabitatSceneProps {
  weather: WeatherState;
  habitatIntegrity: number;
  temperature: number;
}

const WEATHER_TINT: Record<WeatherState['condition'], string> = {
  clear: '#FFD166',
  dusty: '#53636D',
  moderate_storm: '#53636D',
  severe_storm: '#53636D',
  solar_storm: '#E5484D',
};

/** Compact habitat cross-section for the dashboard environment panel. */
export function HabitatScene({ weather, habitatIntegrity, temperature }: HabitatSceneProps) {
  const tint = WEATHER_TINT[weather.condition];
  const dusty = weather.condition === 'dusty' || weather.condition === 'moderate_storm' || weather.condition === 'severe_storm';
  const stormy = weather.condition === 'severe_storm' || weather.condition === 'moderate_storm';
  const windowGlow = habitatIntegrity > 60 ? 0.9 : 0.35;

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-md border border-haze/30 bg-gradient-to-b from-[#14202b] via-[#1a2731] to-[#101820]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 180" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        {/* Sky */}
        <circle cx="330" cy="34" r="30" fill="#FFD166" opacity={dusty ? 0.08 : 0.25} />
        <circle cx="330" cy="34" r="9" fill="#FFD166" opacity={dusty ? 0.15 : 0.8} />
        {/* Ridge */}
        <path d="M0 128 L60 112 L130 126 L210 108 L290 124 L360 114 L400 122 L400 180 L0 180 Z" fill="#182630" />
        <path d="M0 148 L70 138 L150 150 L240 136 L330 150 L400 142 L400 180 L0 180 Z" fill="#131c24" />
        {/* Habitat dome */}
        <g transform="translate(96 78)">
          <path d="M0 62 A34 34 0 0 1 68 62 Z" fill="#22313d" stroke="#53636D" strokeWidth="1.2" />
          <rect x="70" y="46" width="44" height="16" rx="3" fill="#1c2a35" stroke="#53636D" strokeOpacity="0.6" />
          <rect x="116" y="50" width="26" height="12" rx="2" fill="#22313d" stroke="#53636D" strokeOpacity="0.4" />
          <line x1="34" y1="28" x2="34" y2="8" stroke="#53636D" strokeWidth="1.6" />
          <circle cx="34" cy="6" r="3" fill={tint} className="animate-pulse-solar" />
          <rect x="20" y="46" width="10" height="8" rx="1.5" fill="#FFD166" opacity={windowGlow} />
          <rect x="38" y="46" width="10" height="8" rx="1.5" fill="#FFD166" opacity={windowGlow * 0.8} />
          <rect x="80" y="50" width="8" height="7" rx="1.5" fill="#FFD166" opacity={windowGlow * 0.6} />
          {/* Solar panel farm */}
          <g transform="translate(158 40)">
            <rect x="0" y="0" width="52" height="14" rx="2" fill="#1e2d3a" stroke="#53636D" strokeOpacity="0.6" />
            <line x1="10" y1="0" x2="10" y2="14" stroke="#344955" strokeWidth="1" />
            <line x1="20" y1="0" x2="20" y2="14" stroke="#344955" strokeWidth="1" />
            <line x1="30" y1="0" x2="30" y2="14" stroke="#344955" strokeWidth="1" />
            <line x1="40" y1="0" x2="40" y2="14" stroke="#344955" strokeWidth="1" />
            <rect x="24" y="14" width="4" height="10" fill="#53636D" />
          </g>
        </g>
        {/* Ground line */}
        <line x1="0" y1="140" x2="400" y2="140" stroke="#344955" strokeOpacity="0.4" strokeWidth="1" />
      </svg>

      {/* Weather particle overlays */}
      {stormy ? (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          {Array.from({ length: 14 }).map((_, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full bg-mist/30"
              style={{
                width: 2 + (index % 3),
                height: 2 + (index % 3),
                top: `${8 + ((index * 23) % 80)}%`,
                left: `${(index * 31) % 96}%`,
              }}
              animate={{ x: [0, 90], opacity: [0, 0.8, 0] }}
              transition={{ duration: 3 + (index % 4), repeat: Infinity, delay: index * 0.3, ease: 'linear' }}
            />
          ))}
        </motion.div>
      ) : null}
      {weather.condition === 'solar_storm' ? (
        <motion.div
          className="absolute inset-0 bg-alert/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
      ) : null}
      {dusty ? <div className="absolute inset-0 bg-slate/20 backdrop-blur-[1px]" /> : null}

      {/* Condition readout */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px]">
        <span className="font-semibold uppercase tracking-wider" style={{ color: tint }}>
          {WEATHER_META[weather.condition].label}
        </span>
        <span className="text-mist">
          {Math.round(temperature)}°C habitat · {Math.round(temperature - 84)}°C external
        </span>
      </div>
    </div>
  );
}
