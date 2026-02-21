import { motion } from 'framer-motion';
import { KineticText } from '../components/KineticText';
import logoSvg from '../assets/logo.svg';

export const Scene6_CTA = () => {
  return (
    <motion.div
      className="scene-container"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 1, scale: 1 }} // Seamless loop - no exit animation
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Layer 1: Background - Dark (matches Scene 1 for seamless loop) */}
      <div className="layer-background">
        <motion.div
          className="absolute inset-0 bg-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Subtle radial gradient for depth */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.3) 0%, rgba(15,23,42,0) 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Animated background particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold-light rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>
      </div>

      {/* Layer 2: Midground - Golden accent elements */}
      <div className="layer-midground">
        {/* Circular accent rings */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-gold-light/10 rounded-full gpu-optimized"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.2, 0.1],
            rotateZ: [0, 360]
          }}
          transition={{
            scale: {
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            },
            rotateZ: {
              duration: 40,
              repeat: Infinity,
              ease: 'linear'
            }
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-gold-light/15 rounded-full gpu-optimized"
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.15, 0.25, 0.15],
            rotateZ: [360, 0]
          }}
          transition={{
            scale: {
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2
            },
            rotateZ: {
              duration: 30,
              repeat: Infinity,
              ease: 'linear'
            }
          }}
        />

        {/* Floating accent shapes */}
        <motion.div
          className="absolute top-1/4 right-1/3 w-6 h-6 border border-gold-light/20 gpu-optimized"
          style={{
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }}
          animate={{
            rotateZ: [0, 90, 180, 270, 360],
            y: [0, -10, 0, 10, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            rotateZ: {
              duration: 12,
              repeat: Infinity,
              ease: 'linear'
            },
            y: {
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        />

        <motion.div
          className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-gold-light/10 rounded-full gpu-optimized"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
            x: [-10, 10, -10],
            y: [0, -15, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />
      </div>

      {/* Layer 3: Foreground - CTA content */}
      <div className="layer-foreground">
        <div className="text-center space-y-12">
          {/* Logo returns to center */}
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0.3, x: -400, y: -200, opacity: 0.8 }}
            animate={{ scale: 0.8, x: 0, y: 0, opacity: 1 }}
            transition={{
              duration: 1.2,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.5
            }}
          >
            <motion.div
              className="w-24 h-24 text-gold-light"
              animate={{
                rotateZ: [0, 3, 0, -3, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <img
                src={logoSvg}
                alt="Rakeezah Logo"
                className="w-full h-full object-contain"
                style={{ filter: 'brightness(1.3)' }}
              />
            </motion.div>
          </motion.div>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <KineticText
              text="ابدأ رحلة الأثر"
              className="text-5xl font-cairo font-black text-white leading-tight"
              delay={1.8}
              staggerDelay={0.1}
              duration={0.8}
              mode="stagger"
            />
          </motion.div>

          {/* Website URL with gold underline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.8 }}
            className="relative inline-block"
          >
            <motion.div
              className="text-2xl font-cairo font-light text-gold-light tracking-wider"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3, duration: 0.6 }}
            >
              rkzh.org
            </motion.div>

            {/* Gold underline that draws */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gold-light"
              initial={{ width: '0%', opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{
                delay: 3.5,
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            />

            {/* Glowing effect */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gold-light blur-sm opacity-0"
              initial={{ width: '0%', opacity: 0 }}
              animate={{ width: '100%', opacity: 0.6 }}
              transition={{
                delay: 4,
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          </motion.div>

          {/* Supporting tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.5, duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <KineticText
              text="معًا نحو مستقبل أفضل"
              className="text-xl font-cairo font-light text-white/70 leading-relaxed"
              delay={4.8}
              staggerDelay={0.04}
              duration={0.6}
              mode="stagger"
            />
          </motion.div>

          {/* Pulsing call-to-action indicator */}
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.5 }}
          >
            <motion.div
              className="w-3 h-3 bg-gold-light rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>

          {/* Subtle "loop ready" indicator - fades out near end to prepare for Scene 1 */}
          <motion.div
            className="absolute bottom-8 right-8 text-xs font-cairo text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{
              delay: 3.5,
              duration: 1,
              ease: 'easeInOut'
            }}
          >
            {/* This helps ensure the loop feels intentional */}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};