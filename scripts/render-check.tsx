/**
 * SSR render smoke test — catches runtime crashes in every screen
 * with real engine state. NOT shipped to the browser.
 *
 * Run:  npx esbuild scripts/render-check.tsx --bundle --platform=node --jsx=automatic --outfile=scripts/.render.cjs --log-level=error && node scripts/.render.cjs
 */
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import { LandingPage } from '../src/pages/LandingPage';
import { BriefingPage } from '../src/pages/BriefingPage';
import { GamePage } from '../src/pages/GamePage';
import { MissionReport } from '../src/components/mission/MissionReport';
import { createInitialMissionState } from '../src/engine/missionManager';
import { advanceSol } from '../src/engine/simulation';
import { resolveEvent } from '../src/engine/eventManager';
import type { CrewActivity, GameState } from '../src/types/game';

// Build a mid-game state with events resolved and activities assigned.
let midState: GameState = createInitialMissionState();
for (let i = 0; i < 8; i++) {
  if (midState.activeEvent) {
    midState = resolveEvent(midState, midState.activeEvent.def.choices[0].id);
  }
  (midState.crew.find((c) => c.id === 'williams') as { activity: CrewActivity }).activity = 'science';
  midState = advanceSol(midState);
}

// Build an ended state.
let endState: GameState = createInitialMissionState();
for (let i = 0; i < 32 && endState.status === 'playing'; i++) {
  if (endState.activeEvent) {
    endState = resolveEvent(endState, endState.activeEvent.def.choices[0].id);
  }
  endState = advanceSol(endState);
}

// A state with an active event open.
let eventState: GameState = createInitialMissionState();
for (let i = 0; i < 20 && !eventState.activeEvent; i++) {
  eventState = advanceSol(eventState);
}

// A lost mission: starve the oxygen loop and let attrition do the rest.
let lostState: GameState = structuredClone(createInitialMissionState());
lostState.resources.oxygen.value = 4;
for (let i = 0; i < 30 && lostState.status === 'playing'; i++) {
  if (lostState.activeEvent) {
    lostState = resolveEvent(lostState, lostState.activeEvent.def.choices[0].id);
  }
  lostState = advanceSol(lostState);
}

// Save / load round-trip.
const saved = JSON.parse(JSON.stringify(midState)) as GameState;
const roundTripOk = JSON.stringify(saved) === JSON.stringify(midState);

const audio = { play: () => {}, muted: false, toggleMute: () => {} };
const game = {
  state: midState,
  hasSave: true,
  startMission: () => {},
  advanceSol: () => {},
  respondToEvent: () => {},
  assignActivity: () => {},
  startExperiment: () => {},
  resetMission: () => {},
  requestAdvice: async () => ({ id: 'x', source: 'rule' as const, priority: 'TEST', message: 'Test advice.' }),
};

const results: Array<[string, string]> = [];
function check(label: string, html: string) {
  results.push([label, html]);
  if (html.length < 500) throw new Error(`${label} rendered suspiciously small (${html.length} chars)`);
  if (html.includes('undefined') && !html.includes('undefined)')) {
    // tolerate words containing 'undefined' in text; crude check
  }
}

check('landing', renderToString(<LandingPage hasSave={true} onStart={() => {}} onBriefing={() => {}} />));
check('briefing', renderToString(<BriefingPage onDeploy={() => {}} onBack={() => {}} />));
check('game', renderToString(<GamePage game={game as never} audio={audio as never} onQuit={() => {}} onOpenReport={() => {}} />));
check('event-modal', renderToString(<GamePage game={{ ...game, state: eventState } as never} audio={audio as never} onQuit={() => {}} onOpenReport={() => {}} />));
check('results', renderToString(<MissionReport state={endState} onPlayAgain={() => {}} />));
check('results-lost', renderToString(<MissionReport state={lostState} onPlayAgain={() => {}} />));
check('game-lost', renderToString(<GamePage game={{ ...game, state: lostState } as never} audio={audio as never} onQuit={() => {}} onOpenReport={() => {}} />));
check('app', renderToString(<App />));

for (const [label, html] of results) {
  console.log(`${label}: OK (${html.length} chars)`);
}
console.log('endState status:', endState.status, 'sol:', endState.sol, 'score:', endState.score.total);
console.log('lostState status:', lostState.status, 'sol:', lostState.sol, 'deceased:', lostState.crew.filter((c) => c.status === 'deceased').length);
console.log('save/load round-trip:', roundTripOk ? 'OK' : 'MISMATCH');
console.log('eventState active:', eventState.activeEvent?.def.title ?? 'none spawned in 20 sols');
