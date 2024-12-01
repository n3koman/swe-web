import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const FarmerOrdersModal = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null); // To track the updating order ID

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsModalVisible(false);
      onClose();
    }, 300); // Match animation duration
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      setTimeout(() => setIsAnimating(true), 10); // Trigger animation
      fetchFarmerOrders();
    } else {
      handleClose();
    }
  }, [isOpen, handleClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const fetchFarmerOrders = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://swe-backend-livid.vercel.app/farmer/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.orders);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch farmer orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://swe-backend-livid.vercel.app/farmer/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the local state with the new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update order status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (!isModalVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
          isAnimating ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 flex space-x-2 z-50">
          <button
            className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-green-700"
            onClick={fetchFarmerOrders}
            title="Refresh Orders"
          >
            🔄
          </button>
          <button
            onClick={handleClose}
            className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-700"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">My Product Orders</h2>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found for your products.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="p-4 border border-gray-200 rounded bg-gray-50 shadow-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">
                      Order #{order.order_id}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.order_id, e.target.value)
                      }
                      disabled={updatingStatus === order.order_id}
                      className="px-2 py-1 rounded text-sm"
                    >
                      <option value="PLACED">Placed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="DISPATCHED">Dispatched</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELED">Canceled</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <strong>Buyer ID:</strong> {order.buyer_id}
                  </div>
                  <div className="mb-2">
                    <strong>Total Order Price:</strong> $
                    {order.total_price.toFixed(2)}
                  </div>
                  <div className="mb-2">
                    <strong>Created At:</strong>{" "}
                    {new Date(order.created_at).toLocaleString()}
                  </div>

                  <div>
                    <strong>Your Products in This Order:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {order.order_items.map((item) => (
                        <li key={item.id}>
                          {item.product_name} - Qty: {item.quantity} - ${" "}
                          {item.total_price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.delivery && (
                    <div className="mt-2 border-t pt-2">
                      <strong>Delivery Details:</strong>
                      <p>Method: {order.delivery.delivery_method}</p>
                      {order.delivery.tracking_number && (
                        <p>Tracking #: {order.delivery.tracking_number}</p>
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
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerOrdersModal;
