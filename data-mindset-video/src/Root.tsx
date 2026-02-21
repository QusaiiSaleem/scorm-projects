import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';

/**
 * Root component that registers all Remotion compositions.
 *
 * The DataMindsetVideo composition is the main (and only) output.
 * - 1920x1080 Full HD resolution
 * - 30 FPS frame rate
 * - 4260 total frames = ~2 minutes 22 seconds
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DataMindsetVideo"
        component={Video}
        durationInFrames={4260}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
