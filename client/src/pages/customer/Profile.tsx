import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Person as ProfileIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

// Zod schemas matching user update validations
const profileSchema = z.object({
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
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .nullable()
    .optional()
    .or(z.literal('')),
  avatarUrl: z
    .string()
    .max(500, 'Avatar URL must be less than 500 characters')
    .url('Invalid URL format')
    .nullable()
    .optional()
    .or(z.literal('')),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Confirm new password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileInputs = z.infer<typeof profileSchema>;
type PasswordInputs = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profileApiError, setProfileApiError] = useState<string | null>(null);
  const [passwordApiError, setPasswordApiError] = useState<string | null>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Forms setup
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordInputs>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileInputs) => {
    setProfileApiError(null);
    setProfileSubmitting(true);

    // Normalize empty fields to null
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      avatarUrl: data.avatarUrl || null,
    };

    try {
      const updatedUser = await userService.updateProfile(payload);
      updateUser(updatedUser);
      toast.success('Profile details updated successfully!');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile details.';
      setProfileApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setProfileSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordInputs) => {
    setPasswordApiError(null);
    setPasswordSubmitting(true);
    try {
      await userService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to change password. Validate current password.';
      setPasswordApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your contact details, set avatar photos, and manage account security password
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card left */}
        <Grid item xs={12} md={7}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ProfileIcon color="primary" /> Personal Information
              </Typography>

              {profileApiError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {profileApiError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)} noValidate>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="First Name"
                      error={!!profileErrors.firstName}
                      helperText={profileErrors.firstName?.message}
                      disabled={profileSubmitting}
                      {...registerProfile('firstName')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Last Name"
                      error={!!profileErrors.lastName}
                      helperText={profileErrors.lastName?.message}
                      disabled={profileSubmitting}
                      {...registerProfile('lastName')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      placeholder="e.g. +1234567890"
                      error={!!profileErrors.phone}
                      helperText={profileErrors.phone?.message}
                      disabled={profileSubmitting}
                      {...registerProfile('phone')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Avatar Image URL"
                      placeholder="Paste image link"
                      error={!!profileErrors.avatarUrl}
                      helperText={profileErrors.avatarUrl?.message}
                      disabled={profileSubmitting}
                      {...registerProfile('avatarUrl')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={profileSubmitting}
                      sx={{ fontWeight: 700, px: 4, py: 1.25 }}
                    >
                      {profileSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Details'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Card right */}
        <Grid item xs={12} md={5}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LockIcon color="primary" /> Security & Password
              </Typography>

              {passwordApiError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {passwordApiError}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    required
                    fullWidth
                    label="Current Password"
                    type="password"
                    error={!!passwordErrors.oldPassword}
                    helperText={passwordErrors.oldPassword?.message}
                    disabled={passwordSubmitting}
                    {...registerPassword('oldPassword')}
                  />
                  <TextField
                    required
                    fullWidth
                    label="New Password"
                    type="password"
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                    disabled={passwordSubmitting}
                    {...registerPassword('newPassword')}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                    disabled={passwordSubmitting}
                    {...registerPassword('confirmPassword')}
                  />
                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={passwordSubmitting}
                      sx={{ fontWeight: 700, px: 4, py: 1.25 }}
                    >
                      {passwordSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Profile;
