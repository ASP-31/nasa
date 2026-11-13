import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CrewActivity, GameState } from '../types/game';
import { advanceSol as engineAdvanceSol } from '../engine/simulation';
import { resolveEvent } from '../engine/eventManager';
import { createInitialMissionState, startExperiment as engineStartExperiment } from '../engine/missionManager';
import { llmAdvice, ruleBasedAdvice } from '../engine/advisor';
import type { AdvisorMessage } from '../types/game';
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from './useLocalStorage';

// ─────────────────────────────────────────────────────────────
// Central game-state hook. Owns the mission state, autosave,
// and every player action exposed to the UI.
// ─────────────────────────────────────────────────────────────

const SAVE_KEY = 'mission-control-mars-save-v1';

function isValidGameState(candidate: unknown): candidate is GameState {
  if (!candidate || typeof candidate !== 'object') return false;
  const state = candidate as GameState;
  return (
    typeof state.sol === 'number' &&
    typeof state.status === 'string' &&
    Array.isArray(state.crew) &&
    state.crew.length === 4 &&
    Boolean(state.resources) &&
    typeof state.resources.energy?.value === 'number'
  );
}

export function readSave(): GameState | null {
  const saved = readLocalStorage<GameState>(SAVE_KEY);
  if (saved && isValidGameState(saved)) return saved;
  if (saved) removeLocalStorage(SAVE_KEY); // corrupted → discard gracefully
  return null;
}

export function useGameState() {
  const [state, setState] = useState<GameState | null>(() => readSave());

  // Autosave on every state change.
  useEffect(() => {
    if (state) writeLocalStorage(SAVE_KEY, state);
  }, [state]);

  const startMission = useCallback(() => {
    setState(createInitialMissionState());
  }, []);

  const advanceSol = useCallback(() => {
    setState((current) => (current && current.status === 'playing' ? engineAdvanceSol(current) : current));
  }, []);

  const respondToEvent = useCallback((choiceId: string) => {
    setState((current) => (current ? resolveEvent(current, choiceId) : current));
  }, []);

  const assignActivity = useCallback((crewId: string, activity: CrewActivity) => {
    setState((current) => {
      if (!current) return current;
      const member = current.crew.find((c) => c.id === crewId);
      if (!member || member.status === 'deceased') return current;
      const next = structuredClone(current);
      const target = next.crew.find((c) => c.id === crewId);
      if (target) target.activity = activity;
      return next;
    });
  }, []);

  const startExperiment = useCallback((experimentId: string) => {
    setState((current) => {
      if (!current) return current;
      const result = engineStartExperiment(current, experimentId);
      return result.state;
    });
  }, []);

  const resetMission = useCallback(() => {
    removeLocalStorage(SAVE_KEY);
    setState(null);
  }, []);

  const requestAdvice = useCallback(async (): Promise<AdvisorMessage> => {
    if (!state) return ruleBasedAdvice(createInitialMissionState());
    const llm = await llmAdvice(state);
    return llm ?? ruleBasedAdvice(state);
  }, [state]);

  const hasSave = useMemo(() => state !== null, [state]);

  return {
    state,
    hasSave,
    startMission,
    advanceSol,
    respondToEvent,
    assignActivity,
    startExperiment,
    resetMission,
    requestAdvice,
  };
}

export type UseGameState = ReturnType<typeof useGameState>;
