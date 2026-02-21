import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Cairo';
import { theme, commonStyles } from '../styles';
import { Background } from '../components/Background';
import { FadeTransition } from '../components/FadeTransition';
import { ProgressBar } from '../components/ProgressBar';

const { fontFamily } = loadFont();

/**
 * Scene 6: Big Data Details - Volume, Velocity, Variety
 * Duration: 15 seconds (450 frames)
 *
 * Three sub-sections (5 seconds each) showing details of each V.
 * Each sub-section fades in/out in sequence.
 */

const sections = [
  {
    title: 'الحجم',
    english: 'Volume',
    icon: '📦',
    color: '#2b6cb0',
    definition: 'الحجم = الكمية الهائلة من البيانات',
    example: 'يوتيوب يستقبل أكثر من 500 ساعة من الفيديو كل دقيقة',
  },
  {
    title: 'السرعة',
    english: 'Velocity',
    icon: '⚡',
    color: '#ed8936',
    definition: 'السرعة = سرعة إنشاء البيانات',
    example: 'ملايين الرسائل عبر واتساب كل ثانية',
  },
  {
    title: 'التنوع',
    english: 'Variety',
    icon: '🎨',
    color: '#38a169',
    definition: 'التنوع = أشكال مختلفة من البيانات',
    example: 'نصوص، صور، فيديو، بيانات المستشعرات',
  },
];

export const S06_BigDataDetails: React.FC = () => {
  const frame = useCurrentFrame();
  const sectionDuration = 150; // 5 seconds per section

  return (
    <AbsoluteFill>
      <Background variant="light" />

      <AbsoluteFill style={{
        ...commonStyles.slide,
        fontFamily,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {sections.map((section, index) => {
          const sectionStart = index * sectionDuration;
          const localFrame = frame - sectionStart;

          // Each section fades in, stays, fades out
          const sectionOpacity = interpolate(localFrame, [0, 20, 120, 145], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Only render if within section time range
          if (localFrame < -10 || localFrame > 155) return null;

          // Icon scale pop
          const iconScale = interpolate(localFrame, [10, 25, 32], [0, 1.1, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Title slide in
          const titleX = interpolate(localFrame, [15, 40], [60, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });

          // Definition fade
          const defOpacity = interpolate(localFrame, [40, 60], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Example slide up
          const exampleOpacity = interpolate(localFrame, [65, 85], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const exampleY = interpolate(localFrame, [65, 85], [25, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.ease),
          });

          return (
            <AbsoluteFill key={index} style={{
              opacity: sectionOpacity,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 120px',
            }}>
              {/* Icon */}
              <div style={{
                fontSize: 72,
                transform: `scale(${iconScale})`,
                marginBottom: 20,
              }}>
                {section.icon}
              </div>

              {/* Title */}
              <div style={{
                ...commonStyles.rtlText,
                textAlign: 'center',
                transform: `translateX(${titleX}px)`,
                fontSize: 48,
                fontWeight: 800,
                color: section.color,
                marginBottom: 8,
              }}>
                {section.title}
              </div>

              {/* English label */}
              <div style={{
                fontSize: 22,
                color: theme.colors.gray,
                marginBottom: 30,
              }}>
                {section.english}
              </div>

              {/* Definition */}
              <div style={{
                ...commonStyles.rtlText,
                textAlign: 'center',
                opacity: defOpacity,
                fontSize: 32,
                color: theme.colors.text,
                fontWeight: 600,
                marginBottom: 24,
              }}>
                {section.definition}
              </div>

              {/* Example */}
              <div style={{
                ...commonStyles.rtlText,
                textAlign: 'center',
                opacity: exampleOpacity,
                transform: `translateY(${exampleY}px)`,
                fontSize: 26,
                color: theme.colors.white,
                backgroundColor: section.color,
                padding: '16px 36px',
                borderRadius: 14,
                maxWidth: 700,
              }}>
                {section.example}
              </div>
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={1170} />
    </AbsoluteFill>
  );
};
