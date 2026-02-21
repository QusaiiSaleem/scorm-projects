import { motion } from 'framer-motion';

interface HexagonPatternProps {
  className?: string;
  delay?: number;
  color?: string;
  count?: number;
}

/**
 * Animated hexagon grid pattern.
 * Replaces the crude CSS clip-path hexagons in Scene 5.
 * Hexagons draw on with staggered timing for a wave effect.
 */
export const HexagonPattern = ({
  className = '',
  delay = 0,
  color = 'currentColor',
  count = 12,
}: HexagonPatternProps) => {
  // Generate a grid of hexagons
  const hexagons: Array<{ cx: number; cy: number; size: number }> = [];
  const cols = 4;
  const rows = Math.ceil(count / cols);
  const hexSize = 18;
  const hSpacing = hexSize * 1.8;
  const vSpacing = hexSize * 1.6;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (hexagons.length >= count) break;
      const offsetX = row % 2 === 1 ? hSpacing / 2 : 0;
      hexagons.push({
        cx: 30 + col * hSpacing + offsetX,
        cy: 20 + row * vSpacing,
        size: hexSize,
      });
    }
  }

  // Build a hexagon path centered at (0, 0) with given size
  const hexPath = (size: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push(
        `${Math.cos(angle) * size},${Math.sin(angle) * size}`
      );
    }
    return `M${points.join(' L')} Z`;
  };

  return (
    <svg
      viewBox="0 0 160 100"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {hexagons.map((hex, i) => (
        <motion.path
          key={i}
          d={hexPath(hex.size * 0.45)}
          stroke={color}
          strokeWidth={1}
          fill="none"
          style={{
            transform: `translate(${hex.cx}px, ${hex.cy}px)`,
          }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, 0.3, 0.15],
          }}
          transition={{
            pathLength: {
              delay: delay + i * 0.12,
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            },
            opacity: {
              delay: delay + i * 0.12,
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
          }}
        />
      ))}

      {/* Connecting lines between some hexagons for network effect */}
      {hexagons.slice(0, -1).map((hex, i) => {
        if (i % 3 !== 0) return null;
        const next = hexagons[Math.min(i + 1, hexagons.length - 1)];
        return (
          <motion.line
            key={`line-${i}`}
            x1={hex.cx} y1={hex.cy}
            x2={next.cx} y2={next.cy}
            stroke={color}
            strokeWidth={0.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{
              delay: delay + 1 + i * 0.1,
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        );
      })}
    </svg>
  );
};
