import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Alert, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Container, Section } from '../components/layout';
import { Headline, BodyText, Button } from '../components/ui';
import { colors, spacing, typography } from '../theme/designTokens';

const LoginNew: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username: formData.username, password: formData.password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  const formContainerStyles: React.CSSProperties = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: spacing[8],
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.border.light}`,
  };

  const formGroupStyles: React.CSSProperties = {
    marginBottom: spacing[4],
  };

  const linkStyles: React.CSSProperties = {
    color: colors.text.link,
    textDecoration: 'none',
    fontSize: typography.fontSize.sm,
  };

  return (
    <Section background="gray" paddingY={12}>
      <Container maxWidth="narrow">
        <div style={formContainerStyles}>
          <div style={{ textAlign: 'center', marginBottom: spacing[8] }}>
            <Headline level={2}>Вход</Headline>
            <div style={{ marginTop: spacing[2] }}>
              <BodyText color="secondary">Войдите в свой аккаунт</BodyText>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: spacing[4] }}>
              <Alert severity="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={formGroupStyles}>
              <TextField
                fullWidth
                label="Имя пользователя"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div style={formGroupStyles}>
              <TextField
                fullWidth
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: spacing[4] }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <BodyText color="secondary" style={{ fontSize: typography.fontSize.sm }}>
                Нет аккаунта?{' '}
                <RouterLink to="/register" style={linkStyles}>
                  Зарегистрироваться
                </RouterLink>
              </BodyText>
            </div>
          </form>
        </div>
      </Container>
    </Section>
  );
};

export default LoginNew;
