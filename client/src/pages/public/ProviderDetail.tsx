import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import providerService from '../../services/providerService';
import favoriteService from '../../services/favoriteService';
import bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Container,
  Grid,
  Box,
  Typography,
  Avatar,
  Rating,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  ImageList,
  ImageListItem,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Star as StarIcon,
  LocationOn as LocationIcon,
  Favorite as FavIcon,
  FavoriteBorder as FavBorderIcon,
  CalendarMonth as CalendarIcon,
  Handyman as ServicesIcon,
  Collections as GalleryIcon,
  RateReview as ReviewsIcon,
  AccessTime as AccessTimeIcon,
  VerifiedUser as VerifyIcon,
} from '@mui/icons-material';
import type { Service, DayOfWeek } from '../../types';

// Tab panels helpers
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`provider-tabpanel-${index}`}
      aria-labelledby={`provider-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Zod Booking Schema
const bookingFormSchema = z.object({
  scheduledDate: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => new Date(val) >= new Date(new Date().setHours(0,0,0,0)), {
      message: 'Date must be today or in the future',
    }),
  scheduledTime: z
    .string()
    .min(1, 'Time is required')
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'),
  address: z
    .string()
    .min(1, 'Service address is required')
    .max(500, 'Address must be less than 500 characters')
    .transform((val) => val.trim()),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

type BookingFormInputs = z.infer<typeof bookingFormSchema>;

export const ProviderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // 1. Fetch provider details
  const { data: provider, isLoading: providerLoading, error: providerError } = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: () => providerService.getPublicProfile(id!),
    enabled: !!id,
  });

  // 2. Fetch reviews
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['providerReviews', id],
    queryFn: () => providerService.getReviews(id!, 1, 20),
    enabled: !!id,
  });

  const reviews = reviewsResponse?.data || [];

  // 3. Fetch user favorites (only if logged-in role is CUSTOMER)
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const { data: favoritesResponse } = useQuery({
    queryKey: ['myFavorites'],
    queryFn: () => favoriteService.list(1, 100),
    enabled: isCustomer,
  });

  const isFavorited = favoritesResponse?.data?.favorites?.some(
    (fav) => fav.providerId === provider?.id
  ) || false;

  // React Hook Form for Booking
  const {
    register: registerBooking,
    handleSubmit: handleBookingSubmit,
    reset: resetBookingForm,
    formState: { errors: bookingErrors },
  } = useForm<BookingFormInputs>({
    resolver: zodResolver(bookingFormSchema),
  });

  // Toggle Favorite Mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      if (isFavorited) {
        return favoriteService.remove(provider!.id);
      } else {
        return favoriteService.add(provider!.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFavorites'] });
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: () => {
      toast.error('Failed to update favorite status');
    },
  });

  // Create Booking Mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingFormInputs) => {
      return bookingService.create({
        providerId: provider!.id,
        serviceId: selectedService!.id,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        address: data.address,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      toast.success('Booking requested successfully!');
      setBookingDialogOpen(false);
      resetBookingForm();
      navigate('/customer/bookings');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create booking request';
      toast.error(msg);
    },
  });

  if (providerLoading) {
    return <LoadingSpinner message="Retrieving provider profile details..." minHeight="80vh" />;
  }

  if (providerError || !provider) {
    return (
      <EmptyState
        title="Provider Not Found"
        description="We couldn't retrieve the details for this provider profile. It may have been disabled or deleted."
        actionText="Back to Search"
        onActionClick={() => navigate('/search')}
      />
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBookClick = (service: Service) => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a service');
      navigate('/login', { state: { from: { pathname: `/providers/${id}` } } });
      return;
    }
    if (user?.role !== 'CUSTOMER') {
      toast.error('Only customers can book services');
      return;
    }
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  const onBookingSubmit = (data: BookingFormInputs) => {
    createBookingMutation.mutate(data);
  };

  const formatDayOfWeek = (day: DayOfWeek) => {
    const days: Record<DayOfWeek, string> = {
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednesday',
      THU: 'Thursday',
      FRI: 'Friday',
      SAT: 'Saturday',
      SUN: 'Sunday',
    };
    return days[day] || day;
  };

  const formatTime = (timeStr: string) => {
    // Converts Time string or date to readable HH:MM
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* 1. Header Information Panel */}
      <Card sx={{ mb: 4, overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={4} alignItems="center">
            {/* Avatar */}
            <Grid item xs={12} sm={3} md={2.5} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={provider.user?.avatarUrl || undefined}
                alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
                sx={{
                  width: 140,
                  height: 140,
                  border: '4px solid',
                  borderColor: 'primary.main',
                  boxShadow: (theme) => theme.shadows[3],
                }}
              >
                {provider.user?.firstName?.[0]}
              </Avatar>
            </Grid>

            {/* Profile Info */}
            <Grid item xs={12} sm={9} md={6.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                  {provider.user?.firstName} {provider.user?.lastName}
                </Typography>
                {provider.isVerified && (
                  <Chip
                    icon={<VerifyIcon sx={{ color: '#fff !important' }} />}
                    label="Verified Expert"
                    color="secondary"
                    sx={{ fontWeight: 700, color: '#fff' }}
                  />
                )}
              </Box>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 1, textAlign: { xs: 'center', sm: 'left' } }}
              >
                {provider.experienceYears ? `${provider.experienceYears} Years Experience` : 'Local Professional'}
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                gap={0.5}
                sx={{ mt: 1.5, mb: 2.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}
              >
                <Rating value={Number(provider.avgRating)} readOnly precision={0.1} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, ml: 0.5 }}>
                  {Number(provider.avgRating).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({provider.totalReviews} Customer Reviews)
                </Typography>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                gap={{ xs: 1.5, sm: 3 }}
                sx={{ color: 'text.secondary', justifyContent: { xs: 'center', sm: 'flex-start' }, alignItems: 'center' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon />
                  <Typography variant="body2">{provider.city}{provider.area ? `, ${provider.area}` : ''}</Typography>
                </Box>
                {provider.address && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Serving radius: Within {Number(provider.serviceRadiusKm)} km
                  </Typography>
                )}
              </Stack>
            </Grid>

            {/* Favorite / Action Controls */}
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              {isCustomer && (
                <Button
                  variant={isFavorited ? 'outlined' : 'contained'}
                  color={isFavorited ? 'inherit' : 'primary'}
                  size="large"
                  onClick={() => toggleFavoriteMutation.mutate()}
                  disabled={toggleFavoriteMutation.isPending}
                  startIcon={isFavorited ? <FavIcon color="error" /> : <FavBorderIcon />}
                  sx={{ borderRadius: '8px', px: 4, py: 1.5, fontWeight: 700 }}
                >
                  {isFavorited ? 'Favorited' : 'Save Expert'}
                </Button>
              )}
            </Grid>
          </Grid>

          {provider.bio && (
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                About Professional
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {provider.bio}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 2. Detail Tabs Section */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="provider portfolio tabs" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <Tab icon={<ServicesIcon />} label="Services" iconPosition="start" sx={{ fontWeight: 700, minWidth: 'auto' }} />
            <Tab icon={<GalleryIcon />} label="Gallery" iconPosition="start" sx={{ fontWeight: 700, minWidth: 'auto' }} />
            <Tab icon={<CalendarIcon />} label="Availability" iconPosition="start" sx={{ fontWeight: 700, minWidth: 'auto' }} />
            <Tab icon={<ReviewsIcon />} label={`Reviews (${provider.totalReviews})`} iconPosition="start" sx={{ fontWeight: 700, minWidth: 'auto' }} />
          </Tabs>
        </Box>

        {/* Tab 1: Services List */}
        <CustomTabPanel value={activeTab} index={0}>
          {provider.services && provider.services.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              This provider has not published any service offerings yet.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {provider.services?.map((service) => (
                <Grid item xs={12} md={6} key={service.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {service.name}
                        </Typography>
                        <Chip
                          label={service.category?.name || 'Service'}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      {service.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                          {service.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Rate
                          </Typography>
                          <Typography variant="h5" color="primary.main" sx={{ fontWeight: 850 }}>
                            ${Number(service.price).toFixed(2)}
                            {service.priceType === 'HOURLY' ? '/hr' : service.priceType === 'STARTING_AT' ? ' (Starting)' : ''}
                          </Typography>
                          {service.durationMinutes && (
                            <Typography variant="caption" color="text.secondary">
                              Approx duration: {service.durationMinutes} mins
                            </Typography>
                          )}
                        </Box>

                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBookClick(service)}
                          sx={{ fontWeight: 700 }}
                        >
                          Book Service
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CustomTabPanel>

        {/* Tab 2: Gallery */}
        <CustomTabPanel value={activeTab} index={1}>
          {provider.gallery && provider.gallery.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              This provider has not added any photos to their portfolio yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {provider.gallery?.map((img) => (
                <Grid item xs={12} sm={6} md={4} key={img.id}>
                  <Paper
                    sx={{
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '8px',
                      height: '100%',
                    }}
                    elevation={0}
                  >
                    <Box
                      component="img"
                      src={img.imageUrl}
                      alt={img.caption || 'Portfolio image'}
                      sx={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: '6px',
                        display: 'block',
                      }}
                    />
                    {img.caption && (
                      <Typography variant="body2" sx={{ p: 1, fontWeight: 500, mt: 1 }}>
                        {img.caption}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CustomTabPanel>

        {/* Tab 3: Availability */}
        <CustomTabPanel value={activeTab} index={2}>
          {provider.availability && provider.availability.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              This provider has not configured weekly availability schedule hours.
            </Typography>
          ) : (
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }} elevation={0}>
                <List disablePadding>
                  {provider.availability?.map((slot, idx) => (
                    <React.Fragment key={slot.id}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          <AccessTimeIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={formatDayOfWeek(slot.dayOfWeek)}
                          primaryTypographyProps={{ fontWeight: 700 }}
                          secondary="Active Slot"
                        />
                        <Chip
                          label={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </ListItem>
                      {idx < provider.availability!.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </CustomTabPanel>

        {/* Tab 4: Reviews */}
        <CustomTabPanel value={activeTab} index={3}>
          {reviewsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : reviews.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No reviews left for this provider yet.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {reviews.map((rev) => (
                <Card key={rev.id} variant="outlined" sx={{ borderRadius: '8px' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={1.5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                        <Avatar
                          src={rev.customer?.avatarUrl || undefined}
                          alt={`${rev.customer?.firstName} ${rev.customer?.lastName}`}
                          sx={{ width: 48, height: 48 }}
                        >
                          {rev.customer?.firstName?.[0]}
                        </Avatar>
                      </Grid>
                      <Grid item xs={12} sm={10.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 1 }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {rev.customer?.firstName} {rev.customer?.lastName}
                            </Typography>
                            <Rating value={Number(rev.rating)} readOnly size="small" sx={{ mt: 0.5 }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(rev.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                          {rev.comment || 'Reviewed without comment.'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CustomTabPanel>
      </Box>

      {/* 3. Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Book Service Request</DialogTitle>
        <DialogContent dividers>
          {selectedService && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(79, 70, 229, 0.04)', borderRadius: '8px', border: '1px solid', borderColor: 'primary.light' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Selected Service:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {selectedService.name}
              </Typography>
              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, mt: 0.5 }}>
                Quoted Price: ${Number(selectedService.price).toFixed(2)}
                {selectedService.priceType === 'HOURLY' ? '/hr' : ''}
              </Typography>
            </Box>
          )}

          <Box component="form" noValidate>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Scheduled Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!bookingErrors.scheduledDate}
                  helperText={bookingErrors.scheduledDate?.message}
                  {...registerBooking('scheduledDate')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Scheduled Time"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  error={!!bookingErrors.scheduledTime}
                  helperText={bookingErrors.scheduledTime?.message}
                  {...registerBooking('scheduledTime')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Service Address"
                  placeholder="Enter the complete address where service is needed"
                  multiline
                  rows={2}
                  error={!!bookingErrors.address}
                  helperText={bookingErrors.address?.message}
                  {...registerBooking('address')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  placeholder="Specify details, special instructions, or service specifics"
                  multiline
                  rows={3}
                  error={!!bookingErrors.notes}
                  helperText={bookingErrors.notes?.message}
                  {...registerBooking('notes')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setBookingDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleBookingSubmit(onBookingSubmit)}
            variant="contained"
            color="primary"
            disabled={createBookingMutation.isPending}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {createBookingMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default ProviderDetail;
