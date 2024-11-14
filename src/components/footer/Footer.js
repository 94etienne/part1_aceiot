// Footer.js
import { useState } from "react";
import { Button, Dialog, DialogContent, DialogTitle, DialogActions, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom";
import ChatBot from "../chat/ChatBot";

const Footer = () => {
  const [isQRScannerOpen, setQRScannerOpen] = useState(false);
  const navigate = useNavigate();

  const handleQRScannerOpen = () => setQRScannerOpen(true);
  const handleQRScannerClose = () => setQRScannerOpen(false);

  const handleScanResult = (result) => {
    if (result?.text) {
      navigate("/result", { state: { scannedData: result.text } });
      handleQRScannerClose();
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 100 }}>
      <Link to="/" style={{ textDecoration: "none", color: "#fff", marginRight: "10px" }}>
        <Button variant="contained" sx={{ backgroundColor: "primary.light" }}>
          Login
        </Button>
      </Link>

      <Link to="/scanItem" className="btn btn-primary" style={{ marginRight: "10px" }}>
        Track Item
      </Link>

      <Button variant="contained" color="primary" onClick={handleQRScannerOpen} sx={{ marginRight: 2 }}>
        Track Item
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
{/* Embed ChatBot inside Footer */}
      {/* <ChatBot />  */}
    </div>
  );
};

export default Footer;
