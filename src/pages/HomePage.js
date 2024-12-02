// HomePage.js
import React, { useState } from 'react';
import { loginUser } from '../apiService';
import { Link } from 'react-router-dom';
import './HomePage.css';
import logo from '../images/logo.png';

const HomePage = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      const response = await loginUser(email, password);
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token); // Store JWT token
        setIsLoggedIn(true);
        setShowLoginPopup(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleLogout = () => {
    // Perform logout logic here
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="homepage">
      


      <header className="floating-panel">
            <div className="logo-section">
            <img src={logo} alt="Logo" 
                style={{ 
                  width: '50px',    // Set specific width
                  height: 'auto',    // Maintain aspect ratio
                  maxWidth: '100%',  // Responsive scaling
                  objectFit: 'contain' 
                }} 
              />
              <h1>Farm Fresh</h1>
            </div>

            <nav className="links-section">
              <Link to="/">Home</Link>
              <Link to="/features">Features</Link>
              <Link to="/products">Products</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/review">Review</Link>
              <Link to="/blogs">Blogs</Link>
            </nav>

            <div className="user-section">
              {!isLoggedIn ? (
                <>
                  <div className="login-container">
                    <button className="login-btn" onClick={() => setShowLoginPopup((prev) => !prev)}>
                      Login
                    </button>
                    {showLoginPopup && (
                      <div className="login-popup">
                        <h2>Authorization</h2>
                        {error && <p className="error">{error}</p>}
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="login-input"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="login-input"
                          required
                        />
                        <button onClick={handleLogin} className="login-button">
                          Login
                        </button>
                        <button onClick={() => setShowLoginPopup(false)} className="cancel-button">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <Link to="/register" className="signup-btn">
                    Signup
                  </Link>
                </>
              ) : (
                <div className="login-container">
                  <Link to="/dashboard" className="dashboard-btn">
                    Dashboard
                  </Link>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Farm Fresh to Your Doorstep</h1>
          <p>Connecting farmers and buyers directly. Get fresh, organic produce, seeds, and equipment effortlessly.</p>
          <Link to="/register" className="cta-button">Get Started</Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products-section">
        <h2>Our Top Picks</h2>
        <div className="product-grid">
          <div className="product-card">Product 1</div>
          <div className="product-card">Product 2</div>
          <div className="product-card">Product 3</div>
          <div className="product-card">Product 4</div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Explore by Category</h2>
        <div className="categories">
          <div className="category-card">Vegetables</div>
          <div className="category-card">Fruits</div>
          <div className="category-card">Seeds</div>
          <div className="category-card">Equipment</div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <h3>1. Register</h3>
            <p>Sign up as a farmer or buyer and start exploring.</p>
          </div>
          <div className="step">
            <h3>2. List or Browse</h3>
            <p>Farmers list products; buyers browse and purchase.</p>
          </div>
          <div className="step">
            <h3>3. Place Orders</h3>
            <p>Complete purchases seamlessly, with real-time updates.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials">
          <div className="testimonial">"Incredibly fresh produce! The quality is unbeatable."</div>
          <div className="testimonial">"Easy to navigate and reliable."</div>
          <div className="testimonial">"Best platform for buying directly from farmers."</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Join Us Today!</h2>
        <Link to="/register" className="cta-button">Sign Up Now</Link>
      </section>
    </div>
  );
};

export default HomePage;
