import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
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
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  WorkOutline as BookingsIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch all bookings for this provider
  const { data: bookingsResponse, isLoading } = useQuery({
    queryKey: ['providerRecentBookings'],
    queryFn: () => bookingService.list({ page: 1, limit: 10, role: 'provider' }),
  });

  const bookings = bookingsResponse?.data || [];
  const meta = bookingsResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Calculate earnings (sum of finalPrice or quotedPrice for COMPLETED bookings)
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalEarnings = completedBookings.reduce((sum, b) => {
    return sum + Number(b.finalPrice || b.quotedPrice);
  }, 0);

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const activeBookings = bookings.filter((b) =>
    ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status)
  );

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

  if (isLoading) {
    return <LoadingSpinner message="Loading provider dashboard analytics..." />;
  }

  const profile = user?.providerProfile;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Provider Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your schedule, reply to pending booking requests, and view earnings summaries
        </Typography>
      </Box>

      {/* No Profile Setup Warning Alert */}
      {!profile && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: '8px' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Profile Not Configured
          </Typography>
          Please complete your provider details under <strong>Profile Settings</strong> to configure
          your service areas and availability slots so customers can search and hire you.
        </Alert>
      )}

      {/* Analytics Cards */}
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
                <MoneyIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  ${totalEarnings.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Earnings
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
                  backgroundColor: 'rgba(13, 148, 136, 0.08)',
                  color: 'secondary.main',
                  display: 'flex',
                }}
              >
                <BookingsIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {meta.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Bookings
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
                  {pendingBookings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
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
                  backgroundColor: 'rgba(251, 192, 45, 0.08)',
                  color: 'warning.dark',
                  display: 'flex',
                }}
              >
                <StarIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {profile ? Number(profile.avgRating).toFixed(1) : '0.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bookings Queue */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Recent Requests (Queue)
          </Typography>
          <Button component={RouterLink} to="/provider/bookings" size="small" variant="outlined" sx={{ fontWeight: 700 }}>
            Manage Bookings
          </Button>
        </Box>
        <Divider />

        {bookings.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No booking requests assigned to you yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
            <Table aria-label="provider bookings table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Scheduled Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
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
                      {booking.customer?.firstName} {booking.customer?.lastName}
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
                        to="/provider/bookings"
                        variant="text"
                        size="small"
                        sx={{ fontWeight: 700 }}
                      >
                        Action
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
export default ProviderDashboard;
