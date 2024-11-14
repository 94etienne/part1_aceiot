import React, { useEffect } from 'react';
import { Box, Toolbar, Typography } from '@mui/material';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const InvalidPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /register if the user position is not "IT" or "Director"
    if (user?.position !== 'IT' && user?.position !== 'Director') {
      navigate('/register');
    }
  }, [user, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
        textAlign: 'center',
      }}
    >
      <Toolbar />
      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
          fontWeight: 'bold',
          color: 'gray',
        }}
      >
        404 - Page Not Found
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mt: 2, color: 'gray' }}
      >
        Sorry, the page you're looking for doesn't exist.
      </Typography>
    </Box>
  );
};

export default InvalidPage;
