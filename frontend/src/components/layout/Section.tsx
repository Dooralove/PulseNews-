import React from 'react';
import { colors, spacing } from '../../theme/designTokens';

interface SectionProps {
  background?: 'white' | 'gray' | 'dark';
  paddingY?: keyof typeof spacing;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Section: React.FC<SectionProps> = ({
  background = 'white',
  paddingY = 8,
  children,
  className = '',
  style = {},
}) => {
  const backgroundMap = {
    white: colors.background.primary,
    gray: colors.background.secondary,
    dark: colors.background.dark,
  };

  const sectionStyles: React.CSSProperties = {
    backgroundColor: backgroundMap[background],
    paddingTop: spacing[paddingY],
    paddingBottom: spacing[paddingY],
    ...style,
  };

  return (
    <section style={sectionStyles} className={className}>
      {children}
    </section>
  );
};
