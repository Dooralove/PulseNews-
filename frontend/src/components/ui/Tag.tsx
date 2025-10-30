import React from 'react';
import { motion } from 'framer-motion';
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
    borderRadius: '4px',
    display: 'inline-block',
    cursor: onClick ? 'pointer' : 'default',
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

  const motionProps = onClick ? {
    whileHover: { 
      scale: 1.05,
      y: -2,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
    },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 }
  } : {};

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <motion.span
      style={combinedStyles}
      onClick={onClick}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...motionProps}
    >
      {children}
    </motion.span>
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
