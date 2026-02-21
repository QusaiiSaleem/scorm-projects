import { motion } from 'framer-motion';
import { KineticText } from '../components/KineticText';
import { WarningTriangle } from '../components/icons/WarningTriangle';

export const Scene2_Problem = () => {
  return (
    <motion.div
      className="scene-container"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(75% at 50% 50%)' }}
      exit={{ clipPath: 'circle(0% at 50% 50%)' }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Layer 1: Background - Dark with red tint */}
      <div className="layer-background">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a0f14 0%, #2a1319 50%, #0f172a 100%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Red glow overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.3) 0%, rgba(15,23,42,0) 60%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Layer 2: Midground - Warning accent elements */}
      <div className="layer-midground">
        {/* Pulsing red warning shapes */}
        <motion.div
          className="absolute top-24 right-1/4 w-4 h-4 bg-red-500 rounded-full opacity-60 gpu-optimized"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0
          }}
        />

        <motion.div
          className="absolute bottom-32 left-1/3 w-3 h-3 bg-red-400 rounded-full opacity-40 gpu-optimized"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5
          }}
        />

        <motion.div
          className="absolute top-1/2 left-16 w-2 h-2 bg-red-300 rounded-full opacity-50 gpu-optimized"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />

        {/* Diagonal accent lines */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-px h-24 bg-red-400 opacity-30 rotate-45"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 96, opacity: 0.3 }}
          transition={{ delay: 1, duration: 1.2 }}
        />

        <motion.div
          className="absolute bottom-1/3 left-1/4 w-16 h-px bg-red-400 opacity-30"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 64, opacity: 0.3 }}
          transition={{ delay: 1.5, duration: 1 }}
        />
      </div>

      {/* Layer 3: Foreground - Problem statement */}
      <div className="layer-foreground">
        <div className="text-center space-y-12">
          {/* Counter for 68,000 charities */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative"
          >
            <motion.div
              className="text-7xl font-cairo font-black text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <CounterAnimation
                target={68000}
                duration={2}
                delay={1.2}
              />
            </motion.div>

            {/* "Saudi charities" label */}
            <KineticText
              text="جمعية سعودية"
              className="text-2xl font-cairo font-light text-white/80"
              delay={2.2}
              staggerDelay={0.06}
              duration={0.6}
              mode="stagger"
            />

            {/* Glowing effect behind number */}
            <motion.div
              className="absolute inset-0 -z-10 blur-2xl opacity-30"
              style={{ backgroundColor: '#ef4444' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5
              }}
            />
          </motion.div>

          {/* Problem statement */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <KineticText
              text="أغلبها تكافح لإثبات أثرها للممولين"
              className="text-3xl font-cairo font-light text-white leading-relaxed"
              delay={3.2}
              staggerDelay={0.05}
              duration={0.7}
              mode="stagger"
            />
          </motion.div>

          {/* Warning icon — proper SVG with path draw animation */}
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 4, duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 text-red-500"
              animate={{
                rotateZ: [0, -2, 2, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <WarningTriangle delay={4.2} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Counter animation component for 68,000
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
          duration: duration,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* Arabic numerals for 68,000 */}
        ٦٨,٠٠٠
      </motion.span>
    </motion.span>
  );
};