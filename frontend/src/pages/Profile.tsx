import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Snackbar,
  IconButton,
  Skeleton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  Article as ArticleIcon,
  Verified as VerifiedIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Inbox as InboxIcon,
  DeleteForever as DeleteForeverIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import authService from '../services/authService';
import { User, PasswordChangeData } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface UserActivity {
  id: number;
  action: string;
  action_display: string;
  ip_address: string;
  created_at: string;
  details: any;
}

// Password strength calculator
const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 15;
  if (/[^a-zA-Z\d]/.test(password)) strength += 10;
  
  let label = 'Слабый';
  let color = '#f44336';
  if (strength >= 75) {
    label = 'Сильный';
    color = '#4caf50';
  } else if (strength >= 50) {
    label = 'Средний';
    color = '#ff9800';
  }
  
  return { strength, label, color };
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Profile form state
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    birth_date: user?.birth_date || '',
    email_notifications: user?.email_notifications ?? true,
  });

  // Password change dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    old_password: '',
    new_password: '',
    new_password2: '',
  });

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        email_notifications: user.email_notifications ?? true,
      });
    }
  }, [user]);

  useEffect(() => {
    if (tabValue === 1) {
      loadActivities();
    }
  }, [tabValue]);

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await authService.getUserActivities();
      setActivities(response);
    } catch (err: any) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      if (user) {
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          bio: user.bio || '',
          phone: user.phone || '',
          birth_date: user.birth_date || '',
          email_notifications: user.email_notifications ?? true,
        });
      }
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          updateData.append(key, value.toString());
        }
      });

      // Add avatar if changed
      if (avatarFile) {
        updateData.append('avatar', avatarFile);
      }

      const updatedUser = await authService.updateProfile(updateData);
      updateUser(updatedUser);
      setSnackbarMessage('Профиль успешно обновлен!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.detail || 'Ошибка при обновлении профиля');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.changePassword(passwordData);
      setSnackbarMessage('Пароль успешно изменен!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setPasswordDialogOpen(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password2: '',
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.old_password?.[0] ||
                       err.response?.data?.new_password?.[0] ||
                       err.response?.data?.new_password2?.[0] ||
                       err.response?.data?.detail ||
                       'Ошибка при смене пароля';
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setSnackbarMessage('Введите DELETE для подтверждения');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      await authService.deleteAccount();
      setSnackbarMessage('Аккаунт успешно удален');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.detail || 'Ошибка при удалении аккаунта');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Hero Skeleton */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            pt: 8,
            pb: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Skeleton variant="circular" width={120} height={120} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="25%" height={24} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" width={100} height={24} sx={{ mt: 1, borderRadius: 2 }} />
              </Box>
            </Box>
          </Container>
        </Box>
        
        {/* Content Skeleton */}
        <Container maxWidth="lg" sx={{ mt: -6, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  const passwordStrength = calculatePasswordStrength(passwordData.new_password);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Header with Parallax */}
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            pt: 8,
            pb: 16,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
            },
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
                {/* Interactive Avatar */}
                <Box sx={{ position: 'relative' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      user.is_verified ? (
                        <Tooltip title="Email подтвержден" arrow>
                          <VerifiedIcon sx={{ color: '#4caf50', fontSize: 32, bgcolor: 'white', borderRadius: '50%' }} />
                        </Tooltip>
                      ) : null
                    }
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Avatar
                        src={avatarPreview || user.avatar_url || undefined}
                        alt={user.full_name}
                        sx={{
                          width: 120,
                          height: 120,
                          border: '4px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        }}
                      />
                    </motion.div>
                  </Badge>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ position: 'absolute', bottom: 0, right: 0 }}
                    >
                      <Tooltip title="Загрузить фото" arrow>
                        <IconButton
                          component="label"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            boxShadow: 2,
                          }}
                          aria-label="upload picture"
                        >
                          <CloudUploadIcon />
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </IconButton>
                      </Tooltip>
                    </motion.div>
                  )}
                </Box>

                {/* User Info */}
                <Box sx={{ flex: 1, color: 'white' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.8))',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    {user.full_name}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    @{user.username}
                  </Typography>
                  {user.role && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Chip
                        label={user.role.display_name}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                        }}
                      />
                    </motion.div>
                  )}
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Box>
      </motion.div>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: -8, mb: 4, position: 'relative', zIndex: 1 }}>
        {/* Metric Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  transition: 'all 0.3s',
                  boxShadow: 3,
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Дата регистрации
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Н/Д'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'grey.900',
                  color: 'white',
                  transition: 'all 0.3s',
                  boxShadow: 3,
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    bgcolor: 'grey.800',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ArticleIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Публикации
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {activities.filter(a => a.action === 'article_created').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'info.main',
                  color: 'white',
                  transition: 'all 0.3s',
                  boxShadow: 3,
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <HistoryIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Активность
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {activities.length} действий
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </motion.div>

        {/* Tabs and Content */}
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: tabValue === 0 ? '0%' : '50%',
                width: '50%',
                height: 3,
                bgcolor: 'primary.main',
                transition: 'left 0.3s ease',
              },
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
              }}
            >
              <Tab label="Профиль" icon={<EditIcon />} iconPosition="start" aria-label="profile information" />
              <Tab label="История активности" icon={<HistoryIcon />} iconPosition="start" aria-label="activity history" />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key="profile-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {/* Personal Information Card */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Card
                      sx={{
                        mb: 3,
                        border: isEditing ? '2px solid' : '1px solid',
                        borderColor: isEditing ? 'primary.main' : 'divider',
                        transition: 'all 0.3s',
                        boxShadow: isEditing ? 4 : 1,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EditIcon color="primary" />
                          Личная информация
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2.5}>
                          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                              fullWidth
                              label="Имя"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              helperText="Ваше имя"
                              inputProps={{ 'aria-label': 'first name' }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.2s',
                                  '&:hover': isEditing ? { transform: 'translateY(-2px)' } : {},
                                },
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Фамилия"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              helperText="Ваша фамилия"
                              inputProps={{ 'aria-label': 'last name' }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.2s',
                                  '&:hover': isEditing ? { transform: 'translateY(-2px)' } : {},
                                },
                              }}
                            />
                          </Box>

                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                            helperText="Ваш адрес электронной почты"
                            inputProps={{ 'aria-label': 'email' }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                transition: 'all 0.2s',
                                '&:hover': isEditing ? { transform: 'translateY(-2px)' } : {},
                              },
                            }}
                          />

                          <TextField
                            fullWidth
                            label="О себе"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            multiline
                            rows={3}
                            placeholder="Расскажите о себе..."
                            helperText="Краткое описание о вас"
                            inputProps={{ 'aria-label': 'bio', maxLength: 500 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                transition: 'all 0.2s',
                                '&:hover': isEditing ? { transform: 'translateY(-2px)' } : {},
                              },
                            }}
                          />

                          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                              fullWidth
                              label="Телефон"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="+7 (999) 999-99-99"
                              helperText="Контактный телефон"
                              inputProps={{ 'aria-label': 'phone' }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.2s',
                                  '&:hover': isEditing ? { transform: 'translateY(-2px)' } : {},
                                },
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Дата рождения"
                              name="birth_date"
                              type="date"
                              value={formData.birth_date}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              InputLabelProps={{ shrink: true }}
                              helperText="Ваша дата рождения"
                              inputProps={{ 'aria-label': 'birth date' }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  transition: 'all 0.2s',
                                  '&:hover': isEditing ? { transform: 'translateY(-2px)' } : {},
                                },
                              }}
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Sticky Action Panel */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        position: 'sticky',
                        bottom: 16,
                        zIndex: 10,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        {!isEditing && (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Нажмите "Редактировать" для изменения данных
                            </Typography>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Tooltip title="Безвозвратное удаление аккаунта" arrow>
                                <Button
                                  variant="text"
                                  color="error"
                                  startIcon={<DeleteForeverIcon />}
                                  onClick={() => setDeleteDialogOpen(true)}
                                  size="small"
                                  sx={{
                                    opacity: 0.7,
                                    '&:hover': {
                                      opacity: 1,
                                      bgcolor: 'error.light',
                                      color: 'error.dark',
                                    },
                                  }}
                                  aria-label="delete account"
                                >
                                  Удалить аккаунт
                                </Button>
                              </Tooltip>
                            </motion.div>
                          </>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {!isEditing ? (
                          <>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={handleEditToggle}
                                size="large"
                                sx={{
                                  minWidth: { xs: 'auto', sm: 160 },
                                }}
                                aria-label="edit profile"
                              >
                                Редактировать
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outlined"
                                startIcon={<LockIcon />}
                                onClick={() => setPasswordDialogOpen(true)}
                                size="large"
                                sx={{ minWidth: { xs: 'auto', sm: 160 } }}
                                aria-label="change password"
                              >
                                Сменить пароль
                              </Button>
                            </motion.div>
                          </>
                        ) : (
                          <>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={handleEditToggle}
                                disabled={loading}
                                size="large"
                                aria-label="cancel editing"
                              >
                                Отмена
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? null : <SaveIcon />}
                                disabled={loading}
                                size="large"
                                sx={{
                                  minWidth: 140,
                                }}
                                aria-label="save changes"
                              >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить'}
                              </Button>
                            </motion.div>
                          </>
                        )}
                      </Box>
                    </Paper>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </Box>
          </TabPanel>

          {/* Activity History Tab */}
          <TabPanel value={tabValue} index={1}>
            {loadingActivities ? (
              <Stack spacing={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : activities.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <List>
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateX(8px)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {activity.action_display}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {formatDate(activity.created_at)}
                              </Typography>
                              {activity.ip_address && (
                                <Typography component="span" variant="body2" color="text.secondary">
                                  {' — IP: ' + activity.ip_address}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < activities.length - 1 && <Divider component="li" />}
                    </motion.div>
                  ))}
                </List>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 3,
                  }}
                >
                  <InboxIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    История активности пуста
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Здесь будут отображаться ваши действия в системе
                  </Typography>
                </Box>
              </motion.div>
            )}
          </TabPanel>
        </Paper>
      </Container>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => !loading && setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon color="primary" />
              <Typography variant="h6">Смена пароля</Typography>
            </Box>
            <IconButton
              onClick={() => setPasswordDialogOpen(false)}
              disabled={loading}
              size="small"
              aria-label="close dialog"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Текущий пароль"
              type="password"
              value={passwordData.old_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, old_password: e.target.value })
              }
              required
              inputProps={{ 'aria-label': 'current password' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s',
                  '&:focus-within': {
                    transform: 'translateY(-2px)',
                  },
                },
              }}
            />
            <Box>
              <TextField
                fullWidth
                label="Новый пароль"
                type="password"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new_password: e.target.value })
                }
                required
                inputProps={{ 'aria-label': 'new password' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.2s',
                    '&:focus-within': {
                      transform: 'translateY(-2px)',
                    },
                  },
                }}
              />
              {passwordData.new_password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Надежность пароля
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: passwordStrength.color, fontWeight: 600 }}
                      >
                        {passwordStrength.label}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength.strength}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: passwordStrength.color,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Используйте минимум 8 символов, включая заглавные и строчные буквы, цифры и спецсимволы
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </Box>
            <TextField
              fullWidth
              label="Подтвердите новый пароль"
              type="password"
              value={passwordData.new_password2}
              onChange={(e) =>
                setPasswordData({ ...passwordData, new_password2: e.target.value })
              }
              required
              error={passwordData.new_password2 !== '' && passwordData.new_password !== passwordData.new_password2}
              helperText={
                passwordData.new_password2 !== '' && passwordData.new_password !== passwordData.new_password2
                  ? 'Пароли не совпадают'
                  : ''
              }
              inputProps={{ 'aria-label': 'confirm new password' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s',
                  '&:focus-within': {
                    transform: 'translateY(-2px)',
                  },
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            disabled={loading}
            aria-label="cancel password change"
          >
            Отмена
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handlePasswordChange}
              variant="contained"
              disabled={loading || passwordData.new_password !== passwordData.new_password2}
              sx={{
                minWidth: 140,
              }}
              aria-label="submit password change"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Сменить пароль'}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !loading && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'error.main',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, bgcolor: 'error.light', color: 'error.dark' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Удаление аккаунта
              </Typography>
            </Box>
            <IconButton
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
              size="small"
              aria-label="close dialog"
              sx={{ color: 'error.dark' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              ⚠️ Это действие необратимо!
            </Typography>
            <Typography variant="body2">
              Все ваши данные, публикации и настройки будут безвозвратно удалены.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
              Что будет удалено:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Профиль и личная информация
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Все публикации и комментарии
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                История активности
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Настройки и предпочтения
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Для подтверждения введите <Box component="span" sx={{ color: 'error.main', fontFamily: 'monospace', fontSize: '1.1em' }}>DELETE</Box>
            </Typography>
            <TextField
              fullWidth
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Введите DELETE"
              disabled={loading}
              autoComplete="off"
              inputProps={{
                'aria-label': 'delete confirmation',
                style: { fontFamily: 'monospace', fontSize: '1.1em' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: deleteConfirmText === 'DELETE' ? 'error.main' : 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
              helperText={
                deleteConfirmText && deleteConfirmText !== 'DELETE'
                  ? 'Введите точно DELETE (заглавными буквами)'
                  : deleteConfirmText === 'DELETE'
                  ? '✓ Подтверждение принято'
                  : ''
              }
              error={deleteConfirmText !== '' && deleteConfirmText !== 'DELETE'}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteConfirmText('');
            }}
            disabled={loading}
            variant="outlined"
            aria-label="cancel account deletion"
          >
            Отмена
          </Button>
          <motion.div whileHover={{ scale: deleteConfirmText === 'DELETE' ? 1.05 : 1 }} whileTap={{ scale: deleteConfirmText === 'DELETE' ? 0.95 : 1 }}>
            <Button
              onClick={handleDeleteAccount}
              variant="contained"
              color="error"
              disabled={loading || deleteConfirmText !== 'DELETE'}
              startIcon={loading ? null : <DeleteForeverIcon />}
              sx={{
                minWidth: 140,
                fontWeight: 700,
              }}
              aria-label="confirm account deletion"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Удалить навсегда'}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: '100%',
            boxShadow: 3,
          }}
          aria-live="polite"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
