import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Cairo';
import { theme, commonStyles } from '../styles';
import { Background } from '../components/Background';
import { FadeTransition } from '../components/FadeTransition';
import { ProgressBar } from '../components/ProgressBar';

const { fontFamily } = loadFont();

/**
 * Scene 9: Data Quality Details
 * Duration: 20 seconds (600 frames)
 *
 * Four sub-sections (5 seconds each), each showing one quality dimension
 * with a definition and example. Sections fade in/out in sequence.
 */

const qualityDetails = [
  {
    title: 'الدقة',
    icon: '🎯',
    color: '#2b6cb0',
    definition: 'هل البيانات صحيحة؟',
    example: 'مثال: تسجيل 95 بدلاً من 59',
  },
  {
    title: 'الاكتمال',
    icon: '✅',
    color: '#38a169',
    definition: 'هل جميع القيم مدخلة؟',
    example: 'مثال: بيانات حضور ناقصة',
  },
  {
    title: 'الاتساق',
    icon: '🔄',
    color: '#ed8936',
    definition: 'هل التنسيق موحد؟',
    example: 'مثال: 01/02/2025 مقابل 1 فبراير 2025',
  },
  {
    title: 'التوقيت',
    icon: '⏰',
    color: '#805ad5',
    definition: 'هل البيانات محدثة؟',
    example: 'مثال: بيانات مبيعات قديمة',
  },
];

export const S09_DataQualityDetails: React.FC = () => {
  const frame = useCurrentFrame();
  const sectionDuration = 150; // 5 seconds per sub-section

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
        {qualityDetails.map((section, index) => {
          const sectionStart = index * sectionDuration;
          const localFrame = frame - sectionStart;

          // Fade in and out for each sub-section
          const sectionOpacity = interpolate(localFrame, [0, 20, 120, 145], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          if (localFrame < -10 || localFrame > 155) return null;

          // Icon pop
          const iconScale = interpolate(localFrame, [10, 25, 32], [0, 1.1, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Title slide in from right
          const titleX = interpolate(localFrame, [15, 38], [50, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });

          // Definition
          const defOpacity = interpolate(localFrame, [38, 58], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Example card
          const exampleOpacity = interpolate(localFrame, [60, 80], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const exampleY = interpolate(localFrame, [60, 80], [25, 0], {
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
              padding: '80px 140px',
              gap: 20,
            }}>
              {/* Icon */}
              <div style={{
                fontSize: 72,
                transform: `scale(${iconScale})`,
              }}>
                {section.icon}
              </div>

              {/* Title */}
              <div style={{
                ...commonStyles.rtlText,
                textAlign: 'center',
                transform: `translateX(${titleX}px)`,
                fontSize: 46,
                fontWeight: 800,
                color: section.color,
              }}>
                {section.title}
              </div>

              {/* Definition */}
              <div style={{
                ...commonStyles.rtlText,
                textAlign: 'center',
                opacity: defOpacity,
                fontSize: 34,
                color: theme.colors.text,
                fontWeight: 600,
                marginTop: 10,
              }}>
                {section.definition}
              </div>

              {/* Example card */}
              <div style={{
                ...commonStyles.rtlText,
                textAlign: 'center',
                opacity: exampleOpacity,
                transform: `translateY(${exampleY}px)`,
                fontSize: 26,
                color: theme.colors.white,
                backgroundColor: section.color,
                padding: '18px 40px',
                borderRadius: 14,
                marginTop: 16,
              }}>
                {section.example}
              </div>

              {/* Progress dots showing which sub-section we're on */}
              <div style={{
                display: 'flex',
                gap: 10,
                marginTop: 30,
              }}>
                {qualityDetails.map((_, dotIndex) => (
                  <div key={dotIndex} style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: dotIndex === index
                      ? section.color
                      : theme.colors.lightGray,
                  }} />
                ))}
              </div>
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={2160} />
    </AbsoluteFill>
  );
};
