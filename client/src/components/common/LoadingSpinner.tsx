import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  minHeight?: string | number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading details...',
  minHeight = '300px',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight,
        gap: 2,
        width: '100%',
      }}
    >
      <CircularProgress color="primary" size={40} thickness={4.5} />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};
export default LoadingSpinner;
