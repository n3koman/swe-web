import axios from 'axios';

const API_BASE_URL = 'https://swe-backend-livid.vercel.app';

// API service for registering a user
export const registerUser = async (name, email, password, phoneNumber) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      name,
      email,
      password,
      phone_number: phoneNumber,  // Use snake_case as per backend expectations
    });

    return response; // Return the response to handle in the component
  } catch (error) {
    throw error;  // Throw error to be handled in the component
  }
};
