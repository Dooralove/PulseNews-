import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { PersonAdd, Article as ArticleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null; // Don't show hero for authenticated users
  }

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 8,
        mb: 4,
        borderRadius: 0,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Добро пожаловать в PulseNews
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              maxWidth: '800px',
              opacity: 0.95,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
            }}
          >
            Ваш источник актуальных новостей и аналитики. Читайте, комментируйте и делитесь мнениями.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
                transition: 'all 0.3s',
              }}
            >
              Зарегистрироваться
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArticleIcon />}
              onClick={() => navigate('/')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s',
              }}
            >
              Читать новости
            </Button>
          </Box>
          <Box sx={{ mt: 4, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                1000+
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Статей
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                500+
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Авторов
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                10K+
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Читателей
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default HeroSection;
