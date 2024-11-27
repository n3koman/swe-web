import React, { useEffect, useState } from "react";

const ViewUsersModal = ({ isOpen, onClose, onEditUser }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      setTimeout(() => setIsAnimating(true), 10); // Start animation
      fetchUsers();
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

  const fetchUsers = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://swe-backend-livid.vercel.app/admin/users",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return; // Exit if the user cancels the action
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://swe-backend-livid.vercel.app/admin/user/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the user.");
      }

      setUsers(users.filter((user) => user.id !== userId));
      alert("User deleted successfully.");
    } catch (error) {
      alert(error.message || "An error occurred while deleting the user.");
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsModalVisible(false);
      onClose();
    }, 300); // End animation
  };

  const formatRole = (role) => {
    return role.replace("Role.", ""); // Remove "Role." prefix
  };

  if (!isModalVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose} // Close modal on clicking outside
    >
      <div
        className={`relative bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
          isAnimating ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Top-right Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2 z-50">
          {/* Update Button */}
          <button
            className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-green-700"
            onClick={fetchUsers}
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
            <h2 className="text-2xl font-semibold">All Users</h2>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="space-y-4">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-md"
                  >
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Role:</strong> {formatRole(user.role)}
                    </p>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => onEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No users available.</p>
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
    </div>
  );
};

export default ViewUsersModal;
