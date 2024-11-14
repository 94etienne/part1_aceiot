import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Tooltip, Legend, ArcElement, ChartDataLabels);

const ITDirectorDashboard = () => {
  const { user } = useAuth();
      // page protection to users
      const navigate = useNavigate();

      useEffect(() => {
        // Redirect to NotFound route if user position is not "IT" or "Director"
        if (user?.position !== "IT" && user?.position !== "Director") {
          navigate("/restricted_page");
        }
      }, [user, navigate]);
      // end page protection to users
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    totalRentRequest: 0,
    totalRents: 0,
    totalRentReturn: 0,
    totalPending: 0,
    totalRejected: 0,
    itemTypes: [],
    totalItemTypesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  const encryptItemTypeId = (itemTypeId) => {
    const encrypted = CryptoJS.AES.encrypt(
      itemTypeId.toString(),
      "hdhdhdhhddhhdhddgdfgdfdgddffdfd867766884944gdgff!443$%%%$$fgfgfgfgfg" // Replace with your secret key
    ).toString();
    return encodeURIComponent(encrypted); // To make it URL safe
  };

  // Fetch counts from APIs
  const fetchCounts = async () => {
    try {
      const [
        rentedRequests,
        pendingRequests,
        rentedItems,
        returnedItems,
        rejectedItems,
        itemsRes,
        itemTypesRes,
      ] = await Promise.all([
        axios.get("http://localhost:5000/rents/count_rented_request"),
        axios.get("http://localhost:5000/rents/count_pending"),
        axios.get("http://localhost:5000/rents/count_rented"),
        axios.get("http://localhost:5000/rents/count_returned"),
        axios.get("http://localhost:5000/rents/count_rejected"),
        axios.get("http://localhost:5000/items/count/itemsCount"),
        axios.get("http://localhost:5000/item_types/itemTypesList"), // Correct endpoint
      ]);

      setDashboardData((prevData) => ({
        ...prevData,
        totalRentRequest: rentedRequests.data.count,
        totalPending: pendingRequests.data.count,
        totalRents: rentedItems.data.count,
        totalRentReturn: returnedItems.data.count,
        totalRejected: rejectedItems.data.count,
        totalItems: itemsRes.data.count,
        totalItemTypesCount: itemTypesRes.data.length,
        itemTypes: itemTypesRes.data || [],
      }));
    } catch (error) {
      console.error("Error fetching dashboard counts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchItemsByType = async (itemTypeId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/item_types/byId/${itemTypeId}`
      );
      return response.data.items;
    } catch (error) {
      console.error(`Error fetching items for type ${itemTypeId}:`, error);
      return [];
    }
  };

  const handleCategoryClick = async (itemTypeId) => {
    const items = await fetchItemsByType(itemTypeId);
    setSelectedItems(items);
  };

  //   PIE CHART
  const pieData = {
    labels: ["Total Rent ", "Pending ", "Approved ", "Returned ", "Rejected "],
    datasets: [
      {
        label: "Lab Assets Movement",
        data: [
          dashboardData.totalRentRequest,
          dashboardData.totalPending,
          dashboardData.totalRents,
          dashboardData.totalRentReturn,
          dashboardData.totalRejected,
        ],
        backgroundColor: [
          "#4e73df",
          "#f6c23e",
          "#1cc88a",
          "#36b9cc",
          "#e74a3b",
        ],
        hoverBackgroundColor: [
          "#2e59d9",
          "#dda20a",
          "#17a673",
          "#2c9faf",
          "#d9534f",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 10,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataset = tooltipItem.dataset.data;
            const total = dataset.reduce((acc, value) => acc + value, 0);
            const currentValue = dataset[tooltipItem.dataIndex];
            const percentage = ((currentValue / total) * 100).toFixed(1);
            return `${tooltipItem.label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        formatter: (value, context) => {
          const dataset = context.chart.data.datasets[0].data;
          const total = dataset.reduce((acc, val) => acc + val, 0);
          return;
        },
        color: "#fff",
        font: {
          weight: "bold",
        },
      },
    },
  };

  return (
    <div
      className="container-fluid col-md-12"
      style={{ marginLeft: "5px", marginTop: "80px" }}
    >
      <div className="d-none d-sm-flex align-items-right justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">{user.position} Dashboard</h1>
         <Link
          to="/profile"
          className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"
        >
          <i className="fas fa-edit fa-sm text-warning"></i> Update Profile
        </Link>
      </div>
      <hr className="d-none" />
      <div className="row">
        {/* Total Items */}
        {["IT"].includes(user?.position) && (
          <div className="col-xl-4 col-md-6 mb-4">
            <div className="card border-left-primary shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-center text-primary text-uppercase mb-1">
                      LAB RECORDED ASSETS
                    </div>
                    <hr />
                    <div className="text-xs font-weight-bold text-center text-primary text-uppercase mb-1">
                      <span className="mr-2">
                        Category:
                        <span className="h6 mb-0 font-weight-bold text-gray-800">
                          {dashboardData.totalItemTypesCount}
                        </span>
                      </span>
                      Items:{" "}
                      <Link
                        to="/items"
                        className="h6 mb-0 font-weight-bold text-gray-800"
                      >
                        {dashboardData.totalItems}
                      </Link>{" "}
                    </div>
                    <hr />

                    {/* Scrollable Container */}
                    <div
                      className="scrollable-container"
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto", // Enables vertical scrolling
                        overflowX: "auto", // Enables horizontal scrolling
                        display: "flex",
                        flexDirection: "column-reverse",
                      }}
                    >
                      <div
                        className="row text-center"
                        style={{
                          maxWidth: "400px", // Adjust to trigger horizontal scrolling if content exceeds this width
                          marginLeft: "auto",
                        }}
                      >
                        {dashboardData.itemTypes.length > 0 ? (
                          dashboardData.itemTypes.map((itemType, index) => (
                            <div
                              key={index}
                              className="col-6"
                              style={{
                                padding: "2px 4px",
                                whiteSpace: "normal",
                              }}
                            >
                              <Link 
                                to={`/item/type/${encryptItemTypeId(
                                  itemType.itemTypeId
                                )}`}
                                className={`span mb-0 font-weight text-gray-800 ${
                                  itemType.disabled ? "disabled-link" : ""
                                }`}
                              >
                                {itemType.title.toLowerCase()} (
                                {itemType.itemCount})
                              </Link>
                            </div>
                          ))
                        ) : (
                          <p>No item types found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BORROWING ITEMS MOVEMENT */}
        <div
          className={`col-md-6 mb-4 ${
            user.position === "Director" ? "col-xl-6" : "col-xl-4"
          }`}
        >
          <div className="card border-left-secondary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-center text-primary text-uppercase mb-1">
                    LAB ASSET'S MOVEMENT
                  </div>
                  <hr />
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ height: "100%" }}
                    >
                      <div className="text-center">
                        <div>
                          Total Request:{" "}
                          <Link
                            to="/rents"
                            className="h6 mb-0 font-weight-bold text-gray-800"
                          >
                            {dashboardData.totalRentRequest}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr />

                  {/* Scrollable Container */}
                  <div
                    className="scrollable-container"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column-reverse",
                    }}
                  >
                    <div className="container-fluid text-center">
                      <div className="row">
                        {/* First Column */}
                        <div className="col-md-6">
                          <div className="mb-2">
                            <Link
                              to="/pending"
                              className="h6 mb-0 font-weight-bold text-gray-800"
                            >
                              <span>Pending: </span>
                              {dashboardData.totalPending}
                            </Link>
                          </div>
                          <div className="mb-2">
                            <Link
                              to="/approved"
                              className="h6 mb-0 font-weight-bold text-gray-800"
                            >
                              <span>Approved: </span>
                              {dashboardData.totalRents}
                            </Link>
                          </div>
                        </div>

                        {/* Second Column */}
                        <div className="col-md-6">
                          <div className="mb-2">
                            <Link
                              to="/rejected"
                              className="h6 mb-0 font-weight-bold text-gray-800"
                            >
                              <span>Rejected: </span>
                              {dashboardData.totalRejected}
                            </Link>
                          </div>
                          <div className="mb-2">
                            <Link
                              to="/returned"
                              className="h6 mb-0 font-weight-bold text-gray-800"
                            >
                              <span>Returned: </span>
                              {dashboardData.totalRentReturn}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div
          className={`col-md-6 mb-4 ${
            user.position === "Director" ? "col-xl-6" : "col-xl-4"
          }`}
        >
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-center text-primary text-uppercase mb-1">
                    PIE CHART
                  </div>
                  <div style={{ maxHeight: "250px", maxWidth: "300px" }}>
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* END STATISTICS */}
      </div>
    </div>
  );
};

export default ITDirectorDashboard;
