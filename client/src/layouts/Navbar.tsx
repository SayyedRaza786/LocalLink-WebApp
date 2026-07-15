import React, { useState, useMemo } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomTheme } from '../context/ThemeContext';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Badge,
  Link,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from '@mui/icons-material';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, toggleColorMode } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDashboardRedirect = () => {
    handleCloseUserMenu();
    if (!user) return;
    if (user.role === 'ADMIN') {
      navigate('/admin');
    } else if (user.role === 'PROVIDER') {
      navigate('/provider');
    } else {
      navigate('/customer');
    }
  };

  const handleProfileRedirect = () => {
    handleCloseUserMenu();
    if (!user) return;
    if (user.role === 'ADMIN') {
      navigate('/admin/profile');
    } else if (user.role === 'PROVIDER') {
      navigate('/provider/profile');
    } else {
      navigate('/customer/profile');
    }
  };

  const handleLogoutClick = () => {
    handleCloseUserMenu();
    logout();
  };

  const handleNavClick = (sectionId: string) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const getActiveState = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: mode === 'light' ? '#0F172A' : '#0B0F19', // Dark blue in light mode, Deep Charcoal in dark mode
        backdropFilter: 'blur(12px) saturate(180%)',
        borderBottom: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        color: '#ffffff',
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '72px' }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              gap: 1.2,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#ffffff', fontSize: '15px' }}>
                L
              </Typography>
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 850,
                letterSpacing: '-0.3px',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontSize: '18px',
                color: '#ffffff',
              }}
            >
              LocalLink
            </Typography>
          </Box>

          {/* Navigation Links (Center) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3.5 }}>
            <Link
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: getActiveState('/') ? '#818CF8' : 'rgba(255, 255, 255, 0.75)',
                fontWeight: getActiveState('/') ? 700 : 600,
                fontSize: '14px',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': { color: '#818CF8' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: 0,
                  width: getActiveState('/') ? '100%' : '0%',
                  height: '2px',
                  backgroundColor: '#818CF8',
                  transition: 'width 0.2s ease',
                },
                '&:hover::after': { width: '100%' },
              }}
            >
              Home
            </Link>

            <Link
              component="button"
              onClick={() => handleNavClick('categories-section')}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                p: 0,
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: '"Inter", sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': { color: '#818CF8' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: 0,
                  width: '0%',
                  height: '2px',
                  backgroundColor: '#818CF8',
                  transition: 'width 0.2s ease',
                },
                '&:hover::after': { width: '100%' },
              }}
            >
              Categories
            </Link>

            <Link
              component="button"
              onClick={() => handleNavClick('how-it-works-section')}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                p: 0,
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: '"Inter", sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': { color: '#818CF8' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: 0,
                  width: '0%',
                  height: '2px',
                  backgroundColor: '#818CF8',
                  transition: 'width 0.2s ease',
                },
                '&:hover::after': { width: '100%' },
              }}
            >
              How It Works
            </Link>

            <Link
              component={RouterLink}
              to="/register?role=PROVIDER"
              sx={{
                textDecoration: 'none',
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': { color: '#818CF8' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: 0,
                  width: '0%',
                  height: '2px',
                  backgroundColor: '#818CF8',
                  transition: 'width 0.2s ease',
                },
                '&:hover::after': { width: '100%' },
              }}
            >
              Become a Provider
            </Link>

            <Link
              component="button"
              onClick={() => handleNavClick('about-section')}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                p: 0,
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: '"Inter", sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': { color: '#818CF8' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: 0,
                  width: '0%',
                  height: '2px',
                  backgroundColor: '#818CF8',
                  transition: 'width 0.2s ease',
                },
                '&:hover::after': { width: '100%' },
              }}
            >
              About
            </Link>
          </Box>

          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Explore Button */}
            <Button
              component={RouterLink}
              to="/search"
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                px: 2,
                py: 0.6,
                fontSize: '13px',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              Explore Services
            </Button>

            {/* Notification Badge */}
            {isAuthenticated && user && (
              <IconButton
                component={RouterLink}
                to={user.role === 'PROVIDER' ? '/provider/notifications' : '/customer/notifications'}
                color="inherit"
                sx={{ color: 'rgba(255, 255, 255, 0.75)', '&:hover': { color: '#ffffff' } }}
              >
                <Badge variant="dot" color="error" overlap="circular">
                  <NotificationsIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
            )}

            {/* Light/Dark Mode */}
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleColorMode} color="inherit" sx={{ color: 'rgba(255, 255, 255, 0.75)', '&:hover': { color: '#ffffff' } }}>
                {mode === 'dark' ? <LightIcon sx={{ fontSize: 20 }} /> : <DarkIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            {/* User Account Avatar Menu */}
            {isAuthenticated && user ? (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={`${user.firstName} ${user.lastName}`}
                      src={user.avatarUrl || undefined}
                      sx={{
                        width: 34,
                        height: 34,
                        border: '2px solid',
                        borderColor: '#4F46E5',
                      }}
                    >
                      {user.firstName[0]}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleDashboardRedirect} sx={{ fontWeight: 600, fontSize: '13px' }}>Dashboard</MenuItem>
                  <MenuItem onClick={handleProfileRedirect} sx={{ fontWeight: 600, fontSize: '13px' }}>My Profile</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogoutClick} sx={{ fontWeight: 600, fontSize: '13px' }}>
                    <Typography color="error" sx={{ fontWeight: 700, fontSize: '13px' }}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="text"
                  color="inherit"
                  size="small"
                  sx={{ fontWeight: 700, textTransform: 'none', color: 'rgba(255, 255, 255, 0.75)', fontSize: '13px', '&:hover': { color: '#ffffff' } }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    backgroundColor: '#4F46E5',
                    boxShadow: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#3730A3',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
