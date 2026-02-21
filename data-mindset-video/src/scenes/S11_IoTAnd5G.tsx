import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Cairo';
import { theme, commonStyles } from '../styles';
import { Background } from '../components/Background';
import { SlideTitle } from '../components/SlideTitle';
import { AnimatedList } from '../components/AnimatedList';
import { FadeTransition } from '../components/FadeTransition';
import { ProgressBar } from '../components/ProgressBar';

const { fontFamily } = loadFont();

/**
 * Scene 11: IoT & 5G
 * Duration: 15 seconds (450 frames)
 *
 * Two halves:
 * - First 8 seconds (240 frames): IoT explanation with icons in a circle
 * - Last 7 seconds (210 frames): 5G benefits list
 */

const iotDevices = [
  { icon: '🧊', label: 'الثلاجات الذكية' },
  { icon: '⌚', label: 'الساعات الذكية' },
  { icon: '🏠', label: 'المنازل الذكية' },
  { icon: '🚗', label: 'السيارات المتصلة' },
  { icon: '📱', label: 'الأجهزة المحمولة' },
  { icon: '💡', label: 'الإضاءة الذكية' },
];

const fiveGBenefits = [
  'سرعات إنترنت أعلى',
  'يربط عددًا أكبر من الأجهزة',
  'يمكّن السيارات ذاتية القيادة',
  'يدعم المدن الذكية',
];

export const S11_IoTAnd5G: React.FC = () => {
  const frame = useCurrentFrame();
  const iotDuration = 240; // 8 seconds
  const isIoT = frame < iotDuration;

  // --- IoT Section ---
  const iotOpacity = interpolate(frame, [0, 15, 210, 240], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const iotTitleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const iotDescOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- 5G Section ---
  const fiveGFrame = frame - iotDuration;
  const fiveGOpacity = interpolate(fiveGFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background variant="light" />

      {/* IoT Section */}
      {frame < iotDuration + 10 && (
        <AbsoluteFill style={{
          ...commonStyles.slide,
          fontFamily,
          padding: '50px 100px',
          opacity: iotOpacity,
        }}>
          {/* IoT Title */}
          <div style={{
            ...commonStyles.rtlText,
            opacity: iotTitleOpacity,
            marginBottom: 16,
          }}>
            <h1 style={{
              fontSize: 48,
              fontWeight: 800,
              color: theme.colors.primary,
              margin: 0,
            }}>
              إنترنت الأشياء
            </h1>
            <div style={{
              width: 100,
              height: 4,
              backgroundColor: theme.colors.accent,
              borderRadius: 2,
              marginTop: 10,
            }} />
          </div>

          {/* Description */}
          <div style={{
            ...commonStyles.rtlText,
            opacity: iotDescOpacity,
            fontSize: 28,
            color: theme.colors.gray,
            marginBottom: 40,
          }}>
            الأجهزة اليومية المتصلة بالإنترنت
          </div>

          {/* IoT Devices in a circular arrangement */}
          <div style={{
            position: 'relative',
            width: 500,
            height: 400,
            alignSelf: 'center',
          }}>
            {/* Center hub */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              color: theme.colors.white,
              fontWeight: 800,
              boxShadow: '0 4px 20px rgba(43, 108, 176, 0.3)',
              opacity: interpolate(frame, [60, 80], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}>
              IoT
            </div>

            {/* Device nodes in a circle */}
            {iotDevices.map((device, index) => {
              const angle = (index / iotDevices.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 175;
              const cx = 250 + Math.cos(angle) * radius;
              const cy = 200 + Math.sin(angle) * radius;

              const nodeDelay = 80 + index * 15;
              const adj = frame - nodeDelay;
              const nodeScale = interpolate(adj, [0, 12, 18], [0, 1.08, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const nodeOpacity = interpolate(adj, [0, 12], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });

              return (
                <div key={index} style={{
                  position: 'absolute',
                  left: cx - 55,
                  top: cy - 40,
                  opacity: nodeOpacity,
                  transform: `scale(${nodeScale})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: theme.colors.white,
                    border: `3px solid ${theme.colors.secondary}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  }}>
                    {device.icon}
                  </div>
                  <span style={{
                    ...commonStyles.rtlText,
                    fontSize: 14,
                    color: theme.colors.text,
                    fontWeight: 600,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}>
                    {device.label}
                  </span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* 5G Section */}
      {frame >= iotDuration - 10 && (
        <AbsoluteFill style={{
          ...commonStyles.slide,
          fontFamily,
          padding: '50px 120px',
          opacity: fiveGOpacity,
        }}>
          {/* 5G Title */}
          <div style={{
            ...commonStyles.rtlText,
            marginBottom: 30,
          }}>
            <h1 style={{
              fontSize: 48,
              fontWeight: 800,
              color: theme.colors.accent,
              margin: 0,
            }}>
              الجيل الخامس 5G
            </h1>
            <div style={{
              width: 100,
              height: 4,
              backgroundColor: theme.colors.accent,
              borderRadius: 2,
              marginTop: 10,
            }} />
          </div>

          {/* Benefits list */}
          <div style={{ marginTop: 10 }}>
            <AnimatedList
              items={fiveGBenefits}
              delay={Math.max(0, fiveGFrame - 10)}
              stagger={18}
              fontSize={32}
            />
          </div>

          {/* Signal strength icon animation */}
          <div style={{
            alignSelf: 'center',
            marginTop: 50,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
          }}>
            {[30, 50, 70, 90, 110].map((height, i) => {
              const barDelay = iotDuration + 80 + i * 8;
              const barOpacity = interpolate(frame - barDelay, [0, 12], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const barHeight = interpolate(frame - barDelay, [0, 15], [0, height], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.ease),
              });

              return (
                <div key={i} style={{
                  opacity: barOpacity,
                  width: 24,
                  height: barHeight,
                  backgroundColor: theme.colors.accent,
                  borderRadius: 6,
                }} />
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={3120} />
    </AbsoluteFill>
  );
};
