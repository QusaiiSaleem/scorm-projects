import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

/**
 * Fade transition overlay.
 * Place this inside a Sequence to create a fade-in at the start of a scene.
 *
 * Props:
 * - type: 'in' (fade from black to transparent) or 'out' (transparent to black)
 * - duration: How many frames the fade lasts (default 20)
 */
interface FadeTransitionProps {
  type?: 'in' | 'out';
  duration?: number;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  type = 'in',
  duration = 20,
}) => {
  const frame = useCurrentFrame();

  // Fade in: starts opaque (1), goes to transparent (0)
  // Fade out: starts transparent (0), goes to opaque (1)
  const opacity = type === 'in'
    ? interpolate(frame, [0, duration], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : interpolate(frame, [0, duration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return (
    <AbsoluteFill style={{
      backgroundColor: 'black',
      opacity,
      // Ensure the fade overlay is on top of scene content
      zIndex: 100,
    }} />
  );
};
