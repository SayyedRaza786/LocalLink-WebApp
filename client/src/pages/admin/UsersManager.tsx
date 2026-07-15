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
  Block as BlockIcon,
  CheckCircleOutline as ActiveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

export const UsersManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);

  // Fetch users
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['adminUsersList', search, role, isActive, page],
    queryFn: () =>
      adminService.listUsers({
        page,
        limit: 10,
        q: search || undefined,
        role: role || undefined,
        isActive: isActive || undefined,
      }),
  });

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Block / Unblock Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminService.updateUserStatus(id, active),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      toast.success(
        `User ${updated.firstName} is now ${updated.isActive ? 'Active' : 'Blocked'}`
      );
    },
    onError: () => {
      toast.error('Failed to update user active status');
    },
  });

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleToggleStatus = (id: string, currentActive: boolean) => {
    const action = currentActive ? 'Block' : 'Activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      toggleStatusMutation.mutate({ id, active: !currentActive });
    }
  };

  if (isLoading && page === 1) {
    return <LoadingSpinner message="Retrieving registered accounts list..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Registered Users Directory
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track registration details, verify contact records, and block/unblock system access permissions
        </Typography>
      </Box>

      {/* Filter Header Card */}
      <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Search name or email"
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

          <Grid item xs={12} sm={3.5}>
            <FormControl fullWidth>
              <InputLabel id="role-filter-label">Role</InputLabel>
              <Select
                labelId="role-filter-label"
                id="role"
                value={role}
                label="Role"
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="CUSTOMER">Customer</MenuItem>
                <MenuItem value="PROVIDER">Provider</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3.5}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status"
                value={isActive}
                label="Status"
                onChange={(e) => {
                  setIsActive(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="true">Active Only</MenuItem>
                <MenuItem value="false">Blocked Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Users Table */}
      {users.length === 0 ? (
        <EmptyState title="No Users Found" description="Try broadening your search query constraints." />
      ) : (
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
            <Table aria-label="admin users table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Profile</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Joined On</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar src={item.avatarUrl || undefined} alt={item.firstName}>
                          {item.firstName?.[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.firstName} {item.lastName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.role}
                        color={item.role === 'ADMIN' ? 'secondary' : item.role === 'PROVIDER' ? 'primary' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.isActive ? 'Active' : 'Blocked'}
                        color={item.isActive ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.role !== 'ADMIN' && (
                        <Button
                          variant="outlined"
                          color={item.isActive ? 'error' : 'success'}
                          size="small"
                          startIcon={item.isActive ? <BlockIcon /> : <ActiveIcon />}
                          onClick={() => handleToggleStatus(item.id, item.isActive)}
                          disabled={toggleStatusMutation.isPending}
                          sx={{ fontWeight: 700 }}
                        >
                          {item.isActive ? 'Block' : 'Activate'}
                        </Button>
                      )}
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
export default UsersManager;
