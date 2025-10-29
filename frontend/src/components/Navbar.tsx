import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
          }}
        >
          PulseNews
        </Typography>

        <Button
          color="inherit"
          component={RouterLink}
          to="/"
          startIcon={<Article />}
        >
          Статьи
        </Button>

        {isAuthenticated ? (
          <>
            {canManageArticles && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/articles/create"
                startIcon={<Create />}
              >
                Создать статью
              </Button>
            )}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
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
              color="inherit"
              component={RouterLink}
              to="/login"
              startIcon={<Login />}
            >
              Войти
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              startIcon={<PersonAdd />}
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
