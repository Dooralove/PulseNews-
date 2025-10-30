import React from 'react';
import { Box, styled, keyframes } from '@mui/material';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | false;
  sx?: any;
}

const StyledSkeleton = styled(Box)<SkeletonProps>(({ theme, variant, animation }) => ({
  backgroundColor: '#e0e0e0',
  borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px',
  ...(animation === 'wave' && {
    background: 'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
    backgroundSize: '1000px 100%',
    animation: `${shimmer} 1.5s ease-in-out infinite`,
  }),
  ...(animation === 'pulse' && {
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': {
      '0%, 100%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.4,
      },
    },
  }),
}));

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  animation = 'wave',
  sx = {},
}) => {
  const defaultHeight = variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '200px';

  return (
    <StyledSkeleton
      variant={variant}
      animation={animation}
      sx={{
        width,
        height: height || defaultHeight,
        ...sx,
      }}
    />
  );
};

// Skeleton for News Cards
export const NewsCardSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Image skeleton */}
      <Skeleton variant="rectangular" width="100%" height="200px" />
      
      {/* Content skeleton */}
      <Box sx={{ p: 3 }}>
        {/* Category tag */}
        <Skeleton variant="rectangular" width="80px" height="24px" sx={{ mb: 2 }} />
        
        {/* Title */}
        <Skeleton variant="text" width="100%" height="28px" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height="28px" sx={{ mb: 2 }} />
        
        {/* Meta info */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="text" width="80px" height="16px" />
          <Skeleton variant="text" width="60px" height="16px" />
        </Box>
      </Box>
    </Box>
  );
};

// Skeleton for Article List
export const ArticleListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
      {Array.from({ length: count }).map((_, index) => (
        <NewsCardSkeleton key={index} />
      ))}
    </Box>
  );
};

export default Skeleton;
