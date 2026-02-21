import { Composition } from "remotion";
import { RakeezahVideo } from "./Video";

// Scene durations in milliseconds (from useVideoPlayer.ts)
// At 30fps: 1000ms = 30 frames
const SCENE_DURATIONS_MS = [5000, 5000, 5000, 6000, 5000, 4000];
const FPS = 30;

// Total duration in frames
const totalFrames = SCENE_DURATIONS_MS.reduce(
  (sum, ms) => sum + Math.round((ms / 1000) * FPS),
  0
);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RakeezahVideo"
      component={RakeezahVideo}
      durationInFrames={totalFrames} // ~900 frames = 30 seconds
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
