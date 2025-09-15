import React from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const baseClasses = 'px-4 py-3 rounded-md mb-4 text-sm';
  
  const typeClasses = {
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200'
  };
  
  const alertClasses = `${baseClasses} ${typeClasses[type]} ${className}`;

  return (
    <div className={alertClasses} role="alert">
      {message}
    </div>
  );
};

export default Alert;