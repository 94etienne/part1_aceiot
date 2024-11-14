import React from "react";
import { Box, Typography, Button, Card, CardContent, CardActions } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const ScannedResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scannedData = location.state?.scannedData || "No data scanned.";

  // Close camera handler
  const handleCloseCamera = () => {
    navigate("/rents"); // Navigates back to the home page or any other route to close the camera
  };

  const handleScanAgain = ()=>{
    navigate("/rents"); // Navigates back to the home page or any other route to close the camera
  };

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#f5f5f5", 
        p: 2 
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 500, 
          width: "100%", 
          borderRadius: 4, 
          boxShadow: 3 
        }}
      >
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Scanned QR Code Result
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              wordBreak: "break-word", 
              mb: 2, 
              color: "text.secondary" 
            }}
          >
            {scannedData}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleScanAgain} 
            
          >
            Track Again
          </Button>

          {/* Close Camera button */}
          <Button 
            onClick={handleCloseCamera} 
            variant="contained" 
            sx={{ 
              backgroundColor: "#f50057", 
              color: "#fff", 
              borderRadius: 4, 
              paddingX: 4, 
              "&:hover": {
                backgroundColor: "#c51162", // Darken on hover
              }
            }}
          >
            Close Camera
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default ScannedResult;
