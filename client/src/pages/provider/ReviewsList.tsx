import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import providerService from '../../services/providerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Rating,
  Stack,
  Pagination,
} from '@mui/material';
import {
  RateReview as ReviewIcon,
} from '@mui/icons-material';

export const ReviewsList: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const providerProfileId = user?.providerProfile?.id;

  // Fetch reviews list
  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ['providerProfileReviews', providerProfileId, page],
    queryFn: () => providerService.getReviews(providerProfileId!, page, 10),
    enabled: !!providerProfileId,
  });

  const reviews = reviewsResponse?.data || [];
  const meta = reviewsResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (!providerProfileId) {
    return (
      <EmptyState
        title="Profile Required"
        description="Configure your profile parameters to see customer reviews."
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Retrieving your reviews..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Customer Reviews
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse through ratings and written comments left by your customers on completed service requests
        </Typography>
      </Box>

      {reviews.length === 0 ? (
        <EmptyState
          title="No Reviews Yet"
          description="Completed jobs will show reviews here once customers provide feedback."
          icon={<ReviewIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />}
        />
      ) : (
        <Stack spacing={2.5}>
          {reviews.map((rev) => (
            <Card key={rev.id} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5} alignItems="center">
                  <Grid item xs={12} sm={2} md={1.5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Avatar
                      src={rev.customer?.avatarUrl || undefined}
                      alt={`${rev.customer?.firstName} ${rev.customer?.lastName}`}
                      sx={{ width: 56, height: 56, mb: 1 }}
                    >
                      {rev.customer?.firstName?.[0]}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {rev.customer?.firstName} {rev.customer?.lastName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={10} md={10.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 1.5 }}>
                      <Rating value={Number(rev.rating)} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(rev.createdAt).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
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
export default ReviewsList;
