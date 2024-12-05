// LoadingBackdrop.jsx
import React from 'react';
import { Backdrop, Typography, Box } from '@mui/material';

const LoadingBackdrop = ({ loading }) => {
  if (!loading) return null;

  return (
    <Backdrop
      sx={{
        display: 'flex',
        flexDirection: 'column',
        color: '#edf6fa',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        transition: 'background-color 0.5s ease-in-out',
      }}
      open={true}
    >

      <Typography
        variant="h6"
        sx={{
           animation: 'fade 3s ease-in infinite',
        }}
      >
        Loading
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          marginTop: -5,
          '@keyframes fade': {
            '0%': { opacity: 0 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0 },
          },
        }}
      >
        <Typography
          sx={{
            animation: 'fade 1.5s ease-in-out infinite',
            animationDelay: '0.3s',
            fontSize: 50
          }}
        >
          .
        </Typography>
        <Typography
          sx={{
            animation: 'fade 1.5s ease-in-out infinite',
            animationDelay: '0.6s',
            fontSize: 50
          }}
        >
          .
        </Typography>
        <Typography
          sx={{
            animation: 'fade 1.5s ease-in-out infinite',
            animationDelay: '0.9s',
            fontSize: 50
          }}
        >
          .
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingBackdrop;
