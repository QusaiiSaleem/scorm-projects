import { motion } from 'framer-motion';

interface ShieldCheckmarkProps {
  className?: string;
  delay?: number;
  color?: string;
}

/**
 * Animated shield with checkmark icon.
 * Replaces the crude CSS clip-path polygon + border checkmark in Scene 3.
 * Shield draws on first, then checkmark snaps in with a spring.
 */
export const ShieldCheckmark = ({
  className = '',
  delay = 0,
  color = 'currentColor',
}: ShieldCheckmarkProps) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shield body — draws on with pathLength */}
    <motion.path
      d="M32 4 L8 18 L8 36 C8 48 18 57 32 62 C46 57 56 48 56 36 L56 18 Z"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay, duration: 1.2, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay, duration: 0.2 },
      }}
    />

    {/* Shield fill — soft glow after outline */}
    <motion.path
      d="M32 4 L8 18 L8 36 C8 48 18 57 32 62 C46 57 56 48 56 36 L56 18 Z"
      fill={color}
      fillOpacity={0.12}
      stroke="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 1.0, duration: 0.5 }}
    />

    {/* Checkmark — springs in after shield is drawn */}
    <motion.path
      d="M22 34 L29 41 L42 26"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: {
          delay: delay + 1.2,
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
        },
        opacity: { delay: delay + 1.2, duration: 0.2 },
      }}
    />
  </svg>
);
