import { motion } from 'framer-motion';
import { KineticText } from '../components/KineticText';
import { Vision2030Emblem } from '../components/icons/Vision2030Emblem';
import { HexagonPattern } from '../components/icons/HexagonPattern';

export const Scene5_Alignment = () => {
  return (
    <motion.div
      className="scene-container"
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Layer 1: Background - Green gradient */}
      <div className="layer-background">
        <motion.div
          className="absolute inset-0 green-gradient"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Dynamic gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(34,197,94,0.4) 0%, rgba(22,163,74,0) 50%), radial-gradient(ellipse at bottom left, rgba(22,163,74,0.3) 0%, rgba(34,197,94,0) 60%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Animated green particles */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 2 }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Layer 2: Midground - Geometric patterns */}
      <div className="layer-midground">
        {/* Hexagon pattern — proper SVG with staggered draw animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 text-white">
          <HexagonPattern delay={1} count={12} />
        </div>

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-16 h-16 border border-white/20 gpu-optimized"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
          }}
          animate={{
            rotateZ: [0, 120, 240, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotateZ: {
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            },
            scale: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }
          }}
        />

        <motion.div
          className="absolute bottom-1/4 left-1/4 w-12 h-12 border border-white/15 gpu-optimized"
          style={{
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          }}
          animate={{
            rotateZ: [360, 0],
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{
            rotateZ: {
              duration: 15,
              repeat: Infinity,
              ease: 'linear'
            },
            scale: {
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2
            }
          }}
        />

        {/* Dynamic connecting lines */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-32 h-px bg-white/20"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 128, opacity: 0.2 }}
          transition={{ delay: 1.5, duration: 2, ease: [0.4, 0, 0.2, 1] }}
        />

        <motion.div
          className="absolute top-1/3 right-1/3 w-px h-24 bg-white/20"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 96, opacity: 0.2 }}
          transition={{ delay: 2, duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* Layer 3: Foreground - Vision 2030 alignment content */}
      <div className="layer-foreground">
        <div className="text-center space-y-12 max-w-5xl mx-auto">
          {/* Vision 2030 alignment */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <KineticText
              text="متوافق مع رؤية ٢٠٣٠"
              className="text-6xl font-cairo font-black text-white leading-tight"
              delay={0.8}
              staggerDelay={0.08}
              duration={0.8}
              mode="stagger"
            />
          </motion.div>

          {/* Vision 2030 emblem — proper SVG with animated path draw */}
          <motion.div
            className="flex justify-center my-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            <motion.div
              className="w-24 h-24 text-white"
              animate={{
                rotateZ: [0, 1, 0, -1, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Vision2030Emblem delay={2.8} />
            </motion.div>
          </motion.div>

          {/* Growth statistic */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="space-y-4"
          >
            {/* Growth percentage */}
            <motion.div
              className="flex justify-center items-baseline space-x-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.5, duration: 0.8 }}
            >
              <motion.span
                className="text-5xl font-cairo font-black text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.8, duration: 0.6 }}
              >
                ٢٠٪
              </motion.span>

              <motion.div
                className="text-2xl font-cairo font-light text-white/90"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.1, duration: 0.6 }}
              >
                نمو سنوي
              </motion.div>
            </motion.div>

            {/* Growth description */}
            <KineticText
              text="في القطاع غير الربحي"
              className="text-xl font-cairo font-light text-white/80"
              delay={4.5}
              staggerDelay={0.05}
              duration={0.6}
              mode="stagger"
            />

            {/* Glowing effect behind percentage */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 w-32 h-16 bg-white/20 rounded-full blur-2xl opacity-0"
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 4
              }}
            />
          </motion.div>

          {/* Supporting message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <KineticText
              text="نساهم في تحقيق أهداف التنمية المستدامة"
              className="text-lg font-cairo font-light text-white/70 leading-relaxed"
              delay={5.3}
              staggerDelay={0.03}
              duration={0.6}
              mode="stagger"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

