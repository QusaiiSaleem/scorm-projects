import React from 'react';
import { theme, commonStyles } from '../styles';

/**
 * Najran University branding component.
 * Shows the university name in Arabic with a styled badge.
 * Uses CSS-only design (no external images needed).
 *
 * Props:
 * - variant: 'light' (for dark backgrounds) or 'dark' (for light backgrounds)
 * - size: 'small' or 'normal'
 */
interface NajranLogoProps {
  variant?: 'light' | 'dark';
  size?: 'small' | 'normal';
}

export const NajranLogo: React.FC<NajranLogoProps> = ({
  variant = 'dark',
  size = 'normal',
}) => {
  const isSmall = size === 'small';
  const textColor = variant === 'light' ? theme.colors.white : theme.colors.primary;

  return (
    <div style={{
      ...commonStyles.rtlText,
      display: 'flex',
      alignItems: 'center',
      gap: isSmall ? 10 : 16,
    }}>
      {/* Decorative university badge - a hexagonal shape with initials */}
      <div style={{
        width: isSmall ? 36 : 52,
        height: isSmall ? 36 : 52,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.white,
        fontSize: isSmall ? 14 : 20,
        fontWeight: 800,
        fontFamily: theme.fonts.arabic,
        boxShadow: '0 2px 8px rgba(26, 54, 93, 0.3)',
      }}>
        ن
      </div>
      {/* University name */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <span style={{
          fontSize: isSmall ? 16 : 22,
          fontWeight: 700,
          color: textColor,
        }}>
          جامعة نجران
        </span>
        <span style={{
          fontSize: isSmall ? 11 : 14,
          color: variant === 'light' ? 'rgba(255,255,255,0.7)' : theme.colors.gray,
        }}>
          كلية علوم الحاسب ونظم المعلومات
        </span>
      </div>
    </div>
  );
};
