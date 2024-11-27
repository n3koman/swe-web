import React, { useState, useEffect } from 'react';

const FarmerProfileModal = ({ isOpen, onClose, currentProfile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    farm_address: '',
    farm_size: '',
    crop_types: [],
    resources: [],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [newResource, setNewResource] = useState({
    resource_type: '',
    description: '',
    quantity: '',
  });

  useEffect(() => {
    if (currentProfile) {
      setFormData(currentProfile);
    }
  }, [currentProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCropTypesChange = (e) => {
    const crops = e.target.value.split(',').map((crop) => crop.trim());
    setFormData((prev) => ({
      ...prev,
      crop_types: crops,
    }));
  };

  const handleResourceInputChange = (e) => {
    const { name, value } = e.target;
    setNewResource((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://swe-backend-livid.vercel.app/farmer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://swe-backend-livid.vercel.app/farmer/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newResource),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add resource');
      }

      setFormData((prev) => ({
        ...prev,
        resources: [...prev.resources, data.resource],
      }));
      setNewResource({ resource_type: '', description: '', quantity: '' });
      setSuccess('Resource added successfully!');
    } catch (err) {
      setError(err.message);
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
            <h2 className="text-2xl font-semibold">Farmer Profile Management</h2>
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
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Farm Address</label>
              <input
                type="text"
                name="farm_address"
                value={formData.farm_address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Farm Size (acres)</label>
              <input
                type="number"
                name="farm_size"
                value={formData.farm_size}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Crop Types (comma-separated)
              </label>
              <input
                type="text"
                name="crop_types"
                value={formData.crop_types.join(', ')}
                onChange={handleCropTypesChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div className="border-t mt-4 pt-4">
              <h3 className="text-lg font-medium">Resources</h3>

              <div className="space-y-4">
                {formData.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded bg-gray-50"
                  >
                    <p>
                      <strong>Type:</strong> {resource.type}
                    </p>
                    <p>
                      <strong>Description:</strong> {resource.description}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {resource.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  name="resource_type"
                  value={newResource.resource_type}
                  onChange={handleResourceInputChange}
                  placeholder="Resource Type"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="description"
                  value={newResource.description}
                  onChange={handleResourceInputChange}
                  placeholder="Description"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  name="quantity"
                  value={newResource.quantity}
                  onChange={handleResourceInputChange}
                  placeholder="Quantity"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
                  disabled={loading}
                >
                  Add Resource
                </button>
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
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfileModal;
