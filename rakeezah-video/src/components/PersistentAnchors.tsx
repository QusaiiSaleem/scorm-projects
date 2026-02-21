import { motion } from 'framer-motion';
import { SCENE_ANCHORS, SceneName } from '../hooks/useVideoPlayer';
import logoSvg from '../assets/logo.svg';

interface PersistentAnchorsProps {
  currentScene: SceneName;
  progress: number;
}

export const PersistentAnchors = ({ currentScene, progress }: PersistentAnchorsProps) => {
  const anchor = SCENE_ANCHORS[currentScene];

  return (
    <>
      {/* Logo anchor that morphs across scenes */}
      <motion.div
        className="fixed top-8 right-8 z-50 gpu-optimized"
        animate={{
          x: anchor.x,
          y: anchor.y,
          scale: anchor.scale,
          opacity: anchor.opacity,
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{
          willChange: 'transform, opacity'
        }}
      >
        <motion.div
          className="w-16 h-16 text-gold-light"
          animate={{
            rotateZ: currentScene === 'intro' ? 0 : 5,
            color: getLogoColor(currentScene)
          }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={logoSvg}
            alt="Rakeezah Logo"
            className="w-full h-full object-contain"
            style={{ filter: `brightness(${getLogoBrightness(currentScene)})` }}
          />
        </motion.div>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        className="fixed bottom-8 left-8 z-50 gpu-optimized"
        initial={{ opacity: 0 }}
        animate={{ opacity: currentScene === 'intro' ? 0 : 0.6 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center space-y-2">
          {/* Scene dots */}
          <div className="flex space-x-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                animate={{
                  backgroundColor: i <= getCurrentSceneIndex(currentScene)
                    ? '#F59E0B'
                    : 'rgba(255,255,255,0.3)',
                  scale: i === getCurrentSceneIndex(currentScene) ? 1.2 : 1
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold-light rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Floating accent shapes that persist across scenes */}
      <FloatingAccents currentScene={currentScene} />
    </>
  );
};

// Floating shapes in midground layer
const FloatingAccents = ({ currentScene }: { currentScene: SceneName }) => {
  const getAccentColor = (scene: SceneName) => {
    switch (scene) {
      case 'intro':
      case 'cta':
        return 'rgba(245, 158, 11, 0.1)'; // Gold
      case 'problem':
        return 'rgba(239, 68, 68, 0.1)'; // Red
      case 'solution':
        return 'rgba(155, 139, 124, 0.1)'; // Wood
      case 'howItWorks':
        return 'rgba(255, 255, 255, 0.05)'; // White
      case 'alignment':
        return 'rgba(34, 197, 94, 0.1)'; // Green
      default:
        return 'rgba(245, 158, 11, 0.1)';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Large floating shape */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl gpu-optimized"
        animate={{
          backgroundColor: getAccentColor(currentScene),
          x: [-20, 20, -20],
          y: [-10, 10, -10],
          scale: [1, 1.1, 1],
        }}
        transition={{
          backgroundColor: { duration: 0.8 },
          x: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ willChange: 'transform, background-color' }}
      />

      {/* Medium floating shape */}
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full blur-2xl gpu-optimized"
        animate={{
          backgroundColor: getAccentColor(currentScene),
          x: [10, -15, 10],
          y: [15, -10, 15],
          scale: [1, 0.9, 1],
        }}
        transition={{
          backgroundColor: { duration: 0.8 },
          x: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ willChange: 'transform, background-color' }}
      />

      {/* Small floating shape */}
      <motion.div
        className="absolute top-2/3 left-1/4 w-20 h-20 rounded-full blur-xl gpu-optimized"
        animate={{
          backgroundColor: getAccentColor(currentScene),
          x: [-10, 25, -10],
          y: [-20, 5, -20],
          scale: [1, 1.2, 1],
        }}
        transition={{
          backgroundColor: { duration: 0.8 },
          x: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ willChange: 'transform, background-color' }}
      />
    </div>
  );
};

// Helper functions
const getLogoColor = (scene: SceneName): string => {
  switch (scene) {
    case 'intro':
    case 'cta':
      return '#F59E0B'; // Gold
    case 'problem':
      return '#EF4444'; // Red tint
    case 'solution':
      return '#9D8B7C'; // Wood
    case 'howItWorks':
      return '#FFFFFF'; // White
    case 'alignment':
      return '#22C55E'; // Green
    default:
      return '#F59E0B';
  }
};

const getLogoBrightness = (scene: SceneName): number => {
  switch (scene) {
    case 'intro':
    case 'cta':
      return 1.2;
    case 'problem':
      return 1.1;
    case 'solution':
      return 1.0;
    case 'howItWorks':
      return 1.3;
    case 'alignment':
      return 1.1;
    default:
      return 1.0;
  }
};

const getCurrentSceneIndex = (scene: SceneName): number => {
  switch (scene) {
    case 'intro': return 0;
    case 'problem': return 1;
    case 'solution': return 2;
    case 'howItWorks': return 3;
    case 'alignment': return 4;
    case 'cta': return 5;
    default: return 0;
  }
};