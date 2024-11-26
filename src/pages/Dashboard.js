import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FarmerProfileModal from "./FarmerProfileModal";
import BuyerProfileModal from "./BuyerProfileModal";
import EditUserModal from "./EditUserModal";
import ViewProductsModal from "./ViewProductsModal";
import ViewOrdersModal from "./ViewOrdersModal";
import AddProductModal from "./AddProductModal";
import ProductImageDisplay from "./ProductImageDisplay";
import EditProductModal from "./EditProductModal";

const Dashboard = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBuyerProfileModalOpen, setIsBuyerProfileModalOpen] = useState(false);
  const [isViewProductsModalOpen, setIsViewProductsModalOpen] = useState(false);
  const [isViewOrdersModalOpen, setIsViewOrdersModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // To store the currently selected product for editing

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleProductAdded = (newProduct) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

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
        if (response.data.dashboard === "Farmer Dashboard") {
          setProducts(response.data.data.products); // Initialize products for farmer
        }
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

  const handleSectionClick = (section) => {
    setSelectedSection(section === selectedSection ? "" : section);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user); // Set the user to edit
    setIsEditUserModalOpen(true); // Open the modal
  };

  const renderAdministratorDashboard = (data) => {
    const handleDeleteUser = async (userId) => {
      if (!window.confirm("Are you sure you want to delete this user?")) {
        return; // Exit if the user cancels the action
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `https://swe-backend-livid.vercel.app/admin/user/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete the user.");
        }

        alert("User deleted successfully.");
        // Optionally, refresh the data or remove the user from the local state
      } catch (error) {
        alert(error.message || "An error occurred while deleting the user.");
      }
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
          {/* Users Section */}
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
                    <button
                      style={styles.actionButton}
                      onClick={() => handleEditUser(user)} // Open the modal with the selected user
                    >
                      Edit
                    </button>
                    <button
                      style={styles.actionButton}
                      onClick={() => handleDeleteUser(user.id)} // Trigger delete user
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p>No users available.</p>
              )}
            </div>
          )}

          {/* Products Section */}
          <button
            style={styles.sectionButton}
            onClick={() => setIsViewProductsModalOpen(true)}
          >
            View Products
          </button>

          {/* Orders Section */}
          <button
            style={styles.sectionButton}
            onClick={() => setIsViewOrdersModalOpen(true)}
          >
            View Orders
          </button>
        </div>

        {/* Modals */}
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => setIsEditUserModalOpen(false)} // Close the modal
          user={selectedUser} // Pass the selected user
        />
        <ViewProductsModal
          isOpen={isViewProductsModalOpen}
          onClose={() => setIsViewProductsModalOpen(false)} // Close the modal
        />
        <ViewOrdersModal
          isOpen={isViewOrdersModalOpen}
          onClose={() => setIsViewOrdersModalOpen(false)} // Close the modal
        />
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Products</h2>
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Product
          </button>
        </div>
        <div style={styles.productGrid}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                ...styles.productCard,
                ...(hoveredProductId === product.id
                  ? styles.productCardHover
                  : {}),
              }}
              onMouseEnter={() => setHoveredProductId(product.id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              <div style={styles.imageContainer}>
                <ProductImageDisplay productId={product.id} />
              </div>
              <div style={styles.productDetails}>
                <div style={styles.productName}>{product.name}</div>
                <div style={styles.productDescription}>
                  {product.description}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={styles.productPrice}>${product.price}</div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditProductModalOpen(true);
                    }}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
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
      <h2>{dashboard}</h2>
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
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  productCard: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    backgroundColor: "#fff",
  },
  productCardHover: {
    transform: "scale(1.05)",
    boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)",
  },
  imageContainer: {
    height: "150px",
    marginBottom: "10px",
    borderRadius: "4px",
    overflow: "hidden",
  },
  productDetails: {
    padding: "10px",
  },
  productName: {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "5px",
  },
  productDescription: {
    fontSize: "14px",
    marginBottom: "10px",
    color: "#555",
  },
  productPrice: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    padding: "6px 12px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#FF4B4B",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "40px",
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
