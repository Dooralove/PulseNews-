import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Paper,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Bookmark,
  BookmarkBorder,
  Edit,
  Delete,
  Visibility,
  ArrowBack,
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

const ArticleDetail: React.FC = () => {
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
        // Remove reaction - get current reaction first
        const reaction = await reactionService.getArticleReaction(parseInt(id!));
        if (reaction) {
          await reactionService.deleteReaction(parseInt(id!), reaction.id);
          setUserReaction(null);
          // Reload article to update counts
          await loadArticle();
        }
      } else {
        // Create or update reaction
        await reactionService.createOrUpdateReaction({
          article: parseInt(id!),
          value,
        });
        setUserReaction(value);
        // Reload article to update counts
        await loadArticle();
      }
    } catch (err: any) {
      console.error('Reaction error:', err);
      alert(err.response?.data?.detail || 'Не удалось обработать реакцию');
    }
  };

  const handleEdit = () => {
    navigate(`/articles/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      try {
        await articleService.deleteArticle(parseInt(id!));
        navigate('/');
      } catch (err) {
        alert('Не удалось удалить статью');
      }
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const result = await bookmarkService.toggleBookmark(parseInt(id!));
      setIsBookmarked(result.added);
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  // Админы и модераторы могут редактировать любые статьи
  // Редакторы могут редактировать только свои статьи
  const canEdit = user && article && (
    canModerateContent || // Админы могут редактировать любые статьи
    (canManageArticles && article.author && article.author.id === user.id) // Редакторы только свои
  );

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Статья не найдена'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Вернуться к списку
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Назад к статьям
      </Button>

      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 },
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          {article.category && (
            <Chip 
              label={article.category.name} 
              color="primary" 
              sx={{ 
                mb: 2,
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }} 
            />
          )}
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1.2,
              mb: 3,
            }}
          >
            {article.title}
          </Typography>

          {/* Author and date */}
          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
            <Avatar>{article.author?.full_name?.[0] || 'A'}</Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {article.author?.full_name || 'Аноним'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {article.published_at && format(new Date(article.published_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Box display="flex" gap={3} sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Visibility fontSize="small" color="action" />
              <Typography variant="body2">{article.views} просмотров</Typography>
            </Box>
          </Box>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap">
              {article.tags.map((tag) => (
                <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
              ))}
            </Box>
          )}
        </Box>

        {/* Cover Image */}
        {article.cover_image && (
          <Box 
            sx={{ 
              mb: 4,
              mx: { xs: -3, md: -5 },
              mt: 3,
            }}
          >
            <img
              src={article.cover_image}
              alt={article.title}
              style={{ 
                width: '100%', 
                maxHeight: '500px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontStyle: 'italic',
              color: 'text.secondary',
              borderLeft: 4,
              borderColor: 'primary.main',
              pl: 2,
              py: 1,
            }}
          >
            {article.excerpt}
          </Typography>
        )}

        {/* Content */}
        <Typography
          variant="body1"
          component="div"
          sx={{
            mb: 4,
            fontSize: '1.1rem',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            '& p': {
              mb: 2,
            },
          }}
        >
          {article.content}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant={userReaction === 1 ? 'contained' : 'outlined'}
              startIcon={<ThumbUp />}
              onClick={() => handleReaction(1)}
              sx={{
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
                transition: 'all 0.2s',
              }}
            >
              Нравится {article.likes_count ? `(${article.likes_count})` : ''}
            </Button>
            <Button
              variant={userReaction === -1 ? 'contained' : 'outlined'}
              color="error"
              startIcon={<ThumbDown />}
              onClick={() => handleReaction(-1)}
              sx={{
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
                transition: 'all 0.2s',
              }}
            >
              Не нравится {article.dislikes_count ? `(${article.dislikes_count})` : ''}
            </Button>
            {isAuthenticated && (
              <IconButton 
                onClick={handleToggleBookmark}
                sx={{
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            )}
          </Box>

          {canEdit && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Редактировать
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                Удалить
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Comments Section */}
      <Box sx={{ mt: 4 }}>
        <CommentSection
          articleId={parseInt(id!)}
          comments={comments}
          onCommentAdded={loadComments}
          onCommentDeleted={loadComments}
        />
      </Box>
    </Container>
  );
};

export default ArticleDetail;
