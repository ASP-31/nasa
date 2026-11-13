import type { GameState, MissionRating, MissionScore } from '../types/game';
import { CRITICAL_THRESHOLDS, TOTAL_SOL } from '../data/gameConfig';
import { clamp } from '../utils/calculations';

// ─────────────────────────────────────────────────────────────
// Scoring — mission report numbers and final rating.
// ─────────────────────────────────────────────────────────────

export function computeScore(state: GameState): MissionScore {
  const survival = clamp((state.sol / TOTAL_SOL) * 40, 0, 40);
  const samples = (state.objectives.samplesCollected / 5) * 20;
  const experiments = (state.objectives.experimentsCompleted / 3) * 20;
  const habitat = clamp((state.habitat.integrity / 100) * 10, 0, 10);
  const crewScore = clamp((state.resources.crewHealth.value / 100) * 10, 0, 10);
  const total = Math.round(survival + samples + experiments + habitat + crewScore);

  return {
    total: clamp(total, 0, 100),
    survival: Math.round(survival),
    samples: Math.round(samples),
    experiments: Math.round(experiments),
    habitat: Math.round(habitat),
    crew: Math.round(crewScore),
    // crewAlive kept implicit in crew health
  } as MissionScore;
}

export function computeRating(state: GameState, score: MissionScore): MissionRating {
  if (state.status === 'lost' || state.outcome === 'mission_failure') {
    return {
      label: 'MISSION FAILURE',
      tone: 'critical',
      description:
        'The outpost could not sustain the crew. Every failure teaches the next mission something — review the report and redeploy.',
    };
  }

  const allObjectives =
    state.objectives.samplesCollected >= 5 &&
    state.objectives.experimentsCompleted >= 3 &&
    state.habitat.integrity > CRITICAL_THRESHOLDS.habitat &&
    state.sol >= TOTAL_SOL;

  if (allObjectives && score.total >= 85) {
    return {
      label: 'OUTSTANDING COMMANDER',
      tone: 'success',
      description:
        'Every primary objective met. Jezero Crater now holds a functioning research outpost and a complete scientific record.',
    };
  }
  if (score.total >= 60) {
    return {
      label: 'SUCCESSFUL COMMANDER',
      tone: 'success',
      description:
        'The crew comes home alive with a solid scientific record. Most objectives met — mission control is satisfied.',
    };
  }
  return {
    label: 'BARELY SURVIVED',
    tone: 'warning',
    description:
      'The crew survived, but the scientific return was thin and the outpost is worn. Survival alone is not the mission.',
  };
}
