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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  HelpOutline as HowIcon,
  Storefront as ProviderIcon,
  Info as AboutIcon,
  Search as SearchIcon,
  Login as LoginIcon,
  PersonAdd as SignUpIcon,
} from '@mui/icons-material';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, toggleColorMode } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
    setMobileDrawerOpen(false);
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

  const handleMobileNavTo = (path: string) => {
    setMobileDrawerOpen(false);
    navigate(path);
  };

  // Desktop nav link style helper
  const navLinkSx = (isActive: boolean) => ({
    textDecoration: 'none',
    color: isActive ? '#818CF8' : 'rgba(255, 255, 255, 0.75)',
    fontWeight: isActive ? 700 : 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    '&:hover': { color: '#818CF8' },
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      bottom: -6,
      left: 0,
      width: isActive ? '100%' : '0%',
      height: '2px',
      backgroundColor: '#818CF8',
      transition: 'width 0.2s ease',
    },
    '&:hover::after': { width: '100%' },
  });

  const navButtonLinkSx = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    p: 0,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: 600,
    fontSize: '14px',
    fontFamily: '"Inter", sans-serif',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    '&:hover': { color: '#818CF8' },
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      bottom: -6,
      left: 0,
      width: '0%',
      height: '2px',
      backgroundColor: '#818CF8',
      transition: 'width 0.2s ease',
    },
    '&:hover::after': { width: '100%' },
  };

  // Mobile Drawer Content
  const mobileDrawerContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        backgroundColor: mode === 'light' ? '#0F172A' : '#0B0F19',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#ffffff', fontSize: '13px' }}>
              L
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: '"Outfit", sans-serif' }}>
            LocalLink
          </Typography>
        </Box>
        <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 1, py: 1.5, flexGrow: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleMobileNavTo('/')} sx={{ borderRadius: '8px', color: getActiveState('/') ? '#818CF8' : 'rgba(255,255,255,0.8)' }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><HomeIcon sx={{ fontSize: 20 }} /></ListItemIcon>
            <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavClick('categories-section')} sx={{ borderRadius: '8px', color: 'rgba(255,255,255,0.8)' }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><CategoryIcon sx={{ fontSize: 20 }} /></ListItemIcon>
            <ListItemText primary="Categories" primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavClick('how-it-works-section')} sx={{ borderRadius: '8px', color: 'rgba(255,255,255,0.8)' }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><HowIcon sx={{ fontSize: 20 }} /></ListItemIcon>
            <ListItemText primary="How It Works" primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => handleMobileNavTo('/register?role=PROVIDER')} sx={{ borderRadius: '8px', color: 'rgba(255,255,255,0.8)' }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><ProviderIcon sx={{ fontSize: 20 }} /></ListItemIcon>
            <ListItemText primary="Become a Provider" primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavClick('about-section')} sx={{ borderRadius: '8px', color: 'rgba(255,255,255,0.8)' }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><AboutIcon sx={{ fontSize: 20 }} /></ListItemIcon>
            <ListItemText primary="About" primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }} />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />

        <ListItem disablePadding>
          <ListItemButton onClick={() => handleMobileNavTo('/search')} sx={{ borderRadius: '8px', color: 'rgba(255,255,255,0.8)' }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><SearchIcon sx={{ fontSize: 20 }} /></ListItemIcon>
            <ListItemText primary="Explore Services" primaryTypographyProps={{ fontWeight: 600, fontSize: '14px' }} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Bottom Section: Auth / User Info */}
      <Box sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </Typography>
          <IconButton onClick={toggleColorMode} sx={{ color: 'rgba(255,255,255,0.7)' }} size="small">
            {mode === 'dark' ? <LightIcon sx={{ fontSize: 18 }} /> : <DarkIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>

        {isAuthenticated && user ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Avatar
                src={user.avatarUrl || undefined}
                alt={`${user.firstName} ${user.lastName}`}
                sx={{ width: 36, height: 36, border: '2px solid #4F46E5' }}
              >
                {user.firstName[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => {
                setMobileDrawerOpen(false);
                handleDashboardRedirect();
              }}
              sx={{
                mb: 1,
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.2)',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '12px',
                '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Dashboard
            </Button>
            <Button
              fullWidth
              variant="text"
              size="small"
              onClick={() => {
                setMobileDrawerOpen(false);
                handleLogoutClick();
              }}
              sx={{
                color: '#EF4444',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '12px',
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={() => handleMobileNavTo('/register')}
              startIcon={<SignUpIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                backgroundColor: '#4F46E5',
                boxShadow: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                '&:hover': { backgroundColor: '#3730A3' },
              }}
            >
              Sign Up
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleMobileNavTo('/login')}
              startIcon={<LoginIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Login
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
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
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: '60px', md: '72px' } }}>
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

            {/* Navigation Links (Center) — Desktop only */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3.5 }}>
              <Link component={RouterLink} to="/" sx={navLinkSx(getActiveState('/'))}>
                Home
              </Link>

              <Link component="button" onClick={() => handleNavClick('categories-section')} sx={navButtonLinkSx}>
                Categories
              </Link>

              <Link component="button" onClick={() => handleNavClick('how-it-works-section')} sx={navButtonLinkSx}>
                How It Works
              </Link>

              <Link component={RouterLink} to="/register?role=PROVIDER" sx={{
                ...navLinkSx(false),
                textDecoration: 'none',
              }}>
                Become a Provider
              </Link>

              <Link component="button" onClick={() => handleNavClick('about-section')} sx={navButtonLinkSx}>
                About
              </Link>
            </Box>

            {/* Right Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 } }}>
              {/* Explore Button — hidden on xs */}
              <Button
                component={RouterLink}
                to="/search"
                variant="outlined"
                size="small"
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
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

              {/* Light/Dark Mode — hidden on xs, visible in drawer instead */}
              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton
                  onClick={toggleColorMode}
                  color="inherit"
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'rgba(255, 255, 255, 0.75)', '&:hover': { color: '#ffffff' } }}
                >
                  {mode === 'dark' ? <LightIcon sx={{ fontSize: 20 }} /> : <DarkIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              </Tooltip>

              {/* User Account Avatar Menu — Desktop only */}
              {isAuthenticated && user ? (
                <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'block' } }}>
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
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
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

              {/* Hamburger Menu — Mobile only */}
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                color="inherit"
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  color: 'rgba(255, 255, 255, 0.85)',
                  ml: 0.5,
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            border: 'none',
          },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
