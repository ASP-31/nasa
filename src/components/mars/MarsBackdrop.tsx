// Deterministic star field so renders are stable between mounts.
const STARS = [
  { x: 60, y: 40, r: 1.1, o: 0.9 }, { x: 140, y: 90, r: 0.8, o: 0.6 }, { x: 210, y: 30, r: 1.3, o: 0.8 },
  { x: 300, y: 70, r: 0.7, o: 0.5 }, { x: 380, y: 25, r: 1.0, o: 0.7 }, { x: 470, y: 55, r: 0.9, o: 0.65 },
  { x: 545, y: 18, r: 1.2, o: 0.85 }, { x: 640, y: 80, r: 0.7, o: 0.45 }, { x: 720, y: 40, r: 1.0, o: 0.7 },
  { x: 810, y: 22, r: 0.8, o: 0.55 }, { x: 880, y: 66, r: 1.1, o: 0.75 }, { x: 950, y: 30, r: 0.7, o: 0.5 },
  { x: 1040, y: 58, r: 0.9, o: 0.6 }, { x: 1120, y: 16, r: 1.2, o: 0.8 }, { x: 1210, y: 72, r: 0.7, o: 0.45 },
  { x: 1290, y: 34, r: 1.0, o: 0.7 }, { x: 1360, y: 84, r: 0.8, o: 0.5 }, { x: 1420, y: 20, r: 1.1, o: 0.8 },
  { x: 100, y: 140, r: 0.6, o: 0.35 }, { x: 260, y: 120, r: 0.8, o: 0.4 }, { x: 520, y: 130, r: 0.6, o: 0.35 },
  { x: 780, y: 118, r: 0.9, o: 0.45 }, { x: 1010, y: 128, r: 0.7, o: 0.4 }, { x: 1240, y: 122, r: 0.8, o: 0.42 },
];

interface MarsBackdropProps {
  storm?: boolean;
  className?: string;
}

/**
 * Cinematic Mars landscape rendered as layered SVG — no external
 * image assets, so it works offline and stays on-palette.
 */
export function MarsBackdrop({ storm = false, className }: MarsBackdropProps) {
  const hazeOpacity = storm ? 0.5 : 0.16;
  return (
    <div className={`absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 1440 810" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1118" />
            <stop offset="62%" stopColor="#14202b" />
            <stop offset="100%" stopColor="#27333d" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFD166" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFD166" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b3a46" />
            <stop offset="100%" stopColor="#1a2731" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d2a34" />
            <stop offset="45%" stopColor="#16212a" />
            <stop offset="100%" stopColor="#101820" />
          </linearGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.42" r="0.75">
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="1440" height="810" fill="url(#sky)" />

        {/* Stars */}
        {STARS.map((star, index) => (
          <circle
            key={index}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="#F1F4F6"
            opacity={star.o}
            className={index % 3 === 0 ? 'animate-twinkle' : undefined}
            style={index % 3 === 0 ? { animationDelay: `${index * 0.35}s` } : undefined}
          />
        ))}

        {/* Sun low over the horizon */}
        <g opacity={storm ? 0.25 : 0.9}>
          <circle cx="1150" cy="216" r="120" fill="url(#sunGlow)" />
          <circle cx="1150" cy="216" r="20" fill="#FFD166" opacity="0.95" />
        </g>

        {/* Distant mesa range */}
        <path
          d="M0 470 L90 430 L170 452 L260 405 L360 448 L470 412 L560 446 L680 418 L800 452 L940 430 L1080 458 L1200 436 L1320 460 L1440 440 L1440 560 L0 560 Z"
          fill="#1b2933"
          opacity="0.85"
        />
        {/* Mid ridge with warm rim light */}
        <path
          d="M0 520 L120 488 L240 516 L390 478 L540 512 L700 484 L860 516 L1030 492 L1190 520 L1330 500 L1440 522 L1440 640 L0 640 Z"
          fill="url(#ridge)"
        />
        <path
          d="M0 520 L120 488 L240 516 L390 478 L540 512 L700 484 L860 516 L1030 492 L1190 520 L1330 500 L1440 522"
          fill="none"
          stroke="#FFD166"
          strokeOpacity={storm ? 0.06 : 0.18}
          strokeWidth="1.5"
        />

        {/* Habitat outpost */}
        <g transform="translate(150 470)">
          <ellipse cx="70" cy="118" rx="150" ry="16" fill="#0d141b" opacity="0.6" />
          {/* Main dome */}
          <path d="M20 118 A52 52 0 0 1 124 118 Z" fill="#22313d" />
          <path d="M20 118 A52 52 0 0 1 124 118" fill="none" stroke="#53636D" strokeWidth="1.5" />
          {/* Airlock modules */}
          <rect x="128" y="92" width="66" height="26" rx="4" fill="#1c2a35" stroke="#53636D" strokeOpacity="0.7" />
          <rect x="198" y="98" width="40" height="20" rx="3" fill="#22313d" stroke="#53636D" strokeOpacity="0.5" />
          {/* Greenhouse */}
          <path d="M244 118 A26 26 0 0 1 296 118 Z" fill="#1e3a2f" opacity="0.9" />
          {/* Antenna */}
          <line x1="72" y1="66" x2="72" y2="30" stroke="#53636D" strokeWidth="2" />
          <circle cx="72" cy="28" r="4" fill="#FFD166" className="animate-pulse-solar" />
          {/* Lit windows */}
          <rect x="52" y="96" width="14" height="10" rx="2" fill="#FFD166" opacity="0.85" />
          <rect x="84" y="96" width="14" height="10" rx="2" fill="#FFD166" opacity="0.7" />
          <rect x="140" y="100" width="10" height="8" rx="2" fill="#FFD166" opacity="0.6" />
          <rect x="256" y="104" width="8" height="7" rx="2" fill="#FFD166" opacity="0.5" />
        </g>

        {/* Foreground ground */}
        <path d="M0 588 L200 566 L420 592 L660 574 L900 596 L1140 578 L1440 598 L1440 810 L0 810 Z" fill="url(#ground)" />
        {/* Regolith texture strokes */}
        {[
          { x: 240, y: 650, l: 60 }, { x: 520, y: 668, l: 90 }, { x: 830, y: 640, l: 70 },
          { x: 1080, y: 672, l: 55 }, { x: 1300, y: 648, l: 80 }, { x: 400, y: 700, l: 65 },
          { x: 700, y: 712, l: 95 }, { x: 980, y: 724, l: 60 },
        ].map((mark, index) => (
          <line
            key={index}
            x1={mark.x}
            y1={mark.y}
            x2={mark.x + mark.l}
            y2={mark.y + 4}
            stroke="#344955"
            strokeWidth="2"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
        ))}

        {/* Drifting dust haze */}
        <g opacity={hazeOpacity}>
          <rect x="-200" y="470" width="900" height="120" fill="#53636D" opacity="0.22" className="animate-drift-dust" style={{ animationDuration: '26s' }} />
          <rect x="500" y="500" width="900" height="90" fill="#53636D" opacity="0.18" className="animate-drift-dust" style={{ animationDuration: '34s', animationDelay: '-12s' }} />
        </g>

        <rect width="1440" height="810" fill="url(#vignette)" />
      </svg>
    </div>
  );
}
