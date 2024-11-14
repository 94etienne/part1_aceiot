import React, { useState } from "react";
import { Box, Typography, Button, Dialog, Grid, DialogContent, DialogTitle, DialogActions } from "@mui/material";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer/Footer";

const QRScanner = () => {
  const [isQRScannerOpen, setQRScannerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Toggle QR scanner dialog
  const handleQRScannerOpen = () => setQRScannerOpen(true);
  const handleQRScannerClose = () => {
    setQRScannerOpen(false);
    setErrorMsg(""); // Clear error message when closing
  };

  // Handle scanned result and navigate to results page
  const handleScanResult = (result) => {
    if (result?.text) {
      navigate("/result", { state: { scannedData: result.text } });
      handleQRScannerClose();
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "primary.main",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            height: "64px",
            backgroundColor: "primary.main",
          }}
        >
          <Typography
            variant="h6"
            component="h1"
            sx={{
              textAlign: "center",
              color: "white",
              marginX: "auto",
              fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.75rem", lg: "2rem" },
              paddingX: { xs: 2, sm: 0 },
              fontWeight: 500,
            }}
          >
            African Center Of Excellence in Internet of Things Laboratory Tracking System
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Box
            sx={{
              width: 400,
              padding: 3,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h5" gutterBottom>
                Track Item
              </Typography>

              <Button variant="contained" color="primary" onClick={handleQRScannerOpen}>
                Open QR Scanner
              </Button>

              <Dialog open={isQRScannerOpen} onClose={handleQRScannerClose}>
                <DialogTitle>Scan QR Code To Check Item Details</DialogTitle>
                <DialogContent>
                  <Grid container justifyContent="center">
                    <Grid item xs={12} sm={8} md={6}>
                      <QrReader
                        onResult={(result) => {
                          if (result?.text) handleScanResult(result);
                        }}
                        style={{ width: "100%" }}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleQRScannerClose} color="secondary">
                    Exit
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            height: "64px",
            backgroundColor: "primary.main",
          }}
        >
          <Footer />
        </Box>
      </Box>
    </>
  );
};

export default QRScanner;
