import { motion } from 'framer-motion';

interface ChartIconProps {
  className?: string;
  delay?: number;
  color?: string;
}

/**
 * Animated rising bar chart icon.
 * Replaces the crude CSS bar divs in Scene 4.
 * Bars grow upward with staggered spring animations.
 */
export const ChartIcon = ({
  className = '',
  delay = 0,
  color = 'currentColor',
}: ChartIconProps) => {
  // Bar data: x position and height (taller = more impact)
  const bars = [
    { x: 8, height: 14 },
    { x: 16, height: 22 },
    { x: 24, height: 32 },
    { x: 32, height: 18 },
  ];

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Baseline */}
      <motion.line
        x1="4" y1="42" x2="44" y2="42"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{
          pathLength: { delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
          opacity: { delay, duration: 0.2 },
        }}
      />

      {/* Bars — grow from bottom with stagger */}
      {bars.map((bar, i) => (
        <motion.rect
          key={i}
          x={bar.x}
          y={42 - bar.height}
          width={6}
          height={bar.height}
          rx={2}
          fill={color}
          fillOpacity={0.7 + i * 0.1}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{
            delay: delay + 0.3 + i * 0.15,
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          style={{ transformOrigin: `${bar.x + 3}px 42px` }}
        />
      ))}

      {/* Trend line connecting bar tops */}
      <motion.path
        d="M11 28 L19 20 L27 10 L35 24"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{
          pathLength: { delay: delay + 1.0, duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          opacity: { delay: delay + 1.0, duration: 0.3 },
        }}
      />
    </svg>
  );
};
