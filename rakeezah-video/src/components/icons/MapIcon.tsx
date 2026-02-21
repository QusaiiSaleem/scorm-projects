import { motion } from 'framer-motion';

interface MapIconProps {
  className?: string;
  delay?: number;
  color?: string;
}

/**
 * Animated impact map icon with connected nodes.
 * Replaces the crude CSS borders + dots + lines in Scene 4.
 * Nodes appear with spring, connecting lines draw between them.
 */
export const MapIcon = ({
  className = '',
  delay = 0,
  color = 'currentColor',
}: MapIconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Map frame — rounded rectangle */}
    <motion.rect
      x="4" y="6" width="40" height="36" rx="4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay, duration: 0.2 },
      }}
    />

    {/* Connecting lines between nodes — draw on */}
    <motion.path
      d="M14 18 L24 28 L36 16"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="3 3"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{
        pathLength: { delay: delay + 0.5, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay: delay + 0.5, duration: 0.3 },
      }}
    />

    {/* Node 1 — top left */}
    <motion.circle
      cx="14" cy="18" r="3.5"
      fill={color}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: delay + 0.8,
        duration: 0.3,
        type: 'spring',
        stiffness: 400,
        damping: 15,
      }}
    />

    {/* Node 2 — center bottom */}
    <motion.circle
      cx="24" cy="28" r="3.5"
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

    {/* Node 3 — top right */}
    <motion.circle
      cx="36" cy="16" r="3.5"
      fill={color}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: delay + 1.2,
        duration: 0.3,
        type: 'spring',
        stiffness: 400,
        damping: 15,
      }}
    />

    {/* Pin marker at center node */}
    <motion.path
      d="M24 28 L24 34"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      transition={{
        delay: delay + 1.3,
        duration: 0.3,
      }}
    />
  </svg>
);
