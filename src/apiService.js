import axios from 'axios';

const API_BASE_URL = 'https://swe-backend-livid.vercel.app';

export const registerFarmer = async (name, email, password, phoneNumber, farmAddress, farmSize, crops, govId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/farmer`, {
      name,
      email,
      password,
      phone_number: phoneNumber,
      farm_address: farmAddress,
      farm_size: farmSize,
      crops,
      gov_id: govId
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const registerBuyer = async (name, email, phoneNumber, password, deliveryAddress) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/buyer`, {
      name,
      email,
      phone_number: phoneNumber,
      password,
      delivery_address: deliveryAddress
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
