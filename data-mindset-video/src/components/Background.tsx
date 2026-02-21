import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles';

/**
 * Animated background component with gradient and floating shapes.
 *
 * Props:
 * - variant: 'light' (default light gray) or 'dark' (navy/dark)
 * - showShapes: whether to render decorative floating circles (default true)
 */
interface BackgroundProps {
  variant?: 'light' | 'dark';
  showShapes?: boolean;
}

export const Background: React.FC<BackgroundProps> = ({
  variant = 'light',
  showShapes = true,
}) => {
  const frame = useCurrentFrame();

  // Choose gradient based on variant
  const gradient = variant === 'dark'
    ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.darkBg} 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.lightBlue} 50%, ${theme.colors.white} 100%)`;

  return (
    <AbsoluteFill>
      {/* Main gradient background */}
      <div style={{
        width: '100%',
        height: '100%',
        background: gradient,
      }} />

      {/* Decorative floating shapes for visual interest */}
      {showShapes && (
        <>
          {/* Large circle - slow drift */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: variant === 'dark'
              ? 'rgba(43, 108, 176, 0.15)'
              : 'rgba(43, 108, 176, 0.08)',
            transform: `translateY(${Math.sin(frame / 60) * 15}px)`,
          }} />
          {/* Medium circle - medium drift */}
          <div style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: variant === 'dark'
              ? 'rgba(237, 137, 54, 0.15)'
              : 'rgba(237, 137, 54, 0.1)',
            transform: `translateY(${Math.cos(frame / 50) * 12}px)`,
          }} />
          {/* Small circle - fast drift */}
          <div style={{
            position: 'absolute',
            top: '40%',
            right: '30%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: variant === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(26, 54, 93, 0.05)',
            transform: `translateX(${Math.sin(frame / 40) * 10}px)`,
          }} />
        </>
      )}
    </AbsoluteFill>
  );
};
