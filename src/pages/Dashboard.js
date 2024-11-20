import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token'); // Fetch the JWT token from local storage

    if (!token) {
      navigate('/login'); // Redirect to login if no token is found
      return;
    }

    // Fetch the dashboard data
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('https://swe-backend-livid.vercel.app/dashboard/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboardData(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to fetch dashboard data.');
        }
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the JWT token from local storage
    navigate('/login'); // Redirect to login page
  };

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!dashboardData) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>
      <h1>{dashboardData.dashboard}</h1>
      <div style={styles.card}>
        <h2>User Info</h2>
        <p><strong>Name:</strong> {dashboardData.data.name}</p>
        <p><strong>Email:</strong> {dashboardData.data.email}</p>
      </div>

      {dashboardData.dashboard === 'Farmer Dashboard' && (
        <>
          <div style={styles.card}>
            <h2>Farm Info</h2>
            <p><strong>Farm Address:</strong> {dashboardData.data.farm_address}</p>
            <p><strong>Farm Size:</strong> {dashboardData.data.farm_size} acres</p>
            <p><strong>Crops:</strong> {dashboardData.data.crops.join(', ')}</p>
          </div>
          <div style={styles.card}>
            <h2>Products</h2>
            {dashboardData.data.products.length > 0 ? (
              dashboardData.data.products.map((product) => (
                <div key={product.id}>
                  <p><strong>{product.name}</strong></p>
                  <p>{product.description}</p>
                  <p><strong>Price:</strong> ${product.price}</p>
                </div>
              ))
            ) : (
              <p>No products listed yet.</p>
            )}
          </div>
        </>
      )}

      {dashboardData.dashboard === 'Buyer Dashboard' && (
        <div style={styles.card}>
          <h2>Orders</h2>
          {dashboardData.data.orders.length > 0 ? (
            dashboardData.data.orders.map((order) => (
              <div key={order.id}>
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total Price:</strong> ${order.total_price}</p>
              </div>
            ))
          ) : (
            <p>No orders placed yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#FF4B4B',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '20px',
    float: 'right',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '20px',
  },
  loading: {
    textAlign: 'center',
    marginTop: '20px',
  },
};

export default Dashboard;
