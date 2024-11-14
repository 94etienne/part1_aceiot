import React, { useState, useEffect } from "react";
import {
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
  Grid,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Toolbar,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add"; // Import Add icon
import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

import { useMediaQuery } from "@mui/material";

const Position = () => {
  const [positionData, setPositionData] = useState({ title: "" });
  const [positions, setPositions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isAddNewRecord, setIsAddNewRecord] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const { user } = useAuth();
  // page protection to users
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    // Redirect to NotFound route if user position is not "IT" or "Director"
    if (user?.position !== "IT") {
      navigate("/restricted_page");
    }
  }, [user, navigate]);
  // end page protection to users

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/positions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };
    fetchPositions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPositionData({ ...positionData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Show loading spinner
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/positions",
        positionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPositions([...positions, response.data]);
      setPositionData({ title: "" });
      // Success: Show success message in Snackbar and redirect after a delay
      if (response.data.message) {
        setSnackbarMessage(response.data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true); // Open the snackbar

        setTimeout(() => {
          navigate("/position"); // Redirect to login page after a delay
        }, 6000); // 3-second delay before redirect
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Failed to add position. Please try again.");
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
  // Toggle Add New Record form visibility
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
  const paginatedPositions = positions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // END OF PAGINATION
  return (
    <Container>
      <Toolbar sx={{ mt: 2 }} />
      <Box mb={0}>
        {/* <Box display="flex" alignItems="center" justifyContent="space-between"></Box> */}
        <Button
          className="mr-2 mt-2 ml-4"
          title={isAddNewRecord ? "Close Form" : "Add New Record"}
          variant="contained"
          startIcon={isAddNewRecord ? <CloseIcon /> : <AddIcon />} // Conditionally render icon
          onClick={handleAddNewRecordClick}
          sx={{
            backgroundColor: isAddNewRecord ? "error.main" : "primary.main", // Danger for close, primary for add
            color: "white", // White text and icon color
            "&:hover": {
              backgroundColor: isAddNewRecord ? "error.dark" : "primary.dark", // Darker shades on hover
            },
          }}
        >
          {isAddNewRecord ? "Close Form" : "Add New Record"}
          {/* <AddIcon /> */}
        </Button>
      </Box>

      <Box p={3}>
        {isAddNewRecord && (
          <>
            <Typography variant="h4" gutterBottom>
              Register New Position
            </Typography>
            <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
              <form onSubmit={handleSubmit} autoComplete="off">
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      fullWidth
                      label="Position Title"
                      name="title"
                      value={positionData.title}
                      onChange={handleChange}
                      margin="normal"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        height: 56,
                        backgroundColor: !positionData.title
                          ? "primary.main"
                          : undefined, // Primary color when disabled
                        color: !positionData.title ? "white" : undefined, // Text color for readability when disabled
                        "&:disabled": {
                          backgroundColor: "primary.main", // Ensures primary color when disabled
                          color: "white", // Text color when disabled
                        },
                      }}
                      disabled={!positionData.title}
                    >
                      Add Position
                    </Button>
                  </Grid>
                </Grid>
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
            List of Items
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
                {/* {positions.length > 0 ? (
                  positions.map((position, index) => ( */}
                {paginatedPositions.length > 0 ? (
                  paginatedPositions.map((position, index) => (
                    <TableRow key={position.positionId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{position.title}</TableCell>
                      <TableCell>
                        {new Date(position.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(position.updatedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      className="text-danger"
                    >
                      No positions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Component */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]} // Customize as needed
              component="div"
              count={positions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Box>
      </Box>

      <Snackbar
        style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
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

export default Position;
