import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Card,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  Stack,
  Pagination,
  Grid,
} from '@mui/material';
import {
  VerifiedUser as VerifyIcon,
  Search as SearchIcon,
  HighlightOff as UnverifyIcon,
} from '@mui/icons-material';

export const ProvidersManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isVerified, setIsVerified] = useState('');
  const [page, setPage] = useState(1);

  // Fetch providers
  const { data: response, isLoading } = useQuery({
    queryKey: ['adminProvidersList', search, isVerified, page],
    queryFn: () =>
      adminService.listProviders({
        page,
        limit: 10,
        q: search || undefined,
        isVerified: isVerified || undefined,
      }),
  });

  const providers = response?.data || [];
  const meta = response?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Verification Toggle Mutation
  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      adminService.verifyProvider(id, verified),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminProvidersList'] });
      toast.success(
        `Provider is now ${updated.isVerified ? 'Verified' : 'Unverified'}`
      );
    },
    onError: () => {
      toast.error('Failed to change provider verification status');
    },
  });

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleToggleVerify = (id: string, currentVerified: boolean) => {
    const action = currentVerified ? 'Revoke Verification' : 'Verify Expert';
    if (window.confirm(`Are you sure you want to ${action}?`)) {
      verifyMutation.mutate({ id, verified: !currentVerified });
    }
  };

  if (isLoading && page === 1) {
    return <LoadingSpinner message="Retrieving provider profiles..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Service Providers Directory
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Moderate provider profiles parameters, verify local business identities, and review quality ratings
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Search name, city, area"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="verification-filter-label">Verification</InputLabel>
              <Select
                labelId="verification-filter-label"
                id="isVerified"
                value={isVerified}
                label="Verification"
                onChange={(e) => {
                  setIsVerified(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Providers</MenuItem>
                <MenuItem value="true">Verified Only</MenuItem>
                <MenuItem value="false">Unverified Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      {providers.length === 0 ? (
        <EmptyState title="No Providers Found" description="Try adjusting search keyword filters." />
      ) : (
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: 'none', overflowX: 'auto' }}>
            <Table aria-label="admin providers table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Experience</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Bookings</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Verification</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providers.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar src={item.user?.avatarUrl || undefined} alt={item.user?.firstName}>
                          {item.user?.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.user?.firstName} {item.user?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.user?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {item.city}{item.area ? `, ${item.area}` : ''}
                    </TableCell>
                    <TableCell>{item.experienceYears} Years</TableCell>
                    <TableCell>
                      {Number(item.avgRating).toFixed(1)} ({item.totalReviews} Reviews)
                    </TableCell>
                    <TableCell>{item.totalBookings}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.isVerified ? 'Verified' : 'Pending Verification'}
                        color={item.isVerified ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color={item.isVerified ? 'error' : 'success'}
                        size="small"
                        startIcon={item.isVerified ? <UnverifyIcon /> : <VerifyIcon />}
                        onClick={() => handleToggleVerify(item.id, item.isVerified)}
                        disabled={verifyMutation.isPending}
                        sx={{ fontWeight: 700 }}
                      >
                        {item.isVerified ? 'Revoke' : 'Verify'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Pagination count={meta.totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
};
export default ProvidersManager;
