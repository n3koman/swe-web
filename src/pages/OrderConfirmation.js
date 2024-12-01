import React from "react";
import { useNavigate } from "react-router-dom";

const OrderConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-6">Congratulations!</h1>
      <p className="text-lg text-gray-700 mb-6">
        Your order has been placed successfully. Would you like to continue shopping or go to your dashboard?
      </p>

      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={() => navigate("/shop")}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
