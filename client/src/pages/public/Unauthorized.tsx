import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ShieldOutlined as ShieldMuiIcon } from '@mui/icons-material';

export const Unauthorized: React.FC = () => {
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
        <ShieldMuiIcon sx={{ fontSize: 80, color: 'error.main' }} />
        <Box>
          <Typography variant="h3" color="text.primary" gutterBottom sx={{ fontWeight: 800 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You do not have the required permissions to view this page. If you believe this is an
            error, please try logging out and logging back in with a different account.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
            Log In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
export default Unauthorized;
