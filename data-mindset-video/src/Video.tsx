import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';

// Import all scenes
import { S01_Intro } from './scenes/S01_Intro';
import { S02_TableOfContents } from './scenes/S02_TableOfContents';
import { S03_Introduction } from './scenes/S03_Introduction';
import { S04_WhatIsDataMindset } from './scenes/S04_WhatIsDataMindset';
import { S05_BigData3V } from './scenes/S05_BigData3V';
import { S06_BigDataDetails } from './scenes/S06_BigDataDetails';
import { S07_WhyDataMatters } from './scenes/S07_WhyDataMatters';
import { S08_DataQuality } from './scenes/S08_DataQuality';
import { S09_DataQualityDetails } from './scenes/S09_DataQualityDetails';
import { S10_DataCommunication } from './scenes/S10_DataCommunication';
import { S11_IoTAnd5G } from './scenes/S11_IoTAnd5G';
import { S12_PrivacyEthics } from './scenes/S12_PrivacyEthics';
import { S13_DataToAI } from './scenes/S13_DataToAI';
import { S14_Outro } from './scenes/S14_Outro';

/**
 * Main Video composition.
 *
 * This wires all 14 scenes together using Remotion's Sequence component.
 * Each Sequence defines when (from) a scene starts and how long (durationInFrames) it runs.
 *
 * Scene timing (at 30fps):
 *   S01: 0-150     (5s)   Intro
 *   S02: 150-390   (8s)   Table of Contents
 *   S03: 390-630   (8s)   Introduction
 *   S04: 630-870   (8s)   What is Data Mindset?
 *   S05: 870-1170  (10s)  Big Data 3V
 *   S06: 1170-1620 (15s)  Big Data Details
 *   S07: 1620-1920 (10s)  Why Data Matters
 *   S08: 1920-2160 (8s)   Data Quality
 *   S09: 2160-2760 (20s)  Data Quality Details
 *   S10: 2760-3120 (12s)  Data Communication
 *   S11: 3120-3570 (15s)  IoT & 5G
 *   S12: 3570-3870 (10s)  Privacy & Ethics
 *   S13: 3870-4110 (8s)   Data to AI
 *   S14: 4110-4260 (5s)   Outro
 *
 * Total: 4260 frames = 2 minutes 22 seconds at 30fps
 */
export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#f7fafc' }}>
      {/* Scene 1: Course title intro */}
      <Sequence from={0} durationInFrames={150} name="S01-Intro">
        <S01_Intro />
      </Sequence>

      {/* Scene 2: Chapter contents */}
      <Sequence from={150} durationInFrames={240} name="S02-TableOfContents">
        <S02_TableOfContents />
      </Sequence>

      {/* Scene 3: What are data? */}
      <Sequence from={390} durationInFrames={240} name="S03-Introduction">
        <S03_Introduction />
      </Sequence>

      {/* Scene 4: Data mindset definition */}
      <Sequence from={630} durationInFrames={240} name="S04-WhatIsDataMindset">
        <S04_WhatIsDataMindset />
      </Sequence>

      {/* Scene 5: Big Data 3V overview */}
      <Sequence from={870} durationInFrames={300} name="S05-BigData3V">
        <S05_BigData3V />
      </Sequence>

      {/* Scene 6: Big Data details (Volume, Velocity, Variety) */}
      <Sequence from={1170} durationInFrames={450} name="S06-BigDataDetails">
        <S06_BigDataDetails />
      </Sequence>

      {/* Scene 7: Why data matters in different fields */}
      <Sequence from={1620} durationInFrames={300} name="S07-WhyDataMatters">
        <S07_WhyDataMatters />
      </Sequence>

      {/* Scene 8: Data quality overview */}
      <Sequence from={1920} durationInFrames={240} name="S08-DataQuality">
        <S08_DataQuality />
      </Sequence>

      {/* Scene 9: Data quality 4 dimensions in detail */}
      <Sequence from={2160} durationInFrames={600} name="S09-DataQualityDetails">
        <S09_DataQualityDetails />
      </Sequence>

      {/* Scene 10: Data communication methods */}
      <Sequence from={2760} durationInFrames={360} name="S10-DataCommunication">
        <S10_DataCommunication />
      </Sequence>

      {/* Scene 11: IoT & 5G examples */}
      <Sequence from={3120} durationInFrames={450} name="S11-IoTAnd5G">
        <S11_IoTAnd5G />
      </Sequence>

      {/* Scene 12: Privacy & ethics */}
      <Sequence from={3570} durationInFrames={300} name="S12-PrivacyEthics">
        <S12_PrivacyEthics />
      </Sequence>

      {/* Scene 13: Data to AI pipeline */}
      <Sequence from={3870} durationInFrames={240} name="S13-DataToAI">
        <S13_DataToAI />
      </Sequence>

      {/* Scene 14: Outro with summary */}
      <Sequence from={4110} durationInFrames={150} name="S14-Outro">
        <S14_Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
