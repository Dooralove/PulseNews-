import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save, Cancel, CloudUpload } from '@mui/icons-material';
import { Category, Tag, ArticleCreateData } from '../types';
import articleService from '../services/articleService';

const ArticleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<ArticleCreateData>({
    title: '',
    content: '',
    excerpt: '',
    cover_image: null,
    category: null,
    tags: [],
    status: 'draft',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategoriesAndTags();
    if (isEditMode) {
      loadArticle();
    }
  }, [id]);

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        articleService.getCategories(),
        articleService.getTags(),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);
    } catch (err) {
      console.error('Failed to load categories and tags:', err);
      // Set empty arrays on error to prevent .map() errors
      setCategories([]);
      setTags([]);
    }
  };

  const loadArticle = async () => {
    setLoadingData(true);
    try {
      const article = await articleService.getArticle(parseInt(id!));
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        cover_image: null,
        category: article.category?.id || null,
        tags: Array.isArray(article.tags) ? article.tags.map(t => t.id) : [],
        status: article.status,
      });
      if (article.cover_image) {
        setCoverImagePreview(article.cover_image);
      }
    } catch (err: any) {
      setError('Не удалось загрузить статью');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: keyof ArticleCreateData, value: any) => {
    if (field === 'tags') {
      // Ensure tags is always an array
      value = Array.isArray(value) ? value : [];
    }
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, cover_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Обязательное поле';
    if (!formData.content.trim()) newErrors.content = 'Обязательное поле';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Обязательное поле';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await articleService.updateArticle(parseInt(id!), formData);
      } else {
        await articleService.createArticle(formData);
      }
      navigate('/my-articles');
    } catch (err: any) {
      if (err.response?.data) {
        const serverErrors: Record<string, string> = {};
        Object.keys(err.response.data).forEach(key => {
          const errorValue = err.response.data[key];
          serverErrors[key] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
        });
        setErrors(serverErrors);
      } else {
        setError('Не удалось сохранить статью');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {isEditMode ? 'Редактировать статью' : 'Создать статью'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Заголовок"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Краткое описание"
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            error={!!errors.excerpt}
            helperText={errors.excerpt || 'Краткое описание статьи для превью'}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            required
            multiline
            rows={15}
            label="Содержание"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            error={!!errors.content}
            helperText={errors.content}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Категория</InputLabel>
            <Select
              value={formData.category || ''}
              onChange={(e) => handleChange('category', e.target.value || null)}
              label="Категория"
              disabled={loading}
            >
              <MenuItem value="">
                <em>Без категории</em>
              </MenuItem>
              {Array.isArray(categories) && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Теги</InputLabel>
            <Select
              multiple
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              input={<OutlinedInput label="Теги" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Array.isArray(selected) && selected.map((value) => {
                    const tag = tags.find(t => t.id === value);
                    return tag ? <Chip key={value} label={tag.name} size="small" /> : null;
                  })}
                </Box>
              )}
              disabled={loading}
            >
              {Array.isArray(tags) && tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              disabled={loading}
            >
              Загрузить обложку
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {coverImagePreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={coverImagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                />
              </Box>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.status === 'published'}
                onChange={(e) => handleChange('status', e.target.checked ? 'published' : 'draft')}
                disabled={loading}
              />
            }
            label="Опубликовать сразу"
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate(-1)}
              disabled={loading}
              fullWidth
            >
              Отмена
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ArticleForm;
