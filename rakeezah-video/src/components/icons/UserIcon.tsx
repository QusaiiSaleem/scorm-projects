import { motion } from 'framer-motion';

interface UserIconProps {
  className?: string;
  delay?: number;
  color?: string;
}

/**
 * Animated user/person icon.
 * Replaces the crude CSS circles + clip-path body in Scene 4.
 * Head draws first, then body — clean line icon style.
 */
export const UserIcon = ({
  className = '',
  delay = 0,
  color = 'currentColor',
}: UserIconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head circle */}
    <motion.circle
      cx="24" cy="16" r="8"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay, duration: 0.2 },
      }}
    />

    {/* Body/shoulders arc */}
    <motion.path
      d="M6 44 C6 34 14 28 24 28 C34 28 42 34 42 44"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { delay: delay + 0.5, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay: delay + 0.5, duration: 0.2 },
      }}
    />
  </svg>
);
