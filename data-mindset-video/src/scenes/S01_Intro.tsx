import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Cairo';
import { theme, commonStyles } from '../styles';
import { Background } from '../components/Background';
import { NajranLogo } from '../components/NajranLogo';
import { FadeTransition } from '../components/FadeTransition';
import { ProgressBar } from '../components/ProgressBar';

// Load Cairo font for Arabic text
const { fontFamily } = loadFont();

/**
 * Scene 1: Course Introduction
 * Duration: 5 seconds (150 frames at 30fps)
 *
 * Shows:
 * - Chapter number "الفصل الثالث"
 * - Full course title
 * - University branding at bottom
 * - Animations: title zooms in, subtitle fades up, bottom bar slides in
 */
export const S01_Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Animation: Chapter label fades + scales in ---
  const chapterOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const chapterScale = interpolate(frame, [10, 30], [0.7, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.5)),
  });

  // --- Animation: Title zooms in from slightly larger ---
  const titleOpacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleScale = interpolate(frame, [30, 55], [1.15, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // --- Animation: Subtitle fades up ---
  const subtitleOpacity = interpolate(frame, [55, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(frame, [55, 80], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  // --- Animation: Bottom brand bar slides up ---
  const barY = interpolate(frame, [70, 100], [80, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const barOpacity = interpolate(frame, [70, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* Dark background for intro */}
      <Background variant="dark" />

      {/* Content */}
      <AbsoluteFill style={{
        ...commonStyles.rtlText,
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Chapter label */}
        <div style={{
          opacity: chapterOpacity,
          transform: `scale(${chapterScale})`,
          fontSize: 28,
          color: theme.colors.accent,
          fontWeight: 700,
          letterSpacing: 2,
          marginBottom: 20,
        }}>
          الفصل الثالث
        </div>

        {/* Main title */}
        <div style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          fontSize: 56,
          fontWeight: 800,
          color: theme.colors.white,
          textAlign: 'center',
          lineHeight: 1.4,
          maxWidth: 1000,
          padding: '0 60px',
        }}>
          عقلية البيانات
        </div>

        {/* Subtitle */}
        <div style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontSize: 32,
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          marginTop: 16,
          maxWidth: 800,
        }}>
          التعلم والتواصل باستخدام البيانات
        </div>

        {/* Accent line under subtitle */}
        <div style={{
          opacity: subtitleOpacity,
          width: interpolate(frame, [65, 90], [0, 200], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 4,
          backgroundColor: theme.colors.accent,
          borderRadius: 2,
          marginTop: 24,
        }} />
      </AbsoluteFill>

      {/* Bottom brand bar */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: barOpacity,
        transform: `translateY(${barY}px)`,
      }}>
        <NajranLogo variant="light" />
      </div>

      {/* Fade in from black at very start */}
      <FadeTransition type="in" duration={15} />

      {/* Progress bar */}
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={0} />
    </AbsoluteFill>
  );
};
