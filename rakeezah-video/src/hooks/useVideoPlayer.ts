import { useState, useEffect } from 'react';

// Scene durations in milliseconds (total ~30s)
export const SCENE_DURATIONS = [
  5000, // Scene 1: الافتتاحية (Logo intro)
  5000, // Scene 2: المشكلة (Problem statement)
  5000, // Scene 3: الحل (Solution)
  6000, // Scene 4: كيف يعمل (How it works)
  5000, // Scene 5: التوافق (Vision 2030 alignment)
  4000, // Scene 6: الختام (Call to action)
];

export const SCENE_NAMES = [
  'intro',
  'problem',
  'solution',
  'howItWorks',
  'alignment',
  'cta',
] as const;

export type SceneName = typeof SCENE_NAMES[number];

// Anchor positions for logo morphing across scenes
export const SCENE_ANCHORS = {
  intro: { x: 0, y: 0, scale: 1, opacity: 1 },
  problem: { x: -800, y: -400, scale: 0.3, opacity: 0.8 },
  solution: { x: -800, y: -400, scale: 0.3, opacity: 0.8 },
  howItWorks: { x: -800, y: -400, scale: 0.3, opacity: 0.8 },
  alignment: { x: -800, y: -400, scale: 0.3, opacity: 0.8 },
  cta: { x: 0, y: 0, scale: 0.8, opacity: 1 },
};

export function useVideoPlayer() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const totalScenes = SCENE_DURATIONS.length;
  const currentSceneName = SCENE_NAMES[currentScene];
  const currentSceneDuration = SCENE_DURATIONS[currentScene];

  // Auto-advance to next scene
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % totalScenes);
      setProgress(0);
    }, currentSceneDuration);

    return () => clearTimeout(timer);
  }, [currentScene, isPlaying, currentSceneDuration, totalScenes]);

  // Track progress within current scene
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (currentSceneDuration / 100);
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentScene, isPlaying, currentSceneDuration]);

  // Recording API for external control
  useEffect(() => {
    // Expose controls to window for recording tools
    window.startRecording = () => {
      setIsPlaying(true);
      setCurrentScene(0);
      setProgress(0);
    };

    window.stopRecording = () => setIsPlaying(false);

    window.nextScene = () => {
      if (currentScene < totalScenes - 1) {
        setCurrentScene(prev => prev + 1);
        setProgress(0);
      }
    };

    window.prevScene = () => {
      if (currentScene > 0) {
        setCurrentScene(prev => prev - 1);
        setProgress(0);
      }
    };

    return () => {
      delete window.startRecording;
      delete window.stopRecording;
      delete window.nextScene;
      delete window.prevScene;
    };
  }, [currentScene, totalScenes]);

  // Manual scene control
  const goToScene = (sceneIndex: number) => {
    if (sceneIndex >= 0 && sceneIndex < totalScenes) {
      setCurrentScene(sceneIndex);
      setProgress(0);
    }
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const restart = () => {
    setCurrentScene(0);
    setProgress(0);
    setIsPlaying(true);
  };

  // Calculate total progress
  const totalProgress = ((currentScene * 100) + progress) / totalScenes;

  return {
    currentScene,
    currentSceneName,
    currentSceneDuration,
    progress,
    totalProgress,
    totalScenes,
    isPlaying,
    play,
    pause,
    restart,
    goToScene,
  };
}

// Global type augmentation for recording API
declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
    nextScene?: () => void;
    prevScene?: () => void;
  }
}