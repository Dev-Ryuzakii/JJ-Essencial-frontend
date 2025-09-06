import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BankTransferCheckout from '../components/payment/BankTransferCheckout';
import { ordersApi } from '../services';
import { Loader2 } from 'lucide-react';

const BankTransferCheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    console.log('BankTransferCheckoutPage mounted, orderId:', orderId);
    
    if (!orderId) {
      setError('No order ID provided');
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching order:', orderId);
        
        try {
          // Try to get the order from API
          const response = await ordersApi.getById(orderId);
          if (response.success && response.data) {
            console.log('Order loaded successfully:', response.data);
            setOrder(response.data);
          } else {
            console.error('Failed to load order:', response);
            throw new Error('Order not found');
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('Order not found or failed to load');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleOrderComplete = (paymentData: any) => {
    console.log('Payment completed:', paymentData);
    navigate(`/orders/confirmation?orderId=${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error || 'Failed to load payment information'}
        </h1>
        <p className="text-gray-600 mb-8">
          There was a problem retrieving your order. Please try again or contact customer support.
        </p>
        <button 
          onClick={() => navigate('/checkout')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return to Checkout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Complete Your Payment</h1>
      <BankTransferCheckout 
        order={order}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
};

export default BankTransferCheckoutPage;
