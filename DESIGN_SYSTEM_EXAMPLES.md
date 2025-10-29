# PulseNews Design System - Implementation Examples

## 🎨 Design Tokens Implementation

### 1. Design Tokens File

Create: `frontend/src/lib/designTokens.ts`

```typescript
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
```

---

## 🧩 Component Examples

### 2. Typography Components

Create: `frontend/src/components/ui/Typography.tsx`

```typescript
import React from 'react';
import { typography, colors } from '../../lib/designTokens';

interface HeadlineProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'inverse';
}

export const Headline: React.FC<HeadlineProps> = ({ 
  level, 
  children, 
  className = '',
  color = 'primary' 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const styles: Record<number, React.CSSProperties> = {
    1: {
      fontSize: typography.fontSize['6xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
      color: colors.text[color === 'primary' ? 'primary' : color === 'inverse' ? 'inverse' : 'secondary'],
    },
    2: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
      color: colors.text[color === 'primary' ? 'primary' : color === 'inverse' ? 'inverse' : 'secondary'],
    },
    3: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
      color: colors.text[color === 'primary' ? 'primary' : color === 'inverse' ? 'inverse' : 'secondary'],
    },
    4: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
      color: colors.text[color === 'primary' ? 'primary' : color === 'inverse' ? 'inverse' : 'secondary'],
    },
    5: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
      color: colors.text[color === 'primary' ? 'primary' : color === 'inverse' ? 'inverse' : 'secondary'],
    },
    6: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
      color: colors.text[color === 'primary' ? 'primary' : color === 'inverse' ? 'inverse' : 'secondary'],
    },
  };
  
  return (
    <Tag style={styles[level]} className={className}>
      {children}
    </Tag>
  );
};

interface BodyTextProps {
  variant?: 'large' | 'regular' | 'small';
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'tertiary';
}

export const BodyText: React.FC<BodyTextProps> = ({ 
  variant = 'regular', 
  children, 
  className = '',
  color = 'primary' 
}) => {
  const sizeMap = {
    large: typography.fontSize.lg,
    regular: typography.fontSize.base,
    small: typography.fontSize.sm,
  };
  
  const style: React.CSSProperties = {
    fontSize: sizeMap[variant],
    lineHeight: typography.lineHeight.normal,
    color: colors.text[color],
  };
  
  return (
    <p style={style} className={className}>
      {children}
    </p>
  );
};

interface CaptionProps {
  children: React.ReactNode;
  className?: string;
  uppercase?: boolean;
}

export const Caption: React.FC<CaptionProps> = ({ 
  children, 
  className = '',
  uppercase = false 
}) => {
  const style: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textTransform: uppercase ? 'uppercase' : 'none',
    letterSpacing: uppercase ? typography.letterSpacing.wide : typography.letterSpacing.normal,
  };
  
  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
};
```

---

### 3. Button Component

Create: `frontend/src/components/ui/Button.tsx`

```typescript
import React from 'react';
import { colors, typography, spacing, transitions, borderRadius } from '../../lib/designTokens';

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
}) => {
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
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: colors.brand.redHover },
    secondary: { backgroundColor: colors.neutral.gray50 },
    ghost: { backgroundColor: colors.neutral.gray50 },
    link: { color: colors.text.linkHover },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled ? hoverStyles[variant] : {}),
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
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
```

---

### 4. NewsCard Component

Create: `frontend/src/components/news/NewsCardLarge.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Article } from '../../types';
import { colors, spacing, typography, transitions } from '../../lib/designTokens';
import { Headline, BodyText, Caption } from '../ui/Typography';

interface NewsCardLargeProps {
  article: Article;
}

export const NewsCardLarge: React.FC<NewsCardLargeProps> = ({ article }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  const cardStyles: React.CSSProperties = {
    cursor: 'pointer',
    transition: transitions.base,
    backgroundColor: colors.background.primary,
  };

  const imageContainerStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    overflow: 'hidden',
    backgroundColor: colors.neutral.gray100,
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: transitions.base,
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  const contentStyles: React.CSSProperties = {
    padding: `${spacing[4]} 0`,
  };

  const categoryBadgeStyles: React.CSSProperties = {
    display: 'inline-block',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    color: colors.text.link,
    marginBottom: spacing[2],
  };

  const titleStyles: React.CSSProperties = {
    marginBottom: spacing[2],
    textDecoration: isHovered ? 'underline' : 'none',
    transition: transitions.fast,
  };

  const excerptStyles: React.CSSProperties = {
    marginBottom: spacing[3],
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const metaStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    alignItems: 'center',
  };

  return (
    <article
      style={cardStyles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {article.cover_image && (
        <div style={imageContainerStyles}>
          <img
            src={article.cover_image}
            alt={article.title}
            style={imageStyles}
          />
        </div>
      )}
      
      <div style={contentStyles}>
        {article.category && (
          <div style={categoryBadgeStyles}>
            {article.category.name}
          </div>
        )}
        
        <div style={titleStyles}>
          <Headline level={3}>{article.title}</Headline>
        </div>
        
        <div style={excerptStyles}>
          <BodyText color="secondary">{article.excerpt}</BodyText>
        </div>
        
        <div style={metaStyles}>
          <Caption>
            {article.published_at &&
              format(new Date(article.published_at), 'd MMMM yyyy', { locale: ru })}
          </Caption>
          {article.author && (
            <>
              <Caption>•</Caption>
              <Caption>{article.author.full_name || article.author.username}</Caption>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
```

