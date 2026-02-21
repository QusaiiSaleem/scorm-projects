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
 * Scene 12: Privacy & Ethics
 * Duration: 10 seconds (300 frames)
 *
 * Shows two rows: problems (red) and solutions (green),
 * creating a clear contrast between challenges and responses.
 */

const problems = [
  { icon: '📢', text: 'الإعلانات الموجّهة' },
  { icon: '👁️', text: 'المراقبة الشاملة' },
  { icon: '🔓', text: 'خروقات البيانات' },
];

const solutions = [
  { icon: '📚', text: 'رفع وعي المستخدمين' },
  { icon: '📜', text: 'قانون خصوصية المستهلك' },
  { icon: '🛡️', text: 'اللائحة العامة لحماية البيانات' },
];

export const S12_PrivacyEthics: React.FC = () => {
  const frame = useCurrentFrame();

  // Problems label
  const probLabelOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Solutions label
  const solLabelOpacity = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Arrow between rows
  const arrowOpacity = interpolate(frame, [135, 155], [0, 1], {
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
        <SlideTitle text="الخصوصية والأخلاقيات" delay={5} />

        {/* Problems row */}
        <div style={{
          ...commonStyles.rtlText,
          opacity: probLabelOpacity,
          fontSize: 24,
          color: theme.colors.danger,
          fontWeight: 700,
          marginBottom: 14,
          marginTop: 10,
        }}>
          ⚠️ التحديات
        </div>
        <div style={{
          display: 'flex',
          gap: 20,
          marginBottom: 30,
        }}>
          {problems.map((prob, i) => {
            const cardDelay = 60 + i * 20;
            const adj = frame - cardDelay;
            const cardOpacity = interpolate(adj, [0, 18], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const cardX = interpolate(adj, [0, 18], [40, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.ease),
            });

            return (
              <div key={i} style={{
                ...commonStyles.rtlText,
                opacity: cardOpacity,
                transform: `translateX(${cardX}px)`,
                flex: 1,
                backgroundColor: '#fff5f5',
                border: '2px solid #fed7d7',
                borderRadius: 14,
                padding: '20px 24px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{prob.icon}</div>
                <div style={{
                  fontSize: 22,
                  color: theme.colors.text,
                  fontWeight: 600,
                }}>
                  {prob.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrow separator */}
        <div style={{
          opacity: arrowOpacity,
          textAlign: 'center',
          fontSize: 36,
          color: theme.colors.secondary,
          marginBottom: 20,
        }}>
          ↓ الحلول ↓
        </div>

        {/* Solutions row */}
        <div style={{
          ...commonStyles.rtlText,
          opacity: solLabelOpacity,
          fontSize: 24,
          color: theme.colors.success,
          fontWeight: 700,
          marginBottom: 14,
        }}>
          ✅ الحلول
        </div>
        <div style={{
          display: 'flex',
          gap: 20,
        }}>
          {solutions.map((sol, i) => {
            const cardDelay = 170 + i * 20;
            const adj = frame - cardDelay;
            const cardOpacity = interpolate(adj, [0, 18], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const cardY = interpolate(adj, [0, 18], [25, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.ease),
            });

            return (
              <div key={i} style={{
                ...commonStyles.rtlText,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                flex: 1,
                backgroundColor: '#f0fff4',
                border: '2px solid #c6f6d5',
                borderRadius: 14,
                padding: '20px 24px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{sol.icon}</div>
                <div style={{
                  fontSize: 22,
                  color: theme.colors.text,
                  fontWeight: 600,
                }}>
                  {sol.text}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={3570} />
    </AbsoluteFill>
  );
};
