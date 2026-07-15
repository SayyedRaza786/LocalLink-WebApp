import React from 'react';
import { useQuery } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import {
  SupervisedUserCircle as UsersIcon,
  Handyman as ProvidersIcon,
  Assessment as StatsIcon,
  ReportProblem as ReportsIcon,
  AttachMoney as MoneyIcon,
  ChevronRight as ArrowIcon,
} from '@mui/icons-material';

export const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  if (isLoading) {
    return <LoadingSpinner message="Retrieving administrator insights..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of LocalLink platform status, registered accounts volume, billing revenue, and support moderation reports
        </Typography>
      </Box>

      {/* Main Metric Grid */}
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
                <UsersIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {stats?.totalUsers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
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
                <ProvidersIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {stats?.totalProviders || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Providers
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
                <ReportsIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {stats?.pendingReports || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open Reports
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
                <MoneyIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  ${Number(stats?.totalRevenue || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Platform Volume
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sub sections: Navigation quick links and platform health */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }} elevation={0}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              Quick Navigation Panel
            </Typography>
            <Stack spacing={2}>
              <Button
                component={RouterLink}
                to="/admin/users"
                variant="outlined"
                fullWidth
                endIcon={<ArrowIcon />}
                sx={{ py: 1.5, justifyContent: 'space-between', fontWeight: 700 }}
              >
                Manage User Registrations
              </Button>
              <Button
                component={RouterLink}
                to="/admin/providers"
                variant="outlined"
                fullWidth
                endIcon={<ArrowIcon />}
                sx={{ py: 1.5, justifyContent: 'space-between', fontWeight: 700 }}
              >
                Verify Services Providers
              </Button>
              <Button
                component={RouterLink}
                to="/admin/categories"
                variant="outlined"
                fullWidth
                endIcon={<ArrowIcon />}
                sx={{ py: 1.5, justifyContent: 'space-between', fontWeight: 700 }}
              >
                Manage Service Categories
              </Button>
              <Button
                component={RouterLink}
                to="/admin/reports"
                variant="outlined"
                fullWidth
                endIcon={<ArrowIcon />}
                sx={{ py: 1.5, justifyContent: 'space-between', fontWeight: 700 }}
              >
                Moderation Support Reports
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: '12px', height: '100%' }} elevation={0}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              Platform Volume Distribution
            </Typography>
            <Stack spacing={3.5} sx={{ py: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Active Service Orders:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {stats?.activeBookings || 0}
                  </Typography>
                </Box>
                <Box sx={{ height: 8, width: '100%', backgroundColor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${Math.min(100, ((stats?.activeBookings || 0) / Math.max(1, stats?.totalBookings || 1)) * 100)}%`,
                      backgroundColor: 'primary.main',
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Completed Service Orders:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {stats?.completedBookings || 0}
                  </Typography>
                </Box>
                <Box sx={{ height: 8, width: '100%', backgroundColor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${Math.min(100, ((stats?.completedBookings || 0) / Math.max(1, stats?.totalBookings || 1)) * 100)}%`,
                      backgroundColor: 'success.main',
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    New registrations (Last 30 Days):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {stats?.newUsersLast30Days || 0}
                  </Typography>
                </Box>
                <Box sx={{ height: 8, width: '100%', backgroundColor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${Math.min(100, ((stats?.newUsersLast30Days || 0) / Math.max(1, stats?.totalUsers || 1)) * 100)}%`,
                      backgroundColor: 'secondary.main',
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
export default AdminDashboard;
