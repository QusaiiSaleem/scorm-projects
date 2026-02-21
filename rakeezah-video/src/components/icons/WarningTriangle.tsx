import { motion } from 'framer-motion';

interface WarningTriangleProps {
  className?: string;
  delay?: number;
  color?: string;
}

/**
 * Animated warning triangle icon with exclamation mark.
 * Replaces the crude CSS border-triangle in Scene 2.
 * Uses path draw animation for cinematic reveal.
 */
export const WarningTriangle = ({
  className = '',
  delay = 0,
  color = 'currentColor',
}: WarningTriangleProps) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Triangle outline — draws on with pathLength animation */}
    <motion.path
      d="M32 6 L4 58 L60 58 Z"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay, duration: 1.0, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay, duration: 0.2 },
      }}
    />

    {/* Inner fill — fades in after outline draws */}
    <motion.path
      d="M32 6 L4 58 L60 58 Z"
      fill={color}
      fillOpacity={0.15}
      stroke="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.8, duration: 0.4 }}
    />

    {/* Exclamation line */}
    <motion.line
      x1="32" y1="26"
      x2="32" y2="40"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay: delay + 0.6, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay: delay + 0.6, duration: 0.2 },
      }}
    />

    {/* Exclamation dot */}
    <motion.circle
      cx="32" cy="48" r="2.5"
      fill={color}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: delay + 1.0,
        duration: 0.3,
        type: 'spring',
        stiffness: 400,
        damping: 15,
      }}
    />
  </svg>
);
