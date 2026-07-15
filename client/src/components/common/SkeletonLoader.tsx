import React from 'react';
import { Grid, Card, CardContent, Skeleton, Box } from '@mui/material';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'detail';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'card', count = 3 }) => {
  const items = Array.from({ length: count });

  if (variant === 'list') {
    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              backgroundColor: 'background.paper',
            }}
          >
            <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: '4px' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'detail') {
    return (
      <Box sx={{ width: '100%', py: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '12px', mb: 3 }} />
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" width="100%" height={100} />
            <Skeleton variant="rectangular" width="100%" height={150} sx={{ mt: 3, borderRadius: '8px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: '8px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {items.map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={160} />
            <CardContent>
              <Skeleton variant="text" width="80%" height={28} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, alignItems: 'center' }}>
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
export default SkeletonLoader;
