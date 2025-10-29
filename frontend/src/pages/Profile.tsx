import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  History as HistoryIcon,
  DeleteForever as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts';
import authService from '../services/authService';
import { User, PasswordChangeData } from '../types';
import { useNavigate } from 'react-router-dom';

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

const Profile: React.FC = () => {
  const { user, updateUser, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

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

  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
      setSuccess('Профиль успешно обновлен!');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при обновлении профиля');
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
      setSuccess('Пароль успешно изменен!');
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
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Введите DELETE для подтверждения');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteAccount();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при удалении аккаунта');
    } finally {
      setLoading(false);
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Профиль" icon={<EditIcon />} iconPosition="start" />
            <Tab label="История активности" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              {/* Avatar Section */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  minWidth: 250,
                }}
              >
                <Avatar
                  src={avatarPreview || user.avatar_url || undefined}
                  alt={user.full_name}
                  sx={{ width: 150, height: 150 }}
                />
                {isEditing && (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                  >
                    Загрузить фото
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </Button>
                )}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{user.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{user.username}
                  </Typography>
                  {user.role && (
                    <Chip
                      label={user.role.display_name}
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Profile Information */}
              <Box sx={{ flex: 1 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      fullWidth
                      label="Имя"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Фамилия"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
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
                    />
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Account Information */}
                <Typography variant="h6" gutterBottom>
                  Информация об аккаунте
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Дата регистрации
                    </Typography>
                    <Typography variant="body1">
                      {user.created_at ? formatDate(user.created_at) : 'Н/Д'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email подтвержден
                    </Typography>
                    <Chip
                      label={user.is_verified ? 'Да' : 'Нет'}
                      color={user.is_verified ? 'success' : 'warning'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isEditing}
                  >
                    Удалить аккаунт
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {!isEditing ? (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleEditToggle}
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<LockIcon />}
                          onClick={() => setPasswordDialogOpen(true)}
                        >
                          Сменить пароль
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleEditToggle}
                          disabled={loading}
                        >
                          Отмена
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Activity History Tab */}
        <TabPanel value={tabValue} index={1}>
          {loadingActivities ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : activities.length > 0 ? (
            <List>
              {activities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={activity.action_display}
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
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                История активности пуста
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => !loading && setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Смена пароля</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Текущий пароль"
            type="password"
            value={passwordData.old_password}
            onChange={(e) =>
              setPasswordData({ ...passwordData, old_password: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Новый пароль"
            type="password"
            value={passwordData.new_password}
            onChange={(e) =>
              setPasswordData({ ...passwordData, new_password: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Подтвердите новый пароль"
            type="password"
            value={passwordData.new_password2}
            onChange={(e) =>
              setPasswordData({ ...passwordData, new_password2: e.target.value })
            }
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Сменить пароль'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !loading && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Удаление аккаунта</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Это действие необратимо! Все ваши данные будут удалены.
          </Alert>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" sx={{ mb: 2 }}>
            Для подтверждения удаления аккаунта введите <strong>DELETE</strong> в поле ниже:
          </Typography>
          <TextField
            fullWidth
            label="Введите DELETE"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setDeleteConfirmText('');
            setError(null);
          }} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={loading || deleteConfirmText !== 'DELETE'}
          >
            {loading ? <CircularProgress size={24} /> : 'Удалить аккаунт'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
