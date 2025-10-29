import React from 'react';
import { spacing } from '../../theme/designTokens';

interface ContainerProps {
  maxWidth?: 'narrow' | 'regular' | 'wide' | 'full';
  padding?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'regular',
  padding = true,
  children,
  className = '',
  style = {},
}) => {
  const maxWidthMap = {
    narrow: '680px',    // Article content
    regular: '1280px',  // Standard pages
    wide: '1440px',     // Wide layouts
    full: '100%',       // Full width
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: maxWidthMap[maxWidth],
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: padding ? spacing[4] : 0,
    paddingRight: padding ? spacing[4] : 0,
    width: '100%',
    ...style,
  };

  return (
    <div style={containerStyles} className={className}>
      {children}
    </div>
  );
};
