import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Snackbar, Alert, IconButton, Pagination,
  Toolbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

const ItemLists = () => {
  const [items, setItems] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Set items per page to 5
  const componentPDF = useRef();

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: "ItemsData",
    onAfterPrint: () => alert("Data saved in PDF")
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Calculate the range of items for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return ( 
    <div p={3}
    className="container-fluid col-md-12"
    style={{ marginLeft: "5px" }}>
    <Toolbar sx={{mt: 2,}} />
      <Box p={3}>
        <Button variant="contained" color="primary" onClick={generatePDF} sx={{ float: 'right' }}>Print PDF</Button>

        <Box mt={4}>
          <Typography variant="h5" gutterBottom>List of Items</Typography>
          <TableContainer component={Paper} ref={componentPDF}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={9} align="center" style={{ fontSize: '20px', fontWeight: '600' }}>LIST OF RESOURCES</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Lab Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Item Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                </TableRow>
              </TableHead> 
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    const createdAt = new Date(item.createdAt);
                    const updatedAt = new Date(item.updatedAt);
                    return (
                      <TableRow key={item.itemId}>
                        <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                        <TableCell>{item.serialNumber}</TableCell>
                        <TableCell>{item.labCode}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.item_type?.title}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>{item.user?.email}</TableCell>
                        <TableCell>{createdAt.toLocaleString()}</TableCell>
                        <TableCell>{updatedAt.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">No items found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Pagination */}
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(items.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>

        <Snackbar
          style={{ marginTop: '70px', marginRight: '78px' }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </div>
  );
};

export default ItemLists;
