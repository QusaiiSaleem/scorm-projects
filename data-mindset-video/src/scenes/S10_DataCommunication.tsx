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
 * Scene 10: Data Communication
 * Duration: 12 seconds (360 frames)
 *
 * Shows the goal of data communication, methods,
 * a good vs bad comparison, and a takeaway message.
 */

const methods = ['الرسوم البيانية', 'المخططات', 'الإنفوجرافيك', 'لوحات المعلومات'];

export const S10_DataCommunication: React.FC = () => {
  const frame = useCurrentFrame();

  // Goal text
  const goalOpacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Good vs bad comparison
  const compOpacity = interpolate(frame, [140, 170], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Takeaway
  const takeawayOpacity = interpolate(frame, [250, 280], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const takeawayScale = interpolate(frame, [250, 275, 285], [0.9, 1.03, 1], {
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
        <SlideTitle text="التواصل باستخدام البيانات" delay={5} />

        {/* Goal */}
        <div style={{
          ...commonStyles.rtlText,
          opacity: goalOpacity,
          fontSize: 30,
          color: theme.colors.text,
          marginBottom: 30,
          lineHeight: 1.6,
        }}>
          الهدف: جعل البيانات مفهومة
        </div>

        {/* Methods tags */}
        <div style={{
          display: 'flex',
          gap: 18,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          marginBottom: 36,
        }}>
          {methods.map((method, i) => {
            const tagDelay = 60 + i * 15;
            const tagOpacity = interpolate(frame - tagDelay, [0, 18], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const tagY = interpolate(frame - tagDelay, [0, 18], [15, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div key={i} style={{
                ...commonStyles.rtlText,
                opacity: tagOpacity,
                transform: `translateY(${tagY}px)`,
                background: `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.primary})`,
                color: theme.colors.white,
                padding: '12px 28px',
                borderRadius: 30,
                fontSize: 24,
                fontWeight: 600,
              }}>
                {method}
              </div>
            );
          })}
        </div>

        {/* Good vs Bad comparison */}
        <div style={{
          opacity: compOpacity,
          display: 'flex',
          gap: 24,
          width: '100%',
          marginBottom: 30,
        }}>
          {/* Bad */}
          <div style={{
            ...commonStyles.rtlText,
            flex: 1,
            backgroundColor: '#fff5f5',
            border: `2px solid ${theme.colors.danger}`,
            borderRadius: 16,
            padding: '24px 28px',
          }}>
            <div style={{
              fontSize: 20,
              color: theme.colors.danger,
              fontWeight: 700,
              marginBottom: 8,
            }}>
              ❌ سيء
            </div>
            <div style={{
              fontSize: 24,
              color: theme.colors.text,
            }}>
              جداول كبيرة
            </div>
          </div>

          {/* Good */}
          <div style={{
            ...commonStyles.rtlText,
            flex: 1,
            backgroundColor: '#f0fff4',
            border: `2px solid ${theme.colors.success}`,
            borderRadius: 16,
            padding: '24px 28px',
          }}>
            <div style={{
              fontSize: 20,
              color: theme.colors.success,
              fontWeight: 700,
              marginBottom: 8,
            }}>
              ✅ جيد
            </div>
            <div style={{
              fontSize: 24,
              color: theme.colors.text,
            }}>
              مخطط بسيط يوضح الاتجاه
            </div>
          </div>
        </div>

        {/* Takeaway */}
        <div style={{
          ...commonStyles.rtlText,
          textAlign: 'center',
          opacity: takeawayOpacity,
          transform: `scale(${takeawayScale})`,
          fontSize: 28,
          fontWeight: 700,
          color: theme.colors.accent,
          backgroundColor: theme.colors.lightOrange,
          padding: '16px 36px',
          borderRadius: 14,
        }}>
          كلما كان العرض أبسط كان أوضح
        </div>
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={2760} />
    </AbsoluteFill>
  );
};
