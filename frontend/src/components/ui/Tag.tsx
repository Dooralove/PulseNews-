import React from 'react';
import { colors, typography, spacing, borderRadius } from '../../theme/designTokens';
import { getCategoryColor } from '../../theme/utils';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'category' | 'outlined';
  color?: string;
  categoryName?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  color,
  categoryName,
  onClick,
  className = '',
  style = {},
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const getColor = () => {
    if (color) return color;
    if (categoryName) return getCategoryColor(categoryName);
    return colors.text.link;
  };
  
  const tagColor = getColor();
  
  const baseStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    padding: `${spacing[1]} ${spacing[2]}`,
    borderRadius: borderRadius.none,
    display: 'inline-block',
    cursor: onClick ? 'pointer' : 'default',
    transition: '150ms ease-in-out',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: tagColor,
      color: colors.neutral.white,
      border: 'none',
    },
    category: {
      backgroundColor: 'transparent',
      color: tagColor,
      border: `1px solid ${tagColor}`,
    },
    outlined: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
      border: `1px solid ${colors.border.medium}`,
    },
  };

  const hoverStyles: React.CSSProperties = onClick ? {
    opacity: 0.8,
    transform: 'translateY(-1px)',
  } : {};

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...(isHovered ? hoverStyles : {}),
    ...style,
  };

  return (
    <span
      style={combinedStyles}
      onClick={onClick}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </span>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  style = {},
}) => {
  const colorMap = {
    success: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.error,
    info: colors.status.info,
    neutral: colors.neutral.gray500,
  };

  const badgeStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    padding: `${spacing[1]} ${spacing[2]}`,
    borderRadius: borderRadius.full,
    backgroundColor: colorMap[variant],
    color: colors.neutral.white,
    display: 'inline-block',
    ...style,
  };

  return (
    <span style={badgeStyles} className={className}>
      {children}
    </span>
  );
};
