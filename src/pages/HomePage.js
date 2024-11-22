// HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Farm Fresh to Your Doorste</h1>
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
