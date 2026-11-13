import type { AdvisorMessage, GameState } from '../types/game';
import { CRITICAL_THRESHOLDS, TOTAL_SOL } from '../data/gameConfig';

// ─────────────────────────────────────────────────────────────
// Mission advisor.
// Default: a rule-based advisor that reads the live game state.
// Optional: if a key is configured at build time via env vars,
// an LLM answers in natural language. The game never depends
// on it, and no key is ever committed or hard-coded.
// ─────────────────────────────────────────────────────────────

const LLM_API_KEY = import.meta.env.VITE_MARS_ADVISOR_API_KEY as string | undefined;
const LLM_BASE_URL = (import.meta.env.VITE_MARS_ADVISOR_BASE_URL as string | undefined) ?? 'https://api.openai.com/v1';
const LLM_MODEL = (import.meta.env.VITE_MARS_ADVISOR_MODEL as string | undefined) ?? 'gpt-4o-mini';

function stateSummary(state: GameState): string {
  const r = state.resources;
  return [
    `sol ${state.sol}/${TOTAL_SOL}`,
    `energy ${Math.round(r.energy.value)}/${r.energy.max} kWh`,
    `water ${Math.round(r.water.value)}L`,
    `oxygen ${Math.round(r.oxygen.value)}L`,
    `food ${Math.round(r.food.value)}kg`,
    `radiation shield ${Math.round(r.radiationProtection.value)}%`,
    `crew health ${Math.round(r.crewHealth.value)}%`,
    `habitat integrity ${Math.round(state.habitat.integrity)}%`,
    `weather ${state.weather.condition.replace('_', ' ')}`,
    `samples ${state.objectives.samplesCollected}/5`,
    `experiments ${state.objectives.experimentsCompleted}/3`,
    state.activeEvent ? `active event: ${state.activeEvent.def.title}` : 'no active event',
  ].join('; ');
}

interface Rule {
  priority: string;
  test: (state: GameState) => boolean;
  message: (state: GameState) => string;
}

const RULES: Rule[] = [
  {
    priority: 'SOLAR STORM SHELTER',
    test: (s) => s.weather.condition === 'solar_storm' || s.activeEvent?.def.id === 'solar_storm',
    message: () =>
      'A solar particle event is in progress. Get everyone behind the regolith shield and pause external operations until the wave passes — radiation exposure compounds fast.',
  },
  {
    priority: 'OXYGEN CRITICAL',
    test: (s) => s.resources.oxygen.value <= CRITICAL_THRESHOLDS.oxygen,
    message: (s) =>
      `Oxygen is at ${Math.round(s.resources.oxygen.value)}L. Suspend all nonessential power draw, put the crew on rest rotation, and repair the oxygen generation system before advancing another sol.`,
  },
  {
    priority: 'POWER CRITICAL',
    test: (s) => s.resources.energy.value <= CRITICAL_THRESHOLDS.energy,
    message: () =>
      'The battery bank is nearly empty. Shut down nonessential equipment, assign Morgan to repairs, and conserve everything for oxygen circulation and water recycling.',
  },
  {
    priority: 'WATER CRITICAL',
    test: (s) => s.resources.water.value <= CRITICAL_THRESHOLDS.water,
    message: () =>
      'Potable water is below the safety line. Repair the water recycler first — recycling recovers far more than rationing ever saves.',
  },
  {
    priority: 'FOOD CRITICAL',
    test: (s) => s.resources.food.value <= CRITICAL_THRESHOLDS.food,
    message: () =>
      'Food stores are critical. Push the greenhouse to maximum yield or cut rations — hunger degrades crew health within two sols.',
  },
  {
    priority: 'HABITAT INTEGRITY',
    test: (s) => s.habitat.integrity < CRITICAL_THRESHOLDS.habitat,
    message: (s) =>
      `Habitat integrity is ${Math.round(s.habitat.integrity)}%, below the 60% mission floor. Assign Morgan to maintenance and repair degraded systems before it cascades.`,
  },
  {
    priority: 'ACTIVE EMERGENCY',
    test: (s) => s.activeEvent !== null,
    message: (s) => {
      const def = s.activeEvent?.def;
      if (!def) return 'An event is in progress.';
      return `${def.title} is active. Read every option before responding — this one has lasting consequences either way.`;
    },
  },
  {
    priority: 'CREW HEALTH',
    test: (s) => s.resources.crewHealth.value <= CRITICAL_THRESHOLDS.crewHealth,
    message: () =>
      'Crew health is trending down. Rotate everyone to sleep, put Chen on medical duty, and hold off fieldwork until the crew stabilizes.',
  },
  {
    priority: 'SYSTEMS DEGRADED',
    test: (s) => s.subsystems.some((sub) => sub.status !== 'nominal'),
    message: (s) => {
      const worst = [...s.subsystems].filter((sub) => sub.status !== 'nominal').sort((a, b) => a.condition - b.condition)[0];
      return `The ${worst?.name.toLowerCase() ?? 'subsystem'} is degraded (${Math.round(worst?.condition ?? 0)}%). A repair now is cheap; a failure mid-storm is not.`;
    },
  },
  {
    priority: 'SCIENCE BEHIND SCHEDULE',
    test: (s) =>
      s.sol >= TOTAL_SOL / 3 &&
      (s.objectives.samplesCollected < 2 || s.objectives.experimentsCompleted < 1),
    message: (s) =>
      `Science is behind schedule at sol ${s.sol}. Assign Williams to the field or the lab — the mission is judged on return, not just survival.`,
  },
  {
    priority: 'STOCKPILE ENERGY',
    test: (s) => s.resources.energy.value > 110,
    message: () =>
      'Battery reserves are high. This is the window for fieldwork, sample collection, or starting the next experiment before dust season deepens.',
  },
];

export function ruleBasedAdvice(state: GameState): AdvisorMessage {
  const rule = RULES.find((r) => r.test(state));
  if (rule) {
    return {
      id: `rule-${state.sol}-${rule.priority}`,
      source: 'rule',
      priority: rule.priority,
      message: rule.message(state),
    };
  }
  return {
    id: `rule-${state.sol}-nominal`,
    source: 'rule',
    priority: 'ALL SYSTEMS NOMINAL',
    message:
      'Life support is stable and no threats are active. Use the quiet sols: run experiments, collect samples, and keep the battery topped up for the next storm.',
  };
}

/** Optional LLM advisor. Only active when a key is configured via env. */
export async function llmAdvice(state: GameState): Promise<AdvisorMessage | null> {
  if (!LLM_API_KEY) return null;
  try {
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: 160,
        temperature: 0.6,
        messages: [
          {
            role: 'system',
            content:
              'You are the AI mission advisor for ARES-01, a Mars surface outpost simulation. Answer the commander in 2-3 short, concrete sentences focused on the highest-priority action. Be calm and specific. Simplified game mechanics, not real engineering.',
          },
          {
            role: 'user',
            content: `Mission state: ${stateSummary(state)}. Commander asks for your recommendation.`,
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    return {
      id: `llm-${state.sol}-${Date.now()}`,
      source: 'llm',
      priority: 'MISSION ADVISOR',
      message: content,
    };
  } catch {
    return null;
  }
}
