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
 * Scene 13: From Data to AI
 * Duration: 8 seconds (240 frames)
 *
 * Shows a flow diagram: Data -> Patterns -> Knowledge -> Intelligence
 * Plus a closing statement about what's next.
 */

const flowSteps = [
  { text: 'البيانات', icon: '💾', color: '#2b6cb0' },
  { text: 'أنماط', icon: '🔍', color: '#38a169' },
  { text: 'معرفة', icon: '💡', color: '#ed8936' },
  { text: 'ذكاء', icon: '🧠', color: '#805ad5' },
];

export const S13_DataToAI: React.FC = () => {
  const frame = useCurrentFrame();

  // Statement 1
  const stmt1Opacity = interpolate(frame, [130, 155], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Statement 2 (next chapter teaser)
  const stmt2Opacity = interpolate(frame, [170, 195], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stmt2Y = interpolate(frame, [170, 195], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  return (
    <AbsoluteFill>
      <Background variant="light" />

      <AbsoluteFill style={{
        ...commonStyles.slide,
        fontFamily,
        padding: '50px 100px',
      }}>
        <SlideTitle text="من البيانات إلى الذكاء الاصطناعي" delay={5} />

        {/* Flow diagram */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginTop: 50,
          marginBottom: 50,
        }}>
          {flowSteps.map((step, index) => {
            const stepDelay = 30 + index * 25;
            const adj = frame - stepDelay;

            const stepScale = interpolate(adj, [0, 12, 18], [0, 1.08, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const stepOpacity = interpolate(adj, [0, 12], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Arrow between steps
            const arrowOpacity = index < flowSteps.length - 1
              ? interpolate(frame - (stepDelay + 15), [0, 10], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              : 0;

            return (
              <React.Fragment key={index}>
                {/* Step box */}
                <div style={{
                  ...commonStyles.rtlText,
                  textAlign: 'center',
                  opacity: stepOpacity,
                  transform: `scale(${stepScale})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: 20,
                    background: `linear-gradient(135deg, ${step.color}22, ${step.color}44)`,
                    border: `3px solid ${step.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 42,
                  }}>
                    {step.icon}
                  </div>
                  <span style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: step.color,
                  }}>
                    {step.text}
                  </span>
                </div>

                {/* Arrow between steps (reversed for RTL: ← instead of →) */}
                {index < flowSteps.length - 1 && (
                  <div style={{
                    opacity: arrowOpacity,
                    fontSize: 32,
                    color: theme.colors.gray,
                    fontWeight: 700,
                    padding: '0 6px',
                  }}>
                    ←
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Statement 1 */}
        <div style={{
          ...commonStyles.rtlText,
          textAlign: 'center',
          opacity: stmt1Opacity,
          fontSize: 28,
          color: theme.colors.text,
          lineHeight: 1.6,
          marginBottom: 24,
        }}>
          البيانات الضخمة وإنترنت الأشياء توفر الوقود للذكاء الاصطناعي
        </div>

        {/* Next chapter teaser */}
        <div style={{
          ...commonStyles.rtlText,
          textAlign: 'center',
          opacity: stmt2Opacity,
          transform: `translateY(${stmt2Y}px)`,
          fontSize: 24,
          color: theme.colors.secondary,
          backgroundColor: theme.colors.lightBlue,
          padding: '14px 32px',
          borderRadius: 12,
          fontWeight: 600,
        }}>
          الفصل القادم: الذكاء الاصطناعي – التاريخ، الأساسيات، والتطور
        </div>
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={3870} />
    </AbsoluteFill>
  );
};
