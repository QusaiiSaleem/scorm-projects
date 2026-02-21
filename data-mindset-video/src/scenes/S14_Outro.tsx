import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Cairo';
import { theme, commonStyles } from '../styles';
import { Background } from '../components/Background';
import { NajranLogo } from '../components/NajranLogo';
import { FadeTransition } from '../components/FadeTransition';
import { ProgressBar } from '../components/ProgressBar';

const { fontFamily } = loadFont();

/**
 * Scene 14: Outro
 * Duration: 5 seconds (150 frames)
 *
 * Summary cards with key takeaways, then fade to brand bar.
 */

const summaryCards = [
  { text: 'عقلية البيانات = التفكير + التعلم + التواصل', icon: '🧠' },
  { text: 'البيانات موجودة في كل مكان', icon: '🌍' },
  { text: 'الدرس القادم: الذكاء الاصطناعي', icon: '🤖' },
];

export const S14_Outro: React.FC = () => {
  const frame = useCurrentFrame();

  // Brand bar at bottom
  const brandOpacity = interpolate(frame, [80, 105], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const brandY = interpolate(frame, [80, 105], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  // Fade to black at end
  const endFade = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background variant="dark" />

      <AbsoluteFill style={{
        ...commonStyles.rtlText,
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 120px',
        gap: 24,
      }}>
        {/* Summary cards */}
        {summaryCards.map((card, index) => {
          const cardDelay = 10 + index * 18;
          const adj = frame - cardDelay;

          const cardOpacity = interpolate(adj, [0, 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const cardX = interpolate(adj, [0, 18], [50, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.ease),
          });

          return (
            <div key={index} style={{
              opacity: cardOpacity,
              transform: `translateX(${cardX}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              padding: '20px 32px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              width: '100%',
              maxWidth: 800,
            }}>
              <span style={{ fontSize: 36 }}>{card.icon}</span>
              <span style={{
                fontSize: 28,
                color: theme.colors.white,
                fontWeight: 600,
                lineHeight: 1.5,
              }}>
                {card.text}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Bottom brand bar */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: brandOpacity,
        transform: `translateY(${brandY}px)`,
      }}>
        <NajranLogo variant="light" size="small" />
      </div>

      {/* Fade in at start */}
      <FadeTransition type="in" duration={15} />

      {/* Fade to black at end */}
      <AbsoluteFill style={{
        backgroundColor: 'black',
        opacity: endFade,
        zIndex: 100,
      }} />

      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={5250} />
    </AbsoluteFill>
  );
};
