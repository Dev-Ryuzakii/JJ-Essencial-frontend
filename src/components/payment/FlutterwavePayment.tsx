import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  flutterwaveApi, 
  loadFlutterwaveScript, 
  isFlutterwaveLoaded,
  FlutterwaveWindow,
  FlutterwaveCheckoutParams
} from '../../services/flutterwaveApi';
import { Button, Alert, Spinner } from '../ui'; // Assuming you have these UI components

interface FlutterwavePaymentProps {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  currency?: string;
  orderId: string;
  onSuccess?: (transactionId: string, txRef: string) => void;
  onFailure?: (error: any) => void;
  onClose?: () => void;
}

const FlutterwavePayment: React.FC<FlutterwavePaymentProps> = ({
  amount,
  email,
  name,
  phone = '',
  currency = 'NGN',
  orderId,
  onSuccess,
  onFailure,
  onClose
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(isFlutterwaveLoaded());

  // Load Flutterwave script
  useEffect(() => {
    if (!scriptLoaded) {
      setLoading(true);
      loadFlutterwaveScript()
        .then(() => {
          setScriptLoaded(true);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load Flutterwave script:', err);
          setError('Failed to load payment gateway. Please try again later.');
          setLoading(false);
        });
    }
  }, [scriptLoaded]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initiate payment with backend
      const response = await flutterwaveApi.initiatePayment(
        amount,
        { email, name, phone },
        currency
      );

      if (!response.data) {
        throw new Error('Failed to initialize payment');
      }

      const { publicKey, tx_ref, amount: confirmedAmount, currency: confirmedCurrency, customer } = response.data;

      // Configure Flutterwave checkout
      const config: FlutterwaveCheckoutParams = {
        public_key: publicKey,
        tx_ref,
        amount: confirmedAmount,
        currency: confirmedCurrency,
        payment_options: 'card,banktransfer,ussd',
        customer: {
          email: customer.email,
          phone_number: customer.phone || '',
          name: customer.name
        },
        customizations: {
          title: 'JJ Essencial Payment',
          description: `Payment for order #${orderId}`,
          logo: window.location.origin + '/favicon.svg', // Use your website logo
        },
        callback: (response: any) => {
          console.log('Payment callback:', response);
          
          // Verify transaction with backend
          if (response.status === 'successful') {
            handleTransactionVerification(response.transaction_id, tx_ref);
          } else {
            setError(`Payment failed: ${response.message || 'Unknown error'}`);
            if (onFailure) onFailure(response);
          }
        },
        onclose: () => {
          console.log('Payment modal closed');
          setLoading(false);
          if (onClose) onClose();
        }
      };

      // Open Flutterwave checkout
      const flutterwaveCheckout = (window as unknown as FlutterwaveWindow).FlutterwaveCheckout;
      if (flutterwaveCheckout) {
        flutterwaveCheckout(config);
      } else {
        throw new Error('Flutterwave checkout not available');
      }
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
      if (onFailure) onFailure(err);
    }
  };

  const handleTransactionVerification = async (transactionId: string, txRef: string) => {
    try {
      setLoading(true);
      
      // Confirm payment with backend
      const response = await flutterwaveApi.confirmPayment(transactionId, txRef);
      
      if (response.data?.ok) {
        console.log('Payment verification successful:', response);
        if (onSuccess) onSuccess(transactionId, txRef);
        
        // Redirect to order confirmation
        navigate(`/order-confirmation/${orderId}`);
      } else {
        throw new Error(response.data?.message || 'Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setError(err.message || 'Payment verification failed. Please contact support.');
      if (onFailure) onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flutterwave-payment">
      {error && <Alert type="error" message={error} />}
      
      <Button
        onClick={handlePayment}
        disabled={loading || !scriptLoaded}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Spinner size="sm" className="mr-2" /> Processing...
          </div>
        ) : (
          'Pay with Flutterwave'
        )}
      </Button>
    </div>
  );
};

export default FlutterwavePayment;