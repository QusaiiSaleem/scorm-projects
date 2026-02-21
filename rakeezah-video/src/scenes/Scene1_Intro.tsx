import { motion } from 'framer-motion';
import { KineticText } from '../components/KineticText';
import logoSvg from '../assets/logo.svg';

export const Scene1_Intro = () => {
  return (
    <div className="scene-container">
      {/* Layer 1: Background - Dark with animated gradient */}
      <div className="layer-background">
        <motion.div
          className="absolute inset-0 bg-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Subtle animated gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.2) 0%, rgba(15,23,42,0) 70%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Layer 2: Midground - Gold floating shapes */}
      <div className="layer-midground">
        {/* Large gold shape - top right */}
        <motion.div
          className="absolute top-20 right-32 w-48 h-48 rounded-full blur-3xl gpu-optimized"
          style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}
          animate={{
            scale: [1, 1.3, 1],
            x: [-10, 10, -10],
            y: [-5, 15, -5],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0
          }}
        />

        {/* Medium gold shape - left side */}
        <motion.div
          className="absolute top-1/3 left-20 w-32 h-32 rounded-full blur-2xl gpu-optimized"
          style={{ backgroundColor: 'rgba(245,158,11,0.2)' }}
          animate={{
            scale: [1, 0.8, 1],
            x: [0, -15, 0],
            y: [10, -10, 10],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
        />

        {/* Small gold shape - bottom center */}
        <motion.div
          className="absolute bottom-40 left-1/2 w-24 h-24 rounded-full blur-xl gpu-optimized"
          style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
          animate={{
            scale: [1, 1.4, 1],
            x: [-20, 20, -20],
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4
          }}
        />

        {/* Geometric accent lines */}
        <motion.div
          className="absolute top-1/2 right-1/4 w-px h-32 bg-gold-light opacity-20"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 128, opacity: 0.2 }}
          transition={{ delay: 2, duration: 1.5 }}
        />

        <motion.div
          className="absolute top-1/2 right-1/4 w-16 h-px bg-gold-light opacity-20"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 64, opacity: 0.2 }}
          transition={{ delay: 2.5, duration: 1 }}
        />
      </div>

      {/* Layer 3: Foreground - Logo and text content */}
      <div className="layer-foreground">
        <div className="text-center space-y-8">
          {/* Logo with scale entrance animation */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ scale: 0, opacity: 0, rotateZ: -45 }}
            animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
            exit={{
              scale: 0.3,
              x: -400,
              y: -200,
              opacity: 0.8
            }}
            transition={{
              scale: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.8 },
              rotateZ: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            <motion.div
              className="w-32 h-32 text-gold-light"
              animate={{
                rotateZ: [0, 5, 0, -5, 0],
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
                style={{ filter: 'brightness(1.2)' }}
              />
            </motion.div>
          </motion.div>

          {/* Main title: "ركيزة" */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <KineticText
              text="ركيزة"
              className="text-8xl font-cairo font-black text-white tracking-tight leading-none"
              delay={1.2}
              staggerDelay={0.08}
              duration={0.8}
              mode="stagger"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            <KineticText
              text="منصة الأثر المستدام"
              className="text-2xl font-cairo font-light text-white/80 tracking-wide"
              delay={2.5}
              staggerDelay={0.04}
              duration={0.6}
              mode="stagger"
            />
          </motion.div>

          {/* Golden accent line */}
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
          >
            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-gold-light to-transparent"
              initial={{ width: 0 }}
              animate={{ width: '300px' }}
              transition={{
                delay: 3.5,
                duration: 1.5,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          </motion.div>

          {/* Subtle pulsing dot */}
          <motion.div
            className="flex justify-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
          >
            <motion.div
              className="w-2 h-2 bg-gold-light rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};