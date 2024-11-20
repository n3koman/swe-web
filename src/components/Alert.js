import React from 'react';

export const Alert = ({ variant = "info", children }) => {
  const variantStyles = {
    info: "bg-blue-50 text-blue-700",
    success: "bg-green-50 text-green-700",
    warning: "bg-yellow-50 text-yellow-700",
    destructive: "bg-red-50 text-red-700",
  };

  return (
    <div className={`p-4 rounded ${variantStyles[variant] || ""}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => (
  <p className="text-sm">{children}</p>
);