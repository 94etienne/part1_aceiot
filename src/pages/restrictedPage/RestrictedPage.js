import React from "react";
import { Box, Toolbar, Typography } from "@mui/material";

const RestrictedPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2, // Horizontal padding for smaller screens
        textAlign: "center",
      }}
    >
      <Toolbar />
      <Typography
        variant="h5"
        component="h5"
        sx={{
          fontSize: { xs: "2rem", sm: "2rem", md: "2rem" },
          fontWeight: "bold",
          color: "gray",
        }}
      >
        403 - You are not granted to access this page
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, mt: 2, color: "gray" }}
      >
        Sorry, contact the system administrator for any support.
      </Typography>
    </Box>
  );
};

export default RestrictedPage;
