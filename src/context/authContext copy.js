// authContext.js
import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const userContext = createContext();
 
const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const storedUser = localStorage.getItem("user");
      const storedUserId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
    
      if (storedUser && token && storedUserId) {
        setUser({ ...JSON.parse(storedUser), userId: parseInt(storedUserId, 10) });
        setLoading(false);
      } else if (token) {
        try {
          const response = await axios.get("http://localhost:5000/auth/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("userId", String(response.data.user.userId));
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
  }, []);

// Ensure `userId` is stored on login
const login = (user, token) => {
  setUser(user); // Make sure `user` object here has an `id` key instead of `userId`
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  localStorage.setItem("userId", user.id); // Ensure `userId` matches `id` as per API response
};



  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <userContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </userContext.Provider>
  );
};

AuthContext.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(userContext);

export default AuthContext;
