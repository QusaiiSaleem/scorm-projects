/**
 * Theme configuration for the Data Mindset video.
 * Colors based on Najran University branding (navy + orange).
 */
export const theme = {
  colors: {
    primary: '#1a365d',      // Dark navy - main brand color
    secondary: '#2b6cb0',    // Medium blue - secondary elements
    accent: '#ed8936',       // Orange - Najran University accent
    background: '#f7fafc',   // Light gray - slide backgrounds
    darkBg: '#1a202c',       // Near black - dark sections
    text: '#1a202c',         // Primary text color
    white: '#ffffff',
    lightBlue: '#ebf8ff',    // Tinted backgrounds
    lightOrange: '#feebc8',  // Accent-tinted backgrounds
    gray: '#718096',         // Muted text
    lightGray: '#e2e8f0',   // Borders, dividers
    success: '#38a169',      // Green for positive items
    danger: '#e53e3e',       // Red for negative items
  },
  fonts: {
    arabic: 'Cairo, sans-serif',
  },
  // Total frames for the entire video (4260 frames = ~2min 22sec at 30fps)
  totalFrames: 4260,
};

/**
 * Common style objects reused across components.
 * All text uses RTL direction for Arabic.
 */
export const commonStyles = {
  // Base RTL text style applied to all Arabic text
  rtlText: {
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    fontFamily: theme.fonts.arabic,
  },
  // Full-screen slide container
  slide: {
    direction: 'rtl' as const,
    fontFamily: theme.fonts.arabic,
    backgroundColor: theme.colors.background,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
  },
  // Centered content area with padding
  contentArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: '60px 100px',
    flex: 1,
  },
};
