import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { theme, commonStyles } from '../styles';

/**
 * Animated card component that pops in with a scale effect.
 * Used for feature cards, stat boxes, info panels, etc.
 *
 * Props:
 * - children: Card content
 * - delay: Frame delay before animation (default 0)
 * - bgColor: Card background color
 * - borderColor: Left/right border accent color
 * - width: Card width (default '100%')
 * - icon: Optional emoji/icon to display at top
 */
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  bgColor?: string;
  borderColor?: string;
  width?: string | number;
  icon?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  bgColor = theme.colors.white,
  borderColor = theme.colors.accent,
  width = '100%',
  icon,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - delay;

  // Scale pop animation: grow from 0 -> 1.04 -> 1.0
  const scale = interpolate(adjustedFrame, [0, 12, 18], [0, 1.04, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade in
  const opacity = interpolate(adjustedFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      ...commonStyles.rtlText,
      opacity,
      transform: `scale(${scale})`,
      backgroundColor: bgColor,
      borderRadius: 16,
      padding: '28px 32px',
      width,
      // Right border for RTL accent
      borderRight: `5px solid ${borderColor}`,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    }}>
      {/* Optional icon */}
      {icon && (
        <div style={{
          fontSize: 36,
          marginBottom: 10,
        }}>
          {icon}
        </div>
      )}
      {children}
    </div>
  );
};
