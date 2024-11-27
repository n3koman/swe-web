import React, { useState, useEffect } from "react";

const ProductImageDisplay = ({ productId }) => {
  const [images, setImages] = useState([]);
  const [hovered, setHovered] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Tracks visibility
  const [isModalAnimating, setIsModalAnimating] = useState(false); // Tracks animation
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `https://swe-backend-livid.vercel.app/farmer/product/${productId}/images`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setImages(data.images);
        } else {
          console.error("Failed to fetch images:", data.error);
        }
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    };

    fetchImages();
  }, [productId]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalVisible(true); // Make modal visible
    setTimeout(() => setIsModalAnimating(true), 10); // Trigger animation after visibility
  };

  const closeModal = () => {
    setIsModalAnimating(false); // Start close animation
    setTimeout(() => {
      setIsModalVisible(false); // Hide modal after animation
      setSelectedImage(null);
    }, 300); // Match the animation duration
  };

  if (images.length === 0) {
    return (
      <div style={{ color: "#888", fontStyle: "italic" }}>
        No Image Available
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          ...styles.container,
          ...(hovered ? styles.containerHover : {}),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => handleImageClick(images[0])}
      >
        <img
          src={`data:${images[0].mime_type};base64,${images[0].image_data}`}
          alt={`Product ${productId}`}
          style={styles.image}
        />
      </div>

      {isModalVisible && (
        <div
          style={{
            ...styles.modalOverlay,
            opacity: isModalAnimating ? 1 : 0,
            pointerEvents: isModalAnimating ? "auto" : "none",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              ...styles.modalContent,
              transform: isModalAnimating ? "scale(1)" : "scale(0.8)",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <img
              src={`data:${selectedImage.mime_type};base64,${selectedImage.image_data}`}
              alt="Full View"
              style={styles.modalImage}
            />
            <button onClick={closeModal} style={styles.closeButton}>
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  container: {
    position: "relative",
    width: "150px",
    height: "150px",
    overflow: "hidden",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    margin: "10px",
    cursor: "pointer",
  },
  containerHover: {
    transform: "scale(1.1)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    transition: "opacity 0.3s ease",
  },
  modalContent: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    padding: "10px",
    maxWidth: "90%",
    maxHeight: "90%",
    overflow: "hidden",
    transition: "transform 0.3s ease",
  },
  modalImage: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default ProductImageDisplay;
