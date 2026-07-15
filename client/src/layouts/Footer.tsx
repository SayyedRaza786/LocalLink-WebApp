import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Grid, Stack, IconButton } from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { useCustomTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useCustomTheme();

  const handleNavClick = (sectionId: string) => {
    // If we are on home, scroll to the section. Otherwise redirect home first.
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <Box
      component="footer"
      id="about-section"
      sx={{
        py: 7,
        px: 2,
        mt: 'auto',
        backgroundColor: mode === 'light' ? '#0F172A' : '#0B0F19', // Dark blue in light mode, Deep Charcoal in dark mode
        borderTop: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5} justifyContent="space-between">
          {/* Col 1: Logo & Slogan */}
          <Grid item xs={12} md={3.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 850,
                  fontSize: '17px',
                  letterSpacing: '-0.3px',
                  fontFamily: '"Outfit", sans-serif',
                  color: '#FFFFFF', // Pure white
                }}
              >
                LocalLink
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6, mb: 3 }}>
              Connecting local services with local people. Find certified, pre-screened experts for all your home, repair, and educational needs.
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.5)' }}>
              &copy; {new Date().getFullYear()} LocalLink. All rights reserved.
            </Typography>
          </Grid>

          {/* Col 2: Quick Links */}
          <Grid item xs={6} sm={4} md={2.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/search" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' }, fontWeight: 500 }} variant="body2" underline="hover">
                Search Providers
              </Link>
              <Link component={RouterLink} to="/register?role=PROVIDER" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' }, fontWeight: 500 }} variant="body2" underline="hover">
                Become a Provider
              </Link>
              <Link
                component="button"
                onClick={() => handleNavClick('how-it-works-section')}
                sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' }, fontWeight: 500, background: 'none', border: 'none', p: 0, textAlign: 'left', cursor: 'pointer' }}
                variant="body2"
                underline="hover"
              >
                How It Works
              </Link>
              <Link href="#" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' }, fontWeight: 500 }} variant="body2" underline="hover">
                Help & Support
              </Link>
            </Stack>
          </Grid>

          {/* Col 3: Company */}
          <Grid item xs={6} sm={4} md={2.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>
              Company
            </Typography>
            <Stack spacing={1.5}>
              <Link
                component="button"
                onClick={() => handleNavClick('about-section')}
                sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' }, fontWeight: 500, background: 'none', border: 'none', p: 0, textAlign: 'left', cursor: 'pointer' }}
                variant="body2"
                underline="hover"
              >
                About Us
              </Link>
              <Link href="#" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' }, fontWeight: 500 }} variant="body2" underline="hover">
                Careers
              </Link>
              <Link href="#" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' }, fontWeight: 500 }} variant="body2" underline="hover">
                Terms & Conditions
              </Link>
              <Link href="#" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' }, fontWeight: 500 }} variant="body2" underline="hover">
                Privacy Policy
              </Link>
            </Stack>
          </Grid>

          {/* Col 4: Follow Us */}
          <Grid item xs={12} sm={4} md={3.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>
              Follow Us
            </Typography>
            <Stack direction="row" spacing={1} sx={{ ml: -1 }}>
              <IconButton component="a" href="https://facebook.com" target="_blank" color="inherit" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' } }}>
                <FacebookIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton component="a" href="https://instagram.com" target="_blank" color="inherit" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' } }}>
                <InstagramIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton component="a" href="https://twitter.com" target="_blank" color="inherit" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' } }}>
                <TwitterIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton component="a" href="https://linkedin.com" target="_blank" color="inherit" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' } }}>
                <LinkedInIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
