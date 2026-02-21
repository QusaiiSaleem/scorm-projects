import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface KineticTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  mode?: 'stagger' | 'word' | 'line' | 'counter';
  counterTarget?: number;
  ease?: string | number[];
  children?: ReactNode;
}

export const KineticText = ({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.05,
  duration = 0.6,
  mode = 'stagger',
  counterTarget,
  ease = [0.4, 0, 0.2, 1],
}: KineticTextProps) => {

  // ===== STAGGER MODE =====
  // Word-by-word stagger with kinetic entrance (rotateX + scale + y)
  // Arabic is cursive — splitting by CHARACTER breaks letter joining.
  // Splitting by WORD keeps letters connected and still feels kinetic.
  if (mode === 'stagger') {
    const words = text.split(' ').filter((w) => w.length > 0);

    return (
      <div className={`${className} arabic-text`} dir="rtl">
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="gpu-optimized"
            initial={{
              opacity: 0,
              rotateX: -90,
              scale: 0.5,
              y: 20,
            }}
            animate={{
              opacity: 1,
              rotateX: 0,
              scale: 1,
              y: 0,
            }}
            transition={{
              // Multiply staggerDelay by 3 so word-level timing feels similar
              // to character-level timing (fewer items = needs larger gaps)
              delay: delay + i * staggerDelay * 3,
              duration,
              ease,
            }}
            style={{
              display: 'inline-block',
              transformOrigin: 'center bottom',
              willChange: 'transform, opacity',
            }}
          >
            {/* Add a non-breaking space AFTER each word (except last) for RTL spacing */}
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ))}
      </div>
    );
  }

  // ===== WORD MODE =====
  // Word-by-word reveal with blur effect (slide in + deblur)
  if (mode === 'word') {
    const words = text.split(' ').filter((w) => w.length > 0);
    return (
      <div className={`${className} arabic-text`} dir="rtl">
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="gpu-optimized"
            initial={{
              opacity: 0,
              x: 50,
              filter: 'blur(10px)',
            }}
            animate={{
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
            }}
            transition={{
              delay: delay + i * staggerDelay * 5,
              duration: duration * 1.2,
              ease,
            }}
            style={{
              display: 'inline-block',
              willChange: 'transform, opacity, filter',
            }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ))}
      </div>
    );
  }

  // ===== LINE MODE =====
  // Full text revealed by expanding clip-path (best for single words/short lines)
  // Arabic letters stay perfectly connected since the text is one DOM element.
  if (mode === 'line') {
    return (
      <motion.div
        className={`${className} arabic-text gpu-optimized`}
        dir="rtl"
        initial={{
          // For RTL: reveal from RIGHT to LEFT
          clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
        }}
        animate={{
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        }}
        transition={{
          delay,
          duration: duration * 1.5,
          ease,
        }}
        style={{
          willChange: 'clip-path',
        }}
      >
        {text}
      </motion.div>
    );
  }

  // ===== COUNTER MODE =====
  // For animated numbers (e.g., ٦٨,٠٠٠)
  if (mode === 'counter' && counterTarget) {
    return (
      <motion.div
        className={`${className} arabic-text gpu-optimized`}
        dir="rtl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay,
          duration: 0.3,
          ease,
        }}
      >
        <CounterAnimation
          target={counterTarget}
          duration={duration}
          delay={delay + 0.3}
        />
      </motion.div>
    );
  }

  // ===== FALLBACK =====
  // Simple fade + slide up
  return (
    <motion.div
      className={`${className} arabic-text gpu-optimized`}
      dir="rtl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration,
        ease,
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {text}
    </motion.div>
  );
};

// Counter animation component for numbers
interface CounterAnimationProps {
  target: number;
  duration: number;
  delay: number;
}

const CounterAnimation = ({ target, duration, delay }: CounterAnimationProps) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: delay + 0.3,
          duration,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        ٦٨,٠٠٠
      </motion.span>
    </motion.span>
  );
};

// Text reveal with gold accent line
export const TextWithAccent = ({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  return (
    <div className={`relative ${className}`}>
      <KineticText
        text={text}
        mode="word"
        delay={delay}
        className="relative z-10"
      />
      <motion.div
        className="absolute bottom-0 right-0 h-1 bg-gold-light"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{
          delay: delay + 0.8,
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    </div>
  );
};
