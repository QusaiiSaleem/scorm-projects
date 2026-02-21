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
 * Scene 7: Why Data Matters
 * Duration: 10 seconds (300 frames)
 *
 * Cascading cards showing data importance in 4 areas:
 * Business, Health, Smart Cities, Scientific Research
 */

const areas = [
  {
    icon: '🏢',
    title: 'الأعمال',
    text: 'أمازون تقدّم توصيات من بيانات مشترياتك',
    color: '#2b6cb0',
  },
  {
    icon: '🏥',
    title: 'الصحة',
    text: 'الساعات الذكية تتابع نبضات القلب',
    color: '#38a169',
  },
  {
    icon: '🏙️',
    title: 'المدن الذكية',
    text: 'إدارة المرور وتقليل الازدحام',
    color: '#ed8936',
  },
  {
    icon: '🔬',
    title: 'البحث العلمي',
    text: 'تحليل الجينات لاكتشاف أمراض جديدة',
    color: '#805ad5',
  },
];

export const S07_WhyDataMatters: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Background variant="light" />

      <AbsoluteFill style={{
        ...commonStyles.slide,
        fontFamily,
        padding: '60px 120px',
      }}>
        <SlideTitle text="لماذا البيانات مهمة؟" delay={5} />

        {/* 2x2 grid of area cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginTop: 20,
          flex: 1,
          alignContent: 'center',
        }}>
          {areas.map((area, index) => (
            <AnimatedCard
              key={index}
              delay={35 + index * 30}
              borderColor={area.color}
              bgColor={theme.colors.white}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 10,
              }}>
                <span style={{ fontSize: 36 }}>{area.icon}</span>
                <span style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: area.color,
                }}>
                  {area.title}
                </span>
              </div>
              <div style={{
                fontSize: 24,
                color: theme.colors.text,
                lineHeight: 1.5,
              }}>
                {area.text}
              </div>
            </AnimatedCard>
          ))}
        </div>
      </AbsoluteFill>

      <FadeTransition type="in" duration={15} />
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={1620} />
    </AbsoluteFill>
  );
};
