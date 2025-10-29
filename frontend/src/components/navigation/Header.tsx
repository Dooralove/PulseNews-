import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, shadows, zIndex } from '../../theme/designTokens';
import { Container } from '../layout';
import { Button } from '../ui';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle,
  Login,
  PersonAdd,
  Logout,
  Article,
  Create,
  Bookmarks,
  Search,
} from '@mui/icons-material';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, canManageArticles } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const headerStyles: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    backgroundColor: colors.neutral.gray900,
    color: colors.neutral.white,
    zIndex: zIndex.sticky,
    boxShadow: shadows.md,
  };

  const topBarStyles: React.CSSProperties = {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const brandAccentStyles: React.CSSProperties = {
    color: colors.brand.red,
  };

  const navStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[6],
  };

  const navLinkStyles: React.CSSProperties = {
    color: colors.neutral.white,
    textDecoration: 'none',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    padding: `${spacing[2]} ${spacing[3]}`,
    transition: 'color 200ms',
    cursor: 'pointer',
  };

  const iconButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: colors.neutral.white,
    cursor: 'pointer',
    padding: spacing[2],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const userMenuStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: colors.neutral.white,
    boxShadow: shadows.lg,
    minWidth: '200px',
    marginTop: spacing[2],
    zIndex: zIndex.dropdown,
  };

  const menuItemStyles: React.CSSProperties = {
    padding: `${spacing[3]} ${spacing[4]}`,
    color: colors.text.primary,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    cursor: 'pointer',
    transition: 'background-color 200ms',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    fontSize: typography.fontSize.base,
  };

  return (
    <header style={headerStyles}>
      <Container>
        <div style={topBarStyles}>
          {/* Logo */}
          <RouterLink to="/" style={logoStyles}>
            <span style={brandAccentStyles}>Pulse</span>
            <span>News</span>
          </RouterLink>

          {/* Desktop Navigation */}
          <nav style={{ ...navStyles, display: window.innerWidth >= 768 ? 'flex' : 'none' }}>
            <RouterLink to="/" style={navLinkStyles}>
              Главная
            </RouterLink>
            
            {isAuthenticated ? (
              <>
                {canManageArticles && (
                  <RouterLink to="/articles/create" style={navLinkStyles}>
                    Создать статью
                  </RouterLink>
                )}
                
                <div style={{ position: 'relative' }}>
                  <button
                    style={iconButtonStyles}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <AccountCircle />
                  </button>
                  
                  {userMenuOpen && (
                    <div style={userMenuStyles}>
                      <div style={{ padding: spacing[3], borderBottom: `1px solid ${colors.border.light}` }}>
                        <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[1] }}>
                          {user?.full_name || user?.username}
                        </div>
                        <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {user?.email}
                        </div>
                      </div>
                      
                      <button
                        style={menuItemStyles}
                        onClick={() => {
                          navigate('/profile');
                          setUserMenuOpen(false);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral.gray50}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <AccountCircle fontSize="small" />
                        Профиль
                      </button>
                      
                      {canManageArticles && (
                        <button
                          style={menuItemStyles}
                          onClick={() => {
                            navigate('/my-articles');
                            setUserMenuOpen(false);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral.gray50}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Article fontSize="small" />
                          Мои статьи
                        </button>
                      )}
                      
                      <button
                        style={menuItemStyles}
                        onClick={() => {
                          navigate('/bookmarks');
                          setUserMenuOpen(false);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral.gray50}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Bookmarks fontSize="small" />
                        Закладки
                      </button>
                      
                      <div style={{ borderTop: `1px solid ${colors.border.light}` }}>
                        <button
                          style={menuItemStyles}
                          onClick={handleLogout}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral.gray50}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Logout fontSize="small" />
                          Выйти
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <RouterLink to="/login" style={navLinkStyles}>
                  Войти
                </RouterLink>
                <RouterLink to="/register" style={navLinkStyles}>
                  Регистрация
                </RouterLink>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            style={{ ...iconButtonStyles, display: window.innerWidth >= 768 ? 'none' : 'flex' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>
    </header>
  );
};
