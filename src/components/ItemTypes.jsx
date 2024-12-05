import React, { useState, useEffect } from 'react';
import { Breadcrumbs, Link, Box, Typography, Grid, Paper } from '@mui/material';
import PixIcon from '@mui/icons-material/Pix';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import axios for API requests
import LoadingBackdrop from './status/LoadingBackdrop';
import ErrorMessage from './status/ErrorMessage';

const ItemTypes = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // axios sends cookies with requests
  axios.defaults.withCredentials = true;

  // Login credentials
  const loginData = {
    username: 'user',
    password: '123',
  };

  // Function to handle login and fetching items
  const loginAndFetchItems = async () => {
    try {
      // Login request
      const loginResponse = await axios.post('http://localhost:5200/api/auth/login', loginData);

      // Check if login is successful
      if (loginResponse.data && loginResponse.data.message) {
        console.log("Login successful:", loginResponse.data.message);

        // Fetch items after successful login, relying on session cookie
        const itemResponse = await axios.get('http://localhost:5200/api/dashboard/operations/agingInventory/item/categories');
        // Assuming response.data.items contains the array of item categories
        const fetchedItems = itemResponse.data.categories.map((item) => ({ name: item.Category, qty: item.CategoryCount })); // Set default qty
        setItems(fetchedItems);
        setLoading(false);
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Call login and fetch items when the component mounts
  useEffect(() => {
    loginAndFetchItems();
  }, []);

  // Function to handle item click
  const handleItemClick = (item) => {
    navigate('/excessInventoryItems', { state: { item } });
  };

  if (loading) {
    return (
      <LoadingBackdrop loading={loading} />
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2, pt: 1 }}>
      {/* Header */}
      <Paper sx={{ py: 2, mb: 1, bgcolor: 'primary.blue', display: 'flex', alignItems: 'center', pl: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ transition: 'all 1s ease-in-out' }}>
          Aging Packing Materials Stock Management System
        </Typography>
      </Paper>

      {/* Item List */}
      <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 2, p: 2 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link underline="hover" color="inherit" href="/">
            Item Types /
          </Link>
        </Breadcrumbs>
        <Typography variant="h6" component="div" fontWeight="bold" mb={3} sx={{ textAlign: 'left' }}>
          Item Type
        </Typography>

        <Grid container spacing={2} sx={{ maxHeight: '68vh', overflowY: 'auto', transition: 'all 0.5s ease-in-out' }}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Paper
                onClick={() => handleItemClick(item)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: 'secondary.blue',
                    transform: 'scale(0.95)',
                    '& .icon': {
                      transform: 'scale(5)',
                      zIndex: -3,
                      color: '#cce3ed',
                      mb: 0,
                    },
                  },
                }}
              >
                <PixIcon
                  className="icon"
                  sx={{
                    width: 96,
                    height: 96,
                    mb: 2,
                    color: 'primary.blue',
                    transition: 'all 0.3s ease-in-out',
                  }}
                />
                <Typography variant="h6" component="div" fontWeight="bold">
                  {item.name}
                </Typography>
                <Typography color="textSecondary">
                  Items - {item.qty}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ItemTypes;
