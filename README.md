# Mission Control: Mars Outpost

A browser-based Mars colony survival simulation built for the **NASA Space Apps Challenge 2026**.

You are the commander of **ARES-01**, a four-person research outpost at **Jezero Crater**. Keep your crew alive for **30 Martian sols** while managing six life-support resources, maintaining the habitat, responding to unpredictable events, and closing out the mission's scientific objectives.

> **Play it:** `npm install && npm run dev` → open the printed local URL.

---

## Gameplay

- **Assign the crew** — each sol, every astronaut is assigned an activity: rest, mission coordination, medical duty, system maintenance, repair, field science, or lab work. Specializations matter: the Medical Officer heals, the Engineer repairs, the Geologist collects samples and runs experiments, the Commander sustains morale.
- **Manage six resources** — energy (kWh), water (L), oxygen (L), food (kg), radiation protection and crew health, plus **habitat integrity** tracked separately. Stored quantities are shown with real units; safety indicators are percentages.
- **Respond to events** — 13 dynamic events (dust storms, solar particle events, oxygen leaks, greenhouse failures, crew illness, power malfunctions, discoveries…). Every event pauses the simulation until you choose a response, and **every choice mutates the simulation state** — resources, subsystem conditions, crew health and long-term outcomes.
- **Complete the science** — collect **5 geological samples** and finish **3 experiments**. Survival alone earns a lesser rating.
- **Weather matters** — clear skies, dust, moderate and severe storms, and solar particle events change solar output, external temperature and radiation every sol.
- **Milestones with teeth** — sol 5 (systems verified), sol 10 (dust storm season begins), sol 15 (mid-mission audit), sol 20 (22-minute Earth signal delay), sol 25 (final phase).
- **Endings** — win by surviving all 30 sols with the crew alive; lose when a crew member dies or the habitat is destroyed. Failures always state the reason. Final ratings: `MISSION FAILURE` → `BARELY SURVIVED` → `SUCCESSFUL COMMANDER` → `OUTSTANDING COMMANDER`, with a full mission report, score breakdown, telemetry chart and shareable results.

### AI Mission Advisor

The advisor ships with a **rule-based analyst** that reads the live game state (resources, crew health, active threats, subsystem conditions, objective pace) and answers in mission language — the game is fully playable offline with no API key.

Optionally, set environment variables before `npm run dev` / `npm run build` to have an LLM answer instead (OpenAI-compatible endpoint):

```
VITE_MARS_ADVISOR_API_KEY=...      # required to enable the LLM path
VITE_MARS_ADVISOR_BASE_URL=...     # optional, defaults to https://api.openai.com/v1
VITE_MARS_ADVISOR_MODEL=...        # optional, defaults to gpt-4o-mini
```

Keys are read **only** from environment variables at build time, are never committed, and the rule-based advisor is always the fallback.

---

## Tech stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** — three-colour design system:
  - Deep Space `#101820` (app background)
  - Slate Blue `#344955` (panels, surfaces)
  - Solar Yellow `#FFD166` (primary CTAs, selection, interactive controls)
- **Framer Motion** — event modals, screen transitions, animated values and bars
- **Recharts** — mission telemetry chart
- **Lucide React** — icons
- **LocalStorage** — autosave, resume, reset (corrupted saves are discarded gracefully)
- Procedural **Web Audio** sound effects with a mute control (no audio assets)

All Mars imagery is rendered as layered SVG — no external image assets, so the game works fully offline.

## Architecture

```
src/
  components/
    common/      # panels, bars, chips, animated numbers, icon registry
    dashboard/   # header, environment, resources, crew, objectives,
                 # research, telemetry, advisor, log, action bar
    events/      # blocking event modal
    mars/        # SVG Mars backdrop + habitat scene
    mission/     # end overlay + full mission report
  pages/         # LandingPage, BriefingPage, GamePage, ResultsPage
  engine/        # simulation, resourceManager, eventManager,
                 # missionManager, scoring, advisor (UI-free)
  data/          # gameConfig (all balance numbers), crew, events, missions
  hooks/         # useGameState, useLocalStorage, useAudio
  types/         # game.ts — the full domain model
  utils/         # calculations (clamps, weighted random, etc.)
```

Game logic is completely separated from the UI: `engine/` and `data/` never import React. All balance numbers live in `src/data/gameConfig.ts`.

## Development scripts

```bash
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

Headless checks (used during development, not shipped):

```bash
npx esbuild scripts/balance-check.ts --bundle --platform=node --outfile=scripts/.balance.cjs && node scripts/.balance.cjs
npx esbuild scripts/render-check.tsx --bundle --platform=node --jsx=automatic "--define:import.meta.env={}" --outfile=scripts/.render.cjs && node scripts/.render.cjs
```

- `balance-check` simulates full 30-sol missions under good / random / reckless / neglect policies and reports win rates, samples, experiments, habitat integrity and minimum battery level.
- `render-check` SSR-renders every screen (including active-event and lost-mission states) to catch runtime crashes, and verifies the save/load round-trip.

## Scientific grounding

Game mechanics are deliberately simplified and are **not** an engineering model. Environmental figures referenced in-game (gravity, sol length, temperature range, atmospheric composition, radiation dose, signal delay) are drawn from published NASA sources:

- [NASA Mars Exploration](https://science.nasa.gov/mars/)
- [NASA Mars Facts](https://science.nasa.gov/mars/facts/)
- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)

Links are displayed in-game on the landing page and in the mission report.

---

ARES-01 and its crew are fictional. Built with public information from NASA for the Space Apps Challenge — see you at Jezero Crater.
