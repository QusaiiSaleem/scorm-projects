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
 * Scene 8: Data Quality
 * Duration: 8 seconds (240 frames)
 *
 * Shows the concept that bad data leads to bad decisions,
 * then reveals 4 quality dimensions in a 2x2 grid.
 */

const dimensions = [
  { arabic: 'الدقة', english: 'Accuracy', icon: '🎯', color: '#2b6cb0' },
  { arabic: 'الاكتمال', english: 'Completeness', icon: '✅', color: '#38a169' },
  { arabic: 'الاتساق', english: 'Consistency', icon: '🔄', color: '#ed8936' },
  { arabic: 'التوقيت', english: 'Timeliness', icon: '⏰', color: '#805ad5' },
];

export const S08_DataQuality: React.FC = () => {
  const frame = useCurrentFrame();

  // Warning text animation
  const warningOpacity = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const warningScale = interpolate(frame, [25, 45, 55], [0.85, 1.03, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Example text
  const exampleOpacity = interpolate(frame, [160, 185], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background variant="light" />

      <AbsoluteFill style={{
        ...commonStyles.slide,
        fontFamily,
        padding: '50px 100px',
      }}>
        <SlideTitle text="جودة البيانات" delay={5} />

        {/* Warning: bad data = bad decisions */}
        <div style={{
          ...commonStyles.rtlText,
          textAlign: 'center',
          opacity: warningOpacity,
          transform: `scale(${warningScale})`,
          fontSize: 30,
          color: theme.colors.danger,
          fontWeight: 700,
          backgroundColor: '#fff5f5',
          padding: '16px 36px',
          borderRadius: 14,
          marginBottom: 36,
          border: '2px solid #fed7d7',
        }}>
          البيانات الخاطئة ← قرارات خاطئة
        </div>

        {/* 2x2 grid of quality dimensions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 22,
          flex: 1,
          alignContent: 'center',
        }}>
          {dimensions.map((dim, index) => {
            const cardDelay = 60 + index * 22;
            const adj = frame - cardDelay;

            const cardScale = interpolate(adj, [0, 12, 18], [0, 1.05, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const cardOpacity = interpolate(adj, [0, 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div key={index} style={{
                ...commonStyles.rtlText,
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
                backgroundColor: theme.colors.white,
                borderRadius: 16,
                padding: '24px 28px',
                borderRight: `5px solid ${dim.color}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <span style={{ fontSize: 40 }}>{dim.icon}</span>
                <div>
                  <div style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: dim.color,
                  }}>
                    {dim.arabic}
                  </div>
                  <div style={{
                    fontSize: 18,
                    color: theme.colors.gray,
                  }}>
                    {dim.english}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Example */}
        <div style={{
          ...commonStyles.rtlText,
          textAlign: 'center',
          opacity: exampleOpacity,
          fontSize: 22,
          color: theme.colors.secondary,
          backgroundColor: theme.colors.lightBlue,
          padding: '12px 28px',
          borderRadius: 10,
          marginTop: 20,
        }}>
          غياب درجات بعض الطلاب = نتائج غير عادلة
        </div>
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={1920} />
    </AbsoluteFill>
  );
};
