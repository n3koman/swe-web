import React, { useState, useEffect } from "react";

const ViewProductDetailModal = ({ product, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger the opening animation
    setTimeout(() => setIsAnimating(true), 10);

    // Add event listener for Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsAnimating(false); // Trigger exit animation
        setTimeout(() => {
          onClose(); // Close modal after animation
        }, 300); // Match the animation duration
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsAnimating(false); // Trigger exit animation
    setTimeout(() => {
      onClose(); // Close modal after animation
    }, 300); // Match the animation duration
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-md relative transform transition-transform duration-300 ${
          isAnimating ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
        >
          ✕
        </button>
        {product.images && product.images[0]?.data && (
          <img
            src={`data:${product.images[0].mime_type};base64,${product.images[0].data}`}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
            {product.category}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          <strong>Farmer:</strong> {product.farmer_name || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Stock:</strong> {product.stock}
        </p>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ViewProductDetailModal;
