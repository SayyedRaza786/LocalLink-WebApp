import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  ReportProblem as ReportIcon,
  CheckCircleOutline as ResolveIcon,
} from '@mui/icons-material';
import type { Report } from '../../types';

// Zod schema
const resolveSchema = z.object({
  status: z.enum(['REVIEWED', 'RESOLVED', 'DISMISSED']),
  adminNotes: z
    .string()
    .min(5, 'Admin notes must be at least 5 characters')
    .max(1000, 'Notes must be less than 1000 characters')
    .transform((val) => val.trim()),
});

type ResolveFormInputs = z.infer<typeof resolveSchema>;

export const ReportsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch reports list
  const { data: response, isLoading } = useQuery({
    queryKey: ['adminReportsList', page],
    queryFn: () => adminService.listReports({ page, limit: 10 }),
  });

  const reports = response?.data || [];
  const meta = response?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Resolve Report Mutation
  const resolveMutation = useMutation({
    mutationFn: (data: ResolveFormInputs) =>
      adminService.resolveReport(selectedReport!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReportsList'] });
      toast.success('Report updated successfully.');
      setDialogOpen(false);
      setSelectedReport(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update report');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResolveFormInputs>({
    resolver: zodResolver(resolveSchema),
  });

  const handleResolveClick = (report: Report) => {
    setSelectedReport(report);
    reset({
      status: 'RESOLVED',
      adminNotes: report.adminNotes || '',
    });
    setDialogOpen(true);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const onSubmit = (data: ResolveFormInputs) => {
    resolveMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'REVIEWED':
        return 'primary';
      case 'RESOLVED':
        return 'success';
      case 'DISMISSED':
      default:
        return 'default';
    }
  };

  if (isLoading && page === 1) {
    return <LoadingSpinner message="Retrieving moderation support reports..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Moderation & Support Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Investigate platform support disputes, flag malicious providers, and resolve customer complaints
        </Typography>
      </Box>

      {reports.length === 0 ? (
        <EmptyState
          title="All Clear!"
          description="There are no active support complaints or moderation flags reported by users."
          icon={<ReportIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.2 }} />}
        />
      ) : (
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: 'none', overflowX: 'auto' }}>
            <Table aria-label="admin reports table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Reporter</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reported User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason / Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Report Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {report.reporter?.firstName} {report.reporter?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.reporter?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {report.reportedUser?.firstName} {report.reportedUser?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.reportedUser?.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: '350px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {report.reason}
                      </Typography>
                      {report.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {report.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={getStatusColor(report.status)}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {report.status === 'PENDING' ? (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ResolveIcon />}
                          onClick={() => handleResolveClick(report)}
                          sx={{ fontWeight: 700 }}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            setSelectedReport(report);
                            reset({
                              status: report.status as any,
                              adminNotes: report.adminNotes || '',
                            });
                            setDialogOpen(true);
                          }}
                          sx={{ fontWeight: 600 }}
                        >
                          View Logs
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

      {/* Resolve Report Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedReport?.status === 'PENDING' ? 'Resolve Support dispute' : 'Report Moderation Logs'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport?.status === 'PENDING' && (
            <DialogContentText sx={{ mb: 2.5 }}>
              Assign a resolution category status and add administrative notes documenting action details.
            </DialogContentText>
          )}
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth disabled={selectedReport?.status !== 'PENDING'}>
              <InputLabel id="resolve-status-label">Resolution Status</InputLabel>
              <Select
                labelId="resolve-status-label"
                id="status"
                label="Resolution Status"
                {...register('status')}
              >
                <MenuItem value="REVIEWED">Reviewed (In Progress)</MenuItem>
                <MenuItem value="RESOLVED">Resolved (Action Taken)</MenuItem>
                <MenuItem value="DISMISSED">Dismissed (No Action)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              label="Administrative Resolution Notes"
              placeholder="e.g. Blocked service provider due to breach of conduct terms..."
              multiline
              rows={4}
              error={!!errors.adminNotes}
              helperText={errors.adminNotes?.message}
              disabled={selectedReport?.status !== 'PENDING'}
              {...register('adminNotes')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Close
          </Button>
          {selectedReport?.status === 'PENDING' && (
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              color="primary"
              disabled={resolveMutation.isPending}
              sx={{ fontWeight: 700 }}
            >
              {resolveMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Confirm Resolution'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default ReportsManager;
