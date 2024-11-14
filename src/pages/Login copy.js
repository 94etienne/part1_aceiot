import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IoIosLogIn } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/footer/Footer';
import { useAuth } from '../context/authContext';

 
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Error message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar visibility state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message for Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar severity state
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false); // Add loading state

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        emailOrPhone,
        password,
      });

      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('position', response.data.user.position || 'User');
        localStorage.setItem('fname', response.data.user.fname || '');
        localStorage.setItem('lname', response.data.user.lname || '');

        // Set success message in Snackbar
        setSnackbarMessage("Login successful!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        // Navigate to the dashboard
        // navigate('/dashboard');
        navigate(response.data.dashboard); // Use the route from the server
      }
    }   catch (error) {
      console.error("Server:", error);
      setSnackbarMessage(
        error.response?.data?.error || "Server. Please try again."
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
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'primary.main',
        }}
      >
        <Box
          sx={{
            height: { xs: 'auto', sm: '64px' },
            backgroundColor: 'primary.main',
            paddingY: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            component="h1"
            sx={{
              textAlign: 'center',
              color: 'white',
              marginX: 'auto',
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
              paddingX: { xs: 2, sm: 0 },
              fontWeight: 500,
            }}
          >
            ACEIoT LAB - Laboratory Tracking System
          </Typography>
        </Box>

        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ flex: 1, backgroundColor: '#f5f5f5', paddingX: 2 }}
        >
          <Grid item xs={12} sm={8} md={6} lg={4}>
            <Box
              sx={{
                padding: 3,
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                component="h1"
                gutterBottom
                sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
              >
                ACEIoT Login
              </Typography>
{/* 
              {error && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )} */}

              <form onSubmit={handleLogin} autoComplete="off">
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
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControlLabel
                  control={<Checkbox name="remember" color="primary" />}
                  label="Remember me"
                />
                <Typography variant="body2" sx={{ alignSelf: 'flex-end', mt: 1 }}>
                  <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2', float: 'right' }}>
                    Forgot password?
                  </Link>
                </Typography>

                <Button
                  type="submit"
                  fullWidth
                  color="primary"
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  <IoIosLogIn className="mr-2" style={{ color: 'white', fontSize: '25px' }} />
                  <b>LOGIN</b>
                </Button>
              </form>

              <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Create an account
              </Link>
            </Box>
          </Grid>

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
        </Grid>

        <Snackbar
          style={{ marginTop: "50px"}}
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Box
          sx={{
            height: '64px',
            backgroundColor: 'primary.main',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Footer />
        </Box>
      </Box>
    </>
  );
}
