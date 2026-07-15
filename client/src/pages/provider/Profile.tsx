import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import userService from '../../services/userService';
import providerService from '../../services/providerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
  FormControlLabel,
  Switch,
  Slider,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Person as UserIcon,
  Storefront as StoreIcon,
  Lock as LockIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

// Zod schemas
const personalSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
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

const providerProfileSchema = z.object({
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(2000, 'Bio must be less than 2000 characters')
    .transform((val) => val.trim()),
  experienceYears: z.coerce
    .number()
    .int()
    .min(0, 'Experience years cannot be negative')
    .max(60, 'Experience years cannot exceed 60'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  area: z
    .string()
    .max(100, 'Area must be less than 100 characters')
    .nullable()
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(255, 'Address must be less than 255 characters'),
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  serviceRadiusKm: z.coerce
    .number()
    .min(1, 'Radius must be at least 1 km')
    .max(200, 'Radius cannot exceed 200 km'),
  isAvailable: z.boolean().default(true),
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
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type PersonalInputs = z.infer<typeof personalSchema>;
type ProviderInputs = z.infer<typeof providerProfileSchema>;
type PasswordInputs = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const [personalError, setPersonalError] = useState<string | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [personalSubmitting, setPersonalSubmitting] = useState(false);
  const [providerSubmitting, setProviderSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [radiusVal, setRadiusVal] = useState<number>(10);
  const [availabilityVal, setAvailabilityVal] = useState<boolean>(true);

  // Fetch detailed Provider profile (separate from basic User info)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const details = await providerService.getOwnProfile();
        setProfileData(details);
        setRadiusVal(Number(details.serviceRadiusKm));
        setAvailabilityVal(details.isAvailable);
      } catch (err: any) {
        // If profile doesn't exist, we will create it (first setup)
        toast.info('Please setup your provider portfolio parameters below.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Forms setup
  const {
    register: registerPersonal,
    handleSubmit: handlePersonalSubmit,
    setValue: setPersonalValue,
    watch: watchPersonal,
    formState: { errors: personalErrors },
  } = useForm<PersonalInputs>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const {
    register: registerProvider,
    handleSubmit: handleProviderSubmit,
    setValue: setProviderValue,
    formState: { errors: providerErrors },
  } = useForm<ProviderInputs>({
    resolver: zodResolver(providerProfileSchema),
    values: profileData
      ? {
          bio: profileData.bio || '',
          experienceYears: profileData.experienceYears || 0,
          city: profileData.city || '',
          area: profileData.area || '',
          address: profileData.address || '',
          latitude: profileData.latitude || 0,
          longitude: profileData.longitude || 0,
          serviceRadiusKm: profileData.serviceRadiusKm || 10,
          isAvailable: profileData.isAvailable,
        }
      : undefined,
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordInputs>({
    resolver: zodResolver(passwordSchema),
  });

  const avatarUrl = watchPersonal('avatarUrl');
  const [uploading, setUploading] = useState(false);

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
      toast.error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.');
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

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.secure_url) {
        setPersonalValue('avatarUrl', data.secure_url, { shouldValidate: true, shouldDirty: true });
        toast.success('Image uploaded successfully!');
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      toast.error('Failed to upload image to Cloudinary.');
    } finally {
      setUploading(false);
    }
  };

  const onPersonalSubmit = async (data: PersonalInputs) => {
    setPersonalError(null);
    setPersonalSubmitting(true);
    try {
      const updated = await userService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        avatarUrl: data.avatarUrl || null,
      });
      updateUser(updated);
      toast.success('Personal details saved!');
    } catch (err: any) {
      setPersonalError(err.response?.data?.message || 'Failed to update personal details.');
      toast.error('Failed to save personal info.');
    } finally {
      setPersonalSubmitting(false);
    }
  };

  const onProviderSubmit = async (data: ProviderInputs) => {
    setProviderError(null);
    setProviderSubmitting(true);

    const payload = {
      ...data,
      area: data.area || null,
      serviceRadiusKm: radiusVal,
      isAvailable: availabilityVal,
    };

    try {
      const updated = await providerService.upsertProfile(payload);
      setProfileData(updated);
      toast.success('Provider profile settings published successfully!');
    } catch (err: any) {
      setProviderError(err.response?.data?.message || 'Failed to publish provider settings.');
      toast.error('Failed to save provider portfolio.');
    } finally {
      setProviderSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordInputs) => {
    setPasswordError(null);
    setPasswordSubmitting(true);
    try {
      await userService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Validate current password.');
      toast.error('Failed to change password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (profileLoading) {
    return <LoadingSpinner message="Retrieving provider settings profile..." minHeight="70vh" />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Portfolio Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your service boundaries, toggle availability status, and manage security parameters
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Personal and Password */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={4}>
            {/* Personal Card */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <UserIcon color="primary" /> Personal Information
                </Typography>

                {personalError && <Alert severity="error" sx={{ mb: 3 }}>{personalError}</Alert>}

                <Box component="form" onSubmit={handlePersonalSubmit(onPersonalSubmit)} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="First Name"
                        error={!!personalErrors.firstName}
                        helperText={personalErrors.firstName?.message}
                        disabled={personalSubmitting}
                        {...registerPersonal('firstName')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Last Name"
                        error={!!personalErrors.lastName}
                        helperText={personalErrors.lastName?.message}
                        disabled={personalSubmitting}
                        {...registerPersonal('lastName')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        error={!!personalErrors.phone}
                        helperText={personalErrors.phone?.message}
                        disabled={personalSubmitting}
                        {...registerPersonal('phone')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 2.5 }}>
                        <Avatar
                          src={avatarUrl || undefined}
                          alt="Avatar Preview"
                          sx={{
                            width: 80,
                            height: 80,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            boxShadow: (theme) => theme.shadows[2],
                          }}
                        >
                          {user?.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Profile Picture
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                            Upload a JPEG or PNG image (max. 5MB)
                          </Typography>
                          <Button
                            variant="outlined"
                            component="label"
                            disabled={uploading || personalSubmitting}
                            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
                            sx={{ fontWeight: 700, textTransform: 'none' }}
                          >
                            {uploading ? 'Uploading...' : 'Upload Photo'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleImageUpload}
                            />
                          </Button>
                        </Box>
                      </Stack>
                      <TextField
                        fullWidth
                        label="Avatar Image URL (Fallback)"
                        placeholder="Paste image link or upload above"
                        error={!!personalErrors.avatarUrl}
                        helperText={personalErrors.avatarUrl?.message}
                        disabled={personalSubmitting || uploading}
                        {...registerPersonal('avatarUrl')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={personalSubmitting}
                        sx={{ fontWeight: 700, px: 3, py: 1 }}
                      >
                        {personalSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Info'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            {/* Password Card */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <LockIcon color="primary" /> Security Credentials
                </Typography>

                {passwordError && <Alert severity="error" sx={{ mb: 3 }}>{passwordError}</Alert>}

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
                        disabled={passwordSubmitting}
                        sx={{ fontWeight: 700, px: 3, py: 1 }}
                      >
                        {passwordSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Provider Profile configurations */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <StoreIcon color="primary" /> Service Provider Parameters
              </Typography>

              {providerError && <Alert severity="error" sx={{ mb: 3 }}>{providerError}</Alert>}

              <Box component="form" onSubmit={handleProviderSubmit(onProviderSubmit)} noValidate>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={availabilityVal}
                          onChange={(e) => setAvailabilityVal(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Toggle Online Availability (Shows up in searches)
                        </Typography>
                      }
                      sx={{ mb: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Bio / Professional Description"
                      placeholder="Detail your skills, certification, types of jobs you accept..."
                      multiline
                      rows={4}
                      error={!!providerErrors.bio}
                      helperText={providerErrors.bio?.message}
                      {...registerProvider('bio')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Years of Experience"
                      type="number"
                      error={!!providerErrors.experienceYears}
                      helperText={providerErrors.experienceYears?.message}
                      {...registerProvider('experienceYears')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="City"
                      error={!!providerErrors.city}
                      helperText={providerErrors.city?.message}
                      {...registerProvider('city')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Area / Neighborhood"
                      error={!!providerErrors.area}
                      helperText={providerErrors.area?.message}
                      {...registerProvider('area')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Base Location Address"
                      error={!!providerErrors.address}
                      helperText={providerErrors.address?.message}
                      {...registerProvider('address')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Coordinate Latitude"
                      type="number"
                      inputProps={{ step: 'any' }}
                      error={!!providerErrors.latitude}
                      helperText={providerErrors.latitude?.message}
                      {...registerProvider('latitude')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Coordinate Longitude"
                      type="number"
                      inputProps={{ step: 'any' }}
                      error={!!providerErrors.longitude}
                      helperText={providerErrors.longitude?.message}
                      {...registerProvider('longitude')}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ px: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                      Service Coverage Radius: {radiusVal} km
                    </Typography>
                    <Slider
                      value={radiusVal}
                      min={1}
                      max={150}
                      step={1}
                      onChange={(_e, val) => setRadiusVal(val as number)}
                      valueLabelDisplay="auto"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      disabled={providerSubmitting}
                      sx={{ fontWeight: 800, color: '#fff', px: 4, py: 1.25 }}
                    >
                      {providerSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Publish Portfolio Settings'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Profile;
