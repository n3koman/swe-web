import React, { useEffect, useState } from "react";
import {
  Search,
  Package,
  Filter,
  SortAsc,
  SortDesc,
  Layout,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewProductDetailModal from "./modals/ViewProductDetailModal";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  useEffect(() => {
    fetchProducts();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 relative">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
            <Package className="mr-3 text-blue-600" size={32} />
            Farmers Market
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Layout className="mr-2" size={16} />
            Dashboard
          </button>
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
              onClick={() => handleProductClick(product)}
            >
              {product.images && product.images[0]?.data ? (
                <img
                  src={`data:${product.images[0].mime_type};base64,${product.images[0].data}`}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
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
    </div>
  );
};

export default Shop;
