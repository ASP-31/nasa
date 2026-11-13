import { useEffect, useRef, useState } from 'react';
import type { GamePage as PageId } from './types/game';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { LandingPage } from './pages/LandingPage';
import { BriefingPage } from './pages/BriefingPage';
import { GamePage } from './pages/GamePage';
import { MissionReport } from './components/mission/MissionReport';

export default function App() {
  const game = useGameState();
  const audio = useAudio();
  const [page, setPage] = useState<PageId>('landing');
  const audioRef = useRef(audio);
  audioRef.current = audio;

  // Sound cues for page transitions.
  useEffect(() => {
    if (page === 'game') audioRef.current.play('advance');
    else audioRef.current.play('click');
  }, [page]);

  const state = game.state;
  const saveActive = Boolean(state && state.status === 'playing');

  const goLanding = () => setPage('landing');

  const startOrResume = () => {
    if (saveActive) {
      setPage('game');
      return;
    }
    setPage('briefing');
  };

  const deploy = () => {
    audio.play('success');
    game.startMission();
    setPage('game');
  };

  const playAgain = () => {
    audio.play('success');
    game.startMission();
    setPage('game');
  };

  return (
    <>
      {page === 'landing' ? (
        <LandingPage hasSave={saveActive} onStart={startOrResume} onBriefing={() => setPage('briefing')} />
      ) : null}

      {page === 'briefing' ? (
        <BriefingPage onDeploy={deploy} onBack={goLanding} />
      ) : null}

      {page === 'game' && state ? (
        <GamePage
          game={game}
          audio={audio}
          onQuit={goLanding}
          onOpenReport={() => setPage('results')}
        />
      ) : null}

      {page === 'results' && state ? (
        <MissionReport state={state} onPlayAgain={playAgain} />
      ) : null}

      {/* Fallback: requested page needs a mission that no longer exists. */}
      {(page === 'game' || page === 'results') && !state ? (
        <div className="grid min-h-screen place-items-center bg-deep p-6 text-center">
          <div>
            <p className="mb-4 text-sm text-mist">No mission found on this device.</p>
            <button type="button" onClick={() => setPage('landing')} className="btn-primary">
              Return to Mission Control
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
