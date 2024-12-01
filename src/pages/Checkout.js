import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    email: "",
    phone_number: "",
    street_address: "",
    country: "",
    delivery_method: "HOME_DELIVERY",
    special_instructions: "",
  });

  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      if (!token) throw new Error("Authorization token is missing");

      const response = await fetch(
        "https://swe-backend-livid.vercel.app/buyer/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();

      // Update delivery info with user's profile data
      setDeliveryInfo((prevInfo) => ({
        ...prevInfo,
        name: userData.name || prevInfo.name,
        email: userData.email || prevInfo.email,
        phone_number: userData.phone_number || prevInfo.phone_number,
        street_address: userData.delivery_address || prevInfo.street_address,
      }));
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to fetch user profile");
    } finally {
      setIsProfileLoading(false);
    }
  };

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
      console.log("Fetched cart items:", data.cart_items); // Debug cart items
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
    try {
      if (
        !productId ||
        quantity === null ||
        quantity === undefined ||
        quantity < 0
      ) {
        console.error("Invalid product ID or quantity:", {
          productId,
          quantity,
        });
        throw new Error("Invalid product ID or quantity.");
      }

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
            cart: [{ product_id: productId, quantity }], // Changed from id to product_id
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update cart.");
      }

      // Update local cart state
      setCart((prevCart) =>
        prevCart.map(
          (item) => (item.id === productId ? { ...item, quantity } : item) // Changed from product_id to id
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
      setCart(
        (prevCart) => prevCart.filter((item) => item.id !== productId) // Changed from product_id to id
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

  const handleDeliveryInfoChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Place order method
  const placeOrder = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authorization token is missing");

    const orderData = {
      cart_items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      delivery_info: {
        ...deliveryInfo,
        special_instructions: undefined, // Remove this field
      },
      total_price: calculateTotalPrice(),
    };

    const response = await fetch(
      "https://swe-backend-livid.vercel.app/buyer/place-order",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to place order");
    }

    const responseData = await response.json();
    console.log("Order placed:", responseData);
    setCart([]);
    navigate("/order-confirmation", { state: { orderId: responseData.order_id } });
  } catch (err) {
    console.error("Error placing order:", err);
    setError(err.message || "Failed to place order");
  }
};


  useEffect(() => {
    fetchCartItems();
    fetchUserProfile();
  }, []);

  if (loading || isProfileLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading your checkout information...</p>
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
                key={`${item.id}-${item.quantity}`} // Use id instead of product_id
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
                    onClick={() => {
                      console.log(
                        "Decreasing quantity for:",
                        item.id,
                        item.quantity - 1
                      );
                      updateCartQuantity(item.id, item.quantity - 1);
                    }}
                    className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateCartQuantity(
                        item.id,
                        Math.max(Number(e.target.value), 1)
                      )
                    }
                    className="w-12 text-center border rounded"
                  />
                  <button
                    onClick={() =>
                      updateCartQuantity(item.id, item.quantity + 1)
                    }
                    className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Delivery Information Form */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Delivery Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={deliveryInfo.name}
                onChange={handleDeliveryInfoChange}
                placeholder="Full Name"
                className="border p-2 rounded col-span-2"
                required
              />
              <input
                type="email"
                name="email"
                value={deliveryInfo.email}
                onChange={handleDeliveryInfoChange}
                placeholder="Email"
                className="border p-2 rounded col-span-2"
                required
              />
              <input
                type="tel"
                name="phone_number"
                value={deliveryInfo.phone_number}
                onChange={handleDeliveryInfoChange}
                placeholder="Phone Number"
                className="border p-2 rounded col-span-2"
                required
              />
              <select
                name="delivery_method"
                value={deliveryInfo.delivery_method}
                onChange={handleDeliveryInfoChange}
                className="border p-2 rounded col-span-2"
                required
              >
                <option value="HOME_DELIVERY">Home Delivery</option>
                <option value="PICKUP_POINT">Pickup Point</option>
                <option value="THIRD_PARTY">Third Party Delivery</option>
              </select>
              <input
                type="text"
                name="street_address"
                value={deliveryInfo.street_address}
                onChange={handleDeliveryInfoChange}
                placeholder="Street Address"
                className="border p-2 rounded col-span-2"
                required
              />
              <input
                type="text"
                name="country"
                value={deliveryInfo.country}
                onChange={handleDeliveryInfoChange}
                placeholder="Country"
                className="border p-2 rounded col-span-2"
                required
              />
              <textarea
                name="special_instructions"
                value={deliveryInfo.special_instructions}
                onChange={handleDeliveryInfoChange}
                placeholder="Special Delivery Instructions (Optional)"
                className="border p-2 rounded col-span-2"
                rows="3"
              />
            </div>
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
              onClick={placeOrder}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Place Order
            </button>
          </div>
          {error && (
            <div className="mt-4 text-red-500 text-center">{error}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkout;
