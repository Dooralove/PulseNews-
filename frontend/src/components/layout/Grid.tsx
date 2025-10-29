import React from 'react';
import { spacing } from '../../theme/designTokens';

interface GridProps {
  columns?: number;
  gap?: keyof typeof spacing;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  columns = 3,
  gap = 6,
  children,
  className = '',
  style = {},
  responsive = true,
}) => {
  const getGridTemplateColumns = () => {
    if (responsive) {
      // Responsive grid that adapts to screen size
      return `repeat(auto-fill, minmax(min(100%, ${300}px), 1fr))`;
    }
    return `repeat(${columns}, 1fr)`;
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getGridTemplateColumns(),
    gap: spacing[gap],
    ...style,
  };

  return (
    <div style={gridStyles} className={className}>
      {children}
    </div>
  );
};

interface GridItemProps {
  span?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const GridItem: React.FC<GridItemProps> = ({
  span = 1,
  children,
  className = '',
  style = {},
}) => {
  const itemStyles: React.CSSProperties = {
    gridColumn: `span ${span}`,
    ...style,
  };

  return (
    <div style={itemStyles} className={className}>
      {children}
    </div>
  );
};
