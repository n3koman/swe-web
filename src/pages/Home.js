import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.container}>
      <h1>Welcome to Farmer Market!</h1>
      <p>Join us today and start buying and selling fresh produce directly from local farmers.</p>

      <Link to="/register">
        <button style={styles.button}>Register Now</button>
      </Link>
    </div>
  );
};

// Basic inline styles for the home page
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default Home;
