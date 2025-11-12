import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  CalendarToday,
  FilterList,
  Publish,
  DraftsOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';
import { Article } from '../types';
import articleService from '../services/articleService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

const MyArticles: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadArticles();
  }, [filterStatus]);

  const loadArticles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: any = {
        author: user?.username,
        page_size: 100,
      };
      
      // Фильтруем по статусу
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const data = await articleService.getArticles(params);
      const articlesArray = Array.isArray(data) ? data : data.results || [];
      
      setArticles(articlesArray);
    } catch (err: any) {
      console.error('Error loading articles:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить статьи');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/articles/create');
  };

  const handleEdit = (id: number) => {
    navigate(`/articles/${id}/edit`);
  };

  const handleView = (id: number) => {
    navigate(`/articles/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    setArticleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (articleToDelete) {
      try {
        await articleService.deleteArticle(articleToDelete);
        setArticles(articles.filter(a => a.id !== articleToDelete));
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
      } catch (err: any) {
        setError('Не удалось удалить статью');
      }
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await articleService.publishArticle(id);
      setSuccess('Статья успешно опубликована!');
      // Перезагружаем статьи после публикации
      loadArticles();
    } catch (err: any) {
      setError('Не удалось опубликовать статью');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликовано';
      case 'draft':
        return 'Черновик';
      case 'archived':
        return 'Архив';
      default:
        return status;
    }
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
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Мои статьи
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Управление вашими статьями
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            size="large"
          >
            Создать статью
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <TextField
            select
            label="Фильтр по статусу"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <FilterList sx={{ mr: 1, color: 'action.active' }} />,
            }}
          >
            <MenuItem value="all">Все статьи</MenuItem>
            <MenuItem value="published">Опубликованные</MenuItem>
            <MenuItem value="draft">Черновики</MenuItem>
            <MenuItem value="archived">Архивные</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {articles.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет статей
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Создайте свою первую статью прямо сейчас
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Создать статью
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
          {articles.map((article) => (
            <Card 
              key={article.id}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: article.status === 'draft' ? '2px solid' : '1px solid',
                borderColor: article.status === 'draft' ? 'warning.main' : 'divider',
                bgcolor: article.status === 'draft' ? 'warning.lighter' : 'background.paper',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              {article.cover_image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={article.cover_image}
                  alt={article.title}
                  sx={{ 
                    cursor: 'pointer',
                    objectFit: 'cover',
                  }}
                  onClick={() => handleView(article.id)}
                />
              )}
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip 
                    icon={article.status === 'draft' ? <DraftsOutlined /> : article.status === 'published' ? <CheckCircleOutline /> : undefined}
                    label={getStatusLabel(article.status)} 
                    size="small" 
                    color={getStatusColor(article.status)}
                    sx={{
                      fontWeight: article.status === 'draft' ? 700 : 500,
                    }}
                  />
                  {article.category && (
                    <Chip 
                      label={article.category.name} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Stack>
                
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
                  onClick={() => handleView(article.id)}
                >
                  {article.title}
                </Typography>
                
                {article.excerpt && (
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
                    {article.excerpt}
                  </Typography>
                )}

                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {article.created_at && 
                        format(new Date(article.created_at), 'd MMMM yyyy', { locale: ru })
                      }
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Visibility fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {article.views || 0} просмотров
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box display="flex" gap={1}>
                  <IconButton 
                    size="small"
                    color="primary"
                    onClick={() => handleView(article.id)}
                    title="Просмотр"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(article.id)}
                    title="Редактировать"
                  >
                    <Edit />
                  </IconButton>
                  {article.status === 'draft' && (
                    <IconButton 
                      size="small"
                      color="success"
                      onClick={() => handlePublish(article.id)}
                      title="Опубликовать"
                    >
                      <Publish />
                    </IconButton>
                  )}
                </Box>
                <IconButton 
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(article.id)}
                  title="Удалить"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyArticles;
