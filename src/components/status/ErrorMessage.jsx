import React from 'react';
import { Typography, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link } from 'react-router-dom';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        color: '#d32f2f',
        border: '1px solid #d32f2f',
        maxWidth: '500px',
        margin: 'auto',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        animation: 'shake 0.5s ease',
        '@keyframes shake': {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
          '100%': { transform: 'translateX(0)' },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
        <ErrorOutlineIcon
          sx={{ marginRight: 1, fontSize: '30px', animation: 'blink 1.5s infinite' }}
        />
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.1rem',
          }}
        >
          Error: {error}
        </Typography>
      </Box>
      <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
        Click here to return to Home Page
      </Link>
    </Box>
  );
};

export default ErrorMessage;