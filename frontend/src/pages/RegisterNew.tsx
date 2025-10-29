import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Alert, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import authService from '../services/authService';
import { Container, Section } from '../components/layout';
import { Headline, BodyText, Button } from '../components/ui';
import { colors, spacing, typography } from '../theme/designTokens';

const RegisterNew: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 1, // 1 = reader, 2 = editor
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: name === 'role' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        setError(errorMessages);
      } else {
        setError('Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const formContainerStyles: React.CSSProperties = {
    maxWidth: '500px',
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
            <Headline level={2}>Регистрация</Headline>
            <div style={{ marginTop: spacing[2] }}>
              <BodyText color="secondary">Создайте новый аккаунт</BodyText>
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
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
              <TextField
                fullWidth
                label="Имя"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Фамилия"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
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

            <div style={formGroupStyles}>
              <TextField
                fullWidth
                label="Подтвердите пароль"
                name="password2"
                type="password"
                value={formData.password2}
                onChange={handleChange}
                required
              />
            </div>

            <div style={formGroupStyles}>
              <FormControl fullWidth>
                <InputLabel>Роль</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange as any}
                  label="Роль"
                >
                  <MenuItem value={1}>Читатель</MenuItem>
                  <MenuItem value={2}>Редактор</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div style={{ marginBottom: spacing[4] }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <BodyText color="secondary" style={{ fontSize: typography.fontSize.sm }}>
                Уже есть аккаунт?{' '}
                <RouterLink to="/login" style={linkStyles}>
                  Войти
                </RouterLink>
              </BodyText>
            </div>
          </form>
        </div>
      </Container>
    </Section>
  );
};

export default RegisterNew;
