import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashIcon,
  ReceiptLong as BookingsIcon,
  Favorite as FavIcon,
  Person as ProfileIcon,
  Notifications as NotifIcon,
  Handyman as ServicesIcon,
  AccessTime as TimeIcon,
  Collections as GalleryIcon,
  RateReview as ReviewsIcon,
  People as UsersIcon,
  Category as CategoryIcon,
  Report as ReportIcon,
  VerifiedUser as VerifyIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Logout as LogoutIcon,
  Storefront as LogoIcon,
} from '@mui/icons-material';
import { useCustomTheme } from '../context/ThemeContext';

const DRAWER_WIDTH = 260;

interface SidebarItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Generate sidebar items based on role
  const getSidebarItems = (): SidebarItem[] => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { text: 'Dashboard', path: '/admin', icon: <DashIcon /> },
          { text: 'Categories', path: '/admin/categories', icon: <CategoryIcon /> },
          { text: 'User Management', path: '/admin/users', icon: <UsersIcon /> },
          { text: 'Provider Verification', path: '/admin/providers', icon: <VerifyIcon /> },
          { text: 'Reports', path: '/admin/reports', icon: <ReportIcon /> },
          { text: 'Profile Settings', path: '/admin/profile', icon: <ProfileIcon /> },
        ];
      case 'PROVIDER':
        return [
          { text: 'Dashboard', path: '/provider', icon: <DashIcon /> },
          { text: 'Services List', path: '/provider/services', icon: <ServicesIcon /> },
          { text: 'Bookings Queue', path: '/provider/bookings', icon: <BookingsIcon /> },
          { text: 'Availability Planner', path: '/provider/availability', icon: <TimeIcon /> },
          { text: 'Gallery Manager', path: '/provider/gallery', icon: <GalleryIcon /> },
          { text: 'Customer Reviews', path: '/provider/reviews', icon: <ReviewsIcon /> },
          { text: 'Notifications', path: '/provider/notifications', icon: <NotifIcon /> },
          { text: 'Profile Settings', path: '/provider/profile', icon: <ProfileIcon /> },
        ];
      case 'CUSTOMER':
      default:
        return [
          { text: 'Dashboard', path: '/customer', icon: <DashIcon /> },
          { text: 'My Bookings', path: '/customer/bookings', icon: <BookingsIcon /> },
          { text: 'Saved Providers', path: '/customer/favorites', icon: <FavIcon /> },
          { text: 'Notifications', path: '/customer/notifications', icon: <NotifIcon /> },
          { text: 'Profile Settings', path: '/customer/profile', icon: <ProfileIcon /> },
        ];
    }
  };

  const sidebarItems = getSidebarItems();

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Header/User Section */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          src={user.avatarUrl || undefined}
          alt={`${user.firstName} ${user.lastName}`}
          sx={{ width: 72, height: 72, border: '3px solid', borderColor: 'primary.main' }}
        >
          {user.firstName[0]}
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {user.email}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              px: 1.5,
              py: 0.25,
              borderRadius: '12px',
              backgroundColor: user.role === 'ADMIN' ? 'error.light' : user.role === 'PROVIDER' ? 'secondary.light' : 'primary.light',
              color: '#ffffff',
              fontSize: '10px',
            }}
          >
            {user.role}
          </Typography>
        </Box>
      </Box>
      <Divider />

      {/* Navigation List */}
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {sidebarItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                selected={isSelected}
                sx={{
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#ffffff',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isSelected ? '#ffffff' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: isSelected ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      {/* Sidebar Footer Actions */}
      <List sx={{ px: 2, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={logout} sx={{ borderRadius: '8px' }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, color: 'error.main' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '64px', px: 1 }}>
            {/* Left Toggle (Mobile only) */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" noWrap sx={{ fontWeight: 700, display: { md: 'none' } }}>
                LocalLink
              </Typography>
            </Box>

            {/* Right Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <Button
                component={RouterLink}
                to="/"
                variant="text"
                color="inherit"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Go to Homepage
              </Button>
              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton onClick={toggleColorMode} color="inherit">
                  {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Navigation Drawer (Sidebar) */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {sidebarContent}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px', // Offset for the fixed AppBar
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
export default DashboardLayout;
