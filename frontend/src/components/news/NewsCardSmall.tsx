import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Article } from '../../types';
import { colors, spacing, typography, transitions } from '../../theme/designTokens';
import { Headline, Caption } from '../ui/Typography';

interface NewsCardSmallProps {
  article: Article;
}

export const NewsCardSmall: React.FC<NewsCardSmallProps> = ({ article }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  const cardStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing[3],
    cursor: 'pointer',
    transition: transitions.base,
    backgroundColor: colors.background.primary,
    paddingBottom: spacing[3],
    borderBottom: `1px solid ${colors.border.light}`,
  };

  const imageContainerStyles: React.CSSProperties = {
    flexShrink: 0,
    width: '100px',
    height: '100px',
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
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const titleStyles: React.CSSProperties = {
    textDecoration: isHovered ? 'underline' : 'none',
    transition: transitions.fast,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
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
        <div style={titleStyles}>
          <Headline level={5}>{article.title}</Headline>
        </div>
        
        {article.published_at && (
          <Caption>
            {format(new Date(article.published_at), 'd MMM', { locale: ru })}
          </Caption>
        )}
      </div>
    </article>
  );
};
