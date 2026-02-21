import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles';

/**
 * Bottom progress bar that shows video playback position.
 * Sits at the very bottom of the frame, growing from right to left (RTL).
 *
 * Props:
 * - totalFrames: Total frames in the entire video (for progress calculation)
 * - currentSceneStart: Frame offset where this scene begins in the video
 */
interface ProgressBarProps {
  totalFrames: number;
  currentSceneStart: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  totalFrames,
  currentSceneStart,
}) => {
  const frame = useCurrentFrame();

  // Calculate progress as percentage of total video
  const globalFrame = currentSceneStart + frame;
  const progress = (globalFrame / totalFrames) * 100;

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 6,
      backgroundColor: theme.colors.lightGray,
      zIndex: 50,
    }}>
      {/* Filled portion - grows from right for RTL */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: `${progress}%`,
        background: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.secondary})`,
        borderRadius: '3px 0 0 3px',
        transition: 'width 0.1s ease',
      }} />
    </div>
  );
};
