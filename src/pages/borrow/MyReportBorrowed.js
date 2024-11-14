import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Collapse,
  Box,
  Button,
  Toolbar,
  CircularProgress,
  TextField,
  TablePagination,
  Grid,
  MenuItem,
  Menu,
  FormControl,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../assets/images/logo1.PNG"; // Import the company logo
import logo1 from "../../assets/images/logo.png"; // Import the company logo
import { useAuth } from "../../context/authContext";
import { useMediaQuery } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh"; // Import the Refresh icon
import SearchIcon from "@mui/icons-material/Search";

const MyReportBorrowedList = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Fetch logged-in user details
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedRentId, setSelectedRentId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [items, setItems] = useState([]);
  const [rents, setRents] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [time, setTime] = useState(""); // counting remaining time
  const [loading, setLoading] = useState(false); // Add loading state
  const [loadingSelected, setLoadingSelected] = useState(false); // Add loading state
  const [searchQuery, setSearchQuery] = useState(""); // New state for search input

  const reloadPage = () => {
    window.location.reload(); // Reload the current page
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

  // Fetch data from API for courses, items, rents, users, programmes, and item types
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) throw new Error("No token found");

  //       const [
  //         coursesResponse,
  //         itemsResponse,
  //         rentsResponse,
  //         programmesResponse,
  //         itemTypesResponse,
  //       ] = await Promise.all([
  //         axios.get("http://localhost:5000/courses", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //         axios.get("http://localhost:5000/items", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //         axios.get("http://localhost:5000/rents", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //         axios.get("http://localhost:5000/programmes", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //         axios.get("http://localhost:5000/item_types", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //       ]);

  //       setCourses(coursesResponse.data);
  //       setItems(itemsResponse.data);
  //       setRents(rentsResponse.data);
  //       setProgrammes(programmesResponse.data);
  //       setItemTypes(itemTypesResponse.data);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       const errorMessage =
  //         error.response?.data?.error || "Failed to fetch data.";
  //       setSnackbar({ open: true, message: errorMessage, severity: "error" });
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [
          coursesResponse,
          itemsResponse,
          rentsResponse,
          programmesResponse,
          itemTypesResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/courses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/rents?userId=${user.userId}`, {
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
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error.response?.data?.error || "Failed to fetch data.";
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData();
  }, [user.userId]);

  // LIVE SEARCH  and filter by status

  const [selectedStatus, setSelectedStatus] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle dropdown open and close
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setAnchorEl(null);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const sortedRents = rents
    .filter((rent) => rent.userId === user?.userId)
    .sort((a, b) => {
      const typeA =
        itemTypes.find((type) => type.itemTypeId === a.item.itemTypeId)
          ?.title || "";
      const typeB =
        itemTypes.find((type) => type.itemTypeId === b.item.itemTypeId)
          ?.title || "";
      return typeA.localeCompare(typeB);
    });

  const filteredRents = sortedRents.filter((rent) => {
    const matchesSearch = rent.applicationNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus = (() => {
      switch (selectedStatus) {
        case "Pending":
          return (
            (rent.rentCondition === "In_lab" ||
              rent.rentCondition === "Rented") &&
            rent.rentStatus === "Pending"
          );
        case "Approved":
          return (
            rent.rentCondition === "Rented" && rent.rentStatus === "Approved"
          );
        case "Returned":
          return (
            rent.rentCondition === "Returned" && rent.rentStatus === "Approved"
          );
        case "Cancelled":
          return (
            (rent.rentCondition === "In_lab" ||
              rent.rentCondition === "Rented") &&
            rent.rentStatus === "Cancelled"
          );
        default:
          return true; // Show all if no specific status is selected
      }
    })();

    return matchesSearch && matchesStatus;
  });

  // END LIVE SEARCH

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
        `http://localhost:5000/rents/cancelledRequest/${rentId}`,
        {
          rentStatus: "Cancelled",
          cancelledBy: `${user.fname} ${user.lname}`,
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
                rentStatus: "Cancelled",
                cancelledBy: `${user.fname} ${user.lname}`,
              }
            : rent
        )
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.error || "Failed to cancel this request.",
        severity: "error",
      });
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Print pdf
  // Print pdf
  const generateSelectedRecordPDF = async () => {
    if (!selectedRentId) {
      setSnackbar({
        open: true,
        message: "No record selected for PDF generation",
        severity: "error",
      });
      return;
    }

    const selectedRent = rents.find((rent) => rent.rentId === selectedRentId);
    if (!selectedRent) {
      setSnackbar({
        open: true,
        message: "Selected record not found",
        severity: "error",
      });
      return;
    }

    // Check if the rent request is approved
    if (!selectedRent.approvedBy) {
      setSnackbar({
        open: true,
        message: "Cannot generate report for unapproved requests",
        severity: "warning",
      });
      return;
    }

    const email = user?.email || "Unknown";
    const fname = user?.fname || "Unknown";
    const lname = user?.lname || "Uploader";
    const rentedBy = `${selectedRent.rentBy || "N/A"}`;
    const approvedBy = `${selectedRent.approvedBy || "N/A"}`;

    const doc = new jsPDF();

    // Add logos and header
    doc.addImage(logo1, "png", 10, 10, 20, 20);
    doc.addImage(logo, "PNG", doc.internal.pageSize.width - 60, 10, 50, 20);

    doc.setFontSize(12);
    doc.text(
      "UR-CST ACEIoT",
      doc.internal.pageSize.width / 2,
      20,
      null,
      null,
      "center"
    );
    doc.setFontSize(10);
    doc.text(
      "Selected Borrowed Item Report",
      doc.internal.pageSize.width / 2,
      27,
      null,
      null,
      "center"
    );

    // Blue header section
    doc.setFillColor(0, 0, 255);
    doc.rect(10, 35, doc.internal.pageSize.width - 20, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(
      `Generated by: ${fname} ${lname} (${email})`,
      doc.internal.pageSize.width / 2,
      47,
      null,
      null,
      "center"
    );
    doc.setTextColor(0, 0, 0);

    // User Information Section
    doc.setFontSize(14);
    doc.text(
      "User Information",
      doc.internal.pageSize.width / 2,
      80,
      null,
      null,
      "center"
    );
    doc.line(10, 82, doc.internal.pageSize.width - 10, 82);

    doc.setFontSize(10);
    const leftX = 14,
      rightX = 80;

    doc.text("Name:", leftX, 90);
    doc.text(
      `${selectedRent.user?.lname || "N/A"} ${selectedRent.user?.fname || ""}`,
      rightX,
      90
    );

    doc.text("Level of Education:", leftX, 100);
    doc.text(
      programmes.find((p) => p.programmeId === selectedRent.course.programmeId)
        ?.programmeTitle || "N/A",
      rightX,
      100
    );

    doc.text("Course:", leftX, 110);
    doc.text(selectedRent.course?.courseTitle || "N/A", rightX, 110);

    // Item Information Section
    doc.setFontSize(14);
    doc.text(
      "Item Information",
      doc.internal.pageSize.width / 2,
      130,
      null,
      null,
      "center"
    );
    doc.line(10, 132, doc.internal.pageSize.width - 10, 132);

    doc.setFontSize(10);
    const itemCategory =
      itemTypes.find((t) => t.itemTypeId === selectedRent.item.itemTypeId)
        ?.title || "N/A";

    doc.text("Item Category:", leftX, 140);
    doc.text(itemCategory, rightX, 140);

    doc.text("Description:", leftX, 150);
    doc.text(selectedRent.item?.name || "N/A", rightX, 150);

    doc.text("Serial Number:", leftX, 160);
    doc.text(selectedRent.item?.serialNumber || "N/A", rightX, 160);

    doc.text("Lab Code:", leftX, 170);
    doc.text(selectedRent.item?.labCode || "N/A", rightX, 170);

    doc.text("Expected Return Date:", leftX, 180);
    doc.text(
      new Date(selectedRent.expectedReturnDate).toLocaleDateString(),
      rightX,
      180
    );

    doc.text("Condition:", leftX, 190);
    doc.text(selectedRent.rentCondition || "N/A", rightX, 190);

    doc.text("Status:", leftX, 200);
    doc.text(selectedRent.rentStatus || "N/A", rightX, 200);

    // Line above user information and QR code
    doc.line(10, 205, doc.internal.pageSize.width - 10, 205);

    // QR Code generation
    try {
      const qrContent = `
      Borrowed By: ${selectedRent.user?.lname || ""} ${
        selectedRent.user?.fname || ""
      }
      Borrower Email: ${selectedRent.user?.email || "N/A"}
      Item: ${selectedRent.item?.name || "N/A"}
      Serial Number: ${selectedRent.item?.serialNumber || "N/A"}
      Category: ${itemCategory}
      Condition: ${selectedRent.rentCondition || "N/A"}
      Status: ${selectedRent.rentStatus || "N/A"}
      Rented By: ${selectedRent.rentBy || "N/A"}
      Approved By: ${selectedRent.approvedBy || "N/A"}
    `;

      const qrResponse = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
          qrContent
        )}`
      );
      const qrBlob = await qrResponse.blob();
      const qrReader = new FileReader();

      qrReader.onload = () => {
        const qrX = doc.internal.pageSize.width - 64;
        const userInfoX = qrX - 132;

        // Adding the "Rent By" section
        doc.setFontSize(10);
        doc.text("Rented By:", userInfoX, 220); // This displays the label
        doc.text(rentedBy, userInfoX + 30, 220); // This displays the name of the person who rented the item

        // Adding the "Approved By" section
        doc.text("Approved By:", userInfoX, 230); // This displays the label
        doc.text(approvedBy, userInfoX + 30, 230); // This displays the name of the person who approved the rent

        doc.addImage(qrReader.result, "PNG", qrX, 210, 50, 50);
        doc.line(10, 262, doc.internal.pageSize.width - 10, 262);

        // Footer
        const footerY = doc.internal.pageSize.height - 20;
        doc.setFillColor(0, 0, 255);
        doc.rect(10, footerY, doc.internal.pageSize.width - 20, 20, "F");
        doc.setTextColor(255, 255, 255);

        const footerText = `Report generated on: ${new Date().toLocaleDateString()} | printed by: ${fname} ${lname}`;
        doc.text(footerText, 15, footerY + 10);
        doc.textWithLink("aceiot.ur.ac.rw", 125, footerY + 10, {
          url: "https://aceiot.ur.ac.rw/",
        });
        doc.textWithLink("| ur.ac.rw", 150, footerY + 10, {
          url: "https://ur.ac.rw/",
        });

        // Get today's date in 'YYYY-MM-DD' format
        const today = new Date().toISOString().split("T")[0];

        doc.save(`rent-report-${selectedRent.item?.serialNumber}-${today}.pdf`);
      };

      qrReader.readAsDataURL(qrBlob);
    } catch (error) {
      console.error("QR Code generation failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate QR code",
        severity: "error",
      });
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
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <>
            {/* Buttons */}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              className="d-none d-sm-inline-block"
            >
              <Link
                to="/borrow"
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                Borrow Another Item
              </Link>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              className="d-none d-sm-inline-block"
            >
              {(user.position === "IT" || user.position === "Director") && (
                <Link
                  to="/rents"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  View All Lab Rent Report
                </Link>
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <Button
                  onClick={handleClick}
                  variant="outlined"
                  fullWidth
                  endIcon={<SearchIcon />}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 15px",
                    color: "primary.main",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  {selectedStatus || "Filter By Status"}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => handleStatusFilterChange("")}>
                    All Request
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusFilterChange("Pending")}>
                    Pending Request
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleStatusFilterChange("Approved")}
                  >
                    Approved/Borrowed Request
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleStatusFilterChange("Returned")}
                  >
                    Returned Request
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleStatusFilterChange("Cancelled")}
                  >
                    Rejected Request
                  </MenuItem>
                </Menu>
              </FormControl>
            </Grid>

            {/* Search Input Field */}
            <Grid
              item
              xs={12} // Full width on extra-small screens and up
              sm={6} // Half-width on small screens
              md={3} // Quarter-width on medium and larger screens
              sx={{
                marginTop: "5px",
                paddingX: { xs: 2, sm: 0 }, // Add padding on mobile for better spacing
              }}
            >
              <FormControl fullWidth variant="outlined">
                <TextField
                  label="Search by Application No"
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    padding: { xs: 1, sm: 0 }, // Padding adjustment for mobile devices
                  }}
                />
              </FormControl>
            </Grid>
          </>
        </Grid>

        <h2>Borrowed Item's Records</h2>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Application Number</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Level of Education</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Item Category</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Expected Return Date</TableCell>
              <TableCell>Rent Condition</TableCell>
              <TableCell>Rent Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRents.length > 0 ? (
              paginatedRents.map((rent, index) => {
                const remainingTime = () => {
                  if (
                    rent.rentCondition === "Rented" &&
                    rent.rentStatus === "Approved" &&
                    new Date(rent.expectedReturnDate) > new Date()
                  ) {
                    // Use setInterval directly here if time hasn't been set
                    if (!time) {
                      setInterval(() => {
                        const timeDiff =
                          new Date(rent.expectedReturnDate).getTime() -
                          new Date().getTime();
                        const seconds = Math.floor(timeDiff / 1000);
                        const minutes = Math.floor(seconds / 60);
                        const hours = Math.floor(minutes / 60);
                        const days = Math.floor(hours / 24);
                        const remainingHours = hours % 24;
                        const remainingMinutes = minutes % 60;
                        const remainingSeconds = seconds % 60;

                        // Update the time state to re-render the countdown
                        setTime(
                          `${days} days, ${remainingHours} hours, ${remainingMinutes} minutes, ${remainingSeconds} seconds`
                        );
                      }, 1000);
                    }
                    return time;
                  }
                  return null;
                };

                return (
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
                        {new Date(rent.expectedReturnDate).toLocaleDateString()}
                      </TableCell>
                      {/* <TableCell>{rent.rentCondition}</TableCell> */}
                      {/* Rent Condition */}
                      <TableCell>
                        {rent.rentCondition === "Rented" &&
                        rent.rentStatus === "Approved" ? (
                          <>
                            {new Date() > new Date(rent.expectedReturnDate) ? (
                              <Typography variant="body2">
                                <span
                                  style={{ color: "red", fontWeight: "bold" }}
                                >
                                  {`Not returned `}
                                </span>
                              </Typography>
                            ) : (
                              <Typography variant="body2">
                                <span
                                  style={{ color: "blue", fontWeight: "bold" }}
                                >
                                  Waiting Return
                                </span>
                              </Typography>
                            )}
                          </>
                        ) : rent.rentCondition === "Returned" &&
                          rent.rentStatus === "Approved" ? (
                          <Typography variant="body2">
                            <span
                              style={{ color: "green", fontWeight: "bold" }}
                            >
                              Returned
                            </span>
                          </Typography>
                        ) : rent.rentCondition === "In_lab" ||
                          rent.rentCondition === "Rented" ? (
                          <Typography variant="body2">
                            <span
                              style={{ color: "orange", fontWeight: "bold" }}
                            >
                              In Store
                            </span>
                          </Typography>
                        ) : null}
                      </TableCell>
                      {/* END RENT CONDITION */}
                      <TableCell>
                        <Typography
                          variant="body2"
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
                        </Typography>
                      </TableCell>
                    </TableRow>


                                      {/* LOADING DATA ONCE ROW IS CLICKED */}
                  {loadingSelected === rent.rentId ? (
                    <TableCell colSpan={10}>
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




                    {selectedRentId === rent.rentId && (
                      <TableRow>
                        <TableCell colSpan={10}>
                          <Collapse in={selectedRentId === rent.rentId}>
                            <Box margin={1}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
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
                                </Grid>
                                <Grid item xs={12} md={4}></Grid>
                                <Grid item xs={12} md={4}>
                                  {rent.rentCondition === "Rented" &&
                                    rent.rentStatus === "Approved" &&
                                    new Date(rent.expectedReturnDate) >
                                      new Date() && ( // Ensure the expected return date is in the future
                                      <>
                                        <Typography
                                          variant="body2"
                                          sx={{ mb: 2 }}
                                        >
                                          <b>Remaining Return Time:</b>
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          style={{ fontSize: "15px" }}
                                        >
                                          <span className="text-danger">
                                            {remainingTime()}
                                          </span>
                                        </Typography>
                                      </>
                                    )}
                                </Grid>
                              </Grid>
                              <hr style={{ color: "white" }} />

                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
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
                                    <b>RegNo:</b> {rent.user.userUniversityCode}
                                  </Typography>
                                  <Typography variant="body2">
                                    <b>Email:</b> {rent.user.email}
                                  </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
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

                                  {rent.rentCondition === "Returned" && (
                                    <>
                                      <Typography variant="body2">
                                        <b>Returned Date:</b>{" "}
                                        {new Date(
                                          rent.returnDate
                                        ).toLocaleDateString()}
                                      </Typography>
                                      <Typography variant="body2">
                                        <b>Status:</b>{" "}
                                        {new Date(rent.returnDate) <=
                                        new Date(rent.expectedReturnDate) ? (
                                          <span
                                            style={{
                                              color: "green",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            Submitted on time
                                          </span>
                                        ) : (
                                          <span
                                            style={{
                                              color: "red",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {`Delayed by ${Math.ceil(
                                              (new Date(rent.returnDate) -
                                                new Date(
                                                  rent.expectedReturnDate
                                                )) /
                                                (1000 * 60 * 60 * 24)
                                            )} day(s)`}
                                          </span>
                                        )}
                                      </Typography>
                                    </>
                                  )}

                                  {rent.rentCondition === "Rented" &&
                                    rent.rentStatus === "Approved" && (
                                      <>
                                        {new Date() >
                                        new Date(rent.expectedReturnDate) ? (
                                          <Typography variant="body2">
                                            <b>Status:</b>{" "}
                                            <span
                                              style={{
                                                color: "red",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              {`Not returned - Exceeded by ${Math.ceil(
                                                (new Date() -
                                                  new Date(
                                                    rent.expectedReturnDate
                                                  )) /
                                                  (1000 * 60 * 60 * 24)
                                              )} day(s)`}
                                            </span>
                                          </Typography>
                                        ) : (
                                          <Typography variant="body2">
                                            <b>Status:</b>{" "}
                                            <span
                                              style={{
                                                color: "blue",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              Waiting Return
                                            </span>
                                          </Typography>
                                        )}
                                      </>
                                    )}

                                  {(user.position === "Student" ||
                                    user.position === "IT" ||
                                    user.position === "Director") &&
                                    rent.rentCondition === "In_lab" &&
                                    rent.rentStatus === "Pending" && (
                                      <Button
                                        className="btn btn-danger bg-danger text-white"
                                        style={{ marginTop: "15px" }}
                                        onClick={() =>
                                          handleCancelButton(rent.rentId)
                                        }
                                      >
                                        Cancel Request
                                      </Button>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={4}>
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
                                      <b>Rented By:</b> {rent.rentBy || "N/A"}
                                    </Typography>
                                  )}
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
                                  {rent.rentStatus === "Cancelled" && (
                                    <Typography variant="body2">
                                      <b>Cancelled By:</b>{" "}
                                      {rent.cancelledBy || "N/A"}
                                    </Typography>
                                  )}
                                  {rent.rentCondition === "Rented" &&
                                    rent.rentStatus === "Approved" && (
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        style={{ marginTop: "20px" }}
                                        onClick={generateSelectedRecordPDF}
                                      >
                                        Generate Report
                                      </Button>
                                    )}
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                    </>
                  )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-danger">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <Button
            className="text-danger"
            startIcon={<RefreshIcon />}
            onClick={reloadPage}
          >
            Reload
          </Button>
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

      <Snackbar
        style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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

export default MyReportBorrowedList;
