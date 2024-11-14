import React from "react";
import { Box, Typography, Button, Card, CardContent, CardActions } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/footer/Footer";

const OthersResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scannedData = location.state?.scannedData || "No data scanned.";

  // Close camera handler
  const handleCloseCamera = () => {
    navigate("/"); // Navigates back to the home page or any other route to close the camera
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
        {/* Header */}
        <Box
          sx={{
            height: '64px',
            backgroundColor: 'primary.main',
          }}
        >
                    <Typography 
                        variant="h6" 
                        component="h1" 
                        sx={{
                            textAlign: 'center',
                            color: 'white',
                            marginX: 'auto',
                            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' }, // Responsive font sizes
                            paddingX: { xs: 2, sm: 0 }, // Adjust horizontal padding for small devices
                            fontWeight: 500, // Ensure the font has a nice bold feel on all devices
                        }}
                    >
                        African Center Of Excellence in Internet of Things Laboratory Tracking System
                    </Typography>
        </Box>
  
        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            paddingX: 2,  // Padding for small devices
          }}
        >
          <Card 
            sx={{ 
              width: { xs: '100%', sm: '600px' },  // Full width on small devices, fixed width on larger
              maxWidth: '100%',  // Prevent exceeding the screen width
              minHeight: '200px',
              borderRadius: 6, 
              boxShadow: 6, 
              backgroundColor: "#fff", 
              padding: 2,
              transition: "transform 0.3s ease-in-out", 
              "&:hover": {
                transform: "scale(1.05)"
              }
            }}
          >
            <CardContent sx={{ textAlign: "center", p: { xs: 1, sm: 2 } }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ color: "#1e3c72", fontSize: { xs: '1.25rem', sm: '1.5rem' } }} // Smaller font on mobile
              >
                Scanned QR Code Result
              </Typography>
  
              <Typography 
                variant="body1" 
                sx={{ 
                  wordBreak: "break-word", 
                  mb: 2, 
                  color: "text.secondary",
                  whiteSpace: "normal",
                }}
              >
                {scannedData}
              </Typography>
            </CardContent>
  
            <CardActions sx={{ justifyContent: "space-between", pb: 2 }}>
              <Button 
                component={Link} 
                to="/" 
                variant="contained" 
                sx={{ 
                  backgroundColor: "#1e3c72", 
                  color: "#fff", 
                  borderRadius: 4, 
                  paddingX: { xs: 2, sm: 4 },  // Smaller padding on mobile
                  "&:hover": {
                    backgroundColor: "#2a5298",
                  }
                }}
              >
                Track Again
              </Button>
  
              <Button 
                onClick={handleCloseCamera} 
                variant="contained" 
                sx={{ 
                  backgroundColor: "#f50057", 
                  color: "#fff", 
                  borderRadius: 4, 
                  paddingX: { xs: 2, sm: 4 },  // Smaller padding on mobile
                  "&:hover": {
                    backgroundColor: "#c51162",
                  }
                }}
              >
                Close Camera
              </Button>
            </CardActions>
          </Card>
        </Box>
  
        {/* Footer */}
        <Box
          sx={{
            height: '64px',
            backgroundColor: 'primary.main',
            display: 'flex',              // Flexbox for footer layout
            justifyContent: 'space-between',  // Adjust position
            alignItems: 'center',
            paddingX: 2,                  // Padding for small devices
          }}
        >

          <Footer />
        </Box>
      </Box>
    </>
  );
  
};

export default OthersResults;
