import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#c7c5c5',
      blue: '#79a9ba',
    },
    secondary: {
      main: '#dc004e',
      blue: '#edf6fa',
      blue1: '#a7c9d9',
      blue2: '#dae7ed'
    },
    background: {
      default: '#f5f5f5', // Light gray background
      bg1: '#b0bec5',
      bg2: '#daecf5',
      blue: '#79a9ba',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 500,
    },
    body2: {
      fontSize: '0.875rem',
    },
    heading: {
        fontSize: '30px'
    },
    tableHeader: {
      fontSize: '25px'
    },
  },
  components: {
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 10,
          borderRadius: 5,
          backgroundColor: '#f5f5f5', // Default background
        },
        bar: {
          borderRadius: 5,
        },
        rawMaterials: {
          backgroundColor: '#4caf50', // Green for Raw Materials
        },
        packingMaterials: {
          backgroundColor: '#ff9800', // Orange for Packing Materials
        },
        consulMaterials: {
          backgroundColor: '#2196f3', // Blue for Consul Materials
        },
      },
    },
  },
});

export default theme;
