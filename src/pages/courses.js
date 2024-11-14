import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Button,
  Grid,
  IconButton,
  Toolbar,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add"; // Import Add icon
import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useMediaQuery } from "@mui/material";

const Course = () => {
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseTitle: "",
    programmeId: "",
  });

  const [programmes, setProgrammes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isAddNewRecord, setIsAddNewRecord] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const { user } = useAuth();
  // page protection to users
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    // Redirect to NotFound route if user position is not "IT" or "Director"
    if (user?.position !== "IT") {
      navigate("/restricted_page");
    }
  }, [user, navigate]);
  // end page protection to users

  useEffect(() => {
    fetchProgrammes();
    fetchCourses();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/programmes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgrammes(response.data);
    } catch (error) {
      console.error("Error fetching programmes:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Show loading spinner
    const { courseCode } = courseData;

    const duplicateCourse = courses.find(
      (course) => course.courseCode === courseCode
    );
    if (duplicateCourse) {
      setSnackbarMessage("Course with this code already exists.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false); // Hide loading spinner if duplicate found
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/courses",
        courseData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCourses([...courses, response.data]);
      setCourseData({ courseCode: "", courseTitle: "", programmeId: "" });

      setSnackbarMessage("Course added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      if (error.response && error.response.data.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("failed to add course. Please try again.");
        setSnackbarSeverity("error");
      }
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => {
        setLoading(false); // Hide loading spinner after delay
      }, 500); // Adjust delay time as needed (500ms here)
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid date"
      : `${date.toISOString().split("T")[0]} ${
          date.toTimeString().split(" ")[0]
        }`;
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
  const paginatedCourses = courses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // END OF PAGINATION

  return (
    <Container>
      <Toolbar sx={{ mt: 2 }} />
      <Box mb={0}>
        <Button
          title={isAddNewRecord ? "Close Form" : "Add New Record"}
          variant="contained"
          startIcon={isAddNewRecord ? <CloseIcon /> : <AddIcon />} // Conditionally render icon
          onClick={() => setIsAddNewRecord(!isAddNewRecord)}
          className="mr-2 ml-4"
          sx={{
            backgroundColor: isAddNewRecord ? "error.main" : "primary.main", // Danger for close, primary for add
            color: "white", // White text and icon color
            "&:hover": {
              backgroundColor: isAddNewRecord ? "error.dark" : "primary.dark", // Darker shades on hover
            },
          }}
        >
          {isAddNewRecord ? "Close Form" : "Add New Record"}
        </Button>
      </Box>

      <Box p={3} mt={0}>
        {isAddNewRecord && (
          <>
            <Typography variant="h4" gutterBottom>
              Add New Course
            </Typography>
            <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
              <form onSubmit={handleSubmit} autoComplete="off">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>Programme</InputLabel>
                      <Select
                        name="programmeId"
                        value={courseData.programmeId}
                        onChange={handleChange}
                        label="Programme"
                      >
                        {programmes.map((programme) => (
                          <MenuItem
                            key={programme.programmeId}
                            value={programme.programmeId}
                          >
                            {programme.programmeTitle}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" required>
                      <TextField
                        label="Course Code"
                        name="courseCode"
                        value={courseData.courseCode}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" required>
                      <TextField
                        label="Course Title"
                        name="courseTitle"
                        value={courseData.courseTitle}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        height: 56,
                        backgroundColor: !courseData.programmeId || !courseData.courseCode || !courseData.courseTitle
                          ? "primary.main"
                          : undefined, // Primary color when disabled
                        color: !courseData.programmeId || !courseData.courseCode || !courseData.courseTitle ? "white" : undefined, // Text color for readability when disabled
                        "&:disabled": {
                          backgroundColor: "primary.main", // Ensures primary color when disabled
                          color: "white", // Text color when disabled
                        },
                      }}
                      disabled={
                        !courseData.programmeId ||
                        !courseData.courseCode ||
                        !courseData.courseTitle
                      }
                    >
                      Add Course
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
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
          </>
        )}

        <Box mt={0}>
          <Typography variant="h5" gutterBottom>
            List of Courses
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Title</TableCell>
                  <TableCell>Programme</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* {courses.length > 0 ? (
                  courses.map((course, key) => { */}
                {paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course, index) => {
                    const programme = programmes.find(
                      (p) => p.programmeId === course.programmeId
                    );
                    return (
                      <TableRow key={course.courseId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{course.courseCode}</TableCell>
                        <TableCell>{course.courseTitle}</TableCell>
                        <TableCell>
                          {programme ? programme.programmeTitle : "N/A"}
                        </TableCell>
                        <TableCell>{formatDate(course.createdAt)}</TableCell>
                        <TableCell>{formatDate(course.updatedAt)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      className="text-danger"
                    >
                      No courses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Component */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]} // Customize as needed
              component="div"
              count={courses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Box>
      </Box>

      <Snackbar
        style={{
          marginTop: "60px",
          width: isMobile ? "100%" : "600px", // Adjust width for smaller screens
          marginLeft: isMobile ? "0" : "420px", // Center on mobile by removing left margin
        }}
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Course;
