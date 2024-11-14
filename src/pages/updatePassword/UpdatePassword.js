import React, { useState } from "react";
import {
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Toolbar,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { useAuth } from "./../../context/authContext";
import { useMediaQuery } from "@mui/material";

const ProfileSettings = () => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPersonnelInfo, setIsEditingPersonnelInfo] = useState(false);
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [userInfo, setUserInfo] = useState({
    gender: user.gender || "",
    dob: user.dob || "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [loading, setLoading] = useState(false); // Add loading state
  const [loadingData, setLoadingData] = useState(true); // Start with loadingData as true

  // Fetch data function to simulate loading delay
  React.useEffect(() => {
    setLoadingData(true); // Ensure loading is shown
    const timer = setTimeout(() => {
      setLoadingData(false); // Stop loading after 2 seconds
    }, 500); // Adjust the timeout as needed
  
    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, []);
  

  const handleEditPasswordClick = () =>
    setIsEditingPassword(!isEditingPassword);
  const handleEditPersonnelInfoClick = () =>
    setIsEditingPersonnelInfo(!isEditingPersonnelInfo);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    if (name === "newPassword") checkPasswordStrength(value);
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner
    if (passwords.newPassword !== passwords.confirmPassword) {
      showSnackbar("New passwords don't match!", "warning");
      return;
    }

    try {
      // Update password API call
      const response = await axios.put(
        "http://localhost:5000/auth/updatePassword",
        {
          emailOrPhone: user.email,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      showSnackbar(response.data.message, "success");
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to update password",
        "error"
      );
    } finally {
      setTimeout(() => {
        setLoading(false); // Hide loading spinner after delay
      }, 500); // Adjust delay time as needed (500ms here)
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner
    try {
      // Update profile API call
      const response = await axios.put(
        "http://localhost:5000/auth/updateProfile",
        {
          email: user.email,
          gender: userInfo.gender,
          dob: userInfo.dob,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      showSnackbar(response.data.message, "success");
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const getProgressBarColor = () => {
    if (passwordStrength <= 2) return "error";
    if (passwordStrength === 3) return "warning";
    return "success";
  };

  return (
    <Box
      p={3}
      className="container-fluid col-md-12"
      style={{ marginLeft: "5px" }}
      sx={{ p: 4, backgroundColor: "#f4f4f4", minHeight: "100vh" }}
    >
      <Toolbar />
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Personal Info Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
            {/* display Loading */}
              {loadingData ? (
                <>
                  <Typography variant="h6" style={{ fontWeight: "bold" }}>
                    <Skeleton width="50%" />
                  </Typography>
                  <Skeleton width="80%" />
                  <Skeleton width="70%" />
                  <Skeleton width="90%" />
                </>
              ) : (
                <>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Personal Info
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleEditPersonnelInfoClick}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {user.fname} {user.lname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Position: {user.position}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gender: {user.gender}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date of birth: {user.dob}
                  </Typography>
                  <Typography variant="body2">
                    Status:{" "}
                    <Box
                      component="span"
                      sx={{
                        color:
                          user.status === "Active"
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      {user.status}
                    </Box>
                  </Typography>

                  {isEditingPersonnelInfo && (
                    <form
                      onSubmit={handleProfileUpdate}
                      style={{ marginTop: "16px" }}
                    >
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                          labelId="gender-label"
                          id="gender-select"
                          label="Gender"
                          name="gender"
                          value={userInfo.gender}
                          onChange={handleUserInfoChange}
                        >
                          <MenuItem value="" disabled>
                            Update Gender
                          </MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        name="dob"
                        value={userInfo.dob}
                        onChange={handleUserInfoChange}
                        sx={{ mb: 2 }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          max: new Date().toISOString().split("T")[0],
                        }}
                      />

                      <Button variant="contained" type="submit" fullWidth>
                        Update Info
                      </Button>
                    </form>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Account Details Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
            {/* display Loading */}
              {loadingData ? (
                <>
                  <Typography variant="h6" style={{ fontWeight: "bold" }}>
                    <Skeleton width="50%" />
                  </Typography>
                  <Skeleton width="80%" />
                  <Skeleton width="70%" />
                  <Skeleton width="90%" />
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Account Details
                  </Typography>
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      ID Number: {user.userUniversityCode}
                    </Typography>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      Phone: {user.phone}
                    </Typography>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2">
                    Email Address: {user.email}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
            {/* display Loading */}
              {loadingData ? (
                <>
                  <Typography variant="h6" style={{ fontWeight: "bold" }}>
                    <Skeleton width="50%" />
                  </Typography>
                  <Skeleton width="80%" />
                  <Skeleton width="70%" />
                  <Skeleton width="90%" />
                </>
              ) : (
                <>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="h6">Change Password</Typography>
                    <IconButton size="small" onClick={handleEditPasswordClick}>
                      <EditIcon />
                    </IconButton>
                  </Box>

                  {isEditingPassword && (
                    <form
                      onSubmit={handlePasswordSubmit}
                      style={{ marginTop: "16px" }}
                    >
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Password should be:
                        <ul>
                          <li>A minimum of 8 characters</li>
                          <li>Has a lower case (e.g: a)</li>
                          <li>Has at least one upper case (e.g: A)</li>
                          <li>Has at least one special character (e.g: @)</li>
                          <li>Has at least 1 number (e.g: 2)</li>
                        </ul>
                      </Typography>

                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handlePasswordChange}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        sx={{ mb: 2 }}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={(passwordStrength / 5) * 100}
                        color={getProgressBarColor()}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        sx={{ mb: 2 }}
                      />
                      <Button variant="contained" type="submit" fullWidth>
                        Save Password
                      </Button>
                    </form>
                  )}
                </>
              )}
            </CardContent>
          </Card>
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
      </Grid>

      <Snackbar
        style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileSettings;
