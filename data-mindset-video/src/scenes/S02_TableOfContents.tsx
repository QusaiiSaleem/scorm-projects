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
 * Scene 2: Table of Contents
 * Duration: 8 seconds (240 frames at 30fps)
 *
 * Shows chapter contents as a numbered list, each item sliding in from the right.
 */

// Table of contents items
const tocItems = [
  'مقدمة عن عقلية البيانات',
  'البيانات الضخمة وخصائصها',
  'أهمية البيانات في مختلف المجالات',
  'جودة البيانات',
  'التواصل باستخدام البيانات',
  'أمثلة عملية: إنترنت الأشياء والجيل الخامس',
  'قضايا الخصوصية والأخلاقيات',
  'الخاتمة',
];

export const S02_TableOfContents: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Background variant="light" />

      <AbsoluteFill style={{
        ...commonStyles.slide,
        fontFamily,
        padding: '60px 120px',
      }}>
        {/* Scene title */}
        <SlideTitle text="محتويات الفصل الثالث" delay={10} />

        {/* List of chapter items, numbered, revealed one by one */}
        <div style={{ marginTop: 20, flex: 1 }}>
          <AnimatedList
            items={tocItems}
            delay={40}
            stagger={15}
            numbered={true}
            fontSize={30}
          />
        </div>
      </AbsoluteFill>

      {/* Fade in */}
      <FadeTransition type="in" duration={15} />

      {/* Progress bar */}
      <ProgressBar totalFrames={theme.totalFrames} currentSceneStart={150} />
    </AbsoluteFill>
  );
};
