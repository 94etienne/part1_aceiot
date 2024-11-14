import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  IconButton,
  Toolbar,
  TablePagination,
  CircularProgress,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add"; // Import Add icon

import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Users = () => {
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({
    fname: "",
    lname: "",
    userUniversityCode: "",
    email: "",
    phone: "+250", // Set initial country code
    gender: "",
    dob: "",
    positionId: "",
  });
  const [positions, setPositions] = useState([]);
  const [filter, setFilter] = useState({ positionId: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isAddNewRecord, setIsAddNewRecord] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state
  const [loading, setLoading] = useState(false); // Add loading state
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width:600px)");
  // page protection to users
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to NotFound route if user position is not "IT" or "Director"
    if (user?.position !== "IT") {
      navigate("/restricted_page");
    }
  }, [user, navigate]);
  // end page protection to users

  useEffect(() => {
    fetchStaff();
    fetchPositions();
  }, [filter, searchQuery]);

  // FILTER USER BY POSITION ID

  // FILTER USER BY POSITION ID AND SEARCH QUERY
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "http://localhost:5000/users";

      // If filtering by position
      if (filter.positionId) {
        url = `http://localhost:5000/users/${filter.positionId}`;
      }

      setLoading(true); // Show loading spinner
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter staff by searchQuery if it exists
      const filteredStaff = searchQuery
        ? response.data.filter((user) =>
            user.userUniversityCode
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        : response.data;

      setStaff(filteredStaff);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); // Update search query on input change
  };

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

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const domainRegex = /@(gmail)\.com$|@(ur\.ac\.rw|e\.ntu\.edu\.sg)$/i;

      if (!emailRegex.test(value)) {
        setEmailError("Invalid email format");
      } else if (!domainRegex.test(value)) {
        setEmailError("Only allowed Email must be from Gmail, UR domains");
      } else {
        setEmailError("");
      }
    }

    setNewStaff({ ...newStaff, [name]: value });
  };

  const handleSubmit = async (e) => {
    setLoading(true); // Show loading spinner
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Create FormData object to handle file upload and other data
      const formData = new FormData();
      formData.append("fname", newStaff.fname);
      formData.append("lname", newStaff.lname);
      formData.append("userUniversityCode", newStaff.userUniversityCode);
      formData.append("email", newStaff.email);
      formData.append("phone", newStaff.phone);
      formData.append("positionId", newStaff.positionId);
      formData.append("gender", newStaff.gender);
      formData.append("dob", newStaff.dob);

      // Ensure profileImage is appended only if it exists
      if (newStaff.profileImage) {
        formData.append("profileImage", newStaff.profileImage);
      }

      // Make the POST request with the formData
      const response = await axios.post(
        "http://localhost:5000/users",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Set multipart header
          },
        }
      );

      // Show the success message from the server
      setSnackbarMessage(response.data.message);
      setSnackbarOpen(true);
      setSnackbarSeverity("success"); // Set severity to success

      // Reset the form
      setNewStaff({
        fname: "",
        lname: "",
        userUniversityCode: "",
        email: "",
        phone: "",
        positionId: "",
        gender: "",
        dob: "",
        profileImage: null, // Reset the image input
      });
      fetchStaff(); // Refresh the list of staff
    } catch (error) {
      console.error("Error adding user:", error);
      setSnackbarMessage(
        error.response?.data?.error || "Failed to add user. Please try again."
      );
      setSnackbarSeverity("error");
    } finally {
      setTimeout(() => {
        setLoading(false); // Hide loading spinner after delay
      }, 500); // Adjust delay time as needed (500ms here)f
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

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
  const paginatedStaffs = staff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // END OF PAGINATION

  // ACTIVATE/ DEACTIVATE
  // Function to activate user
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const openConfirmationDialog = (action, userId) => {
    setConfirmAction(action);
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  const closeConfirmationDialog = () => {
    setDialogOpen(false);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "activate") {
      await handleActivateUser(selectedUserId);
    } else if (confirmAction === "deactivate") {
      await handleDeactivateUser(selectedUserId);
    }
    closeConfirmationDialog();
  };

  const handleActivateUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/users/activateUser/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchStaff(); // Refresh the user list after activation
    } catch (error) {
      console.error("Error activating user:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Failed to activate user"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/users/deactivateUser/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchStaff(); // Refresh the user list after deactivation
    } catch (error) {
      console.error("Error deactivating user:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Failed to deactivate user"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // END ACTIVATE/DEACTIVATE

  return (
    <Container>
      <Toolbar sx={{ mt: 2 }} />
      <Box mb={2}>
  <Grid container spacing={2} alignItems="center">
    {/* Add New Record and Print PDF buttons */}
    <Grid item xs={12} sm={4} md="auto">
      <Button
        title={isAddNewRecord ? "Close Form" : "Add New Record"}
        variant="contained"
        fullWidth // Make button full width on mobile
        startIcon={isAddNewRecord ? <CloseIcon /> : <AddIcon />}
        onClick={() => setIsAddNewRecord(!isAddNewRecord)}
        sx={{
          backgroundColor: isAddNewRecord ? "error.main" : "primary.main",
          color: "white",
          "&:hover": {
            backgroundColor: isAddNewRecord ? "error.dark" : "primary.dark",
          },
          mb: { xs: 2, sm: 0 }, // Add margin-bottom on mobile for spacing
        }}
      >
        {isAddNewRecord ? "Close Form" : "Add New Record"}
      </Button>
    </Grid>

    {/* Filter by Position and Search by University Code */}
    <Grid item xs={12} sm={8} md>
      <Grid container spacing={2}>
        {/* Filter by Position */}
        <Grid item xs={12} sm={6} md={6}>
          <FormControl fullWidth>
            <InputLabel id="filterPositionId-label">Filter by Position</InputLabel>
            <Select
              labelId="filterPositionId-label"
              name="positionId"
              value={filter.positionId}
              onChange={(e) => setFilter({ ...filter, positionId: e.target.value })}
              input={
                <OutlinedInput
                  label="Filter by Position"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                />
              }
            >
              <MenuItem value="">All Positions</MenuItem>
              {positions.map((position) => (
                <MenuItem key={position.positionId} value={position.positionId}>
                  {position.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Search by University Code */}
        <Grid item xs={12} sm={6} md={6}>
          <FormControl fullWidth variant="outlined">
            <TextField
              label="Search by University Code"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange} // Call handleSearchChange on input
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: { xs: 2, sm: 0 }, // Adjust margin-bottom on mobile for spacing
                padding: { xs: 1, sm: 0 }, // Padding adjustment for mobile
              }}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
</Box>


      {isAddNewRecord && (
        <>
          <Typography variant="h4" gutterBottom>
            Register Staff/Student
          </Typography>

          <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              autoComplete="off"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="fname"
                    value={newStaff.fname}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="lname"
                    value={newStaff.lname}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="University Code"
                    name="userUniversityCode"
                    value={newStaff.userUniversityCode}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email"
                    value={newStaff.email}
                    onChange={handleChange}
                    error={!!emailError}
                    helperText={emailError}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={newStaff.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only digits after the country code
                      const numericValue =
                        "+250" + value.slice(4).replace(/\D/g, "");
                      setNewStaff({ ...newStaff, phone: numericValue });
                    }}
                    required
                    fullWidth
                    inputProps={{ maxLength: 13 }} // Adjust length based on country code and additional numbers
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      name="gender"
                      value={newStaff.gender}
                      onChange={handleChange}
                    >
                      <MenuItem value="" disabled>
                        Select Gender
                      </MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    name="dob"
                    value={newStaff.dob}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: new Date().toISOString().split("T")[0], // Sets the maximum date to today
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="positionId-label">Position</InputLabel>
                    <Select
                      labelId="positionId-label"
                      name="positionId"
                      value={newStaff.positionId}
                      onChange={handleChange}
                    >
                      {positions.map((position) => (
                        <MenuItem
                          key={position.positionId}
                          value={position.positionId}
                        >
                          {position.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Add profile image upload */}
                <Grid item xs={12}>
                  <TextField
                    type="file"
                    label="Profile Image (Optional)"
                    name="profileImage"
                    inputProps={{ accept: "image/*" }} // Only accept image files
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        profileImage: e.target.files[0], // Save the selected file
                      })
                    }
                    fullWidth
                    InputLabelProps={{ shrink: true }} // Keep label shrunk when no value
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
                      backgroundColor:
                        !newStaff.fname ||
                        !newStaff.lname ||
                        !newStaff.userUniversityCode ||
                        !newStaff.email ||
                        !newStaff.phone ||
                        !newStaff.gender ||
                        !newStaff.dob ||
                        !newStaff.positionId
                          ? "primary.main"
                          : undefined, // Primary color when disabled
                      color:
                        !newStaff.fname ||
                        !newStaff.lname ||
                        !newStaff.userUniversityCode ||
                        !newStaff.email ||
                        !newStaff.phone ||
                        !newStaff.gender ||
                        !newStaff.dob ||
                        !newStaff.positionId
                          ? "white"
                          : undefined, // Text color for readability when disabled
                      "&:disabled": {
                        backgroundColor: "primary.main", // Ensures primary color when disabled
                        color: "white", // Text color when disabled
                      },
                    }}
                    disabled={
                      !newStaff.fname ||
                      !newStaff.lname ||
                      !newStaff.userUniversityCode ||
                      !newStaff.email ||
                      !newStaff.phone ||
                      !newStaff.gender ||
                      !newStaff.dob ||
                      !newStaff.positionId
                    }
                  >
                    Add Staff
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </>
      )}

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
      <Typography variant="h5" gutterBottom>
        List of Users
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Unique Code</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {staff.length ? (
              staff.map((user, index) => ( */}
            {paginatedStaffs.length > 0 ? (
              paginatedStaffs.map((user, index) => (
                <TableRow key={user.userId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.userUniversityCode}</TableCell>
                  <TableCell>{user.fname}</TableCell>
                  <TableCell>{user.lname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {positions.find((p) => p.positionId === user.positionId)
                      ?.title || "Unknown"}
                  </TableCell>
                  {/* Activate / Deactivate Buttons */}
                  <TableCell>
                    {user.status === "Active" ? (
                      <Button
                        onClick={() =>
                          openConfirmationDialog("deactivate", user.userId)
                        }
                        variant="contained"
                        color="secondary"
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          openConfirmationDialog("activate", user.userId)
                        }
                        variant="contained"
                        color="primary"
                      >
                        Activate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-danger">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination Component */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Customize as needed
          component="div"
          count={staff.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        // onClose={closeConfirmationDialog}
      >
        <DialogTitle>
          {confirmAction === "activate" ? "Activate" : "Deactivate"}{" "}
          <span className="text-primary">
            {user.fname} {user.lname}
          </span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            {confirmAction === "activate" ? "activate" : "deactivate"} this
            user:{" "}
            <span className="text-primary">{user.userUniversityCode}</span> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmationDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={8000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity} // Dynamically set the severity
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Users;
