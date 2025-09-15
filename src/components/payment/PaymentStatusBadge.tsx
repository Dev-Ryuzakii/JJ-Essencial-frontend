import React from 'react';
import { Loader2 } from 'lucide-react';

type PaymentStatus = 
  | 'pending' 
  | 'awaiting_verification' 
  | 'verified' 
  | 'rejected'
  | 'expired';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />,
          label: 'Pending Payment'
        };
      case 'awaiting_verification':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
          label: 'Awaiting Verification'
        };
      case 'verified':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ),
          label: 'Payment Verified'
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          label: 'Payment Rejected'
        };
      case 'expired':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Payment Expired'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${config?.bgColor} ${config?.textColor} ${className}`}
    >
      {config?.icon}
      {config?.label}
    </span>
  );
};

export default PaymentStatusBadge;
