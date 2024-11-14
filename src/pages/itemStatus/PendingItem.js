import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Box,
  Snackbar,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useMediaQuery,
  Toolbar,
  TablePagination,
  TextField,
  CircularProgress,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import { Add } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../../context/authContext";

const PendingItem = () => {
  const [courses, setCourses] = useState([]);
  const [items, setItems] = useState([]);
  const [rents, setRents] = useState([]);
  const [filteredRents, setFilteredRents] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedRentId, setSelectedRentId] = useState(null);
  const [isRentModalOpen, setRentModalOpen] = useState(false);
  const [selectedRent, setSelectedRent] = useState(null); // Track the selected rent data
  const [expectedReturnDate, setExpectedReturnDate] = useState(new Date());

  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const navigate = useNavigate();
  const [user1, setUser] = useState(null);
  const [pos, setPosition] = useState("");
  const [positions, setPositions] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false); // Add loading state
  const [loadingSelected, setLoadingSelected] = useState(false); // Add loading state
  // page protection to users
  useEffect(() => {
    // Redirect to NotFound route if user position is not "IT" or "Director"
    if (user?.position !== "IT" && user?.position !== "Director") {
      navigate("/restricted_page");
    }
  }, [user, navigate]);
  // end page protection to users

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage?.getItem("token");

        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get("http://localhost:5000/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
        setPosition(response.data.user.position);

        if (response.data.user) {
          console.log("User Position:", response.data.user.position);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [
          coursesResponse,
          itemsResponse,
          rentsResponse,
          usersResponse,
          positionsResponse,
          programmesResponse,
          itemTypesResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/courses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/rents", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/positions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/programmes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/item_types", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourses(coursesResponse.data);
        setItems(itemsResponse.data);
        setRents(rentsResponse.data);
        setProgrammes(programmesResponse.data);
        setItemTypes(itemTypesResponse.data);
        setPositions(positionsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch data",
          severity: "error",
        });
      }
    };

    fetchData();
  }, []);

  // const handleRowClick = (rentId) => {
  //   setSelectedRentId(selectedRentId === rentId ? null : rentId);
  // };

  
  const handleRowClick = (rentId) => {
    setLoadingSelected(rentId); // Set loading for the specific rentId

    // Simulate a loading period
    setTimeout(() => {
      setSelectedRentId(selectedRentId === rentId ? null : rentId);
      setLoadingSelected(null); // Reset loading after selection
    }, 500); // Adjust delay as needed
  };

  // Use useEffect to stop loading once selectedRentId is set
  useEffect(() => {
    if (selectedRentId !== null) {
      // Set loading to false after a short delay
      const timer = setTimeout(() => {
        setLoadingSelected(false);
      }, 500); // Adjust the delay as needed

      return () => clearTimeout(timer); // Clear timeout on cleanup
    } else {
      setLoadingSelected(false); // If no rent selected, stop loading
    }
  }, [selectedRentId]);

  // Filter logic for live search

  // SEARCH BY NAME OR UNIVERSITY CODE
  // useEffect(() => {
  //   const filteredUsers = users.filter(
  //     (user) =>
  //       user.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       user.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       user.userUniversityCode
  //         ?.toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //   );

  //   // Filter the rents based on the filtered users
  //   const userIds = filteredUsers.map((user) => user.userId);

  //   const searchedRents = rents.filter(
  //     (rent) =>
  //       userIds.includes(rent.userId) &&
  //       rent.rentCondition === "In_lab" &&
  //       rent.rentStatus === "Pending"
  //   );

  //   setFilteredRents(searchedRents);
  // }, [searchTerm, rents, users]);

  // useEffect(() => {
  //   setFilteredRents(
  //     rents.filter(
  //       (rent) =>
  //         (rent.rentCondition === "In_lab" && rent.rentStatus === "Pending") ||
  //         (rent.rentCondition === "Rented" && rent.rentStatus === "Pending")
  //     )
  //   );
  // }, [rents]);

  // SEARCH BY APPLICATION NUMBER

  useEffect(() => {
    // Filter `rents` by `applicationNumber` only
    const searchedRents = rents.filter(
      (rent) =>
        rent.applicationNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        (rent.rentCondition === "In_lab" || rent.rentCondition === "Rented") &&
        rent.rentStatus === "Pending"
    );

    setFilteredRents(searchedRents);
  }, [searchTerm, rents]);

  // Default display of "Returned" and "Approved" rents without filtering by `applicationNumber`
  useEffect(() => {
    setFilteredRents(
      rents.filter(
        (rent) =>
          (rent.rentCondition === "In_lab" ||
            rent.rentCondition === "Rented") &&
          rent.rentStatus === "Pending"
      )
    );
  }, [rents]);

  // END LIVE SEARCH

  // APPROVAL AND REJECTION,  RENT LOGIC
  // REnting Item
  // const handleRentButton = async (rentId) => {
  //   setLoading(true);
  //   try {
  //     if (!user) {
  //       setSnackbar({
  //         open: true,
  //         message: "User not logged in",
  //         severity: "error",
  //       });
  //       return;
  //     }

  //     const response = await axios.put(
  //       `http://localhost:5000/rents/renting/${rentId}`,
  //       {
  //         rentCondition: "Rented",
  //         rentBy: `${user.fname} ${user.lname}`, // Send the full name or user ID
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );
  //     setSnackbar({
  //       open: true,
  //       message: response.data.message,
  //       severity: "success",
  //     });
  //     setRents((prevRents) =>
  //       prevRents.map((rent) =>
  //         rent.rentId === rentId
  //           ? {
  //               ...rent,
  //               rentCondition: "Rented",
  //               rentBy: `${user.fname} ${user.lname}`,
  //             }
  //           : rent
  //       )
  //     );
  //     navigate("/pending");
  //   } catch (error) {
  //     console.error("Error approving rent:", error);
  //     // setSnackbar({ open: true, message: 'Already Rented', severity: 'error' });
  //     const errorMessage =
  //       error.response?.data?.error || "Failed to rent Item.";
  //     // Use the error message from the server response
  //     setSnackbar({ open: true, message: errorMessage, severity: "error" });
  //     navigate("/pending");
  //   } finally {
  //     setLoading(false); // Hide loading spinner
  //   }
  // };

  const handleRentButton = (rent) => {
    setSelectedRent(rent);
    setExpectedReturnDate(new Date(rent.expectedReturnDate)); // Set the initial date
    setRentModalOpen(true);
  };

  // RETURNING ITEM TO LAB
  const handleReturnButton = async (rentId) => {
    setLoading(true);
    try {
      if (!user) {
        setSnackbar({
          open: true,
          message: "User not logged in",
          severity: "error",
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/rents/returning/${rentId}`,
        {
          rentCondition: "Returned",
          rentBy: `${user.fname} ${user.lname}`, // Send the full name or user ID
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });
      setRents((prevRents) =>
        prevRents.map((rent) =>
          rent.rentId === rentId
            ? {
                ...rent,
                rentCondition: "Returned",
                rentBy: `${user.fname} ${user.lname}`,
              }
            : rent
        )
      );
      navigate("/pending");
    } catch (error) {
      console.error("Error Returning rent:", error);
      // setSnackbar({ open: true, message: 'Already Rented', severity: 'error' });
      const errorMessage =
        error.response?.data?.error || "Failed to Return Item.";
      // Use the error message from the server response
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      navigate("/pending");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };
  // Approve Rented Item
  const handleApproveButton = async (rentId) => {
    setLoading(true);
    try {
      if (!user) {
        setSnackbar({
          open: true,
          message: "User not logged in",
          severity: "error",
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/rents/approve/${rentId}`,
        {
          rentStatus: "Approved",
          approvedBy: `${user.fname} ${user.lname}`, // Send the full name or user ID
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });
      setRents((prevRents) =>
        prevRents.map((rent) =>
          rent.rentId === rentId
            ? {
                ...rent,
                rentStatus: "Approved",
                approvedBy: `${user.fname} ${user.lname}`,
              }
            : rent
        )
      );
      navigate("/pending");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to approve rent.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      navigate("/pending");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const handleCancelButton = async (rentId) => {
    setLoading(true);
    try {
      if (!user) {
        setSnackbar({
          open: true,
          message: "User not logged in",
          severity: "error",
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/rents/cancelled/${rentId}`,
        {
          rentStatus: "Cancelled",
          cancelledBy: `${user.fname} ${user.lname}`, // Send the full name or user ID
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });
      setRents((prevRents) =>
        prevRents.map((rent) =>
          rent.rentId === rentId
            ? {
                ...rent,
                rentCondition: "In_lab",
                rentStatus: "Cancelled",
                approvedBy: `${user.fname} ${user.lname}`,
              }
            : rent
        )
      );
      navigate("/pending");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to Cancel rent Request.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      navigate("/pending");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };
  // PAGINATION
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5); // Set default rows per page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };
  const paginatedRents = filteredRents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // END OF PAGINATION

  return (
    <div
      p={3}
      className="container-fluid col-md-12"
      style={{ marginLeft: "5px" }}
    >
      <Toolbar sx={{ mt: 2 }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Conditionally render the heading based on screen size */}
        <Grid item xs={12} sm={6} md={6}>
          <Box
            component="h2"
            sx={{
              display: { xs: "none", sm: "block" }, // Hide on small devices
              margin: 0,
            }}
          >
            Borrowed Pending Records
          </Box>
        </Grid>
        {/* Add search input */}
        <Box
          sx={{
            marginLeft: { xs: 0, sm: "auto" }, // Align left on small screens, right on larger screens
            width: { xs: "100%", sm: "40%" }, // Full width on small screens, 40% on larger screens
            maxWidth: { xs: "100%", sm: "300px" }, // Max width of 300px only on larger screens
          }}
        >
          <TextField
            label="Search by Application No."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              padding: { xs: 1, sm: 0 }, // Adjust padding for small screens
            }}
          />
        </Box>

        {/* Heading below search input on small screens */}
        <Grid item xs={12} sx={{ display: { xs: "block", sm: "none" } }}>
          <Box
            className="text-secondary"
            component="p"
            sx={{ margin: 0, textAlign: "center", mb: 2 }}
          >
            Borrowed Pending Records
          </Box>
        </Grid>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Application Number</TableCell>
              <TableCell>User</TableCell>
              <TableCell>RegNo/StaffCode</TableCell>
              <TableCell>Level of Education</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Item Category</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Expected Return Date</TableCell>
              <TableCell>Applied On</TableCell>
              <TableCell>Rent Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRents.length > 0 ? (
              paginatedRents.map((rent, index) => (
                <React.Fragment key={rent.rentId}>
                  <TableRow
                    onClick={() => handleRowClick(rent.rentId)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{rent.applicationNumber}</TableCell>
                    <TableCell>
                      {rent.user.lname} {rent.user.fname}
                    </TableCell>
                    <TableCell>{rent.user.userUniversityCode}</TableCell>
                    <TableCell>
                      {programmes.find(
                        (prog) => prog.programmeId === rent.course.programmeId
                      )?.programmeTitle || "N/A"}
                    </TableCell>
                    <TableCell>{rent.course.courseTitle}</TableCell>

                    <TableCell>
                      {itemTypes.find(
                        (type) => type.itemTypeId === rent.item.itemTypeId
                      )?.title || "N/A"}
                    </TableCell>

                    <TableCell>{rent.item.name}</TableCell>
                    <TableCell>
                      {new Date(rent.returnDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(rent.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{rent.rentStatus}</TableCell>
                  </TableRow>
                  {/* LOADING DATA ONCE ROW IS CLICKED */}
                  {loadingSelected === rent.rentId ? (
                    <TableCell colSpan={11}>
                      <Collapse in={true}>
                        <Box margin={1}>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: "bold" }}
                          >
                            <Skeleton width="60%" />
                          </Typography>

                          <hr style={{ color: "white" }} />

                          <Grid container spacing={2}>
                            {/* Row 1 */}
                            <Grid item xs={4}>
                              <Typography
                                variant="h6"
                                style={{ fontWeight: "bold" }}
                              >
                                <Skeleton width="50%" />
                              </Typography>
                              <Skeleton width="80%" />
                              <Skeleton width="70%" />
                              <Skeleton width="90%" />
                              <Skeleton width="60%" />
                            </Grid>

                            {/* Row 2 */}
                            <Grid item xs={4}>
                              <Typography
                                variant="h6"
                                style={{ fontWeight: "bold" }}
                              >
                                <Skeleton width="50%" />
                              </Typography>
                              <Skeleton width="80%" />
                              <Skeleton width="70%" />
                              <Skeleton width="90%" />
                            </Grid>

                            {/* Row 3 */}
                            <Grid item xs={4}>
                              <Typography
                                variant="h6"
                                style={{ fontWeight: "bold" }}
                              >
                                <Skeleton width="50%" />
                              </Typography>
                              <Skeleton width="80%" />
                              <Skeleton width="70%" />
                              <Skeleton width="90%" />
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  ) : (
                    <>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={11}
                        >
                          <Collapse
                            in={selectedRentId === rent.rentId}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box margin={1}>
                              {/* Main title */}
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: "bold" }}
                              >
                                Additional Details for:{" "}
                                {itemTypes.find(
                                  (type) =>
                                    type.itemTypeId === rent.item.itemTypeId
                                )?.title || "N/A"}
                              </Typography>

                              <hr style={{ color: "white" }} />

                              {/* Container for all sections */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {/* Left Section: Requester Details */}
                                <div style={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    style={{ fontWeight: "bold" }}
                                  >
                                    Requester Details:{" "}
                                    <span className="text-primary">
                                      {rent.applicationNumber}
                                    </span>
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Name:</b> {rent.user.fname}{" "}
                                    {rent.user.lname}
                                  </Typography>

                                  <Typography variant="body2">
                                    <b>RegNo:</b> {rent.user.userUniversityCode}{" "}
                                  </Typography>

                                  <Typography variant="body2">
                                    <b>Email:</b> {rent.user.email}{" "}
                                  </Typography>

                                  <Typography variant="body2" color="primary">
                                    <b>Role:</b>{" "}
                                    {positions.find(
                                      (position) =>
                                        position.positionId ===
                                        rent.user.positionId
                                    )?.title || "Unknown"}
                                  </Typography>

                                  {user.position === "IT" ||
                                  user.position === "Director" ? (
                                    <div style={{ marginTop: "10px" }}>
                                      {/* <button
                                    // className="btn btn-primary"
                                    className={`btn ${
                                      rent.rentCondition === "In_lab" &&
                                      rent.rentStatus === "Cancelled"
                                        ? "btn-secondary"
                                        : "btn-primary"
                                    }`}
                                    style={{ marginRight: "15px" }}
                                    onClick={() =>
                                      handleRentButton(rent.rentId)
                                    }
                                    hidden={
                                      (rent.rentCondition === "In_lab" &&
                                        rent.rentStatus === "Cancelled") ||
                                      rent.rentCondition === "Rented" ||
                                      rent.rentStatus === "Approved"
                                    } // Disable if the condition is met
                                  >
                                    Rent
                                  </button> */}

                                      <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleRentButton(rent)}
                                        hidden={
                                          (rent.rentCondition === "In_lab" &&
                                            rent.rentStatus === "Cancelled") ||
                                          rent.rentCondition === "Rented" ||
                                          rent.rentStatus === "Approved"
                                        } // Disable if the condition is met
                                      >
                                        Rent
                                      </Button>

                                      {/* <button
                                    className="btn btn-primary"
                                    style={{ marginRight: "15px" }}
                                    onClick={() =>
                                      handleRentButton(rent.rentId)
                                    }
                                  >
                                    Rent
                                  </button> */}

                                      <button
                                        // className="btn btn-warning"
                                        className={`btn ${
                                          rent.rentStatus === "Cancelled"
                                            ? "btn-secondary"
                                            : "btn-warning"
                                        }`}
                                        style={{ marginRight: "15px" }}
                                        onClick={() =>
                                          handleReturnButton(rent.rentId)
                                        }
                                        hidden={
                                          (rent.rentCondition === "In_lab" &&
                                            rent.rentStatus === "Pending") ||
                                          rent.rentCondition === "Returned" ||
                                          rent.rentStatus === "Cancelled" ||
                                          (rent.rentCondition === "Rented" &&
                                            rent.rentStatus === "Pending")
                                        } // Disable if the condition is met
                                      >
                                        Return
                                      </button>
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                </div>

                                {/* Middle Section: Residence */}
                                <div
                                  style={{
                                    flex: 1,
                                    marginLeft: "20px",
                                    marginRight: "20px",
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    style={{ fontWeight: "bold" }}
                                  >
                                    Item Details
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Item Name:</b> {rent.item.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Item Serial Number:</b>{" "}
                                    {rent.item.serialNumber}
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Item Lab Code:</b> {rent.item.labCode}
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Borrowed Date:</b>{" "}
                                    {new Date(
                                      rent.createdAt
                                    ).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Expected Return Date:</b>{" "}
                                    {new Date(
                                      rent.expectedReturnDate
                                    ).toLocaleDateString()}
                                  </Typography>
                                  {/* <Typography variant="body2">
                              <b>Returned Date:</b>{" "}
                              {new Date(rent.returnDate).toLocaleDateString()}
                            </Typography> */}
                                  {/* Action buttons */}
                                  <div style={{ marginTop: "30px" }}>
                                    {user.position === "IT" ||
                                    user.position === "Director" ? (
                                      <>
                                        <button
                                          className="btn btn-success"
                                          style={{ marginRight: "15px" }}
                                          onClick={() =>
                                            handleApproveButton(rent.rentId)
                                          }
                                          hidden={
                                            (rent.rentCondition === "In_lab" &&
                                              rent.rentStatus === "Pending") ||
                                            rent.rentStatus === "Approved" ||
                                            rent.rentStatus === "Cancelled"
                                          } // Disable if the condition is met
                                        >
                                          Approve
                                        </button>

                                        <button
                                          className="btn btn-danger"
                                          style={{ marginRight: "15px" }}
                                          onClick={() =>
                                            handleCancelButton(rent.rentId)
                                          }
                                          hidden={
                                            rent.rentStatus === "Approved" ||
                                            rent.rentStatus === "Cancelled"
                                          } // Disable if the condition is met
                                        >
                                          Reject
                                        </button>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                </div>

                                {/* Right Section: Other Details */}
                                <div style={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    style={{ fontWeight: "bold" }}
                                  >
                                    Approval Details
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Condition:</b> {rent.rentCondition}
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Status:</b>{" "}
                                    <span
                                      style={{
                                        color:
                                          rent.rentStatus === "Approved"
                                            ? "green"
                                            : rent.rentStatus === "Pending"
                                            ? "orange"
                                            : rent.rentStatus === "Cancelled"
                                            ? "red"
                                            : "black",
                                      }}
                                    >
                                      {rent.rentStatus}
                                    </span>
                                  </Typography>
                                  {(rent.rentCondition === "Rented" ||
                                    rent.rentCondition === "Returned") && (
                                    <Typography variant="body2">
                                      <b>Rented By:</b> {rent.rentBy || "N/A"}{" "}
                                    </Typography>
                                  )}

                                  {/* Conditionally render this section if rentCondition is 'Returned' */}
                                  {rent.rentCondition === "Returned" && (
                                    <Typography variant="body2">
                                      <b>Received By:</b>{" "}
                                      {rent.returnedBy || "N/A"}
                                    </Typography>
                                  )}
                                  {rent.rentStatus === "Approved" && (
                                    <Typography variant="body2">
                                      <b>Approved By:</b>{" "}
                                      {rent.approvedBy || "N/A"}
                                    </Typography>
                                  )}

                                  {/* Conditionally render this section if rentCondition is 'Cancelled' */}
                                  {rent.rentStatus === "Cancelled" && (
                                    <Typography variant="body2">
                                      <b>Cancelled By:</b>{" "}
                                      {rent.cancelledBy || "N/A"}
                                    </Typography>
                                  )}
                                </div>
                              </div>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" className="text-danger">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination Component */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Customize as needed
          component="div"
          count={filteredRents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {/* Loading overlay */}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              zIndex: 10,
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}
      </TableContainer>

      <Dialog open={isRentModalOpen}>
        <DialogTitle>Confirm Item Return Date</DialogTitle>
        <DialogContent>
          <TextField
            label="Expected Return Date"
            type="date"
            fullWidth
            value={expectedReturnDate.toISOString().slice(0, 10)}
            onChange={(e) => setExpectedReturnDate(new Date(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRentModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!user) {
                setSnackbar({
                  open: true,
                  message: "User not logged in",
                  severity: "error",
                });
                return;
              }

              setLoading(true);

              try {
                setLoading(true);
                const response = await axios.put(
                  `http://localhost:5000/rents/renting/${selectedRent.rentId}`,
                  {
                    rentCondition: "Rented",
                    expectedReturnDate,
                    rentBy: `${user.fname} ${user.lname}`,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );

                setSnackbar({
                  open: true,
                  message: response.data.message,
                  severity: "success",
                });

                setRents((prevRents) =>
                  prevRents.map((rent) =>
                    rent.rentId === selectedRent.rentId
                      ? {
                          ...rent,
                          rentCondition: "Rented",
                          expectedReturnDate,
                          rentBy: `${user.fname} ${user.lname}`,
                        }
                      : rent
                  )
                );
                setRentModalOpen(false);
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: "Failed to rent item",
                  severity: "error",
                });
              } finally {
                setLoading(false);
              }
            }}
            color="primary"
            disabled={loading}
            className="bg-primary text-white"
          >
            {loading ? (
              <span className="text-white">Please Wait...</span>
            ) : (
              "Confirm Rent"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        style={{ marginTop: "150px" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PendingItem;
