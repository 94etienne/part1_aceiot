import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useTheme } from "@mui/material/styles";
import logo from "../../assets/images/logo1.PNG"; // Import the company logo
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Header({ handleDrawerToggle }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("sm"));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAccountClick = () => {
    handleProfileMenuClose();
    navigate("/profile");
  };

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Main Title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {user && user.position ? (
            <Link
              to="/dashboard"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {`${user.position} Dashboard`}
              {/* <img src={logo} height="60" width= "200"/> */}
            </Link>
          ) : (
            "Loading..."
          )}
        </Typography>

        {/* Centered Title for Large Screens */}
        {!isSmallDevice && (
          <Typography
            variant="h6"
            component="div"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            ACEIOT LAB MANAGEMENT SYSTEM
          </Typography>
        )}

        {/* User Avatar and Name */}
        {user ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: isSmallDevice ? "auto" : 0, // Align right on small screens
              cursor: "pointer",
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar sx={{ mr: isSmallDevice ? 0 : 1 }}>{user.fname[0]}</Avatar>
            {!isSmallDevice && (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {user.fname} {user.lname}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <CircularProgress color="inherit" size={24} />
        )}

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            mt: 5,
          }}
        >
          {user && (
            <>
              <MenuItem
                onClick={handleProfileMenuClose}
                sx={{ cursor: "text" }}
              >
                <AccountCircleIcon
                  fontSize="large"
                  color="secondary"
                  sx={{ mr: 2 }}
                />{" "}
                {user.position} | {user.fname} {user.lname}
              </MenuItem>
              <MenuItem onClick={handleAccountClick}>
                <AccountCircleIcon
                  fontSize="large"
                  color="primary"
                  sx={{ mr: 2 }}
                />
                My Account
              </MenuItem>
              <MenuItem
      onClick={logout}
      sx={{
        cursor: "pointer",
        mb: 0,
        display: "flex",
        alignItems: "center",
        transition: "all 0.3s ease",
        fontSize: { xs: "0.875rem", sm: "1rem" },
        "&:hover": {
          backgroundColor: theme.palette.error.main,
          color: theme.palette.common.white,
          transform: "scale(1.05)",
          "& .MuiSvgIcon-root": {
            color: theme.palette.common.white, // Change icon color to white on hover
          },
        },
        p: { xs: 1, sm: 1.5 },
      }}
    >
      <LogoutIcon
        fontSize="large"
        color="error"
        sx={{
          mr: 2,ml:2,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          transition: "color 0.3s ease",
        }}
      />
      Logout
    </MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
