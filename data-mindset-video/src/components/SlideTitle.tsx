import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { theme, commonStyles } from '../styles';

/**
 * Reusable slide title component.
 * Animates in from the right (RTL) with a fade and an accent underline.
 *
 * Props:
 * - text: The Arabic title text
 * - delay: Frame delay before animation starts (default 0)
 * - color: Override text color
 * - showAccent: Show orange underline accent (default true)
 */
interface SlideTitleProps {
  text: string;
  delay?: number;
  color?: string;
  showAccent?: boolean;
}

export const SlideTitle: React.FC<SlideTitleProps> = ({
  text,
  delay = 0,
  color = theme.colors.primary,
  showAccent = true,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - delay;

  // Title slides in from the right and fades in
  const opacity = interpolate(adjustedFrame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateX = interpolate(adjustedFrame, [0, 25], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Accent line width grows after title appears
  const lineWidth = interpolate(adjustedFrame, [15, 40], [0, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  return (
    <div style={{
      ...commonStyles.rtlText,
      opacity,
      transform: `translateX(${translateX}px)`,
      marginBottom: 30,
    }}>
      {/* Title text */}
      <h1 style={{
        fontSize: 52,
        fontWeight: 800,
        color,
        margin: 0,
        lineHeight: 1.3,
      }}>
        {text}
      </h1>

      {/* Orange accent underline */}
      {showAccent && (
        <div style={{
          width: lineWidth,
          height: 5,
          backgroundColor: theme.colors.accent,
          borderRadius: 3,
          marginTop: 12,
          marginRight: 0,  // Aligns right (RTL)
        }} />
      )}
    </div>
  );
};
