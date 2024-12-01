import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FarmerProfileModal from "./modals/FarmerProfileModal";
import BuyerProfileModal from "./modals/BuyerProfileModal";
import EditUserModal from "./modals/EditUserModal";
import ViewProductsModal from "./modals/ViewProductsModal";
import ViewOrdersModal from "./modals/ViewOrdersModal";
import ViewUsersModal from "./modals/ViewUsersModal";
import AddProductModal from "./modals/AddProductModal";
import ProductImageDisplay from "./modals/ProductImageDisplay";
import EditProductModal from "./modals/EditProductModal";

const Dashboard = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBuyerProfileModalOpen, setIsBuyerProfileModalOpen] = useState(false);
  const [isViewProductsModalOpen, setIsViewProductsModalOpen] = useState(false);
  const [isViewOrdersModalOpen, setIsViewOrdersModalOpen] = useState(false);
  const [isViewUsersModalOpen, setIsViewUsersModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // To store the currently selected product for editing

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);

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
  const handleEditUser = (user) => {
    setSelectedUser(user); // Set the user to edit
    setIsEditUserModalOpen(true); // Open the modal
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const token = localStorage.getItem("token");

      // Delete product images
      await fetch(
        `https://swe-backend-livid.vercel.app/farmer/product/${productId}/images`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Delete product itself
      const response = await fetch(
        `https://swe-backend-livid.vercel.app/farmer/product/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product.");
      }

      setProducts((prev) => prev.filter((product) => product.id !== productId));
      alert("Product deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const renderAdministratorDashboard = (data) => {
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
            onClick={() => setIsViewUsersModalOpen(true)} // Open ViewUsersModal
          >
            View Users
          </button>
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
        <ViewUsersModal
          isOpen={isViewUsersModalOpen}
          onClose={() => setIsViewUsersModalOpen(false)}
          onEditUser={handleEditUser}
        />
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
                <div style={styles.productSeparator}>
                  <div style={styles.productPrice}>${product.price}</div>
                </div>
                <div style={styles.buttonContainer}>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditProductModalOpen(true);
                    }}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    style={styles.deleteButton}
                  >
                    Delete
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

  const fetchBuyerOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://swe-backend-livid.vercel.app/buyer/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBuyerOrders(response.data.orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrdersError(error.response?.data?.error || "Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const renderBuyerDashboard = (data) => {
    const goToShop = () => {
      navigate("/shop");
    };

    return (
      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Buyer Info</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setIsBuyerProfileModalOpen(true)}
              style={styles.profileButton}
            >
              Manage Profile
            </button>
            <button onClick={goToShop} style={styles.shopButton}>
              Go to Shop
            </button>
          </div>
        </div>
        <p>
          <strong>Delivery Address:</strong> {data.delivery_address}
        </p>

        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2>My Orders</h2>
            <button
              onClick={() => {
                fetchBuyerOrders();
                setIsOrdersModalOpen(true);
              }}
              style={styles.viewOrdersButton}
            >
              View All Orders
            </button>
          </div>
          {/* Display recent orders preview */}
          <div style={styles.recentOrdersPreview}>
            {buyerOrders.slice(0, 3).map((order) => (
              <div key={order.id} style={styles.orderPreviewCard}>
                <div style={styles.orderPreviewHeader}>
                  <span style={styles.orderPreviewId}>Order #{order.id}</span>
                  <span style={styles.orderPreviewStatus(order.status)}>
                    {order.status}
                  </span>
                </div>
                <div style={styles.orderPreviewDetails}>
                  <p>Total: ${order.total_price.toFixed(2)}</p>
                  <p>
                    Created: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

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

        {isOrdersModalOpen && (
          <div
            className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
              isOrdersModalOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsOrdersModalOpen(false)}
          >
            <div
              className={`relative bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
                isOrdersModalOpen ? "scale-100" : "scale-90"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-3 right-3 flex space-x-2 z-50">
                <button
                  className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-green-700"
                  onClick={fetchBuyerOrders}
                  title="Refresh Orders"
                >
                  🔄
                </button>
                <button
                  onClick={() => setIsOrdersModalOpen(false)}
                  className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-700"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">My Orders</h2>

                {ordersError && (
                  <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                    {ordersError}
                  </div>
                )}

                {ordersLoading ? (
                  <p>Loading orders...</p>
                ) : buyerOrders.length === 0 ? (
                  <p>No orders found.</p>
                ) : (
                  <div className="space-y-4">
                    {buyerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-gray-200 rounded bg-gray-50 shadow-md"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-lg">
                            Order #{order.id}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              order.status === "completed"
                                ? "bg-green-200 text-green-800"
                                : order.status === "pending"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong>Total Price:</strong> $
                          {order.total_price.toFixed(2)}
                        </div>
                        <div className="mb-2">
                          <strong>Created At:</strong>{" "}
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                        {order.order_items && (
                          <div>
                            <strong>Order Items:</strong>
                            <ul className="list-disc list-inside">
                              {order.order_items.map((item) => (
                                <li key={item.id}>
                                  {item.product_name} - Qty: {item.quantity} - $
                                  {item.total_price.toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {order.delivery && (
                          <div className="mt-2">
                            <strong>Delivery Details:</strong>
                            <p>Method: {order.delivery.delivery_method}</p>
                            {order.delivery.tracking_number && (
                              <p>
                                Tracking #: {order.delivery.tracking_number}
                              </p>
                            )}
                            {order.delivery.estimated_delivery_date && (
                              <p>
                                Estimated Delivery:{" "}
                                {new Date(
                                  order.delivery.estimated_delivery_date
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsOrdersModalOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    backgroundColor: "#f9f9f9",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  productCardHover: {
    transform: "scale(1.02)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  imageContainer: {
    height: "150px",
    marginBottom: "10px",
    borderRadius: "4px",
    overflow: "hidden",
  },
  productDetails: {
    marginTop: "10px",
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
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
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
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#FF4B4B",
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
  profileButton: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  shopButton: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  viewOrdersButton: {
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  recentOrdersPreview: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  orderPreviewCard: {
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
  },
  orderPreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  orderPreviewId: {
    fontWeight: "bold",
    fontSize: "14px",
  },
  orderPreviewStatus: (status) => ({
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor:
      status === "completed"
        ? "#4CAF50"
        : status === "pending"
        ? "#FFC107"
        : "#F44336",
    color: "white",
  }),
  orderPreviewDetails: {
    fontSize: "12px",
  },
};

export default Dashboard;
