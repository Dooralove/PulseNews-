import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Article } from '../../types';
import { colors, spacing, typography, transitions } from '../../theme/designTokens';
import { Headline, BodyText, Caption } from '../ui/Typography';
import { Tag } from '../ui/Tag';

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
    paddingTop: spacing[4],
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
          <div style={{ marginBottom: spacing[2] }}>
            <Tag variant="category" categoryName={article.category.name}>
              {article.category.name}
            </Tag>
          </div>
        )}
        
        <div style={titleStyles}>
          <Headline level={3}>{article.title}</Headline>
        </div>
        
        {article.excerpt && (
          <div style={excerptStyles}>
            <BodyText color="secondary">{article.excerpt}</BodyText>
          </div>
        )}
        
        <div style={metaStyles}>
          {article.published_at && (
            <Caption>
              {format(new Date(article.published_at), 'd MMMM yyyy', { locale: ru })}
            </Caption>
          )}
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
