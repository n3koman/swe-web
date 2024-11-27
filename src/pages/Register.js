import React, { useState } from 'react';
import { registerFarmer, registerBuyer } from '../apiService';
import { Link } from 'react-router-dom';

const Register = () => {
  const [userType, setUserType] = useState(''); // 'farmer' or 'buyer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [crops, setCrops] = useState('');
  const [govId, setGovId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !phoneNumber) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      if (userType === 'farmer') {
        if (!farmAddress || !farmSize || !crops || !govId) {
          setError('Please fill out all required fields for farmer registration.');
          return;
        }
        const cropsArray = crops.split(',').map(crop => crop.trim());
        const response = await registerFarmer(name, email, phoneNumber, password, farmAddress, parseFloat(farmSize), cropsArray, govId);
        if (response.status === 201) {
          setSuccess('Farmer registered successfully!');
        }
      } else if (userType === 'buyer') {
        if (!deliveryAddress) {
          setError('Please fill out all required fields for buyer registration.');
          return;
        }
        const response = await registerBuyer(name, email, phoneNumber, password, deliveryAddress);
        if (response.status === 201) {
          setSuccess('Buyer registered successfully!');
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <select value={userType} onChange={handleUserTypeChange} style={styles.input} required>
          <option value="">Select User Type</option>
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
        </select>

        {userType === 'farmer' && (
          <>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Farm Address" value={farmAddress} onChange={(e) => setFarmAddress(e.target.value)} style={styles.input} required />
            <input type="number" placeholder="Farm Size (in acres)" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Crops (comma-separated)" value={crops} onChange={(e) => setCrops(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Government ID" value={govId} onChange={(e) => setGovId(e.target.value)} style={styles.input} required />
          </>
        )}

        {userType === 'buyer' && (
          <>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Delivery Address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} style={styles.input} required />
          </>
        )}

        <button type="submit" style={styles.button}>Register</button>

        {/* Add login redirect link */}
        <p style={styles.loginText}>
          Already have an account? <Link to="/login" style={styles.loginLink}>Log in</Link>
        </p>
      </form>
    </div>
  );
};

// Inline styles for the register page
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f9f9f9',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  input: {
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  select: {
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '14px',
  },
  success: {
    color: 'green',
    fontSize: '14px',
  },
  loginText: {
    marginTop: '10px',
    fontSize: '14px',
    textAlign: 'center', // Center-aligns the text
  },
  loginLink: {
    color: '#007BFF',
    textDecoration: 'none',
  },
};


export default Register;
