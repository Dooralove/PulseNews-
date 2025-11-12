import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Article } from '../../types';
import { colors, spacing, typography, transitions } from '../../theme/designTokens';
import { Headline, Caption } from '../ui/Typography';
import { Tag } from '../ui/Tag';

interface NewsCardMediumProps {
  article: Article;
}

export const NewsCardMedium: React.FC<NewsCardMediumProps> = ({ article }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  const cardStyles: React.CSSProperties = {
    cursor: 'pointer',
    backgroundColor: colors.background.primary,
    borderRadius: '8px',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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
    paddingTop: spacing[3],
    paddingLeft: spacing[3],
    paddingRight: spacing[3],
    paddingBottom: spacing[3],
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const titleStyles: React.CSSProperties = {
    marginBottom: spacing[2],
    textDecoration: isHovered ? 'underline' : 'none',
    transition: transitions.fast,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const metaStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing[2],
  };

  return (
    <motion.article
      style={cardStyles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        y: -8, 
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
      }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeOut' 
      }}
      initial={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}
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
          <Headline level={4}>{article.title}</Headline>
        </div>
        
        <div style={metaStyles}>
          {article.published_at && (
            <Caption>
              {format(new Date(article.published_at), 'd MMM', { locale: ru })}
            </Caption>
          )}
        </div>
      </div>
    </motion.article>
  );
};
