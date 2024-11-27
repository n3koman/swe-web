import React, { useState, useEffect } from "react";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
    images: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    "Fruits",
    "Vegetables",
    "Grains",
    "Dairy Products",
    "Poultry and Meat",
    "Fish and Seafood",
    "Herbs and Spices",
    "Nuts and Seeds",
    "Flowers and Plants",
    "Processed Goods",
    "Organic Products",
    "Exotic Items",
    "Hydroponic Produce",
    "Livestock Feed",
    "Medicinal Plants",
    "Handmade or Artisanal Products",
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price || 0,
        stock: product.stock || 0,
        description: product.description || "",
        images: [],
      });

      const fetchImages = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `https://swe-backend-livid.vercel.app/farmer/product/${product.id}/images`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await response.json();
          if (response.ok) {
            setPreviewImages(
              data.images.map((img) => ({
                mimeType: img.mime_type,
                data: img.image_data,
              }))
            );
          } else {
            console.error("Failed to fetch images:", data.error);
          }
        } catch (err) {
          console.error("Error fetching images:", err);
        }
      };

      fetchImages();
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]); // Base64 without prefix
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    )
      .then((base64Images) => {
        setFormData((prev) => ({ ...prev, images: base64Images }));
        setPreviewImages(files.map((file) => URL.createObjectURL(file)));
      })
      .catch((err) => console.error("Error uploading images:", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const productResponse = await fetch(
        `https://swe-backend-livid.vercel.app/farmer/product/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            price: formData.price,
            stock: formData.stock,
            description: formData.description,
          }),
        }
      );

      if (!productResponse.ok) {
        const data = await productResponse.json();
        throw new Error(data.error || "Failed to update product details");
      }

      if (formData.images.length > 0) {
        const imageResponse = await fetch(
          `https://swe-backend-livid.vercel.app/farmer/product/${product.id}/images`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ images: formData.images }),
          }
        );

        if (!imageResponse.ok) {
          const data = await imageResponse.json();
          throw new Error(data.error || "Failed to update product images");
        }
      }

      setSuccess("Product updated successfully!");
      onProductUpdated({ ...formData, id: product.id });
      setTimeout(onClose, 1500); // Close modal after success
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Images (Max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="flex mt-2 space-x-2">
                {previewImages.map((src, index) => (
                  <img
                    key={index}
                    src={src.data ? `data:${src.mimeType};base64,${src.data}` : src}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
