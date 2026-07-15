import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import favoriteService from '../../services/favoriteService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import {
  Star as StarIcon,
  LocationOn as LocationIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch favorites list
  const { data: favoritesResponse, isLoading } = useQuery({
    queryKey: ['myFavorites', page],
    queryFn: () => favoriteService.list(page, 12),
  });

  const favorites = favoritesResponse?.data || [];
  const meta = favoritesResponse?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 };

  // Remove Favorite Mutation
  const removeMutation = useMutation({
    mutationFn: (providerId: string) => favoriteService.remove(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFavorites'] });
      toast.success('Removed provider from favorites.');
    },
    onError: () => {
      toast.error('Failed to remove provider from favorites');
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Retrieving saved professionals..." />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
          Saved Providers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quickly access and book your favorite local service professionals
        </Typography>
      </Box>

      {favorites.length === 0 ? (
        <EmptyState
          title="No Saved Providers"
          description="You haven't bookmarked any service professionals yet. Explore experts in your city and click 'Save Expert' to add them here."
          actionText="Search Providers"
          onActionClick={() => navigate('/search')}
        />
      ) : (
        <Grid container spacing={3}>
          {favorites.map((fav) => {
            const provider = fav.provider;
            if (!provider) return null;
            return (
              <Grid item xs={12} sm={6} md={4} key={fav.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flexGrow: 1 }}>
                    <Avatar
                      src={provider.user?.avatarUrl || undefined}
                      alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
                      sx={{ width: 80, height: 80, mb: 2, border: '2px solid', borderColor: 'primary.light' }}
                    >
                      {provider.user?.firstName?.[0]}
                    </Avatar>

                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {provider.user?.firstName} {provider.user?.lastName}
                    </Typography>

                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 1, mb: 1.5 }}>
                      <Rating value={Number(provider.avgRating)} readOnly precision={0.1} size="small" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {Number(provider.avgRating).toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({provider.totalReviews})
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary" sx={{ mb: 2 }}>
                      <LocationIcon fontSize="small" />
                      <Typography variant="body2">{provider.city}</Typography>
                    </Stack>

                    <Box sx={{ width: '100%', mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Grid container spacing={1}>
                        <Grid item xs={8}>
                          <Button
                            component={RouterLink}
                            to={`/providers/${provider.id}`}
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="small"
                            sx={{ fontWeight: 700 }}
                          >
                            View Profile
                          </Button>
                        </Grid>
                        <Grid item xs={4}>
                          <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            size="small"
                            onClick={() => removeMutation.mutate(provider.id)}
                            disabled={removeMutation.isPending}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
export default Favorites;
