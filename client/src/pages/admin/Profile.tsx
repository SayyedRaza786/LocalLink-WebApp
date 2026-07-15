import React from 'react';
import { Box, Typography } from '@mui/material';

export const Profile: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Admin Profile Settings
      </Typography>
    </Box>
  );
};
export default Profile;
