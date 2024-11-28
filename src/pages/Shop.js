import React, { useEffect, useState } from "react";
import {
  Search,
  Package,
  Filter,
  SortAsc,
  SortDesc,
  Layout,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewProductDetailModal from "./modals/ViewProductDetailModal";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartAnimationState, setCartAnimationState] = useState({
    isOpen: false,
    isClosing: false,
  });

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    farmer: "",
    priceMin: "",
    priceMax: "",
    sortPrice: "",
  });

  // Unique categories and farmers for filter dropdowns
  const [categories, setCategories] = useState([]);
  const [farmers, setFarmers] = useState([]);

  const navigate = useNavigate();

  const fetchProducts = async (query = "", filterParams = {}) => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      // Construct query parameters
      const params = new URLSearchParams();
      if (query) params.append("search", query);
      if (filterParams.category)
        params.append("category", filterParams.category);
      if (filterParams.farmer) params.append("farmer", filterParams.farmer);
      if (filterParams.priceMin)
        params.append("price_min", filterParams.priceMin);
      if (filterParams.priceMax)
        params.append("price_max", filterParams.priceMax);
      if (filterParams.sortPrice) params.append("sort", filterParams.sortPrice);

      const endpoint = `https://swe-backend-livid.vercel.app/buyer/products?${params.toString()}`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.suggestions && data.suggestions.length > 0) {
          // Fetch suggested products from the database
          const suggestionParams = new URLSearchParams();
          suggestionParams.append("search", data.suggestions.join(" "));
          const suggestionEndpoint = `https://swe-backend-livid.vercel.app/buyer/products?${suggestionParams.toString()}`;

          const suggestionResponse = await fetch(suggestionEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const suggestionData = await suggestionResponse.json();

          if (suggestionResponse.ok && suggestionData.products.length > 0) {
            setProducts(suggestionData.products);
            setError(
              `No exact products found. Showing suggestions: ${data.suggestions.join(
                ", "
              )}`
            );
          } else {
            setProducts([]);
            setError(
              "No exact products found, and no similar products available."
            );
          }
        } else {
          setProducts([]);
          setError(data.error || "Failed to fetch products.");
        }
        return;
      }

      setProducts(data.products);

      // Extract unique categories and farmers for filters
      const uniqueCategories = [
        ...new Set(data.products.map((p) => p.category)),
      ];
      const uniqueFarmers = [
        ...new Set(data.products.map((p) => p.farmer_name).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
      setFarmers(uniqueFarmers);
    } catch (err) {
      console.error("Error during fetchProducts:", err);
      setError("Error fetching products. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://swe-backend-livid.vercel.app/buyer/cart",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch cart.");

      setCart(data.cart_items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showCart) {
        closeCart();
      }
    };

    // Add event listener when cart is open
    if (showCart) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    // Cleanup event listener
    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showCart]);

  const handleSearch = () => {
    fetchProducts(searchQuery, filters);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    fetchProducts(searchQuery, filters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      farmer: "",
      priceMin: "",
      priceMax: "",
      sortPrice: "",
    });
    fetchProducts();
    setShowFilters(false);
  };
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://swe-backend-livid.vercel.app/buyer/cart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: [{ product_id: product.id, quantity: 1 }],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add product to cart.");

      // Refetch the cart to ensure the UI reflects the backend
      await fetchCartItems();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

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

      if (!response.ok) throw new Error("Failed to remove product from cart");

      // Update the cart state to remove the product
      setCart((prevCart) =>
        prevCart.filter((item) => item.product_id !== productId)
      );
    } catch (error) {
      console.error("Error removing product from cart:", error);
      setError("Failed to remove product from cart. Please try again.");
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authorization token is missing");
        return;
      }

      // If quantity is 0 or less, explicitly remove the item from the cart
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      // Send the updated quantity to the backend
      const response = await fetch(
        "https://swe-backend-livid.vercel.app/buyer/cart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: [{ product_id: productId, quantity: newQuantity }],
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update cart in the backend.");
      }

      // Update the cart state immediately for better UI feedback
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      alert(error.message || "Failed to update cart. Please try again.");
    }
  };

  const openCart = async () => {
    await fetchCartItems(); // Fetch the latest cart items from the backend
    setShowCart(true);
    setTimeout(() => {
      setCartAnimationState({ isOpen: true, isClosing: false });
    }, 10);
  };
  const closeCart = () => {
    setCartAnimationState({ isOpen: false, isClosing: true });
    setTimeout(() => {
      setShowCart(false);
      setCartAnimationState({ isOpen: false, isClosing: false });
    }, 300);
  };

  const isProductInCart = (productId) => {
    return cart.some((item) => item.product_id === productId);
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authorization token is missing");

      // Navigate to cart page after ensuring items are added
      navigate("/checkout");
    } catch (err) {
      console.error("Error during checkout:", err);
      setError("Error proceeding to checkout.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 relative">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
            <Package className="mr-3 text-blue-600" size={32} />
            Farmers Market
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={openCart}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <ShoppingCart className="mr-2" size={16} />
              Cart ({cart.length})
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Layout className="mr-2" size={16} />
              Dashboard
            </button>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Search className="mr-2" size={16} />
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
          >
            <Filter className="mr-2" size={16} />
            Filters
          </button>
        </div>

        {/* Filters Modal */}
        {showFilters && (
          <div className="absolute z-50 right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              Filter & Sort Products
            </h3>

            {/* Category Filter */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Farmer Filter */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farmer
              </label>
              <select
                name="farmer"
                value={filters.farmer}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Farmers</option>
                {farmers.map((farmer) => (
                  <option key={farmer} value={farmer}>
                    {farmer}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-3 flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  name="priceMin"
                  value={filters.priceMin}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Min"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Sort by Price */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by Price
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, sortPrice: "asc" }))
                  }
                  className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
                    filters.sortPrice === "asc"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <SortAsc className="mr-2" size={16} />
                  Ascending
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, sortPrice: "desc" }))
                  }
                  className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
                    filters.sortPrice === "desc"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <SortDesc className="mr-2" size={16} />
                  Descending
                </button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      {/* Existing product grid code remains the same as before */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 animate-pulse bg-gray-100"
              >
                <div className="h-6 bg-gray-300 w-3/4 mb-2 rounded"></div>
                <div className="h-4 bg-gray-300 w-full mb-2 rounded"></div>
                <div className="h-4 bg-gray-300 w-5/6 rounded"></div>
              </div>
            ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {product.images && product.images[0]?.data ? (
                <img
                  src={`data:${product.images[0].mime_type};base64,${product.images[0].data}`}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-3"
                  onClick={() => handleProductClick(product)}
                />
              ) : (
                <div
                  className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500"
                  onClick={() => handleProductClick(product)}
                >
                  No Image
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  {product.name}
                </h2>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {product.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </span>
                {isProductInCart(product.id) ? (
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                  >
                    <ShoppingCart size={16} />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                <strong>Farmer:</strong> {product.farmer_name || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Stock:</strong> {product.stock}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No products found. Try a different search.</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ViewProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {showCart && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 
          ${cartAnimationState.isOpen ? "bg-opacity-50" : "bg-opacity-0"}`}
          onClick={closeCart}
        >
          <div
            className={`absolute right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
              ${
                cartAnimationState.isOpen ? "translate-x-0" : "translate-x-full"
              }
              ${cartAnimationState.isClosing ? "translate-x-full" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button
                  onClick={closeCart}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                  <div>
                    <ShoppingCart
                      size={48}
                      className="mx-auto mb-4 opacity-50"
                    />
                    <p>Your cart is empty</p>
                  </div>
                </div>
              ) : (
                <div className="flex-grow overflow-y-auto p-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center border-b py-3 last:border-b-0"
                    >
                      {/* Product Image */}
                      {item.images && item.images[0]?.data ? (
                        <img
                          src={`data:${item.images[0].mime_type};base64,${item.images[0].data}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md mr-4"></div>
                      )}

                      {/* Product Details */}
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          ${item.price ? item.price.toFixed(2) : "0.00"} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        {/* Decrease Quantity Button */}
                        <button
                          onClick={() => {
                            const newQuantity = item.quantity - 1; // Decrease quantity by 1
                            updateCartQuantity(item.id, newQuantity); // Handles visual update and removal
                          }}
                          className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          -
                        </button>

                        {/* Quantity Input Field */}
                        <input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => {
                            const newQuantity = Math.max(
                              Number(e.target.value),
                              1
                            ); // Ensure minimum value of 1
                            updateCartQuantity(item.id, newQuantity);
                          }}
                          className="w-12 text-center border rounded"
                          min="1"
                        />

                        {/* Increase Quantity Button */}
                        <button
                          onClick={() => {
                            const newQuantity = item.quantity + 1; // Increase quantity by 1
                            updateCartQuantity(item.id, newQuantity);
                          }}
                          className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="p-6 border-t">
                  <p className="text-xl font-bold mb-4">
                    Total: $
                    {cart
                      .reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
