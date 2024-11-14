import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Grid,
  CircularProgress,
} from "@mui/material";
import { IoIosLogIn } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/footer/Footer";
import { useMediaQuery } from "@mui/material";

export default function ResetPasswordForm() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  // const [error, setError] = useState(''); // State to manage error message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State to control Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar type ('success', 'error')
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Add loading state
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Close the snackbar
  };

  const handleResetPassword = async () => {
    setLoading(true); // Show loading spinner
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/resetPassword",
        {
          emailOrPhone,
        }
      );

      // Success: Show success message in Snackbar and redirect after a delay
      if (response.data.message) {
        setSnackbarMessage(response.data.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true); // Open the snackbar

        setTimeout(() => {
          navigate("/forgot-password"); // Redirect to login page after a delay
        }, 3000); // 3-second delay before redirect
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("An error occurred. Please try again.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    } finally {
      setLoading(false); // Hide loading spinner
    }
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
            height: { xs: "auto", sm: "64px" }, // Adjust height for small screens
            backgroundColor: "primary.main", // Primary color for header
            paddingY: { xs: 2, sm: 0 }, // Padding for small screens
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
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ flex: 1, backgroundColor: "#f5f5f5", paddingX: 2 }}
        >
          <Grid item xs={12} sm={8} md={6} lg={4}>
            <Box
              sx={{
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
                ACEIoT Reset Password
              </Typography>

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="emailOrPhone"
                label="Enter your phone/email"
                name="emailOrPhone"
                autoComplete="email"
                autoFocus
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
              />

              <Typography variant="body2" sx={{ alignSelf: "flex-end", mt: 1 }}>
                <Link
                  to="/"
                  style={{ textDecoration: "none", color: "#1976d2" }}
                >
                  Login
                </Link>
              </Typography>

              <Button
                className="btn btn-primary"
                type="submit"
                fullWidth
                color="primary"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleResetPassword} // Handle reset password
              >
                <IoIosLogIn
                  className="mr-2"
                  style={{ color: "white", fontSize: "25px" }}
                />
                <b>Reset</b>
              </Button>

              <Link to="/register">Register</Link>
            </Box>
          </Grid>
        </Grid>

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

        {/* Footer */}
        <Box
          sx={{
            height: "64px",
            backgroundColor: "primary.main",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Footer />
        </Box>
      </Box>

      {/* Snackbar component for success/error messages */}
      <Snackbar
        style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={6000} // 6 seconds auto-hide
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
    </>
  );
}
