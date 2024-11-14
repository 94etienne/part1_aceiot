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
  TextField,
  Toolbar,
  MenuItem,
  Menu,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import { QrReader } from "react-qr-reader";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/images/logo1.PNG";
import logo1 from "../assets/images/logo.png";
import { Add } from "@mui/icons-material";
import { useAuth } from "../context/authContext";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SearchIcon from "@mui/icons-material/Search";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Rents = () => {
  const [courses, setCourses] = useState([]);
  const [items, setItems] = useState([]);
  const [rents, setRents] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState([]); // Store positions
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [filteredRents, setFilteredRents] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  }); // State for Snackbar
  const [selectedRentId, setSelectedRentId] = useState(null); // State to track selected record
  const [isRentModalOpen, setRentModalOpen] = useState(false);
  const [selectedRent, setSelectedRent] = useState(null); // Track the selected rent data
  const [expectedReturnDate, setExpectedReturnDate] = useState(new Date());

  const { user } = useAuth(); // Fetch logged-in user data

  // page protection to users
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false); // Add loading state
  const [loadingSelected, setLoadingSelected] = useState(false); // Add loading state

  useEffect(() => {
    // Redirect to NotFound route if user position is not "IT" or "Director"
    if (user?.position !== "IT" && user?.position !== "Director") {
      navigate("/restricted_page");
    }
  }, [user, navigate]);
  // end page protection to users

  const [isQRScannerOpen, setQRScannerOpen] = useState(false); // Toggle scanner
  const [scannedData, setScannedData] = useState(""); // Store scanned data
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile devices
  const qrReaderRef = useRef(null); // Reference to the QR Reader

  const handleQRScannerOpen = () => setQRScannerOpen(true);
  const handleQRScannerClose = () => {
    setQRScannerOpen(false);
    if (qrReaderRef.current) {
      qrReaderRef.current.stopCamera(); // Stops the camera when closing
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleScanResult = (result) => {
    if (result?.text) {
      navigate("/scannedResults", { state: { scannedData: result.text } });
      handleQRScannerClose();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [
          coursesResponse,
          itemsResponse,
          rentsResponse,
          programmesResponse,
          itemTypesResponse,
          usersResponse,
          positionsResponse, // Fetch positions
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
          axios.get("http://localhost:5000/programmes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/item_types", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/positions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourses(coursesResponse.data);
        setItems(itemsResponse.data);
        setRents(rentsResponse.data);
        setProgrammes(programmesResponse.data);
        setItemTypes(itemTypesResponse.data);
        setUsers(usersResponse.data);
        setPositions(positionsResponse.data); // Set positions
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

  // Handle click without Loading
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

  const sortedRents = rents.sort((a, b) => {
    const typeA =
      itemTypes.find((type) => type.itemTypeId === a.item.itemTypeId)?.title ||
      "";
    const typeB =
      itemTypes.find((type) => type.itemTypeId === b.item.itemTypeId)?.title ||
      "";
    return typeA.localeCompare(typeB);
  });

  // Rent an item
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
  //         rentCondition: "Rented", // Only updating rentCondition
  //         rentBy: `${user.fname} ${user.lname}`,
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
  //     navigate("/rents");
  //   } catch (error) {
  //     const errorMessage =
  //       error.response?.data?.error || "Failed to rent Item.";
  //     setSnackbar({ open: true, message: errorMessage, severity: "error" });
  //     navigate("/rents");
  //   } finally {
  //     setLoading(false); // Hide loading spinner
  //   }
  // };

  // Return an item

  const handleRentButton = (rent) => {
    setSelectedRent(rent);
    setExpectedReturnDate(new Date(rent.expectedReturnDate)); // Set the initial date
    setRentModalOpen(true);
  };

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
          rentStatus: "Approved",
          returnedBy: `${user.fname} ${user.lname}`,
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
                rentStatus: "Approved",
                returnedBy: `${user.fname} ${user.lname}`,
              }
            : rent
        )
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to return item.",
        severity: "error",
      });
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Approve a rent request
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
          approvedBy: `${user.fname} ${user.lname}`,
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
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to approve rent.",
        severity: "error",
      });
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Cancel a rent request
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
        message: error.response?.data?.error || "Failed to cancel rent.",
        severity: "error",
      });
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Function to generate EXCEL for borrowed items
  // Step 1: Add state for date inputs and visibility

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const exportPDF_AND_Excel_FOR_RENTED_ASSETS = () => {
    if (!fromDate || !toDate) {
      console.error("Both 'From' and 'To' dates must be selected.");
      return;
    }

    // Fetch user information
    const email = user?.email || "Unknown";
    const fname = user?.fname || "Unknown";
    const lname = user?.lname || "Uploader";
    const phone = user?.phone || "Uploader";
    const uploaderName = `${fname} ${lname} (${email} - ${phone})`;

    console.log("Uploader Name:", uploaderName);

    // Convert dates to Date objects
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setDate(to.getDate() + 1); // Include the 'toDate' day in the range

    // Filter data
    const filteredRents = sortedRents.filter(
      (rent) =>
        rent.rentCondition === "Rented" &&
        rent.rentStatus === "Approved" &&
        new Date(rent.updatedAt) >= from &&
        new Date(rent.updatedAt) <= to
    );
    if (filteredRents.length === 0) {
      setErrorMessage(
        "No report found in the selected date range for Rented Items."
      );
      return;
    }

    // Prepare data for Excel export
    const excelData = filteredRents.map((rent, index) => ({
      "No.": index + 1,
      User: `${rent.user.lname} ${rent.user.fname}`,
      "Level of Education":
        programmes.find((prog) => prog.programmeId === rent.course.programmeId)
          ?.programmeTitle || "N/A",
      Course: rent.course.courseTitle,
      "Item Category":
        itemTypes.find((type) => type.itemTypeId === rent.item.itemTypeId)
          ?.title || "N/A",
      "Item Name": rent.item.name,
      "Lab Code": `${rent.item.labCode}`,
      "Expected Return Date": new Date(
        rent.expectedReturnDate
      ).toLocaleDateString(),
      Condition: rent.rentCondition,
      Status: rent.rentStatus,
      ApproveBy: rent.approvedBy,
    }));

    // Create and format Excel worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rented Items Report");

    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 5 }, // No.
      { wch: 20 }, // User
      { wch: 20 }, // Level of Education
      { wch: 15 }, // Course
      { wch: 15 }, // Item Category
      { wch: 15 }, // Item Name
      { wch: 20 }, // Serial Number
      { wch: 20 }, // Expected Return Date
      { wch: 15 }, // Condition
      { wch: 10 }, // Status
      { wch: 30 }, // ApprovedBy
    ];

    // Apply auto filter to headers
    ws["!autofilter"] = { ref: `A1:K${excelData.length + 1}` };

    // Apply bold style to header
    Object.keys(ws).forEach((cell) => {
      if (
        cell.startsWith("A1") ||
        cell.startsWith("B1") ||
        cell.startsWith("C1") ||
        cell.startsWith("D1") ||
        cell.startsWith("E1") ||
        cell.startsWith("F1") ||
        cell.startsWith("G1") ||
        cell.startsWith("H1") ||
        cell.startsWith("I1") ||
        cell.startsWith("J1") ||
        cell.startsWith("K1")
      ) {
        ws[cell].s = { font: { bold: true } };
      }
    });

    // Get today's date in 'YYYY-MM-DD' format for file naming
    const today = new Date().toISOString().split("T")[0];

    // Write the Excel file
    XLSX.writeFile(wb, `borrowed-items-report-${fname}-${lname}-${today}.xlsx`);

    // PDF generation with filtered data
    // PDF generation with landscape orientation
    // Initialize the document with explicit landscape orientation
    const doc = new jsPDF({ orientation: "landscape" });

    // Add logos
    doc.addImage(logo1, "png", 10, 10, 20, 20); // Left logo
    doc.addImage(logo, "PNG", 250, 10, 50, 20); // Right logo (adjusted for landscape)

    // Header content
    doc.setFontSize(18);
    doc.text("UR-CST ACEIoT", 14, 40);
    doc.setFontSize(12);
    doc.text("Borrowed Items Report", 14, 50);
    doc.text(`Generated by: ${uploaderName}`, 14, 60);

    // Generate table in landscape
    autoTable(doc, {
      startY: 70,
      head: [
        [
          "No.",
          "Borrower Names",
          "Level of Education",
          "Course",
          "Item Category",
          "Item Name",
          "Lab Code",
          "Expected Return Date",
          "Approved By",
        ],
      ],
      body: filteredRents.map((rent, index) => [
        index + 1,
        `${rent.user.lname} ${rent.user.fname}`,
        programmes.find((prog) => prog.programmeId === rent.course.programmeId)
          ?.programmeTitle || "N/A",
        rent.course.courseTitle,
        itemTypes.find((type) => type.itemTypeId === rent.item.itemTypeId)
          ?.title || "N/A",
        rent.item.name,
        `${rent.item.labCode}`,
        new Date(rent.expectedReturnDate).toLocaleDateString(),
        `${rent.approvedBy || "N/A"} `,
      ]),
      styles: {
        fontSize: 10,
        overflow: "linebreak", // Prevent text overflow by wrapping text within cells
      },
      tableWidth: "wrap",
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 40 },
        6: { cellWidth: 50 },
        7: { cellWidth: 30 },
        8: { cellWidth: 30 },
      },
      pageBreak: "auto",
      theme: "striped", // Optional styling
      didDrawPage: (data) => {
        // Footer text at the bottom of each page
        const currentDate = new Date().toLocaleDateString();
        const footerText = `Report printed on: ${currentDate} | Printed by: ${uploaderName}`;
        doc.setFontSize(10);
        doc.text(footerText, 14, doc.internal.pageSize.height - 10);
      },
    });

    // Calculate position for the approval and signature section
    let yPos = doc.lastAutoTable.finalY + 20;

    // Check if there's enough space for the approval section; if not, add a new page
    if (yPos + 40 > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20; // Reset yPos on the new page
    }

    // Approval and signature section
    doc.setFontSize(12);
    doc.text("Approved By:", 14, yPos);
    doc.line(40, yPos, 100, yPos);

    doc.text("Signature:", 14, yPos + 20);
    doc.line(40, yPos + 20, 100, yPos + 20);

    const rightX = 160; // Adjusted for landscape
    doc.text("Prepared By:", rightX, yPos);
    doc.text(`${fname} ${lname}`, rightX + 40, yPos);

    doc.text("Signature:", rightX, yPos + 20);
    doc.line(rightX + 40, yPos + 20, rightX + 80, yPos + 20);

    // Footer text is already handled by `didDrawPage` event

    // Save PDF
    doc.save(
      `borrowed-items-report-${fname}-${lname}-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  // Function to generate EXCEL for borrowed items
  const exportPDF_AND_Excel_FOR_RETURNED_ASSETS = () => {
    // Fetch necessary information from localStorage
    const email = user?.email || "Unknown";
    const fname = user?.fname || "Unknown";
    const lname = user?.lname || "Uploader";
    const phone = user?.phone || "Uploader";
    const uploaderName = `${fname} ${lname} (${email} - ${phone})`;

    console.log("Uploader Name:", uploaderName);

    // Convert fromDate and toDate to Date objects
    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Add one day from 'to' date
    to.setDate(to.getDate() + 1);

    // Step 4: Filter rents based on the specified conditions and date range
    // Filter rents based on the specified conditions and date range
    const filteredRents = sortedRents.filter(
      (rent) =>
        rent.rentCondition === "Returned" &&
        rent.rentStatus === "Approved" &&
        new Date(rent.returnDate) >= from &&
        new Date(rent.returnDate) <= to
    );
    if (filteredRents.length === 0) {
      setErrorMessage(
        "No report found in the selected date range for Returned Items."
      );
      return;
    }

    // Prepare data for Excel export

    // Prepare data for Excel export
    const excelData = filteredRents.map((rent, index) => ({
      "No.": index + 1,
      User: `${rent.user.lname} ${rent.user.fname}`,
      "Level of Education":
        programmes.find((prog) => prog.programmeId === rent.course.programmeId)
          ?.programmeTitle || "N/A",
      Course: rent.course.courseTitle,
      "Item Category":
        itemTypes.find((type) => type.itemTypeId === rent.item.itemTypeId)
          ?.title || "N/A",
      "Item Name": rent.item.name,
      "Serial Number": `${rent.item.serialNumber} | ${rent.item.labCode}`,
      "Expected Return Date": new Date(
        rent.expectedReturnDate
      ).toLocaleDateString(),
      "Returned on": new Date(rent.returnDate).toLocaleDateString(),
      Condition: rent.rentCondition,
      Status: rent.rentStatus,
      ReceivedBy: rent.returnedBy,
    }));

    // Create and format Excel worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rented Items Report");

    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 5 }, // No.
      { wch: 20 }, // User
      { wch: 20 }, // Level of Education
      { wch: 15 }, // Course
      { wch: 15 }, // Item Category
      { wch: 15 }, // Item Name
      { wch: 20 }, // Serial Number
      { wch: 20 }, // Expected Return Date
      { wch: 20 }, // Returned on
      { wch: 15 }, // Condition
      { wch: 10 }, // Status
      { wch: 30 }, // Received By
    ];

    // Apply auto filter to headers
    ws["!autofilter"] = { ref: `A1:L${excelData.length + 1}` };

    // Apply bold style to header
    Object.keys(ws).forEach((cell) => {
      if (
        cell.startsWith("A1") ||
        cell.startsWith("B1") ||
        cell.startsWith("C1") ||
        cell.startsWith("D1") ||
        cell.startsWith("E1") ||
        cell.startsWith("F1") ||
        cell.startsWith("G1") ||
        cell.startsWith("H1") ||
        cell.startsWith("I1") ||
        cell.startsWith("J1") ||
        cell.startsWith("K1") ||
        cell.startsWith("L1")
      ) {
        ws[cell].s = { font: { bold: true } };
      }
    });

    // Get today's date in 'YYYY-MM-DD' format for file naming
    const today = new Date().toISOString().split("T")[0];

    // Write the Excel file

    XLSX.writeFile(wb, `Returned-items-report-${fname}-${lname}-${today}.xlsx`);

    // PDF generation with filtered data
    // PDF generation with landscape orientation
    const doc = new jsPDF({ orientation: "landscape" }); // Explicit landscape orientation

    // Add logos
    doc.addImage(logo1, "png", 10, 10, 20, 20); // Left logo
    doc.addImage(logo, "PNG", 250, 10, 50, 20); // Right logo (adjusted for landscape)

    // Header
    doc.setFontSize(18);
    doc.text("UR-CST ACEIoT", 14, 40);
    doc.setFontSize(12);
    doc.text("Returned Items Report", 14, 50);
    doc.text(`Generated by: ${uploaderName}`, 14, 60);

    // Generate table in landscape
    autoTable(doc, {
      startY: 70,
      head: [
        [
          "No.",
          "Borrower Names",
          "Level of Education",
          "Item Category",
          "Item Name",
          "Lab Code",
          "Expected Return Date",
          "Returned on",
          "Received By",
        ],
      ],
      body: filteredRents.map((rent, index) => [
        index + 1,
        `${rent.user.lname} ${rent.user.fname}`,
        `${
          programmes.find(
            (prog) => prog.programmeId === rent.course.programmeId
          )?.programmeTitle || "N/A"
        } - ${rent.course.courseTitle || "N/A"}`,

        // rent.course.courseTitle,
        itemTypes.find((type) => type.itemTypeId === rent.item.itemTypeId)
          ?.title || "N/A",
        rent.item.name,
        rent.item.labCode,
        new Date(rent.expectedReturnDate).toLocaleDateString(),
        new Date(rent.returnDate).toLocaleDateString("en-US"),
        `${rent.returnedBy}`,
      ]),
      styles: {
        fontSize: 10,
        overflow: "linebreak", // Prevent text overflow by wrapping text within cells
      },
      tableWidth: "wrap",
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 40 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
        7: { cellWidth: 30 },
        8: { cellWidth: 30 },
      },
      pageBreak: "auto",
      theme: "striped", // Optional styling
      didDrawPage: (data) => {
        // Footer text at the bottom of each page
        const currentDate = new Date().toLocaleDateString();
        const footerText = `Report printed on: ${currentDate} | Printed by: ${uploaderName}`;
        doc.setFontSize(10);
        doc.text(footerText, 14, doc.internal.pageSize.height - 10);
      },
    });

    // Calculate position for the approval and signature section
    let yPos = doc.lastAutoTable.finalY + 20;

    // Check if there's enough space for the approval section; if not, add a new page
    if (yPos + 40 > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20; // Reset yPos on the new page
    }

    // Approval and signature section
    doc.setFontSize(12);
    doc.text("Approved By:", 14, yPos);
    doc.line(40, yPos, 100, yPos);

    doc.text("Signature:", 14, yPos + 20);
    doc.line(40, yPos + 20, 100, yPos + 20);

    const rightX = 160; // Adjusted for landscape
    doc.text("Prepared By:", rightX, yPos);
    doc.text(`${fname} ${lname}`, rightX + 40, yPos);

    doc.text("Signature:", rightX, yPos + 20);
    doc.line(rightX + 40, yPos + 20, rightX + 80, yPos + 20);

    // Footer text is already handled by `didDrawPage` event

    // Save the PDF
    doc.save(`Returned-items-report-${fname}-${lname}-${today}.pdf`);
  };

  // Print pdf for unique record
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
        doc.save(`rent-report-${selectedRentId}-${today}.pdf`);
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

  // filter by status in select option
  // Handle dropdown open and close
  const [selectedStatus, setSelectedStatus] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setAnchorEl(null);
  };

  // Fetch users and rents
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const usersResponse = await axios.get("http://localhost:5000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data);
        const rentsResponse = await axios.get("http://localhost:5000/rents", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRents(rentsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUsers();
  }, []);

  // Filter rents by status, condition, and search term
  useEffect(() => {
    const searchedRents = rents.filter((rent) => {
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
              rent.rentCondition === "Returned" &&
              rent.rentStatus === "Approved"
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

      const matchesSearch = rent.applicationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });

    setFilteredRents(searchedRents);
  }, [searchTerm, selectedStatus, rents]);
  // search by user names or university code
  // useEffect(() => {
  //   const filteredUsers = users.filter((user) =>
  //     [user.fname, user.lname, user.userUniversityCode]
  //       .filter(Boolean) // Ensure only defined fields are included
  //       .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  //   );

  //   // Extract userIds from the filtered users
  //   const userIds = filteredUsers.map((user) => user.userId);

  //   // Filter rents based on matching userId with filtered users
  //   const searchedRents = rents.filter((rent) => userIds.includes(rent.userId));

  //   setFilteredRents(searchedRents);
  // }, [searchTerm, rents, users]);

  // Additional filtering logic with rentCondition and rentStatus

  useEffect(() => {
    setFilteredRents(
      rents.filter(
        (rent) =>
          (rent.rentCondition === "In_lab" && rent.rentStatus === "Pending") ||
          (rent.rentCondition === "Rented" && rent.rentStatus === "Pending") ||
          (rent.rentCondition === "Rented" && rent.rentStatus === "Approved") ||
          (rent.rentCondition === "In_lab" &&
            rent.rentStatus === "Cancelled") ||
          (rent.rentCondition === "Rented" &&
            rent.rentStatus === "Cancelled") ||
          (rent.rentCondition === "Rented" && rent.rentStatus === "Approved") ||
          (rent.rentCondition === "Returned" && rent.rentStatus === "Approved")
      )
    );
  }, [rents]);

  // SHOW MODALS
  // Separate states for each modal
  const [rentedMenuAnchor, setRentedMenuAnchor] = useState(null);
  const [isRentedModalOpen, setIsRentedModalOpen] = useState(false);
  const [isReturnedModalOpen, setIsReturnedModalOpen] = useState(false);

  const handleOpenRentedMenu = (event) =>
    setRentedMenuAnchor(event.currentTarget);
  const handleCloseRentedMenu = () => setRentedMenuAnchor(null);

  const handleOpenRentedModal = () => setIsRentedModalOpen(true);
  const handleCloseRentedModal = () => setIsRentedModalOpen(false);

  const handleOpenReturnedModal = () => setIsReturnedModalOpen(true);
  const handleCloseReturnedModal = () => setIsReturnedModalOpen(false);

  // END OF SHOW MODALS

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

  // CHAT WHATSAPP
  const handleWhatsAppClick = () => {
    const phone = user.phone;
    const whatsappURL = `https://wa.me/${phone}`;
    window.open(whatsappURL, "_blank");
  };
  //END CHAT WHATSAPP

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
            {/* Button for Export Reports Menu */}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              // className="d-none d-sm-inline-block"
            >
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleOpenRentedMenu}
              >
                <i className="fas fa-download fa-sm text-white-50"></i> EXPORT
                REPORTS
              </Button>
              <Menu
                anchorEl={rentedMenuAnchor}
                open={Boolean(rentedMenuAnchor)}
                onClose={handleCloseRentedMenu}
              >
                <MenuItem
                  onClick={() => {
                    handleOpenRentedModal();
                    handleCloseRentedMenu();
                  }}
                >
                  Export Rented Report
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOpenReturnedModal();
                    handleCloseRentedMenu();
                  }}
                >
                  Export Returned Report
                </MenuItem>
              </Menu>
            </Grid>

            {/* Rented Report Modal */}
            <Dialog open={isRentedModalOpen} onClose={handleCloseRentedModal}>
              <DialogTitle>Export Rented Report</DialogTitle>
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="To"
                      type="date"
                      sx={{ mt: 2 }}
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseRentedModal} color="secondary">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    exportPDF_AND_Excel_FOR_RENTED_ASSETS();
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

            {/* Returned Report Modal */}
            <Dialog
              open={isReturnedModalOpen}
              onClose={handleCloseReturnedModal}
            >
              <DialogTitle>Export Returned Report</DialogTitle>
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="To"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      fullWidth
                      sx={{ mt: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseReturnedModal} color="secondary">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    exportPDF_AND_Excel_FOR_RETURNED_ASSETS();
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

            {/* QR Code Scanner Button and Modal */}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              className="d-none d-sm-inline-block"
            >
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleQRScannerOpen}
              >
                Track Item
              </Button>
              <Dialog open={isQRScannerOpen} onClose={handleQRScannerClose}>
                <DialogTitle>Scan QR Code To Check Item Details</DialogTitle>
                <DialogContent>
                  <Grid container justifyContent="center">
                    <Grid item xs={12} sm={8} md={6}>
                      <QrReader
                        onResult={(result, error) => {
                          if (result) handleScanResult(result);
                          if (error) console.error(error);
                        }}
                        constraints={{ facingMode: "environment" }}
                        style={{ width: "100%" }}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleQRScannerClose} color="secondary">
                    Exit
                  </Button>
                </DialogActions>
              </Dialog>
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
                  label="Search by Application No:"
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
              <TableCell>ApplicationNumber</TableCell>
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
            {/* {filteredRents.length > 0 ? (
              filteredRents.map((rent) => (
               */}
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
                          <span style={{ color: "green", fontWeight: "bold" }}>
                            Returned
                          </span>
                        </Typography>
                      ) : rent.rentCondition === "In_lab" ||
                        rent.rentCondition === "Rented" ? (
                        <Typography variant="body2">
                          <span style={{ color: "orange", fontWeight: "bold" }}>
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
                                      <b>RegNo:</b>{" "}
                                      {rent.user.userUniversityCode}{" "}
                                    </Typography>

                                    <Typography variant="body2">
                                      <b>Email:</b> {rent.user.email}{" "}
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                      <Typography variant="body2">
                                        <b>Call:</b> {rent.user.phone}
                                      </Typography>
                                      <WhatsAppIcon
                                        style={{
                                          cursor: "pointer",
                                          color: "#25D366",
                                          marginLeft: "8px",
                                        }}
                                        onClick={handleWhatsAppClick}
                                      />
                                    </Box>
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
                                              rent.rentStatus ===
                                                "Cancelled") ||
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
                                    {/* <Typography variant="body2">
                                  <b>Expected Return Date:</b>{" "}
                                  {new Date(
                                    rent.expectedReturnDate
                                  ).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2">
                                  <b>Returned Date:</b>{" "}
                                  {new Date(
                                    rent.returnDate
                                  ).toLocaleDateString()}
                                </Typography> */}
                                    <Typography variant="body2">
                                      <b>Expected Return Date:</b>{" "}
                                      {new Date(
                                        rent.expectedReturnDate
                                      ).toLocaleDateString()}
                                    </Typography>

                                    {rent.rentCondition === "Returned" &&
                                      rent.rentStatus === "Approved" && (
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
                                            new Date(
                                              rent.expectedReturnDate
                                            ) ? (
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
                                              (rent.rentCondition ===
                                                "In_lab" &&
                                                rent.rentStatus ===
                                                  "Pending") ||
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
                                    {/* VISIBLE ONLY IF RENT CONDITION IS RENTED AND STATUS IS APPROVED*/}
                                    {rent.rentCondition === "Rented" &&
                                      rent.rentStatus === "Approved" && (
                                        <Button
                                          className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"
                                          variant="contained"
                                          color="primary"
                                          style={{ marginTop: "20px" }}
                                          onClick={generateSelectedRecordPDF}
                                        >
                                          <i className="fas fa-download fa-sm text-white-50"></i>{" "}
                                          Generate Report
                                        </Button>
                                      )}
                                  </div>
                                </div>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" className="text-danger">
                  No Rent Record's found
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
      {/* RENT BUTTON */}
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
            {/* Confirm Rent */}
          </Button>
        </DialogActions>
      </Dialog>
      ;
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

export default Rents;
