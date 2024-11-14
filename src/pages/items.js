import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  IconButton,
  Link,
  Toolbar,
  Modal,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
  Menu,
  Collapse,
  TablePagination,
  CircularProgress,
  InputAdornment,
  Skeleton,
  OutlinedInput,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add"; // Import Add icon
import axios from "axios";
import logo from "../assets/images/logo1.PNG";
import logo1 from "../assets/images/logo.png";

import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Items = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    serialNumber: "",
    labCode: "",
    name: "",
    status: "",
    comment: "",
    itemTypeId: "",
    userId: "",
  });
  const [itemTypes, setItemTypes] = useState([]);
  const [statusFilter, setStatusFilter] = useState(""); // Track the status filter
  const [user1, setUser] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [filter, setFilter] = useState({ itemTypeId: "", userId: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isAddNewRecord, setIsAddNewRecord] = useState(false); // Toggle for Add Item Form
  const [selectedItemId, setSelectedItemId] = useState(null); // Store selected item by ID
  const [isEditMode, setIsEditMode] = useState(false); // For toggling edit form visibility
  const [isDeactivateMode, setIsDeactivateMode] = useState(false); // For toggling deactivate form visibility
  const [deactivateComment, setDeactivateComment] = useState(""); // For deactivate comment
  const [searchQuery, setSearchQuery] = useState("");

  // const [selectedItemId, setSelectedItemId] = useState(null); // State to track selected record
  // State variables to manage form visibility
  const [editFormsVisibility, setEditFormsVisibility] = useState({});
  const [deactivateFormsVisibility, setDeactivateFormsVisibility] = useState(
    {}
  );
  const { user } = useAuth();

  // page protection to users
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Add loading state
  const [loadingSelected, setLoadingSelected] = useState(false); // Add loading state
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    // Redirect to NotFound route if user position is not "IT" or "Director"
    if (user?.position !== "IT") {
      navigate("/restricted_page");
    }
  }, [user, navigate]);
  // end page protection to users

  useEffect(() => {
    // Set userId to newItem when user data is available
    if (user) {
      setNewItem((prev) => ({ ...prev, userId: user.userId }));
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
    fetchItemTypes();
  }, [filter]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "http://localhost:5000/items";
      if (filter.itemTypeId) {
        url = `http://localhost:5000/items/type/${filter.itemTypeId}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/item_types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItemTypes(response.data);
    } catch (error) {
      console.error("Error fetching item types:", error);
    }
  };

  // const handleRowClick = (itemId) => {
  //   setSelectedItemId(selectedItemId === itemId ? null : itemId);
  // };
  const handleRowClick = (itemId) => {
    setLoadingSelected(itemId); // Set loading for the specific rentId

    // Simulate a loading period
    setTimeout(() => {
      setSelectedItemId(selectedItemId === itemId ? null : itemId);
      setLoadingSelected(null); // Reset loading after selection
    }, 500); // Adjust delay as needed
  };

  // Use useEffect to stop loading once selectedRentId is set
  useEffect(() => {
    if (selectedItemId !== null) {
      // Set loading to false after a short delay
      const timer = setTimeout(() => {
        setLoadingSelected(false);
      }, 500); // Adjust the delay as needed

      return () => clearTimeout(timer); // Clear timeout on cleanup
    } else {
      setLoadingSelected(false); // If no rent selected, stop loading
    }
  }, [selectedItemId]);
  // const fetchUser = async (email) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.get("http://localhost:5000/users", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setUser(response.data);
  //     const userRecord = response.data.find((u) => u.email === email);
  //     if (userRecord) {
  //       setNewItem((prev) => ({ ...prev, userId: userRecord.userId }));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //   }
  // };

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e, item) => {
    const { name, value } = e.target;
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.itemId === item.itemId ? { ...i, [name]: value } : i
      )
    );
  };

  const handleSubmitEdit = async (e, item) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/items/${item.itemId}`,
        {
          serialNumber: item.serialNumber,
          labCode: item.labCode,
          name: item.name,
          status: item.status,
          comment: item.comment,
          updatedBy: `${user.fname} ${user.lname}`,
          itemTypeId: item.itemTypeId, // Use itemTypeId instead of title
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Assuming backend sends { message: 'Item successfully updated.', item }
      setSnackbarMessage(response.data.message || "Item updated successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchItems(); // Refresh the list after update
      setSelectedItemId(null); // Clear selection
      setIsEditMode(false);
    } catch (error) {
      // Set error message from backend or fallback to default
      const errorMessage =
        error.response?.data?.error || "Failed to update item.";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const handleDeactivateSubmit = async (item) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/items/${item.itemId}`,
        {
          status: "Destroyed",
          comment: deactivateComment,
          updatedBy: `${user.fname} ${user.lname}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbarMessage(
        response.data.message || "Item successfully deactivated."
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchItems(); // Refresh the list after deactivation
      setSelectedItemId(null); // Clear selection
      setIsDeactivateMode(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to deactivate item.";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/items", newItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Item successfully added.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchItems(); // Refresh the list
      setNewItem({
        serialNumber: "",
        labCode: "",
        name: "",
        status: "",
        comment: "",
        itemTypeId: "",
        userId: user.userId,
      }); // Reset form
      setIsAddNewRecord(false); // Close the form
    } catch (error) {
      if (error.response && error.response.data.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Failed to add item. Please try again.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => {
        setLoading(false); // Hide loading spinner after delay
      }, 500); // Adjust delay time as needed (500ms here)f
    }
  };

  // ITEM STATUS (WORKING AND DESTROYED BUTTONS)
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status); // Set the selected status filter
  };

  // LIVE SEARCH
  const filteredItems = statusFilter
    ? items.filter(
        (item) =>
          item.status === statusFilter &&
          (item.serialNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            item.labCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : items.filter(
        (item) =>
          item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.labCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  // LIVE SEARCH

  // report generation
  // State for dropdown menu and report modals
  const [anchorEl, setAnchorEl] = useState(null);
  const [openWorking, setOpenWorking] = useState(false);
  const [openDestroyed, setOpenDestroyed] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Handlers for dropdown menu
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  // Handlers for Working Items modal
  const handleOpenWorking = () => {
    setOpenWorking(true);
    handleCloseMenu();
  };
  const handleCloseWorking = () => setOpenWorking(false);

  // Handlers for Destroyed Items modal
  const handleOpenDestroyed = () => {
    setOpenDestroyed(true);
    handleCloseMenu();
  };
  const handleCloseDestroyed = () => setOpenDestroyed(false);

  const [errorMessage, setErrorMessage] = useState("");
  // WORKING ITEM PDF
  const generateReports = () => {
    const doc = new jsPDF("landscape"); // Set document to landscape

    // Get today's date in 'YYYY-MM-DD' format for file naming
    const today = new Date().toISOString().split("T")[0];

    // Add logos with adjusted size and spacing
    doc.addImage(logo1, "PNG", 10, 10, 40, 30); // Left logo with a larger size for prominence
    doc.addImage(logo, "PNG", 250, 10, 40, 30); // Right logo aligned for landscape layout

    // Position header text below the left logo
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("UR-CST ACEIoT", 10, 50); // Main title under the left logo

    // Add a subtitle with slightly reduced font size and line spacing
    doc.setFontSize(14);
    doc.text("LAB MANAGEMENT SYSTEM", 10, 60); // Positioned under the main title

    // Further subtitle for the report type, styled smaller and with consistent line spacing
    doc.setFontSize(12);
    doc.text("List of Working Items Report", 10, 70); // Positioned below the system name

    // Add the date aligned with the other headers for a cohesive look
    doc.text(`Date: ${today}`, 10, 80); // Positioned below report type with spacing

    // Define columns for the table
    const columns = [
      { header: "#", dataKey: "No" },
      { header: "Serial Number", dataKey: "serialNumber" },
      { header: "Lab Code", dataKey: "labCode" },
      { header: "Name", dataKey: "name" },
      { header: "Item Type", dataKey: "itemType" },
      { header: "Uploaded By", dataKey: "uploadedBy" },
    ];

    // Adjust toDate by adding 1 day
    const adjustedToDate = new Date(toDate);
    adjustedToDate.setDate(adjustedToDate.getDate() + 1);

    // Filter working items
    const filteredWorkingItems = filteredItems.filter(
      (item) =>
        item.status === "Working" &&
        new Date(item.updatedAt) >= new Date(fromDate) &&
        new Date(item.updatedAt) <= adjustedToDate
    );

    if (filteredWorkingItems.length === 0) {
      // Show error message if no items found
      setErrorMessage(
        "No report found in the selected date range for Working Items."
      );
      return;
    }

    // Prepare rows for the table
    const rows = filteredWorkingItems.map((item, index) => ({
      No: index + 1,
      serialNumber: item.serialNumber,
      labCode: item.labCode,
      name: item.name,
      itemType: item.itemType ? item.itemType.title : "N/A",
      uploadedBy: `${item.user.fname} ${item.user.lname}`,
    }));

    // Generate table
    autoTable(doc, {
      startY: 90, // Start the table a bit lower to accommodate logos and headers
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 },
        3: { cellWidth: 45 },
        4: { cellWidth: 45 },
        5: { cellWidth: 55 },
      },
      tableWidth: "auto",
      margin: { left: 10, right: 10 },
    });

    // Positioning for the signatures section
    let finalY = doc.lastAutoTable.finalY + 20;

    // Check if there's space for the signatures section; if not, add a new page
    if (finalY + 40 > doc.internal.pageSize.height - 10) {
      doc.addPage();
      finalY = 20; // Reset position on the new page
    }

    // Get the first user's name for the "Prepared by" section
    const preparedByName = `${filteredWorkingItems[0].user.fname} ${filteredWorkingItems[0].user.lname}`;

    // Add "Approved By" and "Prepared By" sections with signatures
    doc.setFontSize(12);
    doc.text("Approved By:", 10, finalY);
    doc.line(40, finalY, 100, finalY); // Line for signature

    doc.text("Signature:", 10, finalY + 20);
    doc.line(40, finalY + 20, 100, finalY + 20); // Line for signature

    // Prepared By and Signature Section (aligned to the right)
    const rightX = 160; // Adjusted for landscape
    doc.text("Prepared By:", rightX, finalY);
    doc.text(preparedByName, rightX + 40, finalY); // User's name

    doc.text("Signature:", rightX, finalY + 20);
    doc.line(rightX + 40, finalY + 20, rightX + 80, finalY + 20); // Line for signature

    // "Prepared on" date below the "Prepared By" signature line
    doc.text(`Prepared on: ${today}`, rightX, finalY + 40); // Positioned below "Prepared By" signature

    // Save the PDF with file naming format
    doc.save(`Working_Items_Report_${preparedByName}_${today}.pdf`);

    const worksheetData = [
      ["LIST OF Working Items Report"],
      columns.map((col) => col.header),
      ...rows.map((row) => columns.map((col) => row[col.dataKey])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
    ];
    worksheet["A1"].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center" },
    };
    worksheet["!autofilter"] = { ref: `A2:E${worksheetData.length}` };

    const maxWidths = worksheetData[1].map((_, colIndex) =>
      Math.max(
        ...worksheetData.map((row) => String(row[colIndex] || "").length)
      )
    );
    worksheet["!cols"] = maxWidths.map((width) => ({
      width: width < 10 ? 10 : width,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items Report");
    XLSX.writeFile(
      workbook,
      `Working_Items_Report_${preparedByName}_${today}.xlsx`
    );

    handleCloseWorking();
  };

  // DESTROYED ITEM PDF
  const generateDestroyedReports = () => {
    // Initialize document in landscape
    const doc = new jsPDF("landscape");

    // Get today's date in 'YYYY-MM-DD' format
    const today = new Date().toISOString().split("T")[0];

    // Add logos with adjusted size and spacing
    doc.addImage(logo1, "PNG", 10, 10, 40, 30); // Left logo with larger size for prominence
    doc.addImage(logo, "PNG", 250, 10, 40, 30); // Right logo aligned for landscape layout

    // Position header text below the left logo
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("UR-CST ACEIoT", 10, 50); // Main title under the left logo

    // Subtitle with smaller font size and line spacing
    doc.setFontSize(14);
    doc.text("LAB MANAGEMENT SYSTEM", 10, 60); // Positioned under the main title

    // Report type subtitle
    doc.setFontSize(12);
    doc.text("List of Destroyed Items Report", 10, 70); // Positioned below system name

    // Date aligned with headers
    doc.text(`Date: ${today}`, 10, 80); // Positioned below report type

    // Define table columns
    const columns = [
      { header: "#", dataKey: "No" },
      { header: "Serial Number", dataKey: "serialNumber" },
      { header: "Lab Code", dataKey: "labCode" },
      { header: "Name", dataKey: "name" },
      { header: "Item Type", dataKey: "itemType" },
      { header: "Reason", dataKey: "comment" },
      { header: "Uploaded By", dataKey: "uploadedBy" },
    ];

    // Adjust toDate by adding 1 day
    const adjustedToDate = new Date(toDate);
    adjustedToDate.setDate(adjustedToDate.getDate() + 1);

    // Filter working items
    const filteredWorkingItems = filteredItems.filter(
      (item) =>
        item.status === "Destroyed" &&
        new Date(item.updatedAt) >= new Date(fromDate) &&
        new Date(item.updatedAt) <= adjustedToDate
    );

    if (filteredWorkingItems.length === 0) {
      setErrorMessage(
        "No report found in the selected date range for Destroyed Items."
      );
      return;
    }

    // Prepare rows for the table
    const rows = filteredWorkingItems.map((item, index) => ({
      No: index + 1,
      serialNumber: item.serialNumber,
      labCode: item.labCode,
      name: item.name,
      itemType: item.itemType ? item.itemType.title : "N/A",
      comment: item.comment,
      uploadedBy: `${item.user.fname} ${item.user.lname}`,
    }));

    // Generate table
    autoTable(doc, {
      startY: 90, // Start the table lower to accommodate logos and headers
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 },
        3: { cellWidth: 45 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 },
        6: { cellWidth: 45 },
      },
      tableWidth: "auto",
      margin: { left: 10, right: 10 },
    });

    // Positioning for the signatures section
    let finalY = doc.lastAutoTable.finalY + 20;

    // Check if there's space for the signatures section; if not, add a new page
    if (finalY + 40 > doc.internal.pageSize.height - 10) {
      doc.addPage();
      finalY = 20; // Reset position on the new page
    }

    // Get the first user's name for the "Prepared by" section
    const preparedByName = `${filteredWorkingItems[0].user.fname} ${filteredWorkingItems[0].user.lname}`;

    // Add "Approved By" and "Prepared By" sections with signatures
    doc.setFontSize(12);
    doc.text("Approved By:", 10, finalY);
    doc.line(40, finalY, 100, finalY); // Line for signature

    doc.text("Signature:", 10, finalY + 20);
    doc.line(40, finalY + 20, 100, finalY + 20); // Line for signature

    // Prepared By and Signature Section (aligned to the right)
    const rightX = 160; // Adjusted for landscape
    doc.text("Prepared By:", rightX, finalY);
    doc.text(preparedByName, rightX + 40, finalY); // User's name

    doc.text("Signature:", rightX, finalY + 20);
    doc.line(rightX + 40, finalY + 20, rightX + 80, finalY + 20); // Line for signature

    // "Prepared on" date below the "Prepared By" signature line
    doc.text(`Prepared on: ${today}`, rightX, finalY + 40); // Positioned below "Prepared By" signature

    doc.save(`Items_Destroyed_Report_${preparedByName}_${today}.pdf`);

    const worksheetData = [
      ["LIST OF Destroyed Items Report"],
      columns.map((col) => col.header),
      ...rows.map((row) => columns.map((col) => row[col.dataKey])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
    ];
    worksheet["A1"].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center" },
    };
    worksheet["!autofilter"] = { ref: `A2:E${worksheetData.length}` };

    const maxWidths = worksheetData[1].map((_, colIndex) =>
      Math.max(
        ...worksheetData.map((row) => String(row[colIndex] || "").length)
      )
    );
    worksheet["!cols"] = maxWidths.map((width) => ({
      width: width < 10 ? 10 : width,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items Report");
    XLSX.writeFile(
      workbook,
      `Items_Destroyed_Report_${preparedByName}_${today}.xlsx`
    );

    handleCloseDestroyed();
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
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // END OF PAGINATION
  return (
    <Container>
      <Toolbar sx={{ mt: 2 }} />
      <Box mb={0}>
        <Grid container spacing={2} alignItems="center">
          {/* Add New Item Button */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              title={isAddNewRecord ? "Close Form" : "Add New Record"}
              variant="contained"
              startIcon={isAddNewRecord ? <CloseIcon /> : <AddIcon />}
              onClick={() => setIsAddNewRecord(!isAddNewRecord)}
              sx={{
                backgroundColor: isAddNewRecord ? "error.main" : "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: isAddNewRecord
                    ? "error.dark"
                    : "primary.dark",
                },
              }}
              fullWidth
            >
              {isAddNewRecord ? "Close" : "Add New Record"}
            </Button>
          </Grid>

          {/* Working Filter Button */}
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            sx={{ display: { xs: "none", sm: "none" } }}
          >
            <Button
              variant="contained"
              onClick={() => handleStatusFilterChange("Working")}
              sx={{ backgroundColor: "success.main", color: "white" }}
              fullWidth
            >
              Working
            </Button>
          </Grid>

          {/* Destroyed Filter Button */}
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            sx={{ display: { xs: "none", sm: "none" } }}
          >
            <Button
              variant="contained"
              onClick={() => handleStatusFilterChange("Destroyed")}
              sx={{ backgroundColor: "error.main", color: "white" }}
              fullWidth
            >
              Destroyed
            </Button>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            sx={{ display: { xs: "none", sm: "none" } }}
          >
            <Button
              variant="contained"
              onClick={() => handleStatusFilterChange("")}
              sx={{ backgroundColor: "error.main", color: "white" }}
              fullWidth
            >
              All
            </Button>
          </Grid>

          {/* // JSX for the Export Reports Dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenMenu}
              fullWidth
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              <i className="fas fa-download fa-sm text-white-50"></i> Export
              Reports
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenWorking}>
                Export Working Items
              </MenuItem>
              <MenuItem onClick={handleOpenDestroyed}>
                Export Destroyed Items
              </MenuItem>
            </Menu>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Item Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                label="Filter by Item Status"
                input={
                <OutlinedInput
                  label="Filter by Position"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                />
              }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Working">Working</MenuItem>
                <MenuItem value="Destroyed">Destroyed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Working Items Report Modal */}
        <Dialog open={openWorking} onClose={handleCloseWorking}>
          <DialogTitle>Export Working Items Report (PDF and Excel)</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="From"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: new Date().toISOString().split("T")[0], // Sets the maximum date to today
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="To"
                  type="date"
                  value={toDate}
                  sx={{ mt: 2 }}
                  onChange={(e) => setToDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: new Date().toISOString().split("T")[0], // Sets the maximum date to today
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseWorking} color="secondary">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                generateReports();
              }}
              disabled={!fromDate || !toDate}
            >
              Download Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for error message */}
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={() => setErrorMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setErrorMessage("")}
            severity="error"
            sx={{ width: "100%" }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>

        {/* Destroyed Items Report Modal */}
        <Dialog open={openDestroyed} onClose={handleCloseDestroyed}>
          <DialogTitle>
            Export Destroyed Items Report (PDF and Excel)
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="From"
                  type="date"
                  value={fromDate}
                  sx={{ mt: 2 }}
                  onChange={(e) => setFromDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: new Date().toISOString().split("T")[0], // Sets the maximum date to today
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="To"
                  type="date"
                  value={toDate}
                  sx={{ mt: 2 }}
                  onChange={(e) => setToDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: new Date().toISOString().split("T")[0], // Sets the maximum date to today
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDestroyed} color="secondary">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={generateDestroyedReports}
              disabled={!fromDate || !toDate}
            >
              Download Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for error message */}
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={() => setErrorMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setErrorMessage("")}
            severity="error"
            sx={{ width: "100%" }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>

      {isAddNewRecord && (
        <Box mt={3}>
          <Typography variant="h6">Add New Item</Typography>
          <form onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  name="serialNumber"
                  value={newItem.serialNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lab Code"
                  name="labCode"
                  value={newItem.labCode}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={newItem.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="itemTypeId-label">Item Type</InputLabel>
                  <Select
                    labelId="itemTypeId-label"
                    name="itemTypeId"
                    value={newItem.itemTypeId}
                    onChange={handleChange}
                    required
                  >
                    {itemTypes.map((type) => (
                      <MenuItem key={type.itemTypeId} value={type.itemTypeId}>
                        {type.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status and conditional comment section */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={newItem.status}
                    onChange={handleChange}
                  >
                    <MenuItem value="Working">Working</MenuItem>
                    <MenuItem value="Destroyed">Destroyed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Conditionally show comment field if status is 'Destroyed' */}
              {newItem.status === "Destroyed" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Reason for Destroyed"
                    name="comment"
                    value={newItem.comment}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    height: 56,
                    backgroundColor:
                      !newItem.name || !newItem.itemTypeId || !newItem.status
                        ? "primary.main"
                        : undefined, // Primary color when disabled
                    color:
                      !newItem.name || !newItem.itemTypeId || !newItem.status
                        ? "white"
                        : undefined, // Text color for readability when disabled
                    "&:disabled": {
                      backgroundColor: "primary.main", // Ensures primary color when disabled
                      color: "white", // Text color when disabled
                    },
                  }}
                  disabled={
                    !newItem.name || !newItem.itemTypeId || !newItem.status
                  }
                >
                  Add Item
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      )}

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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box
          component="h2"
          sx={{
            display: { xs: "none", sm: "block" }, // Hide on small devices
            margin: 0,
          }}
        >
          Lab Items Records
        </Box>

        {/* Add search input */}
        <Box
          sx={{
            mt: 2,
            marginLeft: { xs: 0, sm: "auto" }, // Align left on small screens, right on larger screens
            width: { xs: "100%", sm: "40%" }, // Full width on small screens, 40% on larger screens
            maxWidth: { xs: "100%", sm: "300px" }, // Max width of 300px only on larger screens
          }}
        >
          <TextField
            label="Search by Item name, serial number, lab code."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            Lab Item's Records
          </Box>
        </Grid>
      </div>

      <TableContainer
        component={Paper}
        sx={{ width: "100%", overflowX: "auto" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Lab Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Item Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Uploaded By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => ( */}
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item, index) => (
                <React.Fragment key={item.itemId}>
                  <TableRow
                    onClick={() => {
                      handleRowClick(
                        selectedItemId === item.itemId ? null : item.itemId
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.serialNumber}</TableCell>
                    <TableCell>{item.labCode}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {
                        itemTypes.find(
                          (type) => type.itemTypeId === item.itemTypeId
                        )?.title
                      }
                    </TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      {item.user?.fname} {item.user?.lname}
                    </TableCell>
                  </TableRow>

                  {/* LOADING DATA ONCE ROW IS CLICKED */}
                  {loadingSelected === item.itemId ? (
                    <TableCell colSpan={7}>
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
                      {/* Display Edit/Deactivate Buttons under the clicked record  and view details*/}
                      {selectedItemId === item.itemId && (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <Box mt={2}>
                              <Collapse
                                in={selectedItemId === item.itemId}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box margin={2}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                      <strong>Item Category:</strong>{" "}
                                      {
                                        itemTypes.find(
                                          (type) =>
                                            type.itemTypeId === item.itemTypeId
                                        )?.title
                                      }
                                      <br />
                                      <strong>Name:</strong> {item.name}
                                      <br />
                                      <br />
                                      <strong>Registered on:</strong>{" "}
                                      <span className="text-success">
                                        {new Date(
                                          item.createdAt
                                        ).toLocaleTimeString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                      <strong>Serial Number:</strong>{" "}
                                      {item.serialNumber}
                                      <br />
                                      <strong>Status:</strong>
                                      <span
                                        style={{
                                          color:
                                            item.status === "Destroyed"
                                              ? "red"
                                              : "green",
                                        }}
                                      >
                                        {" "}
                                        {item.status}
                                      </span>
                                      {item.status === "Destroyed" && (
                                        <span>
                                          <br />
                                          <strong>Reason:</strong>{" "}
                                          {item.comment}
                                        </span>
                                      )}
                                      <br />
                                      <strong>Last Update:</strong>{" "}
                                      {new Date(
                                        item.updatedAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                      <strong>Laboratory Code:</strong>{" "}
                                      {item.labCode}
                                      <br />
                                      <strong>Updated By:</strong>{" "}
                                      {item.updatedBy
                                        ? item.updatedBy
                                        : `${user.fname} ${user.lname}`}
                                      {/* UPDATE AND DEACTIVATE BUTTONS */}
                                      <br />
                                      <Button
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                        display="flex"
                                        gap={2}
                                        flexWrap="wrap"
                                        style={{
                                          backgroundColor: editFormsVisibility[
                                            item.itemId
                                          ]
                                            ? "red"
                                            : "#ff9800",
                                          color: "#fff",
                                        }}
                                        onClick={() => {
                                          setEditFormsVisibility((prev) => ({
                                            ...prev,
                                            [item.itemId]: !prev[item.itemId], // Toggle visibility for the specific item
                                          }));
                                        }}
                                      >
                                        {editFormsVisibility[item.itemId]
                                          ? "Close Form"
                                          : "Edit"}
                                      </Button>
                                      <Button
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                        style={{
                                          backgroundColor:
                                            deactivateFormsVisibility[
                                              item.itemId
                                            ]
                                              ? "red"
                                              : "secondary",
                                          color: "#fff",
                                          marginLeft: "20px",
                                        }}
                                        onClick={() => {
                                          setDeactivateFormsVisibility(
                                            (prev) => ({
                                              ...prev,
                                              [item.itemId]: !prev[item.itemId], // Toggle visibility for the specific item
                                            })
                                          );
                                        }}
                                      >
                                        {deactivateFormsVisibility[item.itemId]
                                          ? "Close Form"
                                          : "Deactivate"}
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </Collapse>
                            </Box>

                            {/* Edit Form */}
                            {editFormsVisibility[item.itemId] && (
                              <Box mt={3}>
                                <Typography variant="h6">Edit Item</Typography>
                                <form
                                  onSubmit={(e) => handleSubmitEdit(e, item)}
                                >
                                  <Grid container spacing={2}>
                                    {/* Serial Number Field */}
                                    <Grid item xs={12} sm={6} md={4}>
                                      <TextField
                                        fullWidth
                                        label="Serial Number"
                                        name="serialNumber"
                                        value={item.serialNumber}
                                        onChange={(e) =>
                                          handleEditChange(e, item)
                                        }
                                      />
                                    </Grid>

                                    {/* Lab Code Field */}
                                    <Grid item xs={12} sm={6} md={4}>
                                      <TextField
                                        fullWidth
                                        label="Lab Code"
                                        name="labCode"
                                        value={item.labCode}
                                        onChange={(e) =>
                                          handleEditChange(e, item)
                                        }
                                      />
                                    </Grid>

                                    {/* Item Type Selector */}
                                    <Grid item xs={12} sm={6} md={4}>
                                      <FormControl fullWidth>
                                        <InputLabel id="itemTypeId-label">
                                          Item Type
                                        </InputLabel>
                                        <Select
                                          labelId="itemTypeId-label"
                                          name="itemTypeId"
                                          value={item.itemTypeId}
                                          onChange={(e) =>
                                            handleEditChange(e, item)
                                          }
                                        >
                                          {itemTypes.map((itemType) => (
                                            <MenuItem
                                              key={itemType.itemTypeId}
                                              value={itemType.itemTypeId}
                                            >
                                              {itemType.title}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Grid>

                                    {/* Item Name Field */}
                                    <Grid item xs={12} sm={6} md={4}>
                                      <TextField
                                        fullWidth
                                        label="Item Name"
                                        name="name"
                                        value={item.name}
                                        onChange={(e) =>
                                          handleEditChange(e, item)
                                        }
                                      />
                                    </Grid>

                                    {/* Status Selector */}
                                    <Grid item xs={12} sm={6} md={4}>
                                      <FormControl fullWidth>
                                        <InputLabel id="status-label">
                                          Status
                                        </InputLabel>
                                        <Select
                                          labelId="status-label"
                                          name="status"
                                          value={item.status}
                                          onChange={(e) =>
                                            handleEditChange(e, item)
                                          }
                                        >
                                          <MenuItem value="Working">
                                            Working
                                          </MenuItem>
                                          <MenuItem value="Destroyed">
                                            Destroyed
                                          </MenuItem>
                                        </Select>
                                      </FormControl>
                                    </Grid>

                                    {/* Comment Field (Conditionally Displayed) */}
                                    {item.status === "Destroyed" && (
                                      <Grid item xs={12} sm={6} md={8}>
                                        <TextField
                                          fullWidth
                                          label="Comment"
                                          name="comment"
                                          value={item.comment || ""}
                                          onChange={(e) =>
                                            handleEditChange(e, item)
                                          }
                                          multiline
                                          rows={4}
                                          placeholder="Add a comment for why the item is destroyed"
                                        />
                                      </Grid>
                                    )}

                                    {/* Update Button */}
                                    <Grid item xs={12} sm={6} md={4}>
                                      <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ py: 1.5 }}
                                      >
                                        Update Item
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </form>
                              </Box>
                            )}
                            {/* // Deactivate Form */}
                            {deactivateFormsVisibility[item.itemId] && (
                              <Box mt={3}>
                                <Typography variant="h6">
                                  Deactivate Item
                                </Typography>
                                <Grid item xs={12} sm={6} md={8} sx={{ mb: 2 }}>
                                  <TextField
                                    label="Deactivation Comment"
                                    fullWidth
                                    value={
                                      deactivateComment || item.comment || ""
                                    } // Show existing comment or allow new input
                                    onChange={(e) =>
                                      setDeactivateComment(e.target.value)
                                    }
                                    multiline
                                    rows={4}
                                  />
                                </Grid>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={() => handleDeactivateSubmit(item)}
                                  fullWidth
                                >
                                  Deactivate
                                </Button>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" className="text-danger">
                  No Item's Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination Component */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Customize as needed
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Snackbar
        style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Items;
