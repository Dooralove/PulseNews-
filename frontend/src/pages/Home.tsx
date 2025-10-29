import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CircularProgress, Alert, Box } from '@mui/material';
import { Article } from '../types';
import articleService from '../services/articleService';
import { Container, Section, Grid } from '../components/layout';
import { Headline } from '../components/ui';
import { NewsCardHero, NewsCardLarge, NewsCardMedium } from '../components/news';
import { spacing, colors } from '../theme/designTokens';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticles();
  }, [searchParams]);

  const loadArticles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: any = { page: 1, page_size: 20, status: 'published' };
      
      const search = searchParams.get('search');
      const category = searchParams.get('category');
      const tags = searchParams.get('tags');
      
      if (search) params.search = search;
      if (category) params.category = category;
      if (tags) params.tags = tags;
      
      const response = await articleService.getArticles(params);
      setArticles(response.results);
    } catch (err: any) {
      setError('Не удалось загрузить статьи');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && articles.length === 0) {
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

  if (error) {
    return (
      <Section>
        <Container>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Section>
    );
  }

  const heroArticle = articles[0];
  const secondaryArticles = articles.slice(1, 5);
  const latestArticles = articles.slice(5, 14);

  return (
    <>
      {/* Hero Section */}
      {heroArticle && (
        <Section background="white" paddingY={0}>
          <NewsCardHero article={heroArticle} />
        </Section>
      )}

      {/* Secondary Stories */}
      {secondaryArticles.length > 0 && (
        <Section background="white" paddingY={8}>
          <Container>
            <Grid columns={2} gap={6} responsive={false}>
              {secondaryArticles.map((article) => (
                <NewsCardLarge key={article.id} article={article} />
              ))}
            </Grid>
          </Container>
        </Section>
      )}

      {/* Latest News Section */}
      {latestArticles.length > 0 && (
        <Section background="gray" paddingY={10}>
          <Container>
            <div style={{ marginBottom: spacing[8] }}>
              <Headline level={2}>Последние новости</Headline>
            </div>
            <Grid columns={3} gap={6}>
              {latestArticles.map((article) => (
                <NewsCardMedium key={article.id} article={article} />
              ))}
            </Grid>
          </Container>
        </Section>
      )}

      {articles.length === 0 && (
        <Section>
          <Container>
            <Alert severity="info">Статьи не найдены</Alert>
          </Container>
        </Section>
      )}
    </>
  );
};

export default Home;
