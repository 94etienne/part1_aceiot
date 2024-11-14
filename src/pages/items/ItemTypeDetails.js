import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toolbar } from "@mui/material";

const ItemTypeDetails = () => {
  const { itemTypeId } = useParams(); // Get itemTypeId from URL params
  const [items, setItems] = useState([]);
  const [itemTypeTitle, setItemTypeTitle] = useState(""); // Track item type title
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(""); // Track logged-in user’s email
  const navigate = useNavigate(); // For navigation in case of authentication failure

  // Data fetching logic with useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");

        if (!token) {
          console.error("No token found. Redirecting to login.");
          navigate("/login");
          return;
        }

        // Fetch data in parallel: items, item type title, and users
        const [itemsResponse, itemTypeResponse, usersResponse] = await Promise.all([
          axios.get(`http://localhost:5000/items/type/${itemTypeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/item_types/byId/${itemTypeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Set the fetched item type title
        setItemTypeTitle(itemTypeResponse.data.title);

        // Store the logged-in user’s email
        setUserEmail(email);

        // Check if the logged-in user exists in the staff list
        const staffMember = usersResponse.data.find((s) => s.email === email);
        if (!staffMember) {
          console.error("User not found. Redirecting to login.");
          navigate("/login");
          return;
        }

        // Set the fetched items
        setItems(itemsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.error || "Failed to fetch items. Please try again."
        );

        // Redirect if unauthorized
        if (err.response?.status === 401) {
          console.error("Unauthorized. Redirecting to login.");
          navigate("/login");
        }
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchData(); // Call fetchData when component mounts or itemTypeId changes
  }, [itemTypeId, navigate]);

  // Conditional rendering based on loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container-fluid col-md-12">
    <Toolbar sx={{mt: 2,}} />
      <h2>Items for {itemTypeTitle}</h2>
      {items.length === 0 ? (
        <p>No items found for this category.</p>
      ) : (
        <div className="row">
          {items.map((item) => (
            <div key={item.itemId} className="col-md-4 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{item.name}</h5>
                  <p className="card-text">
                    <strong>Serial Number:</strong> {item.serialNumber}
                  </p>
                  <p className="card-text">
                    <strong>Status:</strong> {item.status}
                  </p>
                  <p className="card-text">
                    <strong>Uploaded by:</strong>{" "}
                    {item.user
                      ? `${item.user.fname} (${item.user.email})`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to="/dashboard" className="btn btn-primary mt-3">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default ItemTypeDetails;
