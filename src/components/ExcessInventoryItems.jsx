import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Breadcrumbs, Link, Box, Typography, Paper, TextField, Table, TableBody, 
        TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import LoadingBackdrop from './status/LoadingBackdrop';
import ErrorMessage from './status/ErrorMessage';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

function valuetext(value) {
  return `${value}`;
}

//slider style
const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.blue, // Main track color
  '& .MuiSlider-thumb': {
    backgroundColor: theme.palette.primary.blue, // Thumb color
  },
  '& .MuiSlider-track': {
    backgroundColor: theme.palette.primary.blue, // Active track color
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.secondary.blue1, // Inactive track color
  },
}));

const ExcessInventoryItems = () => {
  const [orderDirection, setOrderDirection] = useState('desc');
  const [orderBy, setOrderBy] = useState('Age_months');
  const [searchQuery, setSearchQuery] = useState('');
  const [excessInventories, setExcessInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ageRange, setAgeRange] = useState({ min: 0, max: 100 });
  const [value, setValue] = useState([0, 100]);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const navigate = useNavigate();

  const handleSort = (property) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Ensure excessInventories exists before filtering and sorting
  const filteredItems = excessInventories?.filter((selectedItem) => (
    (selectedItem.ItenCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
     selectedItem.qty_on_hand.toString().includes(searchQuery) ||
     selectedItem.available_qty.toString().includes(searchQuery) ||
     selectedItem.unitcost.toString().includes(searchQuery) ||
     selectedItem.Age_months.toString().includes(searchQuery)) &&
    selectedItem.Age_months >= value[0] && 
    selectedItem.Age_months <= value[1]
  )) || [];

  const sortedItems = filteredItems.sort((a, b) => {
    if (orderDirection === 'asc') {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  const handleRowClick = (row) => {
    navigate('/excessInventoryItems/productList', { state: { item: row, selectedItem} });
  };

  const location = useLocation();
  const selectedItem = location.state?.item;

  const fetchExcessInventoryItems = async () => {
    try {
      const response = await axios.get(`http://localhost:5200/api/dashboard/operations/agingInventory/item/excessInventoryItems?itemType=${selectedItem.name}`);
      const data = response.data.excessInventoryItms || [];

      // Group by `ItenCode` and find the max `Age_months` for each item
      const groupedData = data.reduce((acc, item) => {
        const { ItenCode, Age_months, lotdate, today, available_qty } = item;
      
        if (!acc[ItenCode]) {
          // Initialize the entry with the item, and start arrays for allAgingMonths, allLotDates, and allTodays
          acc[ItenCode] = {
            ...item,
            allAgingMonths: [Age_months],
            allLotDates: [new Date(lotdate)], // Convert to Date objects for comparison
            allTodays: [new Date(today)],
            allAvailableQtys: [available_qty]
          };
        } else {
          // Add the new Age_months, lotdate, and today to their respective arrays
          acc[ItenCode].allAgingMonths.push(Age_months);
          acc[ItenCode].allLotDates.push(new Date(lotdate));
          acc[ItenCode].allTodays.push(new Date(today));
          acc[ItenCode].allAvailableQtys.push(available_qty);
      
          // Update the main Age_months if the current one is greater
          if (Age_months > acc[ItenCode].Age_months) {
            acc[ItenCode] = {
              ...item,
              allAgingMonths: acc[ItenCode].allAgingMonths,
              allLotDates: acc[ItenCode].allLotDates,
              allTodays: acc[ItenCode].allTodays,
              allAvailableQtys: acc[ItenCode].allAvailableQtys
            };
          }
        }
      
        // Sort allAgingMonths in descending order
        acc[ItenCode].allAgingMonths.sort((a, b) => b - a);

        // Sort allLotDates in ascending order (oldest to nearest)
        acc[ItenCode].allLotDates.sort((a, b) => a - b);
      
        // Determine oldest and nearest lotdate
        acc[ItenCode].oldestLotDate = new Date(Math.min(...acc[ItenCode].allLotDates));
        acc[ItenCode].nearestLotDate = new Date(Math.max(...acc[ItenCode].allLotDates));
      
        return acc;
      }, {});

      const groupedValues = Object.values(groupedData);
      setExcessInventories(groupedValues);

      // Calculate min and max Age_months
      const minAge = Math.min(...groupedValues.map(item => item.Age_months));
      const maxAge = Math.max(...groupedValues.map(item => item.Age_months));

      // Update age range and slider value
      setAgeRange({ min: minAge, max: maxAge });
      setValue([minAge, maxAge]);
  
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      fetchExcessInventoryItems();
    }
  }, [selectedItem]);

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


      <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 2, p: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link underline="hover" color="inherit" component={RouterLink} to="/">
            Item Types
          </Link>
          <Typography color="text.primary">Excess Inventory Items</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            Excess Inventory Items
          </Typography> 
          <Box sx={{ justifyContent: 'flex-end', display: 'flex' }}>
            <Box sx={{ width: 400, display: 'flex',alignItems: 'center',gap: 2 }}>
              <Typography variant="body2">
                Aging Range: &nbsp;
                {`${value[0]} - ${value[1]}`}
              </Typography>
              <StyledSlider
                getAriaLabel={() => 'Aging range'}
                value={value}
                sx={{ width: 200 }}
                onChange={handleChange}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
                min={ageRange.min}
                max={ageRange.max}
              />
            </Box>
            <TextField
              variant="outlined"
              placeholder="Search"
              size="small"
              sx={{ width: 300 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
        </Box>

        {selectedItem && (
          <Box mt={0}>
            <Typography variant="h6">{selectedItem.name}</Typography>
          </Box>
        )}

        <TableContainer component={Paper} sx={{ mt: 0, maxHeight: '76vh' }}>
          <Table sx={{ maxWidth: 1390, tableLayout: 'auto' }} aria-label="excess inventory table" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.bg1', fontWeight: 'bold' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'ItenCode'}
                    direction={orderBy === 'ItenCode' ? orderDirection : 'asc'}
                    onClick={() => handleSort('ItenCode')}
                  >
                    Item Code
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'qty_on_hand'}
                    direction={orderBy === 'qty_on_hand' ? orderDirection : 'asc'}
                    onClick={() => handleSort('qty_on_hand')}
                  >
                    On Hand Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'qty_allocjob'}
                    direction={orderBy === 'qty_allocjob' ? orderDirection : 'asc'}
                    onClick={() => handleSort('qty_allocjob')}
                  >
                    Allocated Job Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'available_qty'}
                    direction={orderBy === 'available_qty' ? orderDirection : 'asc'}
                    onClick={() => handleSort('available_qty')}
                  >
                    Available Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'unitcost'}
                    direction={orderBy === 'unitcost' ? orderDirection : 'asc'}
                    onClick={() => handleSort('unitcost')}
                  >
                    Unit Cost
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'Age_months'}
                    direction={orderBy === 'Age_months' ? orderDirection : 'asc'}
                    onClick={() => handleSort('Age_months')}
                  >
                    No. of Aged Months
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {sortedItems.length > 0 ? (
          sortedItems.map((row, index) => (
          <TableRow key={index}  
                    onClick={() => handleRowClick(row)} 
                    sx={{ transition: 'all 0.1s ease-in-out',
                          cursor: 'pointer', '&:hover': {
                          backgroundColor: 'secondary.blue',
                          transform: 'scale(1.01)'
                    }, }}>
            <TableCell component="th" scope="row">{row.ItenCode}</TableCell>
            <TableCell align="right">{row.qty_on_hand}</TableCell>
            <TableCell align="right">{row.qty_allocjob}</TableCell>
            <TableCell align="right">{row.available_qty}</TableCell>
            <TableCell align="right">{row.unitcost}</TableCell>
            <TableCell align="right">{row.Age_months}</TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
        <TableCell colSpan={6} align="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.main' }}>
            <ReportGmailerrorredIcon sx={{ mr: 1 }} />
            <Typography>No data found</Typography>
              </Box>
            </TableCell>
      </TableRow>
      )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ExcessInventoryItems;

