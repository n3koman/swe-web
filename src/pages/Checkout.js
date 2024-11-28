import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch cart items from the server
  const fetchCartItems = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authorization token is missing");

      const response = await fetch(
        "https://swe-backend-livid.vercel.app/buyer/cart",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch cart.");

      setCart(data.cart_items);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError(err.message || "Failed to fetch cart items.");
    } finally {
      setLoading(false);
    }
  };

  // Update cart quantity
  const updateCartQuantity = async (productId, quantity) => {
    if (!productId || quantity < 0) {
      console.error("Invalid product or quantity:", { productId, quantity });
      setError("Invalid product or quantity. Please refresh and try again.");
      return;
    }

    if (quantity === 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authorization token is missing");

      const response = await fetch(
        "https://swe-backend-livid.vercel.app/buyer/cart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: [{ product_id: productId, quantity }],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update cart.");

      // Update local cart state
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      setError(err.message || "Failed to update cart quantity.");
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authorization token is missing");

      const response = await fetch(
        "https://swe-backend-livid.vercel.app/buyer/cart/remove",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: productId }),
        }
      );

      if (!response.ok) throw new Error("Failed to remove item from cart.");

      // Update local cart state
      setCart((prevCart) =>
        prevCart.filter((item) => item.product_id !== productId)
      );
    } catch (err) {
      console.error("Error removing product from cart:", err);
      setError(err.message || "Failed to remove product from cart.");
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p>Your cart is empty.</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-4"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 gap-4">
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center border rounded-lg p-4"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-200 rounded-md mr-4 flex-shrink-0">
                  {item.images && item.images[0]?.data ? (
                    <img
                      src={`data:${item.images[0].mime_type};base64,${item.images[0].data}`}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-md"></div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateCartQuantity(item.product_id, item.quantity - 1)
                    }
                    className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateCartQuantity(
                        item.product_id,
                        Math.max(Number(e.target.value), 1)
                      )
                    }
                    className="w-12 text-center border rounded"
                  />
                  <button
                    onClick={() =>
                      updateCartQuantity(item.product_id, item.quantity + 1)
                    }
                    className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="ml-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Total Price */}
          <div className="mt-6 text-right">
            <p className="text-xl font-bold">
              Total: ${calculateTotalPrice().toFixed(2)}
            </p>
          </div>

          {/* Buy Button */}
          <div className="mt-6 text-right">
            <button
              onClick={() => alert("Proceed to buy")}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