---

### 5. Grid Layout Component

Create: `frontend/src/components/layout/Grid.tsx`

```typescript
import React from 'react';
import { spacing } from '../../lib/designTokens';

interface GridProps {
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  gap?: keyof typeof spacing;
  children: React.ReactNode;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  columns = 3,
  gap = 6,
  children,
  className = '',
}) => {
  const getGridTemplateColumns = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }
    // For responsive columns, you'd need media queries in CSS
    return 'repeat(auto-fit, minmax(300px, 1fr))';
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getGridTemplateColumns(),
    gap: spacing[gap],
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
}

export const GridItem: React.FC<GridItemProps> = ({
  span = 1,
  children,
  className = '',
}) => {
  const itemStyles: React.CSSProperties = {
    gridColumn: `span ${span}`,
  };

  return (
    <div style={itemStyles} className={className}>
      {children}
    </div>
  );
};
```

---

### 6. Container Component

Create: `frontend/src/components/layout/Container.tsx`

```typescript
import React from 'react';
import { spacing } from '../../lib/designTokens';

interface ContainerProps {
  maxWidth?: 'narrow' | 'regular' | 'wide' | 'full';
  padding?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'regular',
  padding = true,
  children,
  className = '',
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
  };

  return (
    <div style={containerStyles} className={className}>
      {children}
    </div>
  );
};
```

---

### 7. Section Component

Create: `frontend/src/components/layout/Section.tsx`

```typescript
import React from 'react';
import { colors, spacing } from '../../lib/designTokens';

interface SectionProps {
  background?: 'white' | 'gray' | 'dark';
  paddingY?: keyof typeof spacing;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  background = 'white',
  paddingY = 12,
  children,
  className = '',
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
  };

  return (
    <section style={sectionStyles} className={className}>
      {children}
    </section>
  );
};
```

---

## 📱 Usage Examples

### Example 1: Homepage Layout

```typescript
import { Container, Section, Grid, GridItem } from '../components/layout';
import { NewsCardLarge, NewsCardMedium } from '../components/news';
import { Headline } from '../components/ui/Typography';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <Section background="white">
        <Container>
          <NewsCardLarge article={heroArticle} />
        </Container>
      </Section>

      {/* Latest News Grid */}
      <Section background="gray">
        <Container>
          <Headline level={2}>Latest News</Headline>
          <Grid columns={3} gap={6}>
            {articles.map(article => (
              <NewsCardMedium key={article.id} article={article} />
            ))}
          </Grid>
        </Container>
      </Section>
    </>
  );
};
```

### Example 2: Article Page

```typescript
import { Container, Section } from '../components/layout';
import { Headline, BodyText, Caption } from '../components/ui/Typography';

const ArticlePage = () => {
  return (
    <Section background="white">
      <Container maxWidth="narrow">
        <article>
          <Headline level={1}>{article.title}</Headline>
          <Caption>{article.published_at}</Caption>
          
          <img 
            src={article.cover_image} 
            alt={article.title}
            style={{ width: '100%', aspectRatio: '16/9' }}
          />
          
          <BodyText variant="large">
            {article.content}
          </BodyText>
        </article>
      </Container>
    </Section>
  );
};
```

---

## 🎯 Tailwind CSS Configuration (Alternative)

If you choose to use Tailwind CSS, here's the configuration:

Create: `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C4161C',
          'red-hover': '#A01317',
        },
        neutral: {
          50: '#F9F9F9',
          100: '#F5F5F5',
          200: '#E0E0E0',
          300: '#CCCCCC',
          400: '#999999',
          500: '#767676',
          600: '#5A5A5A',
          700: '#3A3A3A',
          800: '#2A2A2A',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        'display': '56px',
        'hero': '48px',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      maxWidth: {
        'narrow': '680px',
        'article': '780px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

---

## 🚀 Getting Started Checklist

1. **Install Dependencies**
```bash
cd frontend
npm install clsx framer-motion lucide-react
```

2. **Create Design System Files**
- [ ] Create `lib/designTokens.ts`
- [ ] Create `components/ui/Typography.tsx`
- [ ] Create `components/ui/Button.tsx`
- [ ] Create `components/layout/Container.tsx`
- [ ] Create `components/layout/Grid.tsx`

3. **Test Components**
- [ ] Create a test page to preview components
- [ ] Verify responsive behavior
- [ ] Check accessibility

4. **Integrate Gradually**
- [ ] Start with one page (e.g., Homepage)
- [ ] Use new components alongside old ones
- [ ] Gradually replace old components

---

**This design system will give you a solid foundation for your BBC News-inspired redesign. Start with these components and build from there!** 🎨
