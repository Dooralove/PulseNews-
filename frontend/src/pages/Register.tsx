import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  FormHelperText,
  FormLabel,
  Card,
  CardContent,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Edit } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData, Role } from '../types';
import roleService from '../services/roleService';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: undefined,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const rolesData = await roleService.getRoles();
      setRoles(rolesData);
      // Set default to reader role (find by name, not hardcoded ID)
      const readerRole = rolesData.find(r => r.name === 'reader');
      if (readerRole) {
        setFormData(prev => ({ ...prev, role: readerRole.id }));
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
      // Keep roles empty array on error
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleRoleChange = (roleId: number) => {
    setFormData({
      ...formData,
      role: roleId,
    });
    if (errors.role) {
      setErrors({ ...errors, role: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = 'Обязательное поле';
    if (!formData.email) newErrors.email = 'Обязательное поле';
    if (!formData.password) newErrors.password = 'Обязательное поле';
    if (!formData.password2) newErrors.password2 = 'Обязательное поле';
    if (!formData.first_name) newErrors.first_name = 'Обязательное поле';
    if (!formData.last_name) newErrors.last_name = 'Обязательное поле';
    if (!formData.role) newErrors.role = 'Выберите тип аккаунта';

    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Пароли не совпадают';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Некорректный email адрес';
    }

    console.log('Form validation errors:', newErrors);
    console.log('Form data:', formData);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submit triggered');
    console.log('Current form data:', formData);
    console.log('Roles loaded:', roles);
    console.log('Loading roles:', loadingRoles);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, proceeding with registration...');
    setLoading(true);
    setErrors({});

    try {
      console.log('Calling register function with data:', formData);
      await register(formData);
      console.log('Registration successful, navigating to home');
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Registration failed:', err);
      const serverErrors: Record<string, string> = {};

      if (err.response?.data) {
        Object.keys(err.response.data).forEach(key => {
          const errorValue = err.response.data[key];
          serverErrors[key] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
        });
      } else {
        serverErrors.general = 'Произошла ошибка при регистрации';
      }

      setErrors(serverErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Регистрация в PulseNews
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Создайте аккаунт, чтобы получить доступ ко всем функциям
          </Typography>

          {/* Выбор типа аккаунта */}
          {!loadingRoles && roles.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                Выберите тип аккаунта *
              </FormLabel>
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                {roles.map((role) => (
                  <Card 
                    key={role.id}
                    sx={{ 
                      cursor: 'pointer',
                      border: 2,
                      borderColor: formData.role === role.id ? 'primary.main' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.light',
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleRoleChange(role.id)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {role.name === 'reader' ? <Person color="primary" /> : <Edit color="primary" />}
                        <Typography variant="h6" fontWeight="bold">
                          {role.display_name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              {errors.role && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.role}
                </FormHelperText>
              )}
            </Box>
          )}

          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                required
                fullWidth
                id="first_name"
                label="Имя"
                name="first_name"
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                disabled={loading}
              />
              <TextField
                required
                fullWidth
                id="last_name"
                label="Фамилия"
                name="last_name"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                disabled={loading}
              />
            </Box>

            <TextField
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              id="email"
              label="Email адрес"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              id="phone"
              label="Телефон (необязательно)"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || 'Минимум 8 символов'}
              disabled={loading}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              fullWidth
              name="password2"
              label="Подтверждение пароля"
              type={showPassword ? 'text' : 'password'}
              id="password2"
              autoComplete="new-password"
              value={formData.password2}
              onChange={handleChange}
              error={!!errors.password2}
              helperText={errors.password2}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Уже есть аккаунт? Войдите
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
