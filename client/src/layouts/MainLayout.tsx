import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Box } from '@mui/material';

export const MainLayout: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};
export default MainLayout;
