import React, { useEffect, useState } from "react";

const ViewProductsModal = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      setTimeout(() => setIsAnimating(true), 10); // Start animation
      fetchProductsWithImages();
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsModalVisible(false), 300); // End animation
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsAnimating(false);
        setTimeout(() => {
          setIsModalVisible(false);
          onClose();
        }, 300); // Match animation duration
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const fetchProductsWithImages = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://swe-backend-livid.vercel.app/admin/products-with-images",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products with images");
      }

      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsModalVisible(false);
      onClose();
    }, 300); // Match animation duration
  };

  if (!isModalVisible) return null;

  // Group products by category
  const categorizedProducts = products.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  // Handle image modal open and close
  const openImageModal = (image) => {
    setSelectedImage(image);
    setTimeout(() => setIsAnimating(true), 10);
  };

  const closeImageModal = () => {
    setIsAnimating(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose} // Close modal on clicking outside
    >
      <div
        className={`relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
          isAnimating ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Top-right Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2 z-50">
          {/* Update Button */}
          <button
            className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-green-700"
            onClick={fetchProductsWithImages}
            title="Update List"
          >
            🔄
          </button>
          {/* Close Button */}
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
            <h2 className="text-2xl font-semibold">All Products</h2>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="space-y-6">
              {Object.keys(categorizedProducts).length > 0 ? (
                Object.keys(categorizedProducts).map((category) => (
                  <div key={category}>
                    <h3 className="text-xl font-semibold mb-4">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categorizedProducts[category].map((product) => (
                        <div
                          key={product.id}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-md"
                        >
                          <div className="mb-4">
                            {product.images.length > 0 ? (
                              <img
                                src={`data:${product.images[0].mime_type};base64,${product.images[0].image_data}`}
                                alt={product.name}
                                className="w-full h-40 object-cover rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105"
                                onClick={() =>
                                  openImageModal(product.images[0])
                                }
                              />
                            ) : (
                              <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">No Image</span>
                              </div>
                            )}
                          </div>
                          <p className="font-semibold text-lg">
                            {product.name}
                          </p>
                          <p className="text-gray-700 text-sm mb-2">
                            {product.description || "No description available"}
                          </p>
                          <p className="text-sm">
                            <strong>Price:</strong> ${product.price.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            <strong>Stock:</strong> {product.stock}
                          </p>
                          <p className="text-sm">
                            <strong>Farmer ID:</strong> {product.farmer_id}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>No products available.</p>
              )}
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

      {/* Image Modal */}
      {selectedImage && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeImageModal}
        >
          <div
            className={`relative bg-white rounded-lg overflow-hidden transition-transform duration-300 ${
              isAnimating ? "scale-100" : "scale-90"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`data:${selectedImage.mime_type};base64,${selectedImage.image_data}`}
              alt="Full View"
              className="w-full h-auto"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-700 z-50"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProductsModal;
