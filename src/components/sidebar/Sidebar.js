// Sidebar.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Toolbar,
  Box,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useAuth } from "../../context/authContext";
import { useTheme } from "@mui/material/styles";
import "./Sidebar.css";
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [manageOpen, setManageOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // Reload Page
  // const handleNavigation = (path) => {
  //   if (path !== activeLink) {
  //     // Reload the page and navigate to the path
  //     window.location.href = path;
  //   }
  //   setActiveLink(path);

  //   // Close the drawer on small screens after navigation
  //   if (window.innerWidth < theme.breakpoints.values.sm) {
  //     handleDrawerToggle();
  //   }
  // };

  const handleNavigation = (path) => {
    if (path !== activeLink) {
      // Navigate to the path without reloading the page
      navigate(path);
    }
    setActiveLink(path);

    // Close the drawer on small screens after navigation
    if (window.innerWidth < theme.breakpoints.values.sm) {
      handleDrawerToggle();
    }
  };

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        mt: { xs: 5, md: 7 },
      }}
    >
      <List>
        {["IT", "Director"].includes(user?.position) && (
          <ListItem
            button
            onClick={() => handleNavigation("/dashboard")}
            sx={{
              cursor: "pointer",
              backgroundColor:
                activeLink === "/dashboard"
                  ? theme.palette.primary.main
                  : "inherit",
              color:
                activeLink === "/dashboard"
                  ? theme.palette.common.white
                  : "inherit",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
              },
            }}
          >
           <DashboardIcon sx={{mr:2}}/> <ListItemText primary="Lab Dashboard" />
          </ListItem>
        )}

        {["Student"].includes(user?.position) && (
          <ListItem
            button
            onClick={() => handleNavigation("/dashboard")}
            sx={{
              cursor: "pointer",
              backgroundColor:
                activeLink === "/dashboard"
                  ? theme.palette.primary.main
                  : "inherit",
              color:
                activeLink === "/dashboard"
                  ? theme.palette.common.white
                  : "inherit",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
              },
            }}
          >
          <DashboardIcon sx={{mr:2}}/> <ListItemText primary="My Dashboard" />
          </ListItem>
        )}


        {/* Manage Dropdown */}
        {user?.position === "IT" && (
          <>
            <ListItem
              button
              onClick={() => setManageOpen(!manageOpen)}
              sx={{ cursor: "pointer" }}
            >
             <SettingsIcon sx={{mr:2}}/> <ListItemText primary="Manage" />
              {manageOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={manageOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {[
                  "/position",
                  "/itemCategory",
                  "/items",
                  "/programme",
                  "/courses",
                ].map((path, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleNavigation(path)}
                    sx={{
                      cursor: "pointer",
                      pl: 4,
                      backgroundColor:
                        activeLink === path
                          ? theme.palette.primary.main
                          : "inherit",
                      color:
                        activeLink === path
                          ? theme.palette.common.white
                          : "inherit",
                      "&:hover": {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                      },
                    }}
                  >
                    <ListItemText sx={{ml:4}} primary={path.replace("/", "")} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}

        {/* Users Dropdown */}
        {user?.position === "IT" && (
          <>
            <ListItem
              button
              onClick={() => setUsersOpen(!usersOpen)}
              sx={{ cursor: "pointer" }}
            >
             <PeopleIcon sx={{mr:2}} /> <ListItemText primary="Users" />
              {usersOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={usersOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  onClick={() => handleNavigation("/users")}
                  sx={{
                    cursor: "pointer",
                    pl: 4,
                    backgroundColor:
                      activeLink === "/users"
                        ? theme.palette.primary.main
                        : "inherit",
                    color:
                      activeLink === "/users"
                        ? theme.palette.common.white
                        : "inherit",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                    },
                  }}
                >
                  <ListItemText sx={{ml:4}} primary="Staff/Student" />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* Movement Dropdown */}
        <ListItem
          button
          onClick={() => setMovementOpen(!movementOpen)}
          sx={{ cursor: "pointer" }}
        >
          <SwapHorizIcon fontSize="large" sx={{mr:2}} /> <ListItemText primary="Movement" />
          {movementOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={movementOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {["IT", "Director"].includes(user?.position) && (
              <ListItem
                button
                onClick={() => handleNavigation("/rents")}
                sx={{
                  cursor: "pointer",
                  pl: 4,
                  backgroundColor:
                    activeLink === "/rents"
                      ? theme.palette.primary.main
                      : "inherit",
                  color:
                    activeLink === "/rents"
                      ? theme.palette.common.white
                      : "inherit",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.common.white,
                  },
                  
                }}
              >
                <ListItemText sx={{ml:4}} primary="Rent" />
              </ListItem>
            )}
            {["IT", "Director", "Student"].includes(user?.position) && (
              <>
                <ListItem
                  button
                  onClick={() => handleNavigation("/borrowed_list")}
                  sx={{
                    cursor: "pointer",
                    pl: 4,
                    backgroundColor:
                      activeLink === "/borrowed_list"
                        ? theme.palette.primary.main
                        : "inherit",
                    color:
                      activeLink === "/borrowed_list"
                        ? theme.palette.common.white
                        : "inherit",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                    },
                  }}
                >
                  <ListItemText sx={{ml:4}} primary="My Report" />
                </ListItem>
                <ListItem
                  button
                  onClick={() => handleNavigation("/borrow")}
                  sx={{
                    cursor: "pointer",
                    pl: 4,
                    backgroundColor:
                      activeLink === "/borrow"
                        ? theme.palette.primary.main
                        : "inherit",
                    color:
                      activeLink === "/borrow"
                        ? theme.palette.common.white
                        : "inherit",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                    },
                  }}
                >
                  <ListItemText sx={{ml:4}} primary="Borrow" />
                </ListItem>
              </>
            )}
          </List>
        </Collapse>

        
        {/* MY HISTORY SUMMARY */}
        {["IT", "Director"].includes(user?.position) && (
          <ListItem
            button
            onClick={() => handleNavigation("/my_own_history")}
            sx={{
              cursor: "pointer",
              backgroundColor:
                activeLink === "/my_own_history"
                  ? theme.palette.primary.main
                  : "inherit",
              color:
                activeLink === "/my_own_history"
                  ? theme.palette.common.white
                  : "inherit",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
              },
            }}
          >
          <PersonIcon sx={{mr:2}} />   <ListItemText primary="My own Dashboard" />
          </ListItem>
        )}
      </List>

      

      {/* Logout Button at the Bottom */}
      <ListItem
        button
        onClick={logout}
        sx={{
          cursor: "pointer",
          mb: 0, // Adds margin at the bottom
          backgroundColor: theme.palette.error.main,
          color: theme.palette.common.white,
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
          },
        }}
      >
      <LogoutIcon sx={{mr:2}} />  <ListItemText primary="Logout" />
      </ListItem>
    </Box>
  );

  return (
    <Box
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="sidebar"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
