import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const userId = user?.id;

      // page protection to users
      const navigate = useNavigate();

      useEffect(() => {
        // Redirect to NotFound route if user position is not "IT" or "Director"
        if (user?.position !== "Student") {
          navigate("/restricted_page");
        }
      }, [user, navigate]);
      // end page protection to users

  const [dashboardData, setDashboardData] = useState({
    totalRentRequest: 0,
    totalPending: 0,
    totalRents: 0,
    totalRentReturn: 0,
    totalRejected: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCountsByUser = async () => {
    try {
      const [
        rentedRequests,
        pendingRequests,
        rentedItems,
        returnedItems,
        rejectedItems,
      ] = await Promise.all([
        axios.get(`http://localhost:5000/rents/count_rented_request_by_user?userId=${userId}`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`http://localhost:5000/rents/count_pending_by_user?userId=${userId}`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`http://localhost:5000/rents/count_rented_by_user?userId=${userId}`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`http://localhost:5000/rents/count_returned_by_user?userId=${userId}`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`http://localhost:5000/rents/count_rejected_by_user?userId=${userId}`, { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      setDashboardData({
        totalRentRequest: rentedRequests.data.count,
        totalPending: pendingRequests.data.count,
        totalRents: rentedItems.data.count,
        totalRentReturn: returnedItems.data.count,
        totalRejected: rejectedItems.data.count,
      });
    } catch (error) {
      console.error("Error fetching user-based dashboard counts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountsByUser();
  }, [userId]);

  return (
    <div className="container-fluid" style={{ marginTop: '80px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-12 col-md-12">
        <div className="d-none d-sm-flex align-items-right justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">{user.position} Dashboard</h1>
         <Link
          to="/profile"
          className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"
        >
          <i className="fas fa-edit fa-sm text-warning"></i> Update Profile
        </Link>
      </div>
          <hr className='d-none' />

          <div className="card shadow mb-4">
            <div className="card-body text-center">
              <h2 className="card-title mb-3 text-secondary">
                Welcome, {user.lname} {user.fname}
              </h2>
              <p className="card-text">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="card-text">
                <strong>Phone:</strong> {user.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LAB ASSET'S MOVEMENT */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card border-left-secondary shadow mb-4">
            <div className="card-body">
              <h5 className="text-center font-weight-bold text-secondary mb-3">
                Your Historical Lab Asset's Movement
              </h5>
              <hr />

            
                  <div className="text-center">
                    <Link to="/borrowed_list" className="h5 font-weight-bold text-secondary">
                      Total Requests: {dashboardData.totalRentRequest}
                    </Link>
                  </div>
                <hr/>

              <div className="row">
 

                <div className="col-md-6 mb-3">
                  <div className="text-center">
                    <Link to="/dashboard" className="h6 font-weight-bold text-gray-800">
                      Pending: {dashboardData.totalPending}
                    </Link>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="text-center">
                    <Link to="/dashboard" className="h6 font-weight-bold text-gray-800">
                      Approved: {dashboardData.totalRents}
                    </Link>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="text-center">
                    <Link to="/dashboard" className="h6 font-weight-bold text-gray-800">
                      Returned: {dashboardData.totalRentReturn}
                    </Link>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="text-center">
                    <Link to="/dashboard" className="h6 font-weight-bold text-gray-800">
                      Rejected: {dashboardData.totalRejected}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
