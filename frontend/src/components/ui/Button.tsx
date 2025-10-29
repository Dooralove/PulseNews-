import React from 'react';
import { colors, typography, spacing, transitions, borderRadius } from '../../theme/designTokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  type = 'button',
  style = {},
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.semibold,
    borderRadius: borderRadius.none,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: transitions.base,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    textDecoration: 'none',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      fontSize: typography.fontSize.sm,
      padding: `${spacing[2]} ${spacing[4]}`,
      height: '32px',
    },
    medium: {
      fontSize: typography.fontSize.base,
      padding: `${spacing[3]} ${spacing[6]}`,
      height: '40px',
    },
    large: {
      fontSize: typography.fontSize.lg,
      padding: `${spacing[4]} ${spacing[8]}`,
      height: '48px',
    },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.brand.red,
      color: colors.text.inverse,
    },
    secondary: {
      backgroundColor: colors.neutral.white,
      color: colors.text.primary,
      border: `1px solid ${colors.border.medium}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
    },
    link: {
      backgroundColor: 'transparent',
      color: colors.text.link,
      textDecoration: 'underline',
      padding: 0,
      height: 'auto',
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: colors.brand.redHover },
    secondary: { backgroundColor: colors.neutral.gray50 },
    ghost: { backgroundColor: colors.neutral.gray50 },
    link: { color: colors.text.linkHover },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled ? hoverStyles[variant] : {}),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={combinedStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};
