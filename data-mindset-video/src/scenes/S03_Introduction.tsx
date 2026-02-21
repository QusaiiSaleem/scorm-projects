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
 * Scene 3: Introduction
 * Duration: 8 seconds (240 frames)
 *
 * Introduces the concept of data being everywhere,
 * with a highlighted key definition of "data mindset."
 */
export const S03_Introduction: React.FC = () => {
  const frame = useCurrentFrame();

  // Main text fades in
  const textOpacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textY = interpolate(frame, [30, 55], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  // Examples appear
  const examplesOpacity = interpolate(frame, [70, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Definition box appears
  const defOpacity = interpolate(frame, [110, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const defScale = interpolate(frame, [110, 135, 145], [0.9, 1.02, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Highlight glow on definition
  const glowOpacity = interpolate(frame, [145, 165, 200, 220], [0, 0.6, 0.6, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background variant="light" />

      <AbsoluteFill style={{
        ...commonStyles.slide,
        fontFamily,
        padding: '60px 120px',
      }}>
        {/* Scene title */}
        <SlideTitle text="المقدمة" delay={5} />

        {/* Main paragraph */}
        <div style={{
          ...commonStyles.rtlText,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          fontSize: 34,
          color: theme.colors.text,
          lineHeight: 1.7,
          marginTop: 10,
        }}>
          نحن نعيش في عالم يولّد كميات هائلة من البيانات كل ثانية.
        </div>

        {/* Example tags */}
        <div style={{
          opacity: examplesOpacity,
          display: 'flex',
          gap: 20,
          marginTop: 30,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}>
          {['التغريدات', 'صور إنستغرام', 'التسوق الإلكتروني'].map((tag, i) => (
            <div key={i} style={{
              ...commonStyles.rtlText,
              background: theme.colors.lightBlue,
              color: theme.colors.secondary,
              padding: '10px 24px',
              borderRadius: 30,
              fontSize: 24,
              fontWeight: 600,
              opacity: interpolate(frame - (70 + i * 10), [0, 15], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              transform: `translateY(${interpolate(frame - (70 + i * 10), [0, 15], [15, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}px)`,
            }}>
              {tag}
            </div>
          ))}
        </div>

        {/* Key definition box */}
        <div style={{
          ...commonStyles.rtlText,
          opacity: defOpacity,
          transform: `scale(${defScale})`,
          marginTop: 50,
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          borderRadius: 20,
          padding: '36px 44px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            inset: -2,
            borderRadius: 22,
            border: `3px solid ${theme.colors.accent}`,
            opacity: glowOpacity,
          }} />
          <div style={{
            fontSize: 30,
            color: theme.colors.white,
            fontWeight: 700,
            lineHeight: 1.6,
          }}>
            عقلية البيانات = التفكير بالبيانات، التعلم منها، والتواصل بها مع الآخرين
          </div>
        </div>
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={390} />
    </AbsoluteFill>
  );
};
