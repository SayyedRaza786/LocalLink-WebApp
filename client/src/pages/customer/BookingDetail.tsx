import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingService from '../../services/bookingService';
import reviewService from '../../services/reviewService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Stack,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Rating,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  ArrowBack as BackIcon,
  CancelOutlined as CancelIcon,
  RateReview as ReviewIcon,
} from '@mui/icons-material';
import type { BookingStatus } from '../../types';

// Steps list for active booking tracking
const STEP_STATUSES: BookingStatus[] = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'];
const STEP_LABELS = ['Requested', 'Accepted', 'Expert On The Way', 'Service Started', 'Completed'];

// Zod validation schemas
const cancelSchema = z.object({
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must be less than 500 characters')
    .transform((val) => val.trim()),
});

const reviewFormSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please select at least 1 star')
    .max(5, 'Maximum rating is 5 stars'),
  comment: z
    .string()
    .max(1000, 'Comment must be less than 1000 characters')
    .optional(),
});

type CancelFormInputs = z.infer<typeof cancelSchema>;
type ReviewFormInputs = z.infer<typeof reviewFormSchema>;

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [starValue, setStarValue] = useState<number | null>(5);

  // 1. Fetch booking detailed stats
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['bookingDetails', id],
    queryFn: () => bookingService.getById(id!),
    enabled: !!id,
  });

  // Cancel Booking Mutation
  const cancelMutation = useMutation({
    mutationFn: (data: CancelFormInputs) => bookingService.cancel(id!, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingDetails', id] });
      toast.success('Booking cancelled successfully.');
      setCancelDialogOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to cancel booking';
      toast.error(msg);
    },
  });

  // Leave Review Mutation
  const reviewMutation = useMutation({
    mutationFn: (data: ReviewFormInputs) =>
      reviewService.create({
        bookingId: id!,
        rating: data.rating,
        comment: data.comment || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingDetails', id] });
      toast.success('Thank you for your feedback! Review published.');
      setReviewDialogOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    },
  });

  // React Hook Form setups
  const {
    register: registerCancel,
    handleSubmit: handleCancelSubmit,
    reset: resetCancelForm,
    formState: { errors: cancelErrors },
  } = useForm<CancelFormInputs>({
    resolver: zodResolver(cancelSchema),
  });

  const {
    register: registerReview,
    handleSubmit: handleReviewSubmit,
    setValue: setReviewValue,
    reset: resetReviewForm,
    formState: { errors: reviewErrors },
  } = useForm<ReviewFormInputs>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Retrieving booking details..." minHeight="80vh" />;
  }

  if (error || !booking) {
    return (
      <EmptyState
        title="Booking Details Not Found"
        description="We couldn't retrieve the details for this booking request."
        actionText="Back to Bookings"
        onActionClick={() => navigate('/customer/bookings')}
      />
    );
  }

  // Calculate active step in stepper
  const activeStep = STEP_STATUSES.indexOf(booking.status);
  const isTerminalState = ['CANCELLED', 'REJECTED', 'EXPIRED'].includes(booking.status);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ACCEPTED':
      case 'ON_THE_WAY':
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
      case 'REJECTED':
      case 'EXPIRED':
      default:
        return 'error';
    }
  };

  const onCancelSubmit = (data: CancelFormInputs) => {
    cancelMutation.mutate(data);
  };

  const onReviewSubmit = (data: ReviewFormInputs) => {
    reviewMutation.mutate(data);
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header back button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/customer/bookings')} color="inherit">
          <BackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Booking #{booking.bookingNumber}
        </Typography>
      </Box>

      {/* Progress Stepper Section */}
      <Card sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          {isTerminalState ? (
            <Alert
              severity="error"
              icon={<CancelIcon />}
              sx={{ borderRadius: '8px', '& .MuiAlert-message': { width: '100%' } }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Booking {booking.status}
              </Typography>
              {booking.cancelledBy && (
                <Typography variant="body2">
                  Cancelled by: <strong>{booking.cancelledBy}</strong>
                </Typography>
              )}
              {booking.cancellationReason && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Reason: <em>"{booking.cancellationReason}"</em>
                </Typography>
              )}
            </Alert>
          ) : (
            <Box sx={{ width: '100%', py: 2 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {STEP_LABELS.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      error={booking.status === 'EXPIRED' && index === activeStep}
                      StepIconProps={{
                        sx: {
                          width: 28,
                          height: 28,
                          '&.Mui-active': { color: 'primary.main' },
                          '&.Mui-completed': { color: 'success.main' },
                        },
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: activeStep === index ? 700 : 500 }}>
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Booking Details Left Column */}
        <Grid item xs={12} md={7.5}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Service Information
              </Typography>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 850, mb: 1 }}>
                {booking.service?.name}
              </Typography>
              {booking.service?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {booking.service.description}
                </Typography>
              )}

              <Divider sx={{ my: 2.5 }} />

              <Stack spacing={2} sx={{ color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CalendarIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Schedule Details
                    </Typography>
                    <Typography variant="body2">
                      {new Date(booking.scheduledDate).toLocaleDateString([], {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                    <Typography variant="body2">Time: {formatTime(booking.scheduledTime)}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <LocationIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Service Location
                    </Typography>
                    <Typography variant="body2">{booking.address}</Typography>
                  </Box>
                </Box>
              </Stack>

              {booking.notes && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    My Special Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {booking.notes}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Review Details if completed & already reviewed */}
          {booking.status === 'COMPLETED' && booking.review && (
            <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Your Feedback
                </Typography>
                <Rating value={booking.review.rating} readOnly size="medium" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  "{booking.review.comment || 'You left a review without comments.'}"
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Price & Provider Right Column */}
        <Grid item xs={12} md={4.5}>
          {/* Provider Card */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Assigned Expert
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <Avatar
                  src={booking.provider?.user?.avatarUrl || undefined}
                  alt={`${booking.provider?.user?.firstName} ${booking.provider?.user?.lastName}`}
                  sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'primary.main' }}
                >
                  {booking.provider?.user?.firstName?.[0]}
                </Avatar>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {booking.provider?.user?.firstName} {booking.provider?.user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Serving from {booking.provider?.city}
              </Typography>
            </CardContent>
          </Card>

          {/* Price Card */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
                Price Breakdown
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Quoted Service Cost:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${Number(booking.quotedPrice).toFixed(2)}
                  </Typography>
                </Box>
                {booking.finalPrice && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                    <Typography variant="body2">Final Cost:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      ${Number(booking.finalPrice).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Total Charged:
                  </Typography>
                  <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 850 }}>
                    ${Number(booking.finalPrice || booking.quotedPrice).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Action Triggers */}
          <Stack spacing={2}>
            {/* Cancel booking option */}
            {['PENDING', 'ACCEPTED', 'ON_THE_WAY'].includes(booking.status) && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                startIcon={<CancelIcon />}
                onClick={() => setCancelDialogOpen(true)}
                sx={{ py: 1.5, fontWeight: 700, borderRadius: '8px' }}
              >
                Cancel Booking
              </Button>
            )}

            {/* Leave review option */}
            {booking.status === 'COMPLETED' && !booking.review && (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                startIcon={<ReviewIcon />}
                onClick={() => setReviewDialogOpen(true)}
                sx={{ py: 1.5, fontWeight: 800, borderRadius: '8px', color: '#fff' }}
              >
                Leave a Review
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel Booking Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to cancel this booking? This action is permanent. Please provide a reason for the provider.
          </DialogContentText>
          <TextField
            autoFocus
            required
            fullWidth
            label="Cancellation Reason"
            multiline
            rows={3}
            error={!!cancelErrors.reason}
            helperText={cancelErrors.reason?.message}
            {...registerCancel('reason')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            No, Keep
          </Button>
          <Button
            onClick={handleCancelSubmit(onCancelSubmit)}
            variant="contained"
            color="error"
            disabled={cancelMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            {cancelMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Review Service Expert</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Share your experience! Rate the expert's performance and write optional feedback comments.
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Expert Rating
            </Typography>
            <Rating
              value={starValue}
              onChange={(_e, val) => {
                setStarValue(val);
                setReviewValue('rating', val || 5);
              }}
              size="large"
            />
            {reviewErrors.rating && (
              <Typography variant="caption" color="error">
                {reviewErrors.rating.message}
              </Typography>
            )}
          </Box>
          <TextField
            required
            fullWidth
            label="Comments / Feedback"
            multiline
            rows={4}
            error={!!reviewErrors.comment}
            helperText={reviewErrors.comment?.message}
            {...registerReview('comment')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReviewDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleReviewSubmit(onReviewSubmit)}
            variant="contained"
            color="primary"
            disabled={reviewMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            {reviewMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default BookingDetail;
