import React from 'react';

interface OrderTrackerProps {
  currentStatus: 'awaiting_payment' | 'payment_uploaded' | 'payment_verified' | 'processing' | 'shipped' | 'delivered';
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ currentStatus }) => {
  // Define all possible statuses and their order
  const statuses = [
    {
      key: 'awaiting_payment',
      label: 'Awaiting Payment',
      description: 'Your order is waiting for payment confirmation',
    },
    {
      key: 'payment_uploaded',
      label: 'Payment Uploaded',
      description: 'Your payment receipt is being verified',
    },
    {
      key: 'payment_verified', 
      label: 'Payment Verified',
      description: 'Your payment has been confirmed',
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Your order is being prepared',
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'Your order is on its way to you',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Your order has been delivered',
    },
  ];

  // Find the current status index
  const currentStatusIndex = statuses.findIndex(status => status.key === currentStatus);
  
  return (
    <div className="w-full py-6">
      <div className="flex items-center">
        {statuses.map((status, index) => (
          <React.Fragment key={status.key}>
            {/* Status Circle */}
            <div className="relative flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10
                  ${index <= currentStatusIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'}`}
              >
                {index < currentStatusIndex ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="text-center mt-2">
                <div className={`text-xs font-semibold ${index <= currentStatusIndex ? 'text-blue-600' : 'text-gray-500'}`}>
                  {status.label}
                </div>
                <div className="text-xs text-gray-500 mt-1 max-w-[120px]">
                  {status.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < statuses.length - 1 && (
              <div 
                className={`flex-1 h-1 ${
                  index < currentStatusIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OrderTracker;
