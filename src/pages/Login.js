import React, { useState } from "react";
import { loginUser } from "../apiService";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      const response = await loginUser(email, password);
      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem("token", token); // Store JWT token

        const decodedToken = jwtDecode(token);
        console.log("Decoded token payload:", decodedToken); // Debugging print to log the decoded token payload

        const userID = decodedToken.user_id; // Use user_id from the payload
        console.log("User ID:", userID);
        localStorage.setItem("userID", userID);
        navigate("/dashboard"); // Redirect
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data) {
        setError(
          error.response.data.message || "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Login
        </button>

        <Link to="/" style={styles.homeButton}>
          Back to Homepage
        </Link>
      </form>
      <p style={styles.registerText}>
        Don't have an account?{" "}
        <Link to="/register" style={styles.registerLink}>
          Register here
        </Link>
      </p>
    </div>
  );
};

// Inline styles for the login page
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f9f9f9",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
  },
  input: {
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007BFF",
    color: "white",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  homeButton: {
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px 20px",
    marginTop: "10px",
    textDecoration: "none",
    textAlign: "center",
    color: "#333",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  registerText: {
    marginTop: "10px",
    fontSize: "14px",
    textAlign: "center",
  },
  registerLink: {
    color: "#007BFF",
    textDecoration: "none",
  },
};

export default Login;
