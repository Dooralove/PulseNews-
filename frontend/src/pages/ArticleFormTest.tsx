import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { Category, Tag } from '../types';
import articleService from '../services/articleService';

const ArticleFormTest: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading categories and tags...');
        const [categoriesData, tagsData] = await Promise.all([
          articleService.getCategories(),
          articleService.getTags(),
        ]);

        console.log('Categories data:', categoriesData);
        console.log('Categories data type:', typeof categoriesData);
        console.log('Categories is array:', Array.isArray(categoriesData));

        console.log('Tags data:', tagsData);
        console.log('Tags data type:', typeof tagsData);
        console.log('Tags is array:', Array.isArray(tagsData));

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setTags(Array.isArray(tagsData) ? tagsData : []);
      } catch (err) {
        console.error('Error loading data:', err);
        setCategories([]);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Test Form - No .map() calls
        </Typography>

        <Typography>Categories count: {categories.length}</Typography>
        <Typography>Tags count: {tags.length}</Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Categories (safe):</Typography>
          {Array.isArray(categories) ? (
            categories.map((category) => (
              <Typography key={category.id}>{category.name}</Typography>
            ))
          ) : (
            <Typography>No categories or not an array</Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Tags (safe):</Typography>
          {Array.isArray(tags) ? (
            tags.map((tag) => (
              <Typography key={tag.id}>{tag.name}</Typography>
            ))
          ) : (
            <Typography>No tags or not an array</Typography>
          )}
        </Box>

        <Button variant="contained" sx={{ mt: 2 }}>
          Test Button
        </Button>
      </Paper>
    </Container>
  );
};

export default ArticleFormTest;
