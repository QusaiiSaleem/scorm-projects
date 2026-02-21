import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Cairo';
import { theme, commonStyles } from '../styles';
import { Background } from '../components/Background';
import { SlideTitle } from '../components/SlideTitle';
import { AnimatedCard } from '../components/AnimatedCard';
import { FadeTransition } from '../components/FadeTransition';
import { ProgressBar } from '../components/ProgressBar';

const { fontFamily } = loadFont();

/**
 * Scene 4: What is Data Mindset?
 * Duration: 8 seconds (240 frames)
 *
 * Shows 4 animated cards, each appearing one by one with an icon and description.
 */

const mindsetCards = [
  { icon: '📊', text: 'أسلوب للتعامل مع المشكلات والفرص باستخدام البيانات' },
  { icon: '🗄️', text: 'التعرّف على البيانات في كل مكان' },
  { icon: '📈', text: 'استخدام البيانات للتعلم وتحسين القرارات' },
  { icon: '👁️', text: 'مشاركة النتائج بوضوح مع الآخرين' },
];

export const S04_WhatIsDataMindset: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Background variant="light" />

      <AbsoluteFill style={{
        ...commonStyles.slide,
        fontFamily,
        padding: '60px 120px',
      }}>
        <SlideTitle text="ما هي عقلية البيانات؟" delay={5} />

        {/* 2x2 grid of cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginTop: 20,
          flex: 1,
          alignContent: 'center',
        }}>
          {mindsetCards.map((card, index) => (
            <AnimatedCard
              key={index}
              delay={30 + index * 25}
              icon={card.icon}
              borderColor={index % 2 === 0 ? theme.colors.accent : theme.colors.secondary}
            >
              <div style={{
                fontSize: 26,
                color: theme.colors.text,
                lineHeight: 1.6,
                fontWeight: 500,
              }}>
                {card.text}
              </div>
            </AnimatedCard>
          ))}
        </div>
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={630} />
    </AbsoluteFill>
  );
};
