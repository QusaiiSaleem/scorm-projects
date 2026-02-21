import { motion } from 'framer-motion';
import { KineticText, TextWithAccent } from '../components/KineticText';
import { ShieldCheckmark } from '../components/icons/ShieldCheckmark';

export const Scene3_Solution = () => {
  return (
    <motion.div
      className="scene-container"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        scale: 1.2,
        opacity: 0,
        filter: 'blur(10px)'
      }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Layer 1: Background - Wood gradient */}
      <div className="layer-background">
        <motion.div
          className="absolute inset-0 wood-gradient"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Overlay texture */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(245,158,11,0.3) 0%, rgba(107,91,77,0) 50%),radial-gradient(ellipse at bottom right, rgba(157,139,124,0.4) 0%, rgba(107,91,77,0) 50%)'
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Subtle grain texture using CSS */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23ffffff' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      {/* Layer 2: Midground - Golden accent elements */}
      <div className="layer-midground">
        {/* Floating golden particles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold-light rounded-full opacity-60 gpu-optimized"
          animate={{
            y: [-10, -30, -10],
            x: [0, 10, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0
          }}
        />

        <motion.div
          className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gold-light rounded-full opacity-70 gpu-optimized"
          animate={{
            y: [0, -20, 0],
            x: [-5, 5, -5],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />

        <motion.div
          className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-gold-light rounded-full opacity-80 gpu-optimized"
          animate={{
            y: [5, -15, 5],
            x: [0, -8, 0],
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.4, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
        />

        {/* Geometric accent lines */}
        <motion.div
          className="absolute top-1/3 right-20 w-24 h-px bg-gold-light opacity-40"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 96, opacity: 0.4 }}
          transition={{ delay: 1.5, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />

        <motion.div
          className="absolute bottom-1/3 left-16 w-px h-16 bg-gold-light opacity-40"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 64, opacity: 0.4 }}
          transition={{ delay: 2, duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Curved accent shape */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-32 h-32 border border-gold-light/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.5, duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="w-full h-full border-t-2 border-gold-light rounded-full"
            animate={{ rotateZ: [0, 360] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>
      </div>

      {/* Layer 3: Foreground - Solution message */}
      <div className="layer-foreground">
        <div className="text-center space-y-12 max-w-4xl mx-auto">
          {/* Main solution statement - word by word */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <KineticText
              text="وضّح أثرك، احصل على التمويل بثقة"
              className="text-5xl font-cairo font-bold text-white leading-tight"
              delay={0.8}
              staggerDelay={0.15}
              duration={0.8}
              mode="word"
            />
          </motion.div>

          {/* Gold accent line that draws */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            <motion.div
              className="relative"
              initial={{ width: 0 }}
              animate={{ width: 400 }}
              transition={{
                delay: 3.2,
                duration: 1.5,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <div className="h-1 bg-gradient-to-r from-transparent via-gold-light to-transparent" />

              {/* Glowing effect */}
              <motion.div
                className="absolute inset-0 h-1 bg-gradient-to-r from-transparent via-gold-light to-transparent blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 4, duration: 0.5 }}
              />
            </motion.div>
          </motion.div>

          {/* Supporting text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.2, duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <KineticText
              text="نحول البيانات إلى قصص مؤثرة"
              className="text-xl font-cairo font-light text-white/90 leading-relaxed"
              delay={4.5}
              staggerDelay={0.04}
              duration={0.6}
              mode="stagger"
            />
          </motion.div>

          {/* Shield icon — proper SVG with path draw animation */}
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 5, duration: 0.6 }}
          >
            <motion.div
              className="w-16 h-16 text-gold-light"
              animate={{
                y: [0, -5, 0],
                rotateZ: [0, 2, 0, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <ShieldCheckmark delay={5.2} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};