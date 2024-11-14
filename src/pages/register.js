import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import Footer from "../components/footer/Footer";
import { useMediaQuery } from "@mui/material";

export default function Register() {
  const [newStaff, setNewStaff] = useState({
    fname: "",
    lname: "",
    userUniversityCode: "",
    email: "",
    phone: '+250', // Set initial country code
    gender: "",
    dob: "",
    positionId: "",
  });
  const [positions, setPositions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate(); // Initialize useNavigate
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/positions");
      const positionsData = response.data;
      setPositions(positionsData);

      // Automatically set the position to "Student" if it exists
      const studentPosition = positionsData.find(
        (position) => position.title === "Student"
      );
      if (studentPosition) {
        setNewStaff((prevState) => ({
          ...prevState,
          positionId: studentPosition.positionId,
        }));
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };
  // const acceptedDomains = ["gmail.com", "outlook.com", "hotmail.com", "live.com"];
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
    e.preventDefault();
    setLoading(true); // Show loading spinner

    try {
      // Create FormData object to handle file upload and other data
      const formData = new FormData();
      formData.append("fname", newStaff.fname);
      formData.append("lname", newStaff.lname);
      formData.append("userUniversityCode", newStaff.userUniversityCode);
      formData.append("email", newStaff.email);
      formData.append("phone", newStaff.phone);
      formData.append("gender", newStaff.gender);
      formData.append("dob", newStaff.dob);
      formData.append("positionId", newStaff.positionId);

      // Append the image file to the FormData if it exists
      if (newStaff.profileImage) {
        formData.append("profileImage", newStaff.profileImage);
      }

      // Make the POST request with FormData
      const response = await axios.post(
        "http://localhost:5000/registerEndUser",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set content type for file uploads
          },
        }
      );

      // Get success message from the backend response
      const successMessage =
        response.data.message || "User added successfully!";

      // Set the success message from the backend and show the Snackbar
      setSnackbarMessage(successMessage);
      setSnackbarOpen(true);
      setSnackbarSeverity("success"); // Set severity to success

      // Reset the form after successful submission
      setNewStaff({
        fname: "",
        lname: "",
        userUniversityCode: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        positionId: "",
        profileImage: null, // Clear the profile image field
      });

      // Redirect to the login page after 1 second
      setTimeout(() => {
        navigate("/");
      }, 6000);
    } catch (error) {
      console.error("Error adding user:", error);
      setSnackbarMessage(
        error.response?.data?.error || "Failed to add user. Please try again."
      );
      setSnackbarSeverity("error");
    } finally {
      setLoading(false); // Hide loading spinner
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };




  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "primary.main", // Using theme's primary color
        }}
      >
        {/* Header */}
        <Box
          sx={{
            height: "64px",
            backgroundColor: "primary.main", // Primary color for header
          }}
        >
          <Typography
            variant="h6"
            component="h1"
            sx={{
              textAlign: "center",
              color: "white",
              marginX: "auto",
              fontSize: {
                xs: "1.2rem",
                sm: "1.5rem",
                md: "1.75rem",
                lg: "2rem",
              }, // Responsive font sizes
              paddingX: { xs: 2, sm: 0 }, // Adjust horizontal padding for small devices
              fontWeight: 500, // Ensure the font has a nice bold feel on all devices
            }}
          >
            ACEIoT LAB - Laboratory Tracking System
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5", // Keeping the background for main content
          }}
        >
          <Box
            sx={{
              width: "100%", // Full width
              maxWidth: 1200, // Maximum width, similar to "container-fluid"
              padding: 3,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
          
            <Typography variant="h6" component="h1" gutterBottom>
              Register
            </Typography>

            <form
              onSubmit={handleSubmit}
              style={{ width: "100%" }}
              encType="multipart/form-data"
              autoComplete="off"
            >
              <Grid container spacing={2}>
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
                    required
                    error={!!emailError}
                    helperText={emailError}
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
          const numericValue = '+250' + value.slice(4).replace(/\D/g, '');
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
                      id="gender-select"
                      label="Gender"
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
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: new Date().toISOString().split("T")[0], // Sets the maximum date to today
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  {/* Add profile image upload */}
                  <TextField
                    type="file"
                    label="Profile Image (Optional"
                    name="profileImage"
                    inputProps={{ accept: "image/*" }} // Only accept image files
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        profileImage: e.target.files[0], // Save the selected file
                      })
                    }
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required hidden> 
                    <InputLabel id="positionId-label">Position</InputLabel>
                    <Select
                      labelId="positionId-label"
                      name="positionId"
                      value={newStaff.positionId}
                      onChange={handleChange}
                    >
                      {positions
                        .filter((position) => position.title === "Student")
                        .map((position) => (
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
              </Grid>
              <Button
                className="btn btn-primary"
                type="submit"
                fullWidth
                color="primary"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Register
              </Button>
            </form>

            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#1976d2",
                marginTop: 16,
              }}
            >
              <Typography variant="body2">Login</Typography>
            </Link>

           {/* Loading when form submit */}
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
          </Box>

          <Snackbar
         style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
            open={snackbarOpen}
            autoHideDuration={8000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbarSeverity} // Dynamically set the severity
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            height: "64px",
            backgroundColor: "primary.main", // Primary color for footer
          }}
        >
          <Footer />
        </Box>
      </Box>
    </>
  );
}
