import { motion } from 'framer-motion';
import { KineticText } from '../components/KineticText';
import { UserIcon } from '../components/icons/UserIcon';
import { MapIcon } from '../components/icons/MapIcon';
import { ChartIcon } from '../components/icons/ChartIcon';

export const Scene4_HowItWorks = () => {
  const steps = [
    {
      number: '١',
      title: 'حدد المستفيد',
      description: 'من سيستفيد من خدماتك؟',
      icon: 'user'
    },
    {
      number: '٢',
      title: 'ارسم خارطة الأثر',
      description: 'كيف تحقق التغيير؟',
      icon: 'map'
    },
    {
      number: '٣',
      title: 'قِس النتائج',
      description: 'أثبت نجاحك بالأرقام',
      icon: 'chart'
    }
  ];

  return (
    <motion.div
      className="scene-container"
      initial={{ x: '100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Layer 1: Background - Light with grid */}
      <div className="layer-background">
        <motion.div
          className="absolute inset-0 bg-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Grid overlay */}
        <motion.div
          className="absolute inset-0 grid-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />

        {/* Subtle gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(107,91,77,0.1) 0%, rgba(250,250,250,0) 60%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Layer 2: Midground - Connecting lines and accents */}
      <div className="layer-midground">
        {/* Connecting arrows between steps */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {/* Arrow 1 to 2 */}
          <motion.div
            className="absolute top-0 left-1/3 w-24 h-0.5 bg-wood-dark opacity-30"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-wood-dark border-t-2 border-b-2 border-t-transparent border-b-transparent opacity-30" />
          </motion.div>

          {/* Arrow 2 to 3 */}
          <motion.div
            className="absolute top-0 right-1/3 w-24 h-0.5 bg-wood-dark opacity-30"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 3, duration: 0.8 }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-wood-dark border-t-2 border-b-2 border-t-transparent border-b-transparent opacity-30" />
          </motion.div>
        </motion.div>

        {/* Floating accent elements */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-3 h-3 bg-wood-dark rounded-full opacity-20 gpu-optimized"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0
          }}
        />

        <motion.div
          className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-green-dark rounded-full opacity-30 gpu-optimized"
          animate={{
            y: [0, 10, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5
          }}
        />
      </div>

      {/* Layer 3: Foreground - Steps content */}
      <div className="layer-foreground">
        <div className="text-center space-y-16">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <KineticText
              text="كيف يعمل"
              className="text-4xl font-cairo font-black text-dark mb-8"
              delay={0.6}
              staggerDelay={0.08}
              duration={0.6}
              mode="stagger"
            />
          </motion.div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center space-y-6"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: 1 + (index * 0.3),
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                {/* Step number */}
                <motion.div
                  className="relative w-16 h-16 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    scale: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.5
                    }
                  }}
                >
                  {/* Circle background */}
                  <div className="absolute inset-0 bg-wood-dark rounded-full opacity-10" />
                  <div className="absolute inset-1 bg-white rounded-full border-2 border-wood-dark/20" />

                  {/* Step number */}
                  <motion.span
                    className="text-2xl font-cairo font-black text-wood-dark z-10"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 1.3 + (index * 0.3),
                      duration: 0.5
                    }}
                  >
                    {step.number}
                  </motion.span>

                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gold-light rounded-full opacity-0 blur-lg"
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 2 + (index * 0.3)
                    }}
                  />
                </motion.div>

                {/* Step icon — proper SVG with path draw animation */}
                <motion.div
                  className="w-12 h-12 text-wood-dark"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.6 + (index * 0.3),
                    duration: 0.6
                  }}
                >
                  <StepIconSVG type={step.icon} delay={1.8 + (index * 0.3)} />
                </motion.div>

                {/* Step title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.8 + (index * 0.3),
                    duration: 0.6
                  }}
                >
                  <h3 className="text-2xl font-cairo font-bold text-dark mb-3">
                    {step.title}
                  </h3>
                  <p className="text-lg font-cairo font-light text-dark/70 leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// SVG-based step icons — replaces crude CSS shapes
const StepIconSVG = ({ type, delay = 0 }: { type: string; delay?: number }) => {
  if (type === 'user') return <UserIcon delay={delay} />;
  if (type === 'map') return <MapIcon delay={delay} />;
  if (type === 'chart') return <ChartIcon delay={delay} />;
  return null;
};