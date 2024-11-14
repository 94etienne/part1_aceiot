import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Box,
  Paper,
  Toolbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Add, Send } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./../../context/authContext";
import { useMediaQuery } from "@mui/material";

const BorrowForm = () => {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [items, setItems] = useState([]);
  const [rents, setRents] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isLoading, setIsLoading] = useState(false); //LOADING FORM SUBMIT
  const [openDialog, setOpenDialog] = useState(false); // State for modal
  const isMobile = useMediaQuery("(max-width:600px)");

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [
          programmesResponse,
          coursesResponse,
          itemsResponse,
          rentsResponse,
          itemTypesResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/programmes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/courses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/rents", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/item_types", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProgrammes(programmesResponse.data);
        setCourses(coursesResponse.data);
        setItems(itemsResponse.data);
        setRents(rentsResponse.data);
        setItemTypes(itemTypesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error.response?.data?.error || "Failed to fetch data.";
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProgramme && courses.length > 0) {
      const filtered = courses.filter(
        (course) => course.programmeId === selectedProgramme
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [selectedProgramme, courses]);

  useEffect(() => {
    if (selectedItemType && items.length > 0 && rents.length > 0) {
      const filtered = items.filter(
        (item) =>
          item.itemTypeId === selectedItemType &&
          !rents.some(
            (rent) =>
              rent.itemId === item.itemId &&
              ((rent.rentCondition === "In_lab" &&
                rent.rentStatus === "Pending") ||
                (rent.rentCondition === "Rented" &&
                  rent.rentStatus === "Pending") ||
                (rent.rentCondition === "Rented" &&
                  rent.rentStatus === "Approved"))
          )
      );
      setFilteredItems(filtered);
    }
  }, [selectedItemType, items, rents]);

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };
  const handleDialogClose = (confirmed) => {
    setOpenDialog(false);
    if (confirmed) {
      confirmBorrowItem(); // Proceed with borrowing if confirmed
    }
  };
  const confirmBorrowItem = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = parseInt(user?.id || localStorage.getItem("userId"), 10);
      const rentData = {
        userId,
        itemId: selectedItem,
        courseIds: [selectedCourse],
        expectedReturnDate,
      };

      const response = await axios.post(
        "http://localhost:5000/rents",
        rentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({
        open: true,
        message: response.data.message || "Item successfully borrowed!",
        severity: "success",
      });

      setItems((prevItems) =>
        prevItems.filter((item) => item.itemId !== selectedItem)
      );
      setFilteredItems((prevFilteredItems) =>
        prevFilteredItems.filter((item) => item.itemId !== selectedItem)
      );
      setSelectedItem("");
      setExpectedReturnDate("");

      setTimeout(() => {
        navigate("/borrowed_list");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to borrow item. Please try again!";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async () => {

        // Open confirmation dialog instead of window.confirm
        handleDialogOpen()
   
  };

  return (
    <Box p={3} sx={{ mt: 2 }}>
      {/* <Toolbar/> */}
      <Typography variant="h4" gutterBottom>
        {/* {user.userId} {user.id} */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "40px",
          }}
        >
          <h5>Borrowed Item's Records</h5>
          <div style={{ display: "flex", gap: "10px" }}>
            {" "}
            {/* Adjust 'gap' as needed */}
            <Link to="/borrowed_list" className="btn btn-primary">
              My Report
            </Link>
            {(user.position === "IT" || user.position === "Director") && (
              <Link to="/rents" className="btn btn-primary">
                View All Lab Rent Report
              </Link>
            )}
          </div>
        </div>
      </Typography>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Logged User</InputLabel>
                <Select value={user ? user.email : ""} displayEmpty disabled>
                  {user && (
                    <MenuItem key={user.userId} value={user.email}>
                      {user.email}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Programme</InputLabel>
                <Select
                  value={selectedProgramme}
                  onChange={(e) => {
                    setSelectedProgramme(e.target.value);
                    setSelectedCourse("");
                  }}
                >
                  <MenuItem disabled>---SELECT Programme---</MenuItem>
                  {programmes.map((prog) => (
                    <MenuItem key={prog.programmeId} value={prog.programmeId}>
                      {prog.programmeTitle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedProgramme && filteredCourses.length > 0 && (
                <Typography variant="subtitle1" color="success">
                  Total Modules: {filteredCourses.length}
                </Typography>
              )}

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Module</InputLabel>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={!filteredCourses.length}
                >
                  <MenuItem disabled>---SELECT Module---</MenuItem>
                  {filteredCourses.length ? (
                    filteredCourses.map((course) => (
                      <MenuItem key={course.courseId} value={course.courseId}>
                        {course.courseTitle}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No Module available</MenuItem>
                  )}
                </Select>
              </FormControl>

              {selectedProgramme && filteredCourses.length === 0 && (
                <Typography variant="body2" color="error">
                  Please Register module before you borrow Item, or Contact
                  Administrator
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Item Type</InputLabel>
                <Select
                  value={selectedItemType}
                  onChange={(e) => setSelectedItemType(e.target.value)}
                >
                  <MenuItem disabled>------SELECT ITEM CATEGORY------</MenuItem>
                  {itemTypes.map((type) => (
                    <MenuItem key={type.itemTypeId} value={type.itemTypeId}>
                      {type.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Item</InputLabel>
                <Select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  disabled={!filteredItems.length || !selectedItemType}
                >
                  <MenuItem disabled>------SELECT ITEM------</MenuItem>
                  {filteredItems.length ? (
                    filteredItems.map((item) => (
                      <MenuItem key={item.itemId} value={item.itemId}>
                        {item.name} - {item.labCode}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No remaining item for this item category
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              {selectedItemType && (
                <>
                  {filteredItems.length > 0 ? (
                    <Typography variant="body2" color="success">
                      Total remaining items for this item category:{" "}
                      {filteredItems.length}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error">
                      No items available for the selected item type, Try again
                      soon!
                    </Typography>
                  )}
                </>
              )}

              {selectedItem && (
                <TextField
                  label="Expected Return Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  sx={{ mb: 2 }}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                />
              )}

              {/* <Button
                startIcon={<Send />}
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSubmit}
              >
                Borrow Item
              </Button> */}
              <Button
                startIcon={<Send />}
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSubmit}
                disabled={
                  !selectedProgramme ||
                  !selectedCourse ||
                  !selectedItemType ||
                  !selectedItem ||
                  !expectedReturnDate
                }
              >
                Submit Request
              </Button>
            </Grid>
          </Grid>
        </form>
              {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
        <DialogTitle>Confirm Borrow Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to borrow this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      </Paper>

      {/* Loading overlay */}
      {isLoading && (
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
    </Box>
  );
};

export default BorrowForm;
