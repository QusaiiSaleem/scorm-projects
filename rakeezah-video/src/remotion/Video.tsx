import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

// Import the CSS — CRITICAL for all Tailwind + custom styles
import "../index.css";

// Import all existing scenes — UNCHANGED
import { Scene1_Intro } from "../scenes/Scene1_Intro";
import { Scene2_Problem } from "../scenes/Scene2_Problem";
import { Scene3_Solution } from "../scenes/Scene3_Solution";
import { Scene4_HowItWorks } from "../scenes/Scene4_HowItWorks";
import { Scene5_Alignment } from "../scenes/Scene5_Alignment";
import { Scene6_CTA } from "../scenes/Scene6_CTA";

// Import existing persistent anchors — UNCHANGED
import { PersistentAnchors } from "../components/PersistentAnchors";
import { SCENE_NAMES } from "../hooks/useVideoPlayer";

// Scene durations in frames at 30fps
// Same durations as useVideoPlayer.ts: [5s, 5s, 5s, 6s, 5s, 4s]
const SCENE_DURATIONS_FRAMES = [150, 150, 150, 180, 150, 120];

// How many frames for the cross-fade between scenes (~0.4s)
const TRANSITION_FRAMES = 12;

// All scene components in order
const SCENES = [
  Scene1_Intro,
  Scene2_Problem,
  Scene3_Solution,
  Scene4_HowItWorks,
  Scene5_Alignment,
  Scene6_CTA,
];

// Pre-calculate where each scene starts (in frames)
const SCENE_STARTS: number[] = [];
let accumulator = 0;
for (const dur of SCENE_DURATIONS_FRAMES) {
  SCENE_STARTS.push(accumulator);
  accumulator += dur;
}

export const RakeezahVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Determine which scene we're in based on current frame
  let currentScene = 0;
  let frameInScene = 0;

  for (let i = 0; i < SCENE_DURATIONS_FRAMES.length; i++) {
    const start = SCENE_STARTS[i];
    const end = start + SCENE_DURATIONS_FRAMES[i];
    if (frame >= start && frame < end) {
      currentScene = i;
      frameInScene = frame - start;
      break;
    }
  }

  // Calculate progress within current scene (0-100) for PersistentAnchors
  const progress =
    (frameInScene / SCENE_DURATIONS_FRAMES[currentScene]) * 100;

  // Get current scene name for PersistentAnchors
  const currentSceneName = SCENE_NAMES[currentScene];

  // The current scene component to render
  const CurrentScene = SCENES[currentScene];

  // Cross-fade transition:
  // - Fade IN at the start of each scene (except Scene 1 — it starts fully visible)
  // - Fade OUT at the end of each scene (except last scene)
  const sceneDuration = SCENE_DURATIONS_FRAMES[currentScene];

  let sceneOpacity = 1;

  // Fade in (skip for first scene — we want it to start immediately)
  if (currentScene > 0 && frameInScene < TRANSITION_FRAMES) {
    sceneOpacity = interpolate(
      frameInScene,
      [0, TRANSITION_FRAMES],
      [0, 1],
      { extrapolateRight: "clamp" }
    );
  }

  // Fade out (skip for last scene)
  if (
    currentScene < SCENES.length - 1 &&
    frameInScene > sceneDuration - TRANSITION_FRAMES
  ) {
    sceneOpacity = interpolate(
      frameInScene,
      [sceneDuration - TRANSITION_FRAMES, sceneDuration],
      [1, 0],
      { extrapolateLeft: "clamp" }
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F172A",
        fontFamily: "'Cairo', sans-serif",
        direction: "rtl",
        overflow: "hidden",
      }}
    >
      {/* Persistent cross-scene elements — existing component, UNCHANGED */}
      <PersistentAnchors
        currentScene={currentSceneName}
        progress={progress}
      />

      {/*
        NO AnimatePresence — it doesn't work in Remotion's frame-by-frame rendering.
        Instead: swap scenes directly based on frame number.
        The key={currentScene} makes React unmount old scene and mount new one,
        which triggers each scene's Framer Motion initial→animate animations.
        Cross-fade opacity is handled by Remotion's interpolate() above.
      */}
      <div style={{ opacity: sceneOpacity }}>
        <CurrentScene key={currentScene} />
      </div>
    </AbsoluteFill>
  );
};
