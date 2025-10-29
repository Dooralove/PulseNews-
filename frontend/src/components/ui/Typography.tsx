import React from 'react';
import { typography, colors } from '../../theme/designTokens';

interface HeadlineProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'inverse';
  style?: React.CSSProperties;
}

export const Headline: React.FC<HeadlineProps> = ({ 
  level, 
  children, 
  className = '',
  color = 'primary',
  style = {} 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const colorMap = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    inverse: colors.text.inverse,
  };
  
  const sizeMap = {
    1: typography.fontSize['6xl'],
    2: typography.fontSize['4xl'],
    3: typography.fontSize['2xl'],
    4: typography.fontSize.xl,
    5: typography.fontSize.lg,
    6: typography.fontSize.base,
  };
  
  const weightMap = {
    1: typography.fontWeight.bold,
    2: typography.fontWeight.bold,
    3: typography.fontWeight.semibold,
    4: typography.fontWeight.semibold,
    5: typography.fontWeight.medium,
    6: typography.fontWeight.medium,
  };
  
  const lineHeightMap = {
    1: typography.lineHeight.tight,
    2: typography.lineHeight.tight,
    3: typography.lineHeight.snug,
    4: typography.lineHeight.snug,
    5: typography.lineHeight.normal,
    6: typography.lineHeight.normal,
  };
  
  const combinedStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontSize: sizeMap[level],
    fontWeight: weightMap[level],
    lineHeight: lineHeightMap[level],
    color: colorMap[color],
    margin: 0,
    ...style,
  };
  
  return (
    <Tag style={combinedStyles} className={className}>
      {children}
    </Tag>
  );
};

interface BodyTextProps {
  variant?: 'large' | 'regular' | 'small';
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'tertiary';
  style?: React.CSSProperties;
}

export const BodyText: React.FC<BodyTextProps> = ({ 
  variant = 'regular', 
  children, 
  className = '',
  color = 'primary',
  style = {} 
}) => {
  const sizeMap = {
    large: typography.fontSize.lg,
    regular: typography.fontSize.base,
    small: typography.fontSize.sm,
  };
  
  const colorMap = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    tertiary: colors.text.tertiary,
  };
  
  const combinedStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontSize: sizeMap[variant],
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: colorMap[color],
    margin: 0,
    ...style,
  };
  
  return (
    <p style={combinedStyles} className={className}>
      {children}
    </p>
  );
};

interface CaptionProps {
  children: React.ReactNode;
  className?: string;
  uppercase?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary';
  style?: React.CSSProperties;
}

export const Caption: React.FC<CaptionProps> = ({ 
  children, 
  className = '',
  uppercase = false,
  color = 'tertiary',
  style = {} 
}) => {
  const colorMap = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    tertiary: colors.text.tertiary,
  };
  
  const combinedStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colorMap[color],
    textTransform: uppercase ? 'uppercase' : 'none',
    letterSpacing: uppercase ? typography.letterSpacing.wide : typography.letterSpacing.normal,
    margin: 0,
    ...style,
  };
  
  return (
    <span style={combinedStyles} className={className}>
      {children}
    </span>
  );
};

interface LinkTextProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const LinkText: React.FC<LinkTextProps> = ({ 
  children, 
  href,
  onClick,
  className = '',
  style = {} 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const linkStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base,
    color: isHovered ? colors.text.linkHover : colors.text.link,
    textDecoration: isHovered ? 'underline' : 'none',
    cursor: 'pointer',
    ...style,
  };
  
  if (href) {
    return (
      <a 
        href={href}
        style={linkStyles}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </a>
    );
  }
  
  return (
    <span 
      onClick={onClick}
      style={linkStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </span>
  );
};
