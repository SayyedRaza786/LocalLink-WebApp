import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  CheckCircleOutline as AcceptIcon,
} from '@mui/icons-material';
import type { BookingStatus, Booking } from '../../types';

// Zod schemas
const rejectSchema = z.object({
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must be less than 500 characters')
    .transform((val) => val.trim()),
});

const completeSchema = z.object({
  finalPrice: z.coerce
    .number()
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price seems too high')
    .nullable()
    .optional(),
});

type RejectFormInputs = z.infer<typeof rejectSchema>;
type CompleteFormInputs = z.infer<typeof completeSchema>;

export const BookingsQueue: React.FC = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  // Map tabs to statuses
  const getTabStatusFilter = (index: number): string => {
    switch (index) {
      case 1:
        return 'PENDING';
      case 2:
        return 'ACCEPTED,ON_THE_WAY';
      case 3:
        return 'IN_PROGRESS';
      case 4:
        return 'COMPLETED,CANCELLED,REJECTED,EXPIRED';
      case 0:
      default:
        return '';
    }
  };

  const statusFilter = getTabStatusFilter(tabValue);

  // Fetch bookings list
  const { data: bookingsResponse, isLoading } = useQuery({
    queryKey: ['providerBookingsList', statusFilter, page],
    queryFn: () =>
      bookingService.list({
        page,
        limit: 10,
        status: statusFilter || undefined,
        role: 'provider',
      }),
  });

  const bookings = bookingsResponse?.data || [];
  const meta = bookingsResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // State machine mutations
  const acceptMutation = useMutation({
    mutationFn: (id: string) => bookingService.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBookingsList'] });
      toast.success('Booking request accepted!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to accept booking');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: RejectFormInputs) => bookingService.reject(selectedBooking!.id, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBookingsList'] });
      toast.success('Booking request rejected.');
      setRejectDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject booking');
    },
  });

  const onTheWayMutation = useMutation({
    mutationFn: (id: string) => bookingService.onTheWay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBookingsList'] });
      toast.success('Status updated: Expert on the way!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => bookingService.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBookingsList'] });
      toast.success('Status updated: Service started!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to start service');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (data: CompleteFormInputs) =>
      bookingService.complete(selectedBooking!.id, data.finalPrice || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBookingsList'] });
      toast.success('Job completed successfully! Invoice sent.');
      setCompleteDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete booking');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => bookingService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBookingsList'] });
      toast.success('Booking cancelled successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    },
  });

  // Forms setup
  const {
    register: registerReject,
    handleSubmit: handleRejectSubmit,
    reset: resetRejectForm,
    formState: { errors: rejectErrors },
  } = useForm<RejectFormInputs>({
    resolver: zodResolver(rejectSchema),
  });

  const {
    register: registerComplete,
    handleSubmit: handleCompleteSubmit,
    reset: resetCompleteForm,
    formState: { errors: completeErrors },
  } = useForm<CompleteFormInputs>({
    resolver: zodResolver(completeSchema),
  });

  const handleRejectClick = (booking: Booking) => {
    setSelectedBooking(booking);
    resetRejectForm();
    setRejectDialogOpen(true);
  };

  const handleCompleteClick = (booking: Booking) => {
    setSelectedBooking(booking);
    resetCompleteForm();
    setCompleteDialogOpen(true);
  };

  const onRejectSubmit = (data: RejectFormInputs) => {
    rejectMutation.mutate(data);
  };

  const onCompleteSubmit = (data: CompleteFormInputs) => {
    completeMutation.mutate(data);
  };

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

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Bookings Queue
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track customer service requests, update work progression status, and complete invoices
        </Typography>
      </Box>

      {/* Tabs Filter */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="provider bookings tabs">
          <Tab label="All Bookings" sx={{ fontWeight: 600 }} />
          <Tab label="Incoming Requests" sx={{ fontWeight: 600 }} />
          <Tab label="Scheduled Work" sx={{ fontWeight: 600 }} />
          <Tab label="In Progress" sx={{ fontWeight: 600 }} />
          <Tab label="History (Done/Cancelled)" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Bookings Queue */}
      {isLoading ? (
        <LoadingSpinner message="Retrieving bookings list..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No Bookings Found"
          description="There are no service orders matching this status filter."
        />
      ) : (
        <Stack spacing={2.5}>
          {bookings.map((booking) => (
            <Card key={booking.id} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  {/* Left Column: Customer Avatar */}
                  <Grid item xs={12} sm={3} md={2.5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Avatar
                      src={booking.customer?.avatarUrl || undefined}
                      alt={`${booking.customer?.firstName} ${booking.customer?.lastName}`}
                      sx={{ width: 64, height: 64, mb: 1, border: '2px solid', borderColor: 'secondary.light' }}
                    >
                      {booking.customer?.firstName?.[0]}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {booking.customer?.firstName} {booking.customer?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Customer
                    </Typography>
                  </Grid>

                  {/* Middle Column: Details */}
                  <Grid item xs={12} sm={6} md={6.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {booking.service?.name}
                      </Typography>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Booking ID: #{booking.bookingNumber}
                    </Typography>

                    <Stack spacing={1.25} sx={{ mt: 2, color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(booking.scheduledDate).toLocaleDateString([], {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          at {formatTime(booking.scheduledTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap sx={{ maxWidth: '400px' }}>
                          {booking.address}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Right Column: Actions */}
                  <Grid item xs={12} sm={3} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 1.5 }}>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary">
                        Quote Rate
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 850 }}>
                        ${Number(booking.quotedPrice).toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Dynamic state machine transition button panel */}
                    <Stack spacing={1} width="100%">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            fullWidth
                            startIcon={<AcceptIcon />}
                            onClick={() => acceptMutation.mutate(booking.id)}
                            disabled={acceptMutation.isPending}
                            sx={{ fontWeight: 700 }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            fullWidth
                            onClick={() => handleRejectClick(booking)}
                            sx={{ fontWeight: 700 }}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {booking.status === 'ACCEPTED' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          onClick={() => onTheWayMutation.mutate(booking.id)}
                          disabled={onTheWayMutation.isPending}
                          sx={{ fontWeight: 700 }}
                        >
                          Mark On The Way
                        </Button>
                      )}

                      {booking.status === 'ON_THE_WAY' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          onClick={() => startMutation.mutate(booking.id)}
                          disabled={startMutation.isPending}
                          sx={{ fontWeight: 700 }}
                        >
                          Start Service
                        </Button>
                      )}

                      {booking.status === 'IN_PROGRESS' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          fullWidth
                          startIcon={<CompleteIcon />}
                          onClick={() => handleCompleteClick(booking)}
                          sx={{ fontWeight: 700 }}
                        >
                          Complete Job
                        </Button>
                      )}

                      {/* Cancel option for accepted scheduled requests */}
                      {['ACCEPTED', 'ON_THE_WAY'].includes(booking.status) && (
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          fullWidth
                          onClick={() => {
                            const reason = window.prompt('Specify cancellation reason:');
                            if (reason) cancelMutation.mutate({ id: booking.id, reason });
                          }}
                          disabled={cancelMutation.isPending}
                          sx={{ fontWeight: 700 }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={meta.totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Box>
          )}
        </Stack>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Reject Booking Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Provide the reason why you are rejecting this service request. This will be shared with the customer.
          </DialogContentText>
          <TextField
            autoFocus
            required
            fullWidth
            label="Rejection Reason"
            multiline
            rows={3}
            error={!!rejectErrors.reason}
            helperText={rejectErrors.reason?.message}
            {...registerReject('reason')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectSubmit(onRejectSubmit)}
            variant="contained"
            color="error"
            disabled={rejectMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            {rejectMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Confirm Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Job Dialog */}
      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Complete Service Job</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Awesome! You have completed the service. Would you like to adjust the final price? Leave empty to charge the quoted price.
          </DialogContentText>
          {selectedBooking && (
            <Box sx={{ p: 1.5, mb: 2.5, backgroundColor: 'rgba(76, 175, 80, 0.08)', borderRadius: '8px', border: '1px solid', borderColor: 'success.light' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Quoted Price: ${Number(selectedBooking.quotedPrice).toFixed(2)}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Adjusted Final Price ($) - Optional"
            type="number"
            error={!!completeErrors.finalPrice}
            helperText={completeErrors.finalPrice?.message}
            {...registerComplete('finalPrice')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompleteDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteSubmit(onCompleteSubmit)}
            variant="contained"
            color="success"
            disabled={completeMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            {completeMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Complete & Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default BookingsQueue;
