// Design Tokens - BBC News Inspired
export const colors = {
  // Brand Colors
  brand: {
    red: '#C4161C',
    redHover: '#A01317',
    redLight: '#E63946',
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9F9F9',
    gray100: '#F5F5F5',
    gray200: '#E0E0E0',
    gray300: '#CCCCCC',
    gray400: '#999999',
    gray500: '#767676',
    gray600: '#5A5A5A',
    gray700: '#3A3A3A',
    gray800: '#2A2A2A',
    gray900: '#1A1A1A',
  },
  
  // Text Colors
  text: {
    primary: '#141414',
    secondary: '#5A5A5A',
    tertiary: '#767676',
    inverse: '#FFFFFF',
    link: '#1976D2',
    linkHover: '#1565C0',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#E0E0E0',
    dark: '#1A1A1A',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  
  // Category Colors
  category: {
    politics: '#0066CC',
    technology: '#7B1FA2',
    sports: '#388E3C',
    business: '#D84315',
    culture: '#C2185B',
    health: '#00897B',
    science: '#5E35B1',
    world: '#E64A19',
  },
  
  // Status Colors
  status: {
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#D32F2F',
    info: '#1976D2',
  },
  
  // Border Colors
  border: {
    light: '#E6E6E6',
    medium: '#CCCCCC',
    dark: '#999999',
    focus: '#1976D2',
  },
};

export const typography = {
  fontFamily: {
    primary: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    secondary: "'Georgia', 'Times New Roman', serif",
    mono: "'Courier New', monospace",
  },
  
  fontSize: {
    xs: '12px',      // Captions, small labels
    sm: '14px',      // Small text, metadata
    base: '16px',    // Body text
    lg: '18px',      // Large body text
    xl: '20px',      // Small headings
    '2xl': '24px',   // Card titles
    '3xl': '28px',   // Section headings
    '4xl': '32px',   // Page headings
    '5xl': '40px',   // Large headings
    '6xl': '48px',   // Hero headings
    '7xl': '56px',   // Display headings
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.6,
    relaxed: 1.7,
    loose: 1.8,
  },
  
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
};

export const spacing = {
  // 4px base unit
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
};

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
};

export const borderRadius = {
  none: '0',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
