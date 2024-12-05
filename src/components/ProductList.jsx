import React,{ useState, useEffect, useCallback } from 'react'
import axios from 'axios';
import { Breadcrumbs, Link, Box, Typography, Paper, Grid, LinearProgress, IconButton, Collapse, TextField, Table, 
     TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog,
    DialogTitle, DialogContent } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import LoadingBackdrop from './status/LoadingBackdrop';
import ErrorMessage from './status/ErrorMessage';
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';

  //button style for fetch data button
  const StyledLoadingButton = styled(LoadingButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.blue,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.secondary.blue1,
    },
    padding: theme.spacing(1, 4, 1, 1), // Adjust padding to ensure even spacing
    borderRadius: theme.shape.borderRadius,
    textTransform: 'none',
    fontWeight: 'bold',
    minWidth: '100px',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0)', // Apply box shadow evenly across the button
    width: '30%', // Ensures the button takes full width
    '& .MuiLoadingButton-loadingIndicator': {
      right: theme.spacing(2), // Adjust position of the loading icon
    },
  }));

//progress bar style
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.MuiLinearProgress-colorPrimary`]: {
      backgroundColor: theme.palette.secondary.blue2,
    },
    [`& .MuiLinearProgress-bar`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.primary.blue,
    },
  }));


const ProductList = () => {


    const handleRefresh = () => {
        if (selectedItem && targetProductQty) {
            setIsRefreshing(true);
            fetchProductList().finally(() => {
                setIsRefreshing(false);
            });
        }
    };

    const [productList, setProductList] = useState([]); // Initialized to an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [targetProductQty, setTargetProductQty] = useState('100');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [rawItemList, setRawItemList] = useState([]);
    const [packingItemList, setPackingItemList] = useState([]);
    const [openAgingDialog, setOpenAgingDialog] = useState(false);

    const handleOpenAgingDialog = () => {
        setOpenAgingDialog(true);
    };

    const handleCloseAgingDialog = () => {
        setOpenAgingDialog(false);
    };

    const handleDropdownClick = async (index) => {
        if (selectedProduct === index) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(index);
            try {
                const response = await axios.get(`http://localhost:5200/api/dashboard/operations/agingInventory/item/bomDetails`, {
                    params: {
                        finishGood: productList[index].item
                    }
                });
                const bomDetails = response.data.bomDetails || [];
                // setBomList(bomDetails);

                // Categorize items
                const raw = [];
                const packing = [];

                bomDetails.forEach(item => {
                    switch (item.item_category) {
                        case 'Raw':
                            raw.push(item);
                            break;
                        case 'Packing':
                            packing.push(item);
                            break;
                        default:
                            // Handle unexpected item categories
                            alert.warn(`Unexpected item category: ${item.item_category}`);
                            break;
                    }
                });

                setRawItemList(raw);
                setPackingItemList(packing);
            } catch (err) {
                console.error('Error fetching BOM details:', err);
            }
        }
    };

    //target qty change handler
    const handleTargetQtyChange = (event) => {
        const value = event.target.value;
        if (value === '' || /^[0-9]*$/.test(value)) {
            setTargetProductQty(value);
        }
    }; 

    //formatting date
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return ''; // Return empty string for invalid dates
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
      };

    //get selected item from location state
    const location = useLocation();
    const selectedItem = location.state?.item.ItenCode;
    const selectedItemOnHandQuantity = location.state?.item.qty_on_hand;
    const selectedItemAllocatedJobQuantity = location.state?.item.qty_allocjob;
    const selectedItemAvailableQuantity = location.state?.item.available_qty;
    const selectedCategory = location.state?.selectedItem;
    const selectedItemLotAging = location.state?.item.allAgingMonths;
    const selectedItemOldestLotDate = formatDate(location.state?.item?.oldestLotDate);
    const selectedItemNearestLotDate = formatDate(location.state?.item?.nearestLotDate);
    const selectedItemLotDates = location.state?.item?.allLotDates || [];
    const selectedItemLotAvailableQty = location.state?.item?.available_qty || [];
      // Convert date string to timestamp
    const getTimestamp = (dateStr) => {
        if (!dateStr) return Date.now();
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? Date.now() : date.getTime();
    };

    // Sort the aging data by date
    const sortedAgingData = selectedItemLotAging
        .map((aging, index) => ({
            aging,
            date: selectedItemLotDates[index]
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const value = useState([
        getTimestamp(selectedItemOldestLotDate),
        getTimestamp(selectedItemNearestLotDate)
    ]);

    //fetch product list from api
    const fetchProductList = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5200/api/dashboard/operations/agingInventory/item/productListByItem`, {
                params: {
                    itemCode: selectedItem,
                    targetQty: targetProductQty
                }
            });
            setProductList(response.data.productList || []); 
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [selectedItem, targetProductQty]);

      //fetch product list when selected item changes
      useEffect(() => {
        if (selectedItem) {
            fetchProductList();
        }
    }, [selectedItem, fetchProductList]);
    
      //loading backdrop
      if (loading) {
        return (
            <LoadingBackdrop loading={loading} />
        );
      }
    
      //error message
      if (error) {
        return <ErrorMessage error={error} />;
      }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2, pt: 1 }}>


            {/* Page Content */}
            <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 2, p: 2 }}>
                {/* Breadcrumbs */}
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link underline="hover" color="inherit" component={RouterLink} to="/">
                        Item Types
                    </Link>
                    <Link underline="hover" color="inherit" component={RouterLink} to="/excessInventoryItems" state={{ item:selectedCategory }}>
                        Excess Inventory Items
                    </Link>
                    <Typography color="text.primary">Product List</Typography>
                </Breadcrumbs>

                {selectedItem && (
                <Box mb={2}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3}>
                            <Typography component="div" fontWeight="bold" sx={{fontSize: 16, color: '#757575'}}>
                                Inventory: <span style={{color: '#000'}}>{selectedItem}</span>
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography component="div" fontWeight="bold" sx={{fontSize: 16, color: '#757575'}}>
                                On Hand Qty: <span style={{color: '#000'}}>{selectedItemOnHandQuantity}</span>
                            </Typography>
                        </Grid> 
                        <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
                            <Typography component="div" fontWeight="bold" sx={{ fontSize: 16, color: '#757575' }}>
                                Lot Aging:
                                <Box
                                    component="span"
                                    sx={{
                                        color: '#000',
                                        position: 'relative',
                                        marginLeft: 1,
                                    }}
                                >
                                    {selectedItemLotAging[0]}
                                </Box>
                            </Typography>
                            <IconButton onClick={handleOpenAgingDialog}>
                                <ViewListRoundedIcon/>
                            </IconButton>
                                <Dialog 
                                    open={openAgingDialog} 
                                    onClose={handleCloseAgingDialog}
                                    maxWidth="sm"
                                    fullWidth
                                >
                                    <DialogTitle>Lot Aging Details</DialogTitle>
                                    <DialogContent sx={{ maxHeight: '400px', overflow: 'auto' }}>
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell 
            sx={{ fontWeight: 'bold', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}
          >
            Aging Months
          </TableCell>
          <TableCell 
            sx={{ fontWeight: 'bold', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}
          >
            Aged Date
          </TableCell>
          <TableCell 
            sx={{ fontWeight: 'bold', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}
          >
            Available_Qty
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {selectedItemLotAging.map((aging, index) => (
          <TableRow key={index}>
            <TableCell>{`${aging} months`}</TableCell>
            <TableCell>{formatDate(selectedItemLotDates[index])}</TableCell>
            <TableCell>{selectedItemLotAvailableQty}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</DialogContent>

                                </Dialog>
                        </Grid>
 
                        <Grid item xs={4}>
                            <Box display="flex" alignItems="center">
                                <Typography component="div" fontWeight="bold" sx={{fontSize: 16, color: '#757575', mr: 1}}>
                                    Target Product Qty:
                                </Typography>   
                                <TextField
                                    value={targetProductQty === '' ? '' : targetProductQty || '100'}
                                    onChange={handleTargetQtyChange}
                                    type="text"
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*'
                                    }}
                                    size='small'
                                    placeholder="100"
                                    sx={{ flexGrow: 0, width: '125px', marginRight: '4px' }}
                                />
                                <StyledLoadingButton
                                    size="small"
                                    onClick={handleRefresh}
                                    loading={isRefreshing}
                                    loadingPosition="end" 
                                    variant="contained"
                                >
                                    Fetch Data
                                </StyledLoadingButton>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} alignItems="center" paddingTop={2}>
                        <Grid item xs={4}>
                            <Typography component="div" fontWeight="bold" sx={{fontSize: 16, color: '#757575'}}>
                                Job Alctd. Qty: <span style={{color: '#000'}}>{selectedItemAllocatedJobQuantity}</span>
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography component="div" fontWeight="bold" sx={{fontSize: 16, color: '#757575'}}>
                                Available Qty: <span style={{color: '#000'}}>{selectedItemAvailableQuantity}</span>
                            </Typography>
                        </Grid>  
                        <Grid item xs={4}>
                            <Typography component="div" fontWeight="bold" display="flex" sx={{fontSize: 16, color: '#757575'}}>
                                Aging Range:&nbsp;
                                <span style={{color: '#000'}}>
                                    {formatDate(value[0])} - {formatDate(value[1])}
                                </span>
                                {/* <Box sx={{ width: 200, }}>
                                    <StyledSlider
                                        getAriaLabel={() => 'Aging range'}
                                        value={value}
                                        onChange={handleDateChange}
                                        valueLabelDisplay="auto"
                                        min={getTimestamp(selectedItemOldestLotDate)}
                                        max={getTimestamp(selectedItemNearestLotDate)}
                                    />
                                </Box> */}
                            </Typography>
                        </Grid>   
                    </Grid>
                </Box>
                )}

                <Grid container spacing={2} alignItems="center" sx={{maxHeight: '67vh', overflowY: 'auto', transition: 'all 0.5s ease-in-out' }}>
                    {/* Header */}
                    <Grid item xs={1} sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1, height: '48px' }}></Grid>
                    <Grid item xs={3.33} sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <Typography variant="h6">Product List</Typography>
                    </Grid>
                    <Grid item xs={3.33} sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <Typography variant="h6">Raw Materials</Typography>
                    </Grid>
                    <Grid item xs={3.33} sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <Typography variant="h6">Packing Materials</Typography>
                    </Grid>
                    {/* <Grid item xs={2.5} sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <Typography variant="h6">Consumable Materials</Typography>
                    </Grid> */}
                    <Grid item xs={1} sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1,height: '48px' }}></Grid>

                    {/* Product Rows */}
                    {productList.length > 0 ? (
                        productList.map((product, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={1}>
                                    {/* <Checkbox /> */}
                                </Grid>
                                <Grid item xs={3.33} container alignItems="center">
                                    <Typography>{product.item}</Typography>
                                    <Typography fontSize={12}>{product.description}</Typography>
                                </Grid>

                                {/* Progress Bars with percentages */}
                                <Grid item xs={3.33}>
                                    <StyledLinearProgress variant="determinate" value={product.percentages.Raw} />
                                    <Typography>{product.percentages.Raw}%</Typography>
                                </Grid>
                                <Grid item xs={3.33}>
                                    <StyledLinearProgress variant="determinate" value={product.percentages.Packing} />
                                    <Typography>{product.percentages.Packing}%</Typography>
                                </Grid>
                                {/* <Grid item xs={2.5}>
                                    <StyledLinearProgress variant="determinate" value={product.percentages.Consumable} />
                                    <Typography>{product.percentages.Consumable}%</Typography>
                                </Grid> */}
                                <Grid xs={1}>
                                    <IconButton onClick={() => handleDropdownClick(index)} 
                                        sx={{ transform: selectedProduct === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'all 0.3s ease-in-out' }}>
                                        <ArrowDropDownIcon />
                                    </IconButton>
                                </Grid>

                                {/* Product Details - Conditionally rendered below the row */}
                                {selectedProduct === index && (
                                    <Grid item xs={12}>
                                    <Collapse sx={{transition: 'all 0.1s ease-in-out'}} in={selectedProduct === index} timeout="auto" unmountOnExit>
                                        <Box sx={{ flexDirection: 'row' }}>
                                            <Box sx={{ p: 2, backgroundColor: 'secondary.blue' }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                 Material quantity:
                                                </Typography>
                                             </Grid>
                                             <Grid item xs={8}>
                                                <Typography variant="body2">{product.matl_qty}</Typography>
                                              </Grid>

                                              <Grid item xs={4}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                  Maximum producible master cartons:
                                                 </Typography>
                                               </Grid>
                                               <Grid item xs={8}>
                                                 <Typography variant="body2">
                                                  {Math.max(0, Math.floor(selectedItemAvailableQuantity / product.matl_qty))}
                                                </Typography>
                                               </Grid>

                                              <Grid item xs={4}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                  Units per inner carton:
                                                </Typography>
                                              </Grid>
                                               <Grid item xs={8}>
                                                <Typography variant="body2">{product.UnitsPerInner}</Typography>
                                              </Grid>

                                               <Grid item xs={4}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                  Inner cartons per retail carton:
                                               </Typography>
                                              </Grid>
                                               <Grid item xs={8}>
                                                <Typography variant="body2">{product.InnerPerRC}</Typography>
                                              </Grid>

                                              <Grid item xs={4}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                  Retail carton per Master carton:
                                                </Typography>
                                               </Grid>
                                              <Grid item xs={8}>
                                               <Typography variant="body2">{product.RCPerMC}</Typography>
                                              </Grid>
                                             </Grid>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row',justifyContent: 'center',alignItems: 'center', backgroundColor: 'secondary.blue'}}>
                                            <Grid container spacing={0}>
                                                <Grid item xs={6} sx={{border: '1px solid',borderColor: 'grey.500',borderRadius: '4px',mb: 2,}}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                                                        <span style={{ fontWeight: 'bold' }}>Raw Items</span>
                                                    </Typography>

                                                    <Box sx={{ p: 1, borderTop: '1px solid',borderColor: 'grey.500',borderRadius: '4px', }}>
                                                        {rawItemList.length > 0 ? (
                                                        <TableContainer 
                                                         component={Paper} 
                                                            sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}
                                                        >
                                                         <Table>
                                                             <TableHead>
                                                             <TableRow>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Item</Typography>
                                                                </TableCell>
                                                                {/* <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Material Qty</Typography>
                                                                </TableCell> */}
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">On Hand Qty</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Allocated Job Qty</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Available Qty</Typography>
                                                                </TableCell>
                                                                </TableRow>
                                                            </TableHead>

                                                            <TableBody>
                                                                {rawItemList.map((rawItem, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>
                                                                    <Typography variant="body2">{rawItem.item}</Typography>
                                                                    </TableCell>
                                                                    {/* <TableCell>
                                                                    <Typography variant="body2">{rawItem.matl_qty}</Typography>
                                                                    </TableCell> */}
                                                                    <TableCell>
                                                                    <Typography variant="body2">{rawItem.qty_on_hand}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                     <Typography variant="body2">{rawItem.qty_allocjob}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                    <Typography variant="body2">{rawItem.available_qty}</Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        ) : (
                                                        <Typography variant="body2">No BOM items found.</Typography>
                                                        )}
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6} sx={{border: '1px solid',borderColor: 'grey.500',borderRadius: '4px',mb: 2,}}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                                                        <span style={{ fontWeight: 'bold' }}>Packing Items</span>
                                                    </Typography>

                                                    <Box sx={{ p: 1, borderTop: '1px solid',borderColor: 'grey.500',borderRadius: '4px', }}>
                                                        {packingItemList.length > 0 ? (
                                                        <TableContainer 
                                                         component={Paper} 
                                                            sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}
                                                        >
                                                         <Table>
                                                             <TableHead>
                                                             <TableRow>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Item</Typography>
                                                                </TableCell>
                                                                {/*      */}
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">On Hand Qty</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Allocated Job Qty</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Available Qty</Typography>
                                                                </TableCell>
                                                                </TableRow>
                                                            </TableHead>

                                                            <TableBody>
                                                                {packingItemList.map((packingItem, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>
                                                                    <Typography variant="body2">{packingItem.item}</Typography>
                                                                    </TableCell>
                                                                    {/* <TableCell>
                                                                    <Typography variant="body2">{packingItem.matl_qty}</Typography>
                                                                    </TableCell> */}
                                                                    <TableCell>
                                                                    <Typography variant="body2">{packingItem.qty_on_hand}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                     <Typography variant="body2">{packingItem.qty_allocjob}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                    <Typography variant="body2">{packingItem.available_qty}</Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        ) : (
                                                        <Typography variant="body2">No BOM items found.</Typography>
                                                        )}
                                                    </Box>
                                                </Grid>
                                                {/* <Grid item xs={4} sx={{border: '1px solid',borderColor: 'grey.500',borderRadius: '4px',mb: 2,}}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                                                        <span style={{ fontWeight: 'bold' }}>Consumable Items</span>
                                                    </Typography>

                                                    <Box sx={{ p: 1,borderTop: '1px solid',borderColor: 'grey.500',borderRadius: '4px', }}>
                                                        {consumableItemList.length > 0 ? (
                                                        <TableContainer 
                                                         component={Paper} 
                                                            sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}
                                                        >
                                                         <Table>
                                                             <TableHead>
                                                             <TableRow>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Item</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Material Qty</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">On Hand Qty</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Allocated Job Qty</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">Available Qty</Typography>
                                                                </TableCell>
                                                                </TableRow>
                                                            </TableHead>

                                                            <TableBody>
                                                                {consumableItemList.map((consumableItem, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>
                                                                    <Typography variant="body2">{consumableItem.item}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                    <Typography variant="body2">{consumableItem.matl_qty}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                    <Typography variant="body2">{consumableItem.qty_on_hand}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                     <Typography variant="body2">{consumableItem.qty_allocjob}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                    <Typography variant="body2">{consumableItem.available_qty}</Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        ) : (
                                                        <Typography variant="body2">No BOM items found.</Typography>
                                                        )}
                                                    </Box>
                                                </Grid> */}
                                            </Grid>  
                                        </Box>
                                    </Collapse>
                                </Grid>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.main', height: '100px' }}>
                                <ReportGmailerrorredIcon sx={{ mr: 1 }} />
                                <Typography>No data found</Typography>
                            </Box>
                        </Grid>
                    )}

                    
                </Grid>
                {/* Compare Button */}
                {/* <Grid item xs={12} sx={{ textAlign: 'right', mr: 6, mt: 1 }}>
                    <StyledButton variant="contained">Compare</StyledButton>
                </Grid> */}
            </Paper>
        </Box>
    );
}

export default ProductList;
