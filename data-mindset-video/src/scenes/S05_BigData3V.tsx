import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Cairo';
import { theme, commonStyles } from '../styles';
import { Background } from '../components/Background';
import { SlideTitle } from '../components/SlideTitle';
import { FadeTransition } from '../components/FadeTransition';
import { ProgressBar } from '../components/ProgressBar';

const { fontFamily } = loadFont();

/**
 * Scene 5: Big Data - The 3 V's
 * Duration: 10 seconds (300 frames)
 *
 * Shows definition of big data, then an animated triangle/trio diagram
 * of Volume, Velocity, Variety with a concrete example.
 */

const threeVs = [
  { arabic: 'الحجم', english: 'Volume', icon: '📦', color: '#2b6cb0' },
  { arabic: 'السرعة', english: 'Velocity', icon: '⚡', color: '#ed8936' },
  { arabic: 'التنوع', english: 'Variety', icon: '🎨', color: '#38a169' },
];

export const S05_BigData3V: React.FC = () => {
  const frame = useCurrentFrame();

  // Definition text
  const defOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const defY = interpolate(frame, [20, 45], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  // Example text at bottom
  const exampleOpacity = interpolate(frame, [200, 230], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background variant="light" />

      <AbsoluteFill style={{
        ...commonStyles.slide,
        fontFamily,
        padding: '50px 120px',
      }}>
        <SlideTitle text="ما هي البيانات الضخمة؟" delay={5} />

        {/* Definition */}
        <div style={{
          ...commonStyles.rtlText,
          opacity: defOpacity,
          transform: `translateY(${defY}px)`,
          fontSize: 28,
          color: theme.colors.gray,
          lineHeight: 1.6,
          marginBottom: 40,
        }}>
          مجموعات بيانات ضخمة جدًا لا يمكن التعامل معها بالأدوات التقليدية
        </div>

        {/* 3V Circles in a row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 60,
          flex: 1,
          alignItems: 'center',
        }}>
          {threeVs.map((v, index) => {
            const vDelay = 70 + index * 35;
            const adjustedFrame = frame - vDelay;

            // Scale pop for each circle
            const scale = interpolate(adjustedFrame, [0, 15, 22], [0, 1.08, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const opacity = interpolate(adjustedFrame, [0, 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Floating animation after appearing
            const floatY = adjustedFrame > 22
              ? Math.sin((adjustedFrame - 22) / 25 + index * 1.5) * 6
              : 0;

            return (
              <div key={index} style={{
                opacity,
                transform: `scale(${scale}) translateY(${floatY}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}>
                {/* Circle */}
                <div style={{
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${v.color}22, ${v.color}44)`,
                  border: `4px solid ${v.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}>
                  <span style={{ fontSize: 42 }}>{v.icon}</span>
                  <span style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: v.color,
                    fontFamily,
                  }}>
                    {v.arabic}
                  </span>
                </div>
                {/* English label */}
                <span style={{
                  fontSize: 18,
                  color: theme.colors.gray,
                  fontWeight: 500,
                }}>
                  {v.english}
                </span>
              </div>
            );
          })}
        </div>

        {/* Example */}
        <div style={{
          ...commonStyles.rtlText,
          opacity: exampleOpacity,
          fontSize: 24,
          color: theme.colors.secondary,
          backgroundColor: theme.colors.lightBlue,
          padding: '14px 28px',
          borderRadius: 12,
          textAlign: 'center',
          marginTop: 20,
        }}>
          فيسبوك يولد تيرابايت من البيانات يوميًا
        </div>
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={870} />
    </AbsoluteFill>
  );
};
