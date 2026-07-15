import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import categoryService from '../../services/categoryService';
import userService from '../../services/userService';
import providerService from '../../services/providerService';
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
  Avatar,
  Grid,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as CustomerIcon,
  Storefront as ProviderIcon,
  CloudUpload as UploadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Map as AreaIcon,
  Description as BioIcon,
} from '@mui/icons-material';

// Zod Registration Schema
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must be less than 100 characters')
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be less than 100 characters')
      .transform((val) => val.trim()),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .max(255, 'Email must be less than 255 characters')
      .transform((val) => val.toLowerCase().trim()),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .max(20, 'Phone must be less than 20 characters')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    role: z.enum(['CUSTOMER', 'PROVIDER']),

    // Provider details
    businessName: z.string().optional().or(z.literal('')),
    experienceYears: z.coerce.number().int().min(0, 'Experience must be 0 or more').optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    area: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    serviceRadiusKm: z.coerce.number().min(1, 'Radius must be at least 1km').optional().or(z.literal('')),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
    avatarUrl: z.string().optional().or(z.literal('')),

    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the Terms and Conditions'),
    subscribeNewsletter: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [providerStep, setProviderStep] = useState<1 | 2>(1);

  // Fetch active categories
  const { data: categories = [] } = useQuery({
    queryKey: ['activeCategories'],
    queryFn: categoryService.listActive,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
      acceptTerms: false,
      subscribeNewsletter: false,
    },
  });

  const passwordVal = watch('password') || '';
  const avatarUrlVal = watch('avatarUrl') || '';

  // Password checklist validation
  const checks = {
    length: passwordVal.length >= 8,
    uppercase: /[A-Z]/.test(passwordVal),
    lowercase: /[a-z]/.test(passwordVal),
    number: /\d/.test(passwordVal),
    special: /[^A-Za-z0-9]/.test(passwordVal),
  };

  const strengthScore = Object.values(checks).filter(Boolean).length;
  const getStrengthLabel = () => {
    if (!passwordVal) return { label: 'Not Entered', color: 'text.secondary', val: 0 };
    if (strengthScore <= 2) return { label: 'Weak', color: '#EF4444', val: 30 };
    if (strengthScore <= 4) return { label: 'Medium', color: '#F59E0B', val: 65 };
    return { label: 'Strong', color: '#10B981', val: 100 };
  };

  const strength = getStrengthLabel();

  // Profile photo upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name' || uploadPreset === 'your_upload_preset') {
      toast.error('Cloudinary is not configured. Profile picture can be uploaded later.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const resData = await response.json();
      if (resData.secure_url) {
        setValue('avatarUrl', resData.secure_url, { shouldValidate: true });
        toast.success('Profile picture uploaded successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload profile photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRoleSelection = (role: 'CUSTOMER' | 'PROVIDER') => {
    setSelectedRole(role);
    setValue('role', role);
    setProviderStep(1); // Reset provider step
  };

  const handleNextStep = async () => {
    const isStep1Valid = await trigger([
      'firstName',
      'lastName',
      'email',
      'phone',
      'password',
      'confirmPassword',
    ]);
    if (isStep1Valid) {
      setProviderStep(2);
    } else {
      toast.error('Please fix validation errors first.');
    }
  };

  const onSubmit = async (data: RegisterFormInputs) => {
    setApiError(null);
    setIsSubmitting(true);

    const signupPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
    };

    try {
      await signup(signupPayload);

      if (data.role === 'PROVIDER') {
        try {
          if (data.phone || data.avatarUrl) {
            await userService.updateProfile({
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone || null,
              avatarUrl: data.avatarUrl || null,
            });
          }

          await providerService.upsertProfile({
            bio: data.bio || null,
            experienceYears: data.experienceYears ? Number(data.experienceYears) : null,
            city: data.city || null,
            area: data.area || null,
            address: data.address || null,
            serviceRadiusKm: data.serviceRadiusKm ? Number(data.serviceRadiusKm) : null,
            isAvailable: true,
          });
        } catch (profileErr) {
          console.error('Failed setting up provider profile on register redirect:', profileErr);
          toast.error('Account registered! Profile setup failed, you can configure it later.');
        }
      }

      toast.success('Registration successful! Welcome to LocalLink.');
      navigate('/');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
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
        height: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
        fontFamily: '"Inter", sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-entrance {
          animation: fadeSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      ` }} />

      <Grid container sx={{ height: '100vh' }}>
        {/* ==========================================
            LEFT COLUMN (40% Width) - Airy Clean Gradient
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

          {/* Slogan */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2, mb: 2, letterSpacing: '-0.8px' }}>
              Join the World of LocalLink - Forever Connected
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.5, fontWeight: 500 }}>
              Connect with verified local professionals or scale your services business with thousands of customers.
            </Typography>
          </Box>
          <Box />
        </Grid>

        {/* ==========================================
            RIGHT COLUMN (60% Width) - Premium Card
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
            height: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          {/* Minimal Rounded White Card */}
          <Card
            sx={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
              {/* Header Title */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 850, color: 'text.primary', letterSpacing: '-0.4px', mb: 0.5 }}>
                  Create your account
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Start finding trusted local professionals today.
                </Typography>
              </Box>

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

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Custom Role Selector (Clean Card Toggle) */}
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  <Grid item xs={6}>
                    <Box
                      onClick={() => handleRoleSelection('CUSTOMER')}
                      sx={{
                        py: 1.2,
                        px: 2,
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderColor: selectedRole === 'CUSTOMER' ? '#4F46E5' : 'divider',
                        backgroundColor: selectedRole === 'CUSTOMER' ? 'rgba(79, 70, 229, 0.04)' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        '&:hover': {
                          borderColor: '#4F46E5',
                        },
                      }}
                    >
                      <CustomerIcon sx={{ fontSize: 18, color: selectedRole === 'CUSTOMER' ? '#4F46E5' : 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: selectedRole === 'CUSTOMER' ? '#4F46E5' : 'text.primary', fontSize: '13px' }}>
                        Customer
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box
                      onClick={() => handleRoleSelection('PROVIDER')}
                      sx={{
                        py: 1.2,
                        px: 2,
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderColor: selectedRole === 'PROVIDER' ? '#4F46E5' : 'divider',
                        backgroundColor: selectedRole === 'PROVIDER' ? 'rgba(79, 70, 229, 0.04)' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        '&:hover': {
                          borderColor: '#4F46E5',
                        },
                      }}
                    >
                      <ProviderIcon sx={{ fontSize: 18, color: selectedRole === 'PROVIDER' ? '#4F46E5' : 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: selectedRole === 'PROVIDER' ? '#4F46E5' : 'text.primary', fontSize: '13px' }}>
                        Provider
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Conditional Fields Swapping */}
                {selectedRole === 'CUSTOMER' || (selectedRole === 'PROVIDER' && providerStep === 1) ? (
                  /* ==========================================
                      STEP 1: Basic Info (Customer / Provider Part 1)
                      ========================================== */
                  <Box className="form-entrance" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label="First Name"
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                          disabled={isSubmitting}
                          {...register('firstName')}
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
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label="Last Name"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                          disabled={isSubmitting}
                          {...register('lastName')}
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
                      </Grid>
                    </Grid>

                    <TextField
                      required
                      fullWidth
                      size="small"
                      label="Email Address"
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
                      fullWidth
                      size="small"
                      label="Phone Number"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={isSubmitting}
                      {...register('phone')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
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

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
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
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label="Confirm Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword?.message}
                          disabled={isSubmitting}
                          {...register('confirmPassword')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: 'text.secondary', p: 0.5 }}>
                                  {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
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
                      </Grid>
                    </Grid>

                    {/* COMPACT STRENGTH INDICATOR */}
                    {passwordVal && (
                      <Box sx={{ p: 1, borderRadius: '6px', border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Password Strength: <span style={{ color: strength.color, fontWeight: 800 }}>{strength.label}</span>
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={strength.val}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'divider',
                            '& .MuiLinearProgress-bar': { backgroundColor: strength.color, borderRadius: 2 },
                          }}
                        />
                      </Box>
                    )}

                    {selectedRole === 'CUSTOMER' && (
                      <>
                        <FormControlLabel
                          control={
                            <Checkbox
                              required
                              size="small"
                              {...register('acceptTerms')}
                              sx={{
                                color: 'divider',
                                '&.Mui-checked': { color: '#4F46E5' },
                                p: 0.5,
                                ml: 0.5,
                              }}
                            />
                          }
                          label={
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              I accept the{' '}
                              <Link href="#" underline="hover" sx={{ color: '#4F46E5', fontWeight: 600 }}>
                                Terms & Conditions
                              </Link>
                              .
                            </Typography>
                          }
                        />
                        {errors.acceptTerms && (
                          <Typography variant="caption" color="error" sx={{ ml: 4, mt: -1, fontWeight: 500 }}>
                            {errors.acceptTerms.message}
                          </Typography>
                        )}

                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          disabled={isSubmitting}
                          sx={{
                            py: 1,
                            fontWeight: 700,
                            borderRadius: '8px',
                            textTransform: 'none',
                            backgroundColor: '#4F46E5',
                            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)',
                            '&:hover': { backgroundColor: '#3730A3' },
                          }}
                        >
                          {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
                        </Button>
                      </>
                    )}

                    {selectedRole === 'PROVIDER' && (
                      <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        onClick={handleNextStep}
                        sx={{
                          py: 1,
                          fontWeight: 700,
                          borderRadius: '8px',
                          textTransform: 'none',
                          backgroundColor: '#4F46E5',
                          boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)',
                          '&:hover': { backgroundColor: '#3730A3' },
                        }}
                      >
                        Continue to Business Setup
                      </Button>
                    )}
                  </Box>
                ) : (
                  /* ==========================================
                      STEP 2: Provider Details
                      ========================================== */
                  <Box className="form-entrance" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Business / Brand Name"
                          error={!!errors.businessName}
                          helperText={errors.businessName?.message}
                          disabled={isSubmitting}
                          {...register('businessName')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
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
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Experience (Years)"
                          type="number"
                          error={!!errors.experienceYears}
                          helperText={errors.experienceYears?.message}
                          disabled={isSubmitting}
                          {...register('experienceYears')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <HistoryIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
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
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Serving City"
                          error={!!errors.city}
                          helperText={errors.city?.message}
                          disabled={isSubmitting}
                          {...register('city')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AreaIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
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
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Radius (km)"
                          type="number"
                          error={!!errors.serviceRadiusKm}
                          helperText={errors.serviceRadiusKm?.message}
                          disabled={isSubmitting}
                          {...register('serviceRadiusKm')}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AreaIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
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
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      size="small"
                      label="Short Bio"
                      multiline
                      rows={1.5}
                      error={!!errors.bio}
                      helperText={errors.bio?.message}
                      disabled={isSubmitting}
                      {...register('bio')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <BioIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
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

                    {/* Compact photo selector */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.2, borderRadius: '8px', border: '1px dashed', borderColor: 'divider', backgroundColor: 'background.default' }}>
                      <Avatar
                        src={avatarUrlVal || undefined}
                        alt="Preview"
                        sx={{ width: 36, height: 36, border: '1px solid #4F46E5' }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                          disabled={uploading || isSubmitting}
                          startIcon={uploading ? <CircularProgress size={10} color="inherit" /> : <UploadIcon sx={{ fontSize: 12 }} />}
                          sx={{
                            py: 0.2,
                            px: 1,
                            borderColor: 'divider',
                            color: 'text.primary',
                            fontWeight: 700,
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontSize: '11px',
                            '&:hover': { borderColor: 'text.secondary', backgroundColor: 'background.paper' },
                          }}
                        >
                          {uploading ? 'Uploading...' : 'Upload Photo'}
                          <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                        </Button>
                      </Box>
                    </Box>

                    <FormControlLabel
                      control={
                        <Checkbox
                          required
                          size="small"
                          {...register('acceptTerms')}
                          sx={{
                            color: 'divider',
                            '&.Mui-checked': { color: '#4F46E5' },
                            p: 0.5,
                            ml: 0.5,
                          }}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          I accept the{' '}
                          <Link href="#" underline="hover" sx={{ color: '#4F46E5', fontWeight: 600 }}>
                            Terms & Conditions
                          </Link>
                          .
                        </Typography>
                      }
                    />
                    {errors.acceptTerms && (
                      <Typography variant="caption" color="error" sx={{ ml: 4, mt: -1, fontWeight: 500 }}>
                        {errors.acceptTerms.message}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                      <Button
                        type="button"
                        variant="outlined"
                        fullWidth
                        onClick={() => setProviderStep(1)}
                        disabled={isSubmitting}
                        sx={{
                          py: 0.8,
                          fontWeight: 700,
                          borderRadius: '8px',
                          textTransform: 'none',
                          color: 'text.secondary',
                          borderColor: 'divider',
                          '&:hover': { borderColor: 'text.primary', backgroundColor: 'background.default' },
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isSubmitting || uploading}
                        sx={{
                          py: 0.8,
                          fontWeight: 750,
                          borderRadius: '8px',
                          textTransform: 'none',
                          backgroundColor: '#4F46E5',
                          boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)',
                          '&:hover': { backgroundColor: '#3730A3' },
                        }}
                      >
                        {isSubmitting ? <CircularProgress size={16} color="inherit" /> : 'Create Account'}
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* GOOGLE CONTINUATION BUTTON */}
                <Box sx={{ my: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ height: '1px', backgroundColor: 'divider', flexGrow: 1 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '10px' }}>
                    OR
                  </Typography>
                  <Box sx={{ height: '1px', backgroundColor: 'divider', flexGrow: 1 }} />
                </Box>

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
                    py: 0.8,
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

                {/* REDIRECT TO LOGIN */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Already have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/login"
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
                      Sign In
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
export default Register;
