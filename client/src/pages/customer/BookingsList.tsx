import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Pagination,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import type { BookingStatus } from '../../types';

export const BookingsList: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  // Map tab selections to API status values
  const getTabStatusFilter = (index: number): string => {
    switch (index) {
      case 1:
        return 'PENDING';
      case 2:
        return 'ACCEPTED,ON_THE_WAY,IN_PROGRESS';
      case 3:
        return 'COMPLETED';
      case 4:
        return 'CANCELLED,REJECTED,EXPIRED';
      case 0:
      default:
        return '';
    }
  };

  const statusFilter = getTabStatusFilter(tabValue);

  // Fetch bookings list
  const { data: bookingsResponse, isLoading } = useQuery({
    queryKey: ['customerBookingsList', statusFilter, page],
    queryFn: () =>
      bookingService.list({
        page,
        limit: 10,
        status: statusFilter || undefined,
        role: 'customer',
      }),
  });

  const bookings = bookingsResponse?.data || [];
  const meta = bookingsResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1); // Reset page on tab shift
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
          My Bookings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and review the progression details of all your requested services
        </Typography>
      </Box>

      {/* Tabs Filter */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="bookings filter tabs">
          <Tab label="All Bookings" sx={{ fontWeight: 600 }} />
          <Tab label="Pending Offers" sx={{ fontWeight: 600 }} />
          <Tab label="Active Services" sx={{ fontWeight: 600 }} />
          <Tab label="Completed" sx={{ fontWeight: 600 }} />
          <Tab label="Cancelled" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Bookings Queue */}
      {isLoading ? (
        <LoadingSpinner message="Retrieving bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No Bookings Found"
          description="There are no requested jobs matching this status query."
          actionText="Explore Providers"
          onActionClick={() => navigate('/search')} // Let navigate handle
        />
      ) : (
        <Stack spacing={2.5}>
          {bookings.map((booking) => (
            <Card key={booking.id} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  {/* Left Column: Avatar & Provider */}
                  <Grid item xs={12} sm={3} md={2.5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Avatar
                      src={booking.provider?.user?.avatarUrl || undefined}
                      alt={`${booking.provider?.user?.firstName} ${booking.provider?.user?.lastName}`}
                      sx={{ width: 64, height: 64, mb: 1, border: '2px solid', borderColor: 'primary.light' }}
                    >
                      {booking.provider?.user?.firstName?.[0]}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {booking.provider?.user?.firstName} {booking.provider?.user?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Service Expert
                    </Typography>
                  </Grid>

                  {/* Middle Column: Service, Location & Time */}
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

                  {/* Right Column: Price & Button */}
                  <Grid item xs={12} sm={3} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 2 }}>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary">
                        Price Quote
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 850 }}>
                        ${Number(booking.quotedPrice).toFixed(2)}
                      </Typography>
                    </Box>
                    <Button
                      component={RouterLink}
                      to={`/customer/bookings/${booking.id}`}
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ fontWeight: 700 }}
                    >
                      Track Progress
                    </Button>
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
    </Box>
  );
};
export default BookingsList;
