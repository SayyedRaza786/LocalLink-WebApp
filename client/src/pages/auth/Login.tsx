import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

// Zod Login Schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if redirected due to expired session
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Successfully logged in!');
      
      const origin = (location.state as any)?.from?.pathname;
      if (origin) {
        navigate(origin, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
        fontFamily: '"Inter", sans-serif',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-entrance {
          animation: fadeSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      ` }} />

      <Grid container sx={{ minHeight: '100vh' }}>
        {/* ==========================================
            LEFT COLUMN (40% Width) - Brand & Welcome
            ========================================== */}
        <Grid
          item
          xs={12}
          md={4.8}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 6,
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #F3F4F6 0%, #E0E7FF 100%)'
                : 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>
                L
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.3px' }}>
              LocalLink
            </Typography>
          </Box>

          {/* Heading and Description */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2, mb: 2, letterSpacing: '-0.8px' }}>
              Welcome back to LocalLink
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.5, fontWeight: 500 }}>
              Access your personal dashboard to track bookings, manage services, and connect with trusted local pros.
            </Typography>
          </Box>
          <Box />
        </Grid>

        {/* ==========================================
            RIGHT COLUMN (60% Width) - Login Form
            ========================================== */}
        <Grid
          item
          xs={12}
          md={7.2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 2, sm: 4, md: 6 },
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          {/* White Rounded Card */}
          <Card
            sx={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              {/* Header Title */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.4px', mb: 0.5 }}>
                  Sign in to LocalLink
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Enter your credentials below to access your account.
                </Typography>
              </Box>

              {/* Expired Session Alert */}
              {isExpired && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2.5,
                    py: 0.5,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    color: '#D97706',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                  }}
                >
                  Your session has expired. Please sign in again.
                </Alert>
              )}

              {/* API Errors */}
              {apiError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2.5,
                    py: 0.5,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                  }}
                >
                  {apiError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className="form-entrance">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Email Address"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isSubmitting}
                    {...register('email')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: 'background.paper',
                        '& fieldset': { borderColor: 'divider' },
                        '&:hover fieldset': { borderColor: 'text.secondary' },
                        '&.Mui-focused fieldset': { borderColor: '#4F46E5', boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)' },
                      },
                      '& .MuiInputLabel-root': { color: 'text.secondary', fontSize: '13px' },
                      '& .MuiOutlinedInput-input': { color: 'text.primary' },
                    }}
                  />

                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isSubmitting}
                    {...register('password')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary', p: 0.5 }}>
                            {showPassword ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: 'background.paper',
                        '& fieldset': { borderColor: 'divider' },
                        '&:hover fieldset': { borderColor: 'text.secondary' },
                        '&.Mui-focused fieldset': { borderColor: '#4F46E5', boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)' },
                      },
                      '& .MuiInputLabel-root': { color: 'text.secondary', fontSize: '13px' },
                      '& .MuiOutlinedInput-input': { color: 'text.primary' },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      py: 1.1,
                      fontWeight: 750,
                      borderRadius: '8px',
                      textTransform: 'none',
                      backgroundColor: '#4F46E5',
                      boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)',
                      '&:hover': { backgroundColor: '#3730A3' },
                    }}
                  >
                    {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
                  </Button>
                </Box>

                {/* OR DIVIDER */}
                <Box sx={{ my: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ height: '1px', backgroundColor: 'divider', flexGrow: 1 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '10px' }}>
                    OR
                  </Typography>
                  <Box sx={{ height: '1px', backgroundColor: 'divider', flexGrow: 1 }} />
                </Box>

                {/* GOOGLE SOCIAL LOGIN */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => toast.success('Google login is visual-only')}
                  startIcon={
                    <Box
                      component="img"
                      src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=20&h=20&fit=crop"
                      sx={{ width: 14, height: 14, borderRadius: '50%' }}
                    />
                  }
                  sx={{
                    py: 1,
                    borderRadius: '8px',
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '12px',
                    '&:hover': {
                      borderColor: 'text.secondary',
                      backgroundColor: 'background.default',
                    },
                  }}
                >
                  Continue with Google
                </Button>

                {/* SIGN UP REDIRECT */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      underline="none"
                      sx={{
                        color: '#4F46E5',
                        fontWeight: 700,
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -1,
                          left: 0,
                          width: '0%',
                          height: '1px',
                          backgroundColor: '#4F46E5',
                          transition: 'width 0.2s ease',
                        },
                        '&:hover::after': { width: '100%' },
                      }}
                    >
                      Sign Up
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
