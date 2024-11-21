import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FarmerProfileModal from "./FarmerProfileModal";
import BuyerProfileModal from "./BuyerProfileModal";

const Dashboard = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBuyerProfileModalOpen, setIsBuyerProfileModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Fetch the JWT token from local storage

    if (!token) {
      navigate("/login"); // Redirect to login if no token is found
      return;
    }

    // Fetch the dashboard data
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          "https://swe-backend-livid.vercel.app/dashboard/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.log(error.response);
        if (error.response && error.response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch dashboard data.");
        }
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the JWT token from local storage
    navigate("/login"); // Redirect to login page
  };

  const renderAdministratorDashboard = (data) => {
    const handleSectionClick = (section) => {
      setSelectedSection(section === selectedSection ? "" : section);
    };

    return (
      <div style={styles.adminContainer}>
        <div style={styles.adminCard}>
          <h2>Admin Overview</h2>
          <p>
            <strong>Total Users:</strong> {data.total_users || 0}
          </p>
          <p>
            <strong>Total Farmers:</strong> {data.total_farmers || 0}
          </p>
          <p>
            <strong>Total Buyers:</strong> {data.total_buyers || 0}
          </p>
          <p>
            <strong>Total Products:</strong> {data.total_products || 0}
          </p>
          <p>
            <strong>Total Orders:</strong> {data.total_orders || 0}
          </p>
        </div>

        <div style={styles.sectionsContainer}>
          <button
            style={styles.sectionButton}
            onClick={() => handleSectionClick("users")}
          >
            {selectedSection === "users" ? "Hide Users" : "View Users"}
          </button>
          {selectedSection === "users" && (
            <div style={styles.detailContainer}>
              <h3>All Users</h3>
              {data.users && data.users.length > 0 ? (
                data.users.map((user) => (
                  <div key={user.id} style={styles.userCard}>
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Role:</strong> {user.role}
                    </p>
                    <button style={styles.actionButton}>Edit</button>
                    <button style={styles.actionButton}>Delete</button>
                  </div>
                ))
              ) : (
                <p>No users available.</p>
              )}
            </div>
          )}

          <button
            style={styles.sectionButton}
            onClick={() => handleSectionClick("farmers")}
          >
            {selectedSection === "farmers" ? "Hide Farmers" : "View Farmers"}
          </button>
          {selectedSection === "farmers" && (
            <div style={styles.detailContainer}>
              <h3>Farmers and Their Products</h3>
              {data.farmers && data.farmers.length > 0 ? (
                data.farmers.map((farmer) => (
                  <div key={farmer.id} style={styles.userCard}>
                    <p>
                      <strong>Name:</strong> {farmer.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {farmer.email}
                    </p>
                    <button style={styles.actionButton}>View Products</button>
                  </div>
                ))
              ) : (
                <p>No farmers available.</p>
              )}
            </div>
          )}

          <button
            style={styles.sectionButton}
            onClick={() => handleSectionClick("buyers")}
          >
            {selectedSection === "buyers" ? "Hide Buyers" : "View Buyers"}
          </button>
          {selectedSection === "buyers" && (
            <div style={styles.detailContainer}>
              <h3>Buyers and Their Orders</h3>
              {data.buyers && data.buyers.length > 0 ? (
                data.buyers.map((buyer) => (
                  <div key={buyer.id} style={styles.userCard}>
                    <p>
                      <strong>Name:</strong> {buyer.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {buyer.email}
                    </p>
                    <button style={styles.actionButton}>View Orders</button>
                  </div>
                ))
              ) : (
                <p>No buyers available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFarmerDashboard = (data) => (
    <>
      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Farm Info</h2>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Manage Profile
          </button>
        </div>
        <p>
          <strong>Farm Address:</strong> {data.farm_address}
        </p>
        <p>
          <strong>Farm Size:</strong> {data.farm_size} acres
        </p>
        <p>
          <strong>Crops:</strong> {data.crops.join(", ")}
        </p>
      </div>
      <div style={styles.card}>
        <h2>Products</h2>
        {data.products.length > 0 ? (
          data.products.map((product) => (
            <div key={product.id}>
              <p>
                <strong>{product.name}</strong>
              </p>
              <p>{product.description}</p>
              <p>
                <strong>Price:</strong> ${product.price}
              </p>
            </div>
          ))
        ) : (
          <p>No products listed yet.</p>
        )}
      </div>

      <FarmerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={{
          name: data.name,
          email: data.email,
          phone_number: data.phone_number || "",
          farm_address: data.farm_address,
          farm_size: data.farm_size,
          crop_types: data.crops || [],
          resources: data.resources || [],
        }}
      />
    </>
  );

  const renderBuyerDashboard = (data) => (
    <div style={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Buyer Info</h2>
        <button
          onClick={() => setIsBuyerProfileModalOpen(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Manage Profile
        </button>
      </div>
      <p>
        <strong>Delivery Address:</strong> {data.delivery_address}
      </p>

      <BuyerProfileModal
        isOpen={isBuyerProfileModalOpen}
        onClose={() => setIsBuyerProfileModalOpen(false)}
        currentProfile={{
          name: data.name,
          email: data.email,
          phone_number: data.phone_number || "",
          delivery_address: data.delivery_address || "",
        }}
      />
    </div>
  );

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return <div style={styles.loading}>Loading...</div>;
  }

  const { dashboard, data } = dashboardData;

  return (
    <div style={styles.container}>
      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>
      <h1>{dashboard}</h1>
      <div style={styles.card}>
        <h2>User Info</h2>
        <p>
          <strong>Name:</strong> {data.name}
        </p>
        <p>
          <strong>Email:</strong> {data.email}
        </p>
      </div>

      {dashboard === "Administrator Dashboard" &&
        renderAdministratorDashboard(data)}
      {dashboard === "Farmer Dashboard" && renderFarmerDashboard(data)}
      {dashboard === "Buyer Dashboard" && renderBuyerDashboard(data)}
    </div>
  );
};

// Inline styles
const styles = {
  adminContainer: {
    margin: "20px auto",
    maxWidth: "900px",
    padding: "20px",
    backgroundColor: "#f7f9fc",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  adminCard: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  sectionsContainer: {
    marginTop: "20px",
  },
  sectionButton: {
    display: "block",
    width: "100%",
    padding: "12px 20px",
    marginBottom: "10px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textAlign: "left",
  },
  detailContainer: {
    marginTop: "10px",
    padding: "15px",
    backgroundColor: "#e9ecef",
    borderRadius: "8px",
  },
  userCard: {
    padding: "10px",
    margin: "10px 0",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    border: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    padding: "8px 10px",
    backgroundColor: "#6c757d",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "15px",
    marginBottom: "20px",
    backgroundColor: "#f9f9f9",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#FF4B4B",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
    float: "right",
  },
  errorContainer: {
    textAlign: "center",
    marginTop: "50px",
  },
  error: {
    color: "red",
    fontSize: "18px",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
    marginTop: "50px",
  },
};

export default Dashboard;
