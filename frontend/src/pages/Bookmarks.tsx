import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import {
  BookmarkRemove,
  Visibility,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { Bookmark } from '../types';
import bookmarkService from '../services/bookmarkService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookmarks();
  }, []);

  // Добавляем обработку ошибок рендеринга
  useEffect(() => {
    console.log('Bookmarks component mounted');
    console.log('Current bookmarks:', bookmarks);
  }, [bookmarks]);

  const loadBookmarks = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading bookmarks...');
      const data = await bookmarkService.getBookmarks();
      console.log('Bookmarks loaded:', data);
      setBookmarks(data || []);
    } catch (err: any) {
      console.error('Error loading bookmarks:', err);
      const errorMessage = err.response?.data?.detail || 'Не удалось загрузить закладки';
      setError(errorMessage);
      console.error('Error message:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: number) => {
    try {
      await bookmarkService.removeBookmark(bookmarkId);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (err: any) {
      setError('Не удалось удалить закладку');
    }
  };

  const handleArticleClick = (articleId: number) => {
    navigate(`/articles/${articleId}`);
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Мои закладки
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Здесь собраны все статьи, которые вы сохранили для последующего чтения
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {bookmarks.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет сохраненных статей
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Добавляйте статьи в закладки, чтобы легко находить их позже
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Перейти к статьям
          </Button>
        </Paper>
      ) : (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {bookmarks.map((bookmark) => {
            // Защита от некорректных данных
            if (!bookmark || !bookmark.article) {
              console.warn('Invalid bookmark data:', bookmark);
              return null;
            }
            
            return (
            <Box key={bookmark.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {bookmark.article.cover_image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={bookmark.article.cover_image}
                    alt={bookmark.article.title}
                    sx={{ 
                      cursor: 'pointer',
                      objectFit: 'cover',
                    }}
                    onClick={() => handleArticleClick(bookmark.article.id)}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  {bookmark.article.category && (
                    <Chip 
                      label={bookmark.article.category.name} 
                      size="small" 
                      color="primary" 
                      sx={{ mb: 1 }}
                    />
                  )}
                  
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                    onClick={() => handleArticleClick(bookmark.article.id)}
                  >
                    {bookmark.article?.title || 'Без названия'}
                  </Typography>
                  
                  {bookmark.article.excerpt && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 2,
                      }}
                    >
                      {bookmark.article.excerpt}
                    </Typography>
                  )}

                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {bookmark.article.author?.full_name || bookmark.article.author?.username || 'Неизвестный автор'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {bookmark.article.published_at ? 
                          format(new Date(bookmark.article.published_at), 'd MMMM yyyy', { locale: ru })
                          : 'Дата не указана'
                        }
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Visibility fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {bookmark.article.views || 0} просмотров
                      </Typography>
                    </Box>
                  </Stack>

                  {bookmark.article.tags && bookmark.article.tags.length > 0 && (
                    <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ mt: 2 }}>
                      {bookmark.article.tags.slice(0, 3).map((tag) => (
                        <Chip 
                          key={tag.id} 
                          label={tag.name} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => handleArticleClick(bookmark.article.id)}
                  >
                    Читать
                  </Button>
                  <IconButton 
                    color="error"
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    title="Удалить из закладок"
                  >
                    <BookmarkRemove />
                  </IconButton>
                </CardActions>
              </Card>
            </Box>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default Bookmarks;
