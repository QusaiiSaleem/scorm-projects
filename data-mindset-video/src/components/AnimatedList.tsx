import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { theme, commonStyles } from '../styles';

/**
 * Animated bullet list that reveals items one by one.
 * Items slide in from the right (RTL) with a stagger delay.
 *
 * Props:
 * - items: Array of text strings for each bullet
 * - delay: Frame delay before the list starts animating (default 0)
 * - stagger: Frame gap between each item animation (default 12)
 * - numbered: Whether to show numbers instead of bullets (default false)
 * - fontSize: Text size (default 32)
 * - color: Text color (default theme text color)
 */
interface AnimatedListProps {
  items: string[];
  delay?: number;
  stagger?: number;
  numbered?: boolean;
  fontSize?: number;
  color?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  delay = 0,
  stagger = 12,
  numbered = false,
  fontSize = 32,
  color = theme.colors.text,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{
      ...commonStyles.rtlText,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: '100%',
    }}>
      {items.map((item, index) => {
        // Each item starts animating after the previous one
        const itemDelay = delay + index * stagger;
        const adjustedFrame = frame - itemDelay;

        // Fade in
        const opacity = interpolate(adjustedFrame, [0, 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Slide from right
        const translateX = interpolate(adjustedFrame, [0, 18], [50, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.ease),
        });

        // Number/bullet label
        const label = numbered ? `${index + 1}.` : '●';

        return (
          <div
            key={index}
            style={{
              opacity,
              transform: `translateX(${translateX}px)`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              fontSize,
              color,
              lineHeight: 1.6,
            }}
          >
            {/* Bullet or number */}
            <span style={{
              color: theme.colors.accent,
              fontWeight: 700,
              minWidth: numbered ? 36 : 20,
              textAlign: 'center',
              flexShrink: 0,
            }}>
              {label}
            </span>
            {/* Item text */}
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
};
