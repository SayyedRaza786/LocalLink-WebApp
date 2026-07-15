import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import favoriteService from '../../services/favoriteService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  ReceiptLong as BookingsIcon,
  Favorite as FavIcon,
  CheckCircleOutline as CompleteIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  // 1. Fetch recent customer bookings
  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ['customerRecentBookings'],
    queryFn: () => bookingService.list({ page: 1, limit: 5, role: 'customer' }),
  });

  // 2. Fetch favorites list to count
  const { data: favoritesResponse } = useQuery({
    queryKey: ['myFavorites'],
    queryFn: () => favoriteService.list(1, 100),
  });

  if (bookingsLoading) {
    return <LoadingSpinner message="Loading dashboard statistics..." />;
  }

  const bookings = bookingsResponse?.data || [];
  const totalBookings = bookingsResponse?.meta?.total || 0;
  const totalFavorites = favoritesResponse?.meta?.total || 0;

  // Count active / pending bookings
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  const getStatusColor = (status: string) => {
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Hello, {user?.firstName}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome to your control panel. Track active services, view bookmarked providers, or explore new services.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  color: 'primary.main',
                  display: 'flex',
                }}
              >
                <BookingsIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {totalBookings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Requests
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(237, 108, 2, 0.08)',
                  color: 'warning.main',
                  display: 'flex',
                }}
              >
                <PendingIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {pendingCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Offers
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  color: 'success.main',
                  display: 'flex',
                }}
              >
                <CompleteIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {completedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Jobs
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  color: 'error.main',
                  display: 'flex',
                }}
              >
                <FavIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {totalFavorites}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saved Experts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Bookings Section */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Recent Requests Queue
          </Typography>
          <Button component={RouterLink} to="/customer/bookings" size="small" variant="outlined" sx={{ fontWeight: 700 }}>
            View All Bookings
          </Button>
        </Box>
        <Divider />

        {bookings.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              You haven't requested any services yet.
            </Typography>
            <Button component={RouterLink} to="/search" variant="contained" sx={{ mt: 2, fontWeight: 700 }}>
              Book an Expert
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
            <Table aria-label="recent bookings table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quoted Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>#{booking.bookingNumber}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{booking.service?.name}</TableCell>
                    <TableCell>
                      {booking.provider?.user?.firstName} {booking.provider?.user?.lastName}
                    </TableCell>
                    <TableCell>{new Date(booking.scheduledDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>${Number(booking.quotedPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/customer/bookings/${booking.id}`}
                        variant="text"
                        size="small"
                        sx={{ fontWeight: 700 }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
};
export default CustomerDashboard;
