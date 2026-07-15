import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <ErrorIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.7 }} />
        <Box>
          <Typography variant="h3" color="text.primary" gutterBottom sx={{ fontWeight: 800 }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The page you are looking for does not exist, has been removed, or is temporarily unavailable.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};
export default NotFound;
