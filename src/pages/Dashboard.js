import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FarmerProfileModal from './FarmerProfileModal';

const Dashboard = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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

  const renderAdministratorDashboard = (data) => (
    <>
      <div style={styles.card}>
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
        <p>{data.message || "No additional information available."}</p>
      </div>
  
      <div style={styles.card}>
        <h2>Users</h2>
        {data.users && data.users.length > 0 ? (
          data.users.map((user) => (
            <div key={user.id} style={styles.innerCard}>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </div>
          ))
        ) : (
          <p>No users available.</p>
        )}
      </div>
  
      <div style={styles.card}>
        <h2>Farmers and Their Products</h2>
        {data.farmers && data.farmers.length > 0 ? (
          data.farmers.map((farmer) => (
            <div key={farmer.id} style={styles.innerCard}>
              <p>
                <strong>Name:</strong> {farmer.name}
              </p>
              <p>
                <strong>Email:</strong> {farmer.email}
              </p>
              <p>
                <strong>Farm Address:</strong> {farmer.farm_address}
              </p>
              <p>
                <strong>Farm Size:</strong> {farmer.farm_size || "N/A"} acres
              </p>
              <p>
                <strong>Crops:</strong> {farmer.crops?.join(", ") || "No crops listed"}
              </p>
              <h4>Products:</h4>
              {farmer.products && farmer.products.length > 0 ? (
                farmer.products.map((product) => (
                  <div key={product.id}>
                    <p>
                      <strong>Product Name:</strong> {product.name}
                    </p>
                    <p>
                      <strong>Price:</strong> ${product.price}
                    </p>
                    <p>
                      <strong>Stock:</strong> {product.stock}
                    </p>
                    <p>
                      <strong>Description:</strong> {product.description || "No description"}
                    </p>
                  </div>
                ))
              ) : (
                <p>No products listed yet.</p>
              )}
            </div>
          ))
        ) : (
          <p>No farmers available.</p>
        )}
      </div>
  
      <div style={styles.card}>
        <h2>Buyers and Their Orders</h2>
        {data.buyers && data.buyers.length > 0 ? (
          data.buyers.map((buyer) => (
            <div key={buyer.id} style={styles.innerCard}>
              <p>
                <strong>Name:</strong> {buyer.name}
              </p>
              <p>
                <strong>Email:</strong> {buyer.email}
              </p>
              <p>
                <strong>Delivery Address:</strong> {buyer.delivery_address}
              </p>
              <h4>Orders:</h4>
              {buyer.orders && buyer.orders.length > 0 ? (
                buyer.orders.map((order) => (
                  <div key={order.id}>
                    <p>
                      <strong>Order ID:</strong> {order.id}
                    </p>
                    <p>
                      <strong>Status:</strong> {order.status}
                    </p>
                    <p>
                      <strong>Total Price:</strong> ${order.total_price}
                    </p>
                  </div>
                ))
              ) : (
                <p>No orders placed yet.</p>
              )}
            </div>
          ))
        ) : (
          <p>No buyers available.</p>
        )}
      </div>
    </>
  );
  
  const renderFarmerDashboard = (data) => (
    <>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Farm Info</h2>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
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
          phone_number: data.phone_number || '',
          farm_address: data.farm_address,
          farm_size: data.farm_size,
          crop_types: data.crops || [],
          resources: data.resources || []
        }}
      />
    </>
  );

  const renderBuyerDashboard = (data) => (
    <div style={styles.card}>
      <h2>Orders</h2>
      {data.orders.length > 0 ? (
        data.orders.map((order) => (
          <div key={order.id}>
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Total Price:</strong> ${order.total_price}
            </p>
          </div>
        ))
      ) : (
        <p>No orders placed yet.</p>
      )}
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
