import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Header from './components/header/Header';
import Dashboard from './components/dashboard/Dashboard';
import LoginForm from './pages/Login';
import Position from './pages/position';
import Register from './pages/register';
import ItemCategory from './pages/ItemCategory';
import Programme from './pages/programme';
import Course from './pages/courses';
import Users from './pages/users';
import Items from './pages/items';
import Rents from './pages/rent';
import BorrowForm from './pages/borrow/Borrow';
import MyReportBorrowedList from './pages/borrow/MyReportBorrowed';
import ResetPasswordForm from './pages/resetPassword/Reset';
import ProfileSettings from './pages/updatePassword/UpdatePassword';
import ProtectedRoute from './pages/protectedRoute/ProtectedRoute';
import ScannedResult from './pages/qrCode/ScannedResult';
import QRScanner from './pages/qrCode/QRScanner';
import OthersResults from './pages/qrCode/OthersResults';
import NotFound from './pages/notFound/NotFound';
import PendingItem from './pages/itemStatus/PendingItem';
import ApprovedItem from './pages/itemStatus/ApprovedItem';
import ReturnedItem from './pages/itemStatus/ReturnedItem';
import ItemLists from './pages/items/ItemList';
import RejectedItem from './pages/itemStatus/RejectedItemRequest';
import ItemsByCategory from './pages/items/ItemsByCategory';
import { useAuth } from './context/authContext';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestrictedPage from './pages/restrictedPage/RestrictedPage';
import ChatBot from './components/chat/ChatBot';
import StudentDashboard from './components/dashboard/StudentDashboard';
import SummaryDashboard from './components/dashboard/Summary';
import OTPInput from './pages/oneTimePassword/OTP';

const App = () => {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLinkClick = () => {
    if (isSmallScreen) setMobileOpen(false);
  };

  // if (loading) {
  //   return (
  //     <div
  //       align="center"
  //       className="text-secondary"
  //       style={{
  //         fontSize: "80px",
  //         fontWeight: "bold",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         height: "100vh",
  //       }}
  //     >
  //       Loading...
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div
        align="center"
        className="text-secondary"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            border: "8px solid rgba(0, 0, 0, 0.1)",
            borderTop: "8px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }


  // prevent to access sidebar and header once visited login
  const isLoginPage = location.pathname === '/login';

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>

      {!isLoginPage && user && <Header handleDrawerToggle={handleDrawerToggle} />}
      {!isLoginPage && user && (
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          handleLinkClick={handleLinkClick}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { xs: '100%', sm: user ? `calc(100% - 240px)` : '100%' },
        }}
      >
        <Routes>
         
               {/* Redirect to dashboard if logged in and accessing "/" or "/login" */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ResetPasswordForm />} />
          <Route path="/scanItem" element={<QRScanner />} />
          <Route path="/result" element={<OthersResults />} />
          <Route path="/otp" element={<OTPInput />} />


          {user && (
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/my_own_history" element={<SummaryDashboard />} />
              <Route path="/position" element={<Position />} />
              <Route path="/itemCategory" element={<ItemCategory />} />
              <Route path="/programme" element={<Programme />} />
              <Route path="/courses" element={<Course />} />
              <Route path="/users" element={<Users />} />
              <Route path="/rents" element={<Rents />} />
              <Route path="/borrow" element={<BorrowForm />} />
              <Route path="/borrowed_list" element={<MyReportBorrowedList />} />
              <Route path="/scannedResults" element={<ScannedResult />} />

              <Route path="/pending" element={<PendingItem />} />
              <Route path="/approved" element={<ApprovedItem />} />
              <Route path="/returned" element={<ReturnedItem />} />
              <Route path="/rejected" element={<RejectedItem />} />

              <Route path="/items" element={<Items />} />
              <Route path="/itemList" element={<ItemLists />} />
              <Route path="/item/type/:itemTypeId" element={<ItemsByCategory />} />

              <Route path="/restricted_page" element={<RestrictedPage />} />

              <Route path="*" element={<NotFound />} />
   
            </Route>
          )}

          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

          
        </Routes>
      </Box>
{/* make chatbot only visible to granted users */}
      {["IT", "Director", "Student"].includes(user?.position) && (
  <ChatBot />
)}



    </Box>
  );
};

export default App;
