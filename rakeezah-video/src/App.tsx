import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { PersistentAnchors } from './components/PersistentAnchors';

// Import all scenes
import { Scene1_Intro } from './scenes/Scene1_Intro';
import { Scene2_Problem } from './scenes/Scene2_Problem';
import { Scene3_Solution } from './scenes/Scene3_Solution';
import { Scene4_HowItWorks } from './scenes/Scene4_HowItWorks';
import { Scene5_Alignment } from './scenes/Scene5_Alignment';
import { Scene6_CTA } from './scenes/Scene6_CTA';

function App() {
  const {
    currentScene,
    currentSceneName,
    progress,
    totalProgress,
    isPlaying,
    play,
    pause,
    restart
  } = useVideoPlayer();

  // Scene components mapping
  const scenes = [
    Scene1_Intro,
    Scene2_Problem,
    Scene3_Solution,
    Scene4_HowItWorks,
    Scene5_Alignment,
    Scene6_CTA,
  ];

  const CurrentSceneComponent = scenes[currentScene];

  return (
    <div className="w-full h-screen bg-dark overflow-hidden relative">
      {/* Main video container - 16:9 aspect ratio */}
      <div className="aspect-video w-full h-full relative">
        {/* Persistent elements that morph across scenes */}
        <PersistentAnchors
          currentScene={currentSceneName}
          progress={progress}
        />

        {/* Scene transitions with AnimatePresence */}
        <AnimatePresence mode="popLayout">
          <CurrentSceneComponent key={currentScene} />
        </AnimatePresence>

        {/* Debug controls (only in development) */}
        {import.meta.env.DEV && (
          <DebugControls
            currentScene={currentScene}
            totalScenes={scenes.length}
            isPlaying={isPlaying}
            totalProgress={totalProgress}
            onPlay={play}
            onPause={pause}
            onRestart={restart}
          />
        )}
      </div>

      {/* Recording instructions overlay (appears on first load) */}
      <RecordingInstructions />
    </div>
  );
}

// Debug controls for development
interface DebugControlsProps {
  currentScene: number;
  totalScenes: number;
  isPlaying: boolean;
  totalProgress: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
}

const DebugControls = ({
  currentScene,
  totalScenes,
  isPlaying,
  totalProgress,
  onPlay,
  onPause,
  onRestart
}: DebugControlsProps) => {
  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg font-mono text-sm backdrop-blur-sm">
      <div className="space-y-2">
        <div>Scene: {currentScene + 1}/{totalScenes}</div>
        <div>Progress: {Math.round(totalProgress)}%</div>
        <div className="flex space-x-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={onRestart}
            className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            ⏹️
          </button>
          <button
            onClick={() => window.nextScene?.()}
            className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            ⏭️
          </button>
          <button
            onClick={() => window.prevScene?.()}
            className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            ⏮️
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-40 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold-light transition-all duration-100"
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      <div className="mt-2 text-xs opacity-70">
        Press Space: Play/Pause | R: Restart
      </div>
    </div>
  );
};

// Recording instructions for users
const RecordingInstructions = () => {
  return (
    <div className="fixed bottom-4 left-4 z-40 bg-black/80 text-white p-3 rounded-lg font-cairo text-sm backdrop-blur-sm max-w-sm">
      <div className="space-y-1">
        <div className="font-bold text-gold-light">🎬 Recording Instructions</div>
        <div>• Video auto-plays and loops seamlessly</div>
        <div>• Use screen recording software (QuickTime, OBS)</div>
        <div>• Record at 1920x1080 for best quality</div>
        <div>• Total duration: ~30 seconds</div>
        <div className="text-xs opacity-70 mt-2">
          Console: window.startRecording() | window.stopRecording()
        </div>
      </div>
    </div>
  );
};

// Keyboard controls
document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      // Toggle play/pause
      if (window.startRecording && window.stopRecording) {
        // This will be implemented by the useVideoPlayer hook
      }
      break;
    case 'KeyR':
      e.preventDefault();
      window.startRecording?.();
      break;
    case 'ArrowRight':
      e.preventDefault();
      window.nextScene?.();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      window.prevScene?.();
      break;
  }
});

export default App;