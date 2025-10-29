import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Article } from '../../types';
import { colors, spacing, typography, transitions } from '../../theme/designTokens';
import { Headline, Caption } from '../ui/Typography';
import { Tag } from '../ui/Tag';

interface NewsCardHeroProps {
  article: Article;
}

export const NewsCardHero: React.FC<NewsCardHeroProps> = ({ article }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  const cardStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '500px',
    cursor: 'pointer',
    overflow: 'hidden',
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: transitions.slow,
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: spacing[8],
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: '800px',
  };

  const titleStyles: React.CSSProperties = {
    marginBottom: spacing[3],
    textDecoration: isHovered ? 'underline' : 'none',
    transition: transitions.fast,
  };

  const metaContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing[3],
    alignItems: 'center',
    marginTop: spacing[2],
  };

  return (
    <article
      style={cardStyles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {article.cover_image && (
        <img
          src={article.cover_image}
          alt={article.title}
          style={imageStyles}
        />
      )}
      
      <div style={overlayStyles}>
        <div style={contentStyles}>
          {article.category && (
            <div style={{ marginBottom: spacing[3] }}>
              <Tag variant="default" categoryName={article.category.name}>
                {article.category.name}
              </Tag>
            </div>
          )}
          
          <div style={titleStyles}>
            <Headline level={1} color="inverse">
              {article.title}
            </Headline>
          </div>
          
          {article.excerpt && (
            <div style={{ marginBottom: spacing[3] }}>
              <Caption color="primary" style={{ color: colors.neutral.gray200, fontSize: typography.fontSize.lg }}>
                {article.excerpt}
              </Caption>
            </div>
          )}
          
          <div style={metaContainerStyles}>
            {article.published_at && (
              <Caption style={{ color: colors.neutral.gray200 }}>
                {format(new Date(article.published_at), 'd MMMM yyyy', { locale: ru })}
              </Caption>
            )}
            {article.author && (
              <>
                <Caption style={{ color: colors.neutral.gray200 }}>•</Caption>
                <Caption style={{ color: colors.neutral.gray200 }}>
                  {article.author.full_name || article.author.username}
                </Caption>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
