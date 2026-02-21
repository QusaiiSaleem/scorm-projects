import { motion } from 'framer-motion';

interface Vision2030EmblemProps {
  className?: string;
  delay?: number;
  color?: string;
}

/**
 * Animated Vision 2030 emblem with geometric frame.
 * Replaces the plain text + rotated borders in Scene 5.
 * Outer frame draws on, inner decorations fade, then "2030" scales in.
 */
export const Vision2030Emblem = ({
  className = '',
  delay = 0,
  color = 'currentColor',
}: Vision2030EmblemProps) => (
  <svg
    viewBox="0 0 96 96"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer diamond frame — rotated square */}
    <motion.rect
      x="48" y="4"
      width="56" height="56"
      rx="4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
      style={{ transform: 'rotate(45deg)', transformOrigin: '48px 48px' }}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      transition={{
        pathLength: { delay, duration: 1.2, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay, duration: 0.2 },
      }}
    />

    {/* Inner circle — draws after frame */}
    <motion.circle
      cx="48" cy="48" r="28"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.5 }}
      transition={{
        pathLength: { delay: delay + 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
        opacity: { delay: delay + 0.6, duration: 0.2 },
      }}
    />

    {/* Decorative rays — 4 small lines radiating outward */}
    {[0, 90, 180, 270].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 48 + Math.cos(rad) * 20;
      const y1 = 48 + Math.sin(rad) * 20;
      const x2 = 48 + Math.cos(rad) * 26;
      const y2 = 48 + Math.sin(rad) * 26;

      return (
        <motion.line
          key={i}
          x1={x1} y1={y1}
          x2={x2} y2={y2}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{
            delay: delay + 1.0 + i * 0.1,
            duration: 0.3,
          }}
        />
      );
    })}

    {/* Center fill glow */}
    <motion.circle
      cx="48" cy="48" r="16"
      fill={color}
      fillOpacity={0.08}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: delay + 1.2,
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
    />

    {/* "2030" text — rendered as styled SVG text for this emblem */}
    <motion.text
      x="48" y="54"
      textAnchor="middle"
      fill={color}
      fontSize="18"
      fontWeight="900"
      fontFamily="Cairo, sans-serif"
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: delay + 1.4,
        duration: 0.5,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      ٢٠٣٠
    </motion.text>
  </svg>
);
