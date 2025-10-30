import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountCircle,
  Login,
  PersonAdd,
  Logout,
  Article,
  Create,
  Bookmarks,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, canManageArticles } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    handleClose();
    navigate(path);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <motion.div
          style={{ flexGrow: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            PulseNews
          </Typography>
        </motion.div>

        <Button
          component={motion.button}
          color="inherit"
          onClick={() => navigate('/')}
          startIcon={
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Article />
            </motion.div>
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Статьи
        </Button>

        {isAuthenticated ? (
          <>
            {canManageArticles && (
              <Button
                component={motion.button}
                color="inherit"
                onClick={() => navigate('/articles/create')}
                startIcon={
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Create />
                  </motion.div>
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Создать статью
              </Button>
            )}
            <IconButton
              component={motion.button}
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {user?.avatar_url ? (
                <Avatar src={user.avatar_url} alt={user.username} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.full_name || user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                {user?.role && (
                  <Typography variant="caption" color="primary">
                    {user.role.display_name}
                  </Typography>
                )}
              </Box>
              <Divider />
              <MenuItem onClick={() => handleNavigate('/profile')}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Профиль</ListItemText>
              </MenuItem>
              {canManageArticles && (
                <MenuItem onClick={() => handleNavigate('/my-articles')}>
                  <ListItemIcon>
                    <Article fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Мои статьи</ListItemText>
                </MenuItem>
              )}
              <MenuItem onClick={() => handleNavigate('/bookmarks')}>
                <ListItemIcon>
                  <Bookmarks fontSize="small" />
                </ListItemIcon>
                <ListItemText>Закладки</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Выйти</ListItemText>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button
              component={motion.button}
              color="inherit"
              onClick={() => navigate('/login')}
              startIcon={
                <motion.div
                  whileHover={{ x: [0, -3, 3, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Login />
                </motion.div>
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Войти
            </Button>
            <Button
              component={motion.button}
              color="inherit"
              onClick={() => navigate('/register')}
              startIcon={
                <motion.div
                  whileHover={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  <PersonAdd />
                </motion.div>
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Регистрация
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
