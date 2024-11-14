import { createContext, useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

const userContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(29); // Countdown seconds before logout
  const navigate = useNavigate();

  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  const startAutoLogoutTimer = () => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  
    // Set timer to show warning 1 minutes before logout
    logoutTimerRef.current = setTimeout(() => {
      setShowLogoutWarning(true);
      startWarningCountdown();
    }, 29 * 60 * 1000); // Show warning at 29 minutes
  
    // Set timer to automatically logout at 30 minutes
    warningTimerRef.current = setTimeout(() => {
      logout();
    }, 30 * 60 * 1000); // Total duration: 30 minutes
  };
  
  const startWarningCountdown = () => {
    setCountdown(60); // Start countdown from 60 seconds (1 minutes) remaining from 30 minutes total
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) clearInterval(countdownInterval);
        return prev - 1;
      });
    }, 1000);
  };
  

  useEffect(() => {
    const verifyUser = async () => {
      const storedUser = localStorage.getItem("user");
      const storedUserId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (storedUser && token && storedUserId) {
        setUser({ ...JSON.parse(storedUser), userId: parseInt(storedUserId, 10) });
        setLoading(false);
        startAutoLogoutTimer();
      } else if (token) {
        try {
          const response = await axios.get("http://localhost:5000/auth/verify", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("userId", String(response.data.user.userId));
            startAutoLogoutTimer();
          } else {
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
          }
        } catch (error) {
          console.error("Verification error:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  const login = (user, token) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("userId", user.id);
    startAutoLogoutTimer();
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/auth/logout", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setShowLogoutWarning(false); // Close the modal after logout
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const extendSession = () => {
    setShowLogoutWarning(false);
    startAutoLogoutTimer();
  };

  return (
    <userContext.Provider value={{ user, login, logout, loading }}>
      {children}
      <Dialog open={showLogoutWarning} onClose={null}>
  <DialogTitle>Session Timeout Warning</DialogTitle>
  <DialogContent>
    <DialogContentText>
      You will be logged out in {countdown} seconds. Would you like to extend your session?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={logout} color="secondary">Logout Now</Button>
    <Button onClick={extendSession} color="primary">Stay Logged In</Button>
  </DialogActions>
</Dialog>

    </userContext.Provider>
  );
};

AuthContext.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(userContext);

export default AuthContext;
