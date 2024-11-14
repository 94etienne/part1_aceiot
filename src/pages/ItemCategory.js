import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Toolbar,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon
import AddIcon from "@mui/icons-material/Add"; // Import Add icon
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useMediaQuery } from "@mui/material";

const ItemCategory = () => {
  const [itemTypeData, setItemTypeData] = useState({
    title: "",
  });
  const [itemTypes, setItemTypes] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isAddNewRecord, setIsAddNewRecord] = useState(false);
  const { user } = useAuth();
  // page protection to users
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Add loading state
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    // Redirect to NotFound route if user position is not "IT" or "Director"
    if (user?.position !== "IT") {
      navigate("/restricted_page");
    }
  }, [user, navigate]);
  // end page protection to users

  useEffect(() => {
    fetchItemTypes();
  }, []);

  const fetchItemTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/item_types", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItemTypes(response.data);
    } catch (error) {
      console.error("Error fetching item types:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setItemTypeData({ ...itemTypeData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Show loading spinner
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/item_types",
        itemTypeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newItemType = response.data;
      setItemTypes([...itemTypes, newItemType]);
      setItemTypeData({ title: "" });

      // Success: Show success message in Snackbar and redirect after a delay
      if (response.data.message) {
        setSnackbarMessage(response.data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true); // Open the snackbar

        setTimeout(() => {
          navigate("/itemCategory"); // Redirect to login page after a delay
        }, 6000); // 3-second delay before redirect
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Failed to add item category. Please try again.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => {
        setLoading(false); // Hide loading spinner after delay
      }, 500); // Adjust delay time as needed (500ms here)
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid date"
      : `${date.toISOString().split("T")[0]} ${
          date.toTimeString().split(" ")[0]
        }`;
  };

  const handleAddNewRecordClick = () => {
    setIsAddNewRecord(!isAddNewRecord);
  };

  // PAGINATION
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5); // Set default rows per page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };
  const paginatedItemTypes = itemTypes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // END OF PAGINATION

  return (
    <Container>
      <Toolbar sx={{ mt: 2 }} />

      <Box mb={0}>
        <Button
          title={isAddNewRecord ? "Close Form" : "Add New Record"}
          variant="contained"
          startIcon={isAddNewRecord ? <CloseIcon /> : <AddIcon />} // Conditionally render icon
          onClick={() => setIsAddNewRecord(!isAddNewRecord)}
          className="mr-2 ml-4"
          sx={{
            backgroundColor: isAddNewRecord ? "error.main" : "primary.main", // Danger for close, primary for add
            color: "white", // White text and icon color
            "&:hover": {
              backgroundColor: isAddNewRecord ? "error.dark" : "primary.dark", // Darker shades on hover
            },
          }}
        >
          {isAddNewRecord ? "Close Form" : "Add New Record"}
        </Button>
      </Box>
      <Box p={3} sx={{ mt: 0 }}>
        {isAddNewRecord && (
          <>
            <Typography variant="h4" gutterBottom>
              Add New Item Type
            </Typography>
            <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
              <form onSubmit={handleSubmit} autoComplete="off">
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    name="title"
                    label="Item Type Title"
                    value={itemTypeData.title}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                        height: 56,
                        backgroundColor: !itemTypeData.title
                          ? "primary.main"
                          : undefined, // Primary color when disabled
                        color: !itemTypeData.title ? "white" : undefined, // Text color for readability when disabled
                        "&:disabled": {
                          backgroundColor: "primary.main", // Ensures primary color when disabled
                          color: "white", // Text color when disabled
                        },
                      }}
                      disabled={!itemTypeData.title}
                >
                  Add Item Type
                </Button>
              </form>
            </Paper>
            {/* Loading overlay */}
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  zIndex: 10,
                }}
              >
                <CircularProgress color="primary" />
              </Box>
            )}
          </>
        )}

        <Box mt={0}>
          <Typography variant="h5" gutterBottom>
            List of Item Categories
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* {itemTypes.length > 0 ? (
                  itemTypes.map((itemType, key) => { */}
                {paginatedItemTypes.length > 0 ? (
                  paginatedItemTypes.map((itemType, index) => {
                    const formattedCreatedAt = formatDate(itemType.createdAt);
                    const formattedUpdatedAt = formatDate(itemType.updatedAt);
                    return (
                      <TableRow key={itemType.itemTypeId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{itemType.title}</TableCell>
                        <TableCell>{formattedCreatedAt}</TableCell>
                        <TableCell>{formattedUpdatedAt}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      className="text-danger"
                    >
                      No item types found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Component */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]} // Customize as needed
              component="div"
              count={itemTypes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Box>
      </Box>

      {/* Snackbar for success or failure message */}
      <Snackbar
        style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
        open={snackbarOpen}
        autoHideDuration={snackbarSeverity === "success" ? 4000 : null}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ItemCategory;
