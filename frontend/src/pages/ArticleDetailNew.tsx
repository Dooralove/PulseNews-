import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CircularProgress,
  Alert,
  IconButton,
  Box,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Bookmark,
  BookmarkBorder,
  Edit,
  Delete,
  ArrowBack,
  Share,
} from '@mui/icons-material';
import { Article, Comment } from '../types';
import articleService from '../services/articleService';
import commentService from '../services/commentService';
import reactionService from '../services/reactionService';
import bookmarkService from '../services/bookmarkService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import CommentSection from '../components/CommentSection';
import { Container, Section, Grid } from '../components/layout';
import { Headline, BodyText, Caption, Button } from '../components/ui';
import { Tag } from '../components/ui/Tag';
import { NewsCardSmall } from '../components/news';
import { colors, spacing, typography } from '../theme/designTokens';

const ArticleDetailNew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, canManageArticles, canModerateContent } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userReaction, setUserReaction] = useState<1 | -1 | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      loadArticle();
      loadComments();
      if (isAuthenticated) {
        checkBookmarkStatus();
        loadUserReaction();
      }
    }
  }, [id, isAuthenticated]);

  const loadArticle = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await articleService.getArticle(parseInt(id!));
      setArticle(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось загрузить статью');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentService.getComments(parseInt(id!));
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const bookmarked = await bookmarkService.checkBookmark(parseInt(id!));
      setIsBookmarked(bookmarked);
    } catch (err) {
      console.error('Failed to check bookmark status:', err);
    }
  };

  const loadUserReaction = async () => {
    try {
      const reaction = await reactionService.getArticleReaction(parseInt(id!));
      if (reaction && reaction.value) {
        setUserReaction(reaction.value);
      }
    } catch (err) {
      console.error('Failed to load user reaction:', err);
    }
  };

  const handleReaction = async (value: 1 | -1) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (userReaction === value) {
        await reactionService.removeArticleReaction(parseInt(id!));
        setUserReaction(null);
      } else {
        await reactionService.setArticleReaction(parseInt(id!), value);
        setUserReaction(value);
      }
      loadArticle();
    } catch (err) {
      console.error('Failed to set reaction:', err);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(parseInt(id!));
        setIsBookmarked(false);
      } else {
        await bookmarkService.addBookmark(parseInt(id!));
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      try {
        await articleService.deleteArticle(parseInt(id!));
        navigate('/');
      } catch (err) {
        console.error('Failed to delete article:', err);
      }
    }
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Section>
    );
  }

  if (error || !article) {
    return (
      <Section>
        <Container>
          <Alert severity="error">{error || 'Статья не найдена'}</Alert>
        </Container>
      </Section>
    );
  }

  const articleHeaderStyles: React.CSSProperties = {
    borderBottom: `1px solid ${colors.border.light}`,
    paddingBottom: spacing[6],
    marginBottom: spacing[8],
  };

  const metaContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing[3],
    alignItems: 'center',
    marginTop: spacing[4],
    flexWrap: 'wrap',
  };

  const featuredImageStyles: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    marginBottom: spacing[8],
  };

  const articleBodyStyles: React.CSSProperties = {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.text.primary,
    marginBottom: spacing[12],
  };

  const shareBarStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    alignItems: 'center',
    padding: `${spacing[4]} 0`,
    borderTop: `1px solid ${colors.border.light}`,
    borderBottom: `1px solid ${colors.border.light}`,
    marginBottom: spacing[8],
  };

  const tagsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    flexWrap: 'wrap',
    marginBottom: spacing[8],
  };

  return (
    <>
      <Section background="white">
        <Container maxWidth="narrow">
          {/* Back Button */}
          <div style={{ marginBottom: spacing[6] }}>
            <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowBack />}>
              Назад
            </Button>
          </div>

          {/* Article Header */}
          <article>
            <div style={articleHeaderStyles}>
              {article.category && (
                <div style={{ marginBottom: spacing[3] }}>
                  <Tag variant="category" categoryName={article.category.name}>
                    {article.category.name}
                  </Tag>
                </div>
              )}
              
              <Headline level={1}>{article.title}</Headline>
              
              {article.excerpt && (
                <div style={{ marginTop: spacing[4] }}>
                  <BodyText variant="large" color="secondary">
                    {article.excerpt}
                  </BodyText>
                </div>
              )}

              <div style={metaContainerStyles}>
                {article.author && (
                  <>
                    <Caption>Автор: <strong>{article.author.full_name || article.author.username}</strong></Caption>
                    <Caption>•</Caption>
                  </>
                )}
                {article.published_at && (
                  <Caption>
                    {format(new Date(article.published_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                  </Caption>
                )}
                {article.views !== undefined && (
                  <>
                    <Caption>•</Caption>
                    <Caption>{article.views} просмотров</Caption>
                  </>
                )}
              </div>
            </div>

            {/* Featured Image */}
            {article.cover_image && (
              <div style={{ marginBottom: spacing[8] }}>
                <img 
                  src={article.cover_image} 
                  alt={article.title}
                  style={featuredImageStyles}
                />
                {article.image_caption && (
                  <Caption>{article.image_caption}</Caption>
                )}
              </div>
            )}

            {/* Article Content */}
            <div 
              style={articleBodyStyles}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Social Share Bar */}
            <div style={shareBarStyles}>
              <Caption uppercase>Поделиться:</Caption>
              
              {isAuthenticated && (
                <>
                  <IconButton
                    onClick={() => handleReaction(1)}
                    size="small"
                    style={{ color: userReaction === 1 ? colors.brand.red : colors.text.tertiary }}
                  >
                    <ThumbUp />
                  </IconButton>
                  <Caption>{article.likes_count || 0}</Caption>

                  <IconButton
                    onClick={() => handleReaction(-1)}
                    size="small"
                    style={{ color: userReaction === -1 ? colors.brand.red : colors.text.tertiary }}
                  >
                    <ThumbDown />
                  </IconButton>
                  <Caption>{article.dislikes_count || 0}</Caption>

                  <IconButton
                    onClick={handleBookmark}
                    size="small"
                    style={{ color: isBookmarked ? colors.brand.red : colors.text.tertiary }}
                  >
                    {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                </>
              )}

              <IconButton size="small">
                <Share />
              </IconButton>

              {/* Edit/Delete for authors */}
              {canManageArticles && article.author?.id === user?.id && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: spacing[2] }}>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/articles/${article.id}/edit`)}
                    icon={<Edit />}
                    size="small"
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    icon={<Delete />}
                    size="small"
                  >
                    Удалить
                  </Button>
                </div>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div style={tagsContainerStyles}>
                <Caption uppercase style={{ marginRight: spacing[2] }}>Теги:</Caption>
                {article.tags.map((tag) => (
                  <Tag key={tag.id} variant="outlined">
                    {tag.name}
                  </Tag>
                ))}
              </div>
            )}
          </article>
        </Container>
      </Section>

      {/* Comments Section */}
      <Section background="gray">
        <Container maxWidth="narrow">
          <CommentSection articleId={parseInt(id!)} />
        </Container>
      </Section>
    </>
  );
};

export default ArticleDetailNew;
