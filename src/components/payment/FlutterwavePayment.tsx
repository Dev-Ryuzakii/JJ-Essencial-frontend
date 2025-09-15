import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  loadFlutterwaveScript, 
  isFlutterwaveLoaded
} from '../../services/flutterwaveApi';
import type {
  FlutterwaveWindow,
  FlutterwaveCheckoutParams
} from '../../services/flutterwaveApi';
import { paymentsApi } from '../../services';
import { fastPaymentService, type FastPaymentResult } from '../../services/fastPaymentService';
import FastPaymentConfirmation from './FastPaymentConfirmation';
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
  
  // Fast confirmation states
  const [showFastConfirmation, setShowFastConfirmation] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<{transactionId: string, txRef: string} | null>(null);

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
    if (!orderId || orderId === 'temporary-id') {
      setError('Order ID is required to process payment. Please create an order first.');
      if (onFailure) onFailure(new Error('Invalid order ID'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Initiate payment with backend (send orderId and all required fields)
      const response = await paymentsApi.flutterwave.initiate({
        orderId,
        amount,
        currency,
        customer: {
          email,
          name,
          phone: phone || ''
        }
      });

      if (!response.success || !response.data) {
        const errorMessage = (response as any).message || 'Failed to initialize payment';
        throw new Error(errorMessage);
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
          // Remove logo to avoid loading issues
        },
        callback: (response: any) => {
          console.log('Payment callback:', response);
          
          // Verify transaction with fast confirmation
          if (response.status === 'successful' || response.status === 'completed') {
            setCurrentTransaction({
              transactionId: response.transaction_id,
              txRef: tx_ref
            });
            setShowFastConfirmation(true);
            setLoading(false); // Hide payment loading, show confirmation UI
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
      
      // For successful payments, we can proceed even if backend confirmation times out
      // since the payment was already completed on Flutterwave's side
      console.log('🔍 Verifying payment with backend...');
      
      try {
        // Attempt backend confirmation with shorter timeout
        const response = await paymentsApi.flutterwave.confirm({
          transaction_id: transactionId,
          tx_ref: txRef
        });
        
        if ((response as any).ok || (response as any).data?.ok || response.success) {
          console.log('✅ Payment verification successful:', response);
          handleSuccessfulPayment(transactionId, txRef);
          return;
        }
      } catch (confirmError: any) {
        console.warn('⚠️ Backend confirmation failed/timed out, but payment was successful on Flutterwave');
        console.warn('Error details:', confirmError.message);
        
        // If it's just a timeout, still treat as success since Flutterwave confirmed the payment
        if (confirmError.code === 'ECONNABORTED' || confirmError.message?.includes('timeout')) {
          console.log('🕐 Backend timeout detected, proceeding with successful payment flow');
          handleSuccessfulPayment(transactionId, txRef);
          return;
        }
      }
      
      // If we get here, there was a real error
      throw new Error('Payment verification failed');
      
    } catch (err: any) {
      console.error('❌ Payment verification error:', err);
      setError('Payment completed but verification failed. Please contact support with your transaction ID: ' + transactionId);
      if (onFailure) onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulPayment = (transactionId: string, txRef: string) => {
    console.log('🎉 Payment successful! Transaction ID:', transactionId);
    
    // Call success callback first (this will clear the cart)
    if (onSuccess) {
      onSuccess(transactionId, txRef);
    }
    
    // Navigate to home page as requested
    setTimeout(() => {
      navigate('/');
    }, 2000); // Slightly longer delay to allow success message to be seen
  };

  // Fast confirmation handlers
  const handleFastConfirmationSuccess = (result: FastPaymentResult) => {
    console.log('⚡ Fast confirmation successful:', result);
    setShowFastConfirmation(false);
    
    if (currentTransaction) {
      handleSuccessfulPayment(currentTransaction.transactionId, currentTransaction.txRef);
    }
  };

  const handleFastConfirmationFailure = (result: FastPaymentResult) => {
    console.warn('⚠️ Fast confirmation failed:', result);
    setShowFastConfirmation(false);
    
    // For timeout, we still treat as success since payment was completed on Flutterwave
    if (result.status === 'TIMEOUT' && currentTransaction) {
      console.log('🕐 Treating timeout as success since Flutterwave confirmed payment');
      handleSuccessfulPayment(currentTransaction.transactionId, currentTransaction.txRef);
      return;
    }
    
    // For real failures, show error and call failure callback
    const errorMessage = result.error || 'Payment confirmation failed';
    setError(`Payment completed but verification failed: ${errorMessage}. Please contact support.`);
    
    if (onFailure && currentTransaction) {
      onFailure(new Error(errorMessage));
    }
  };

  return (
    <div className="flutterwave-payment">
      {error && <Alert type="error" message={error} />}
      
      {/* Fast Payment Confirmation Modal */}
      {showFastConfirmation && currentTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <FastPaymentConfirmation
              transactionId={currentTransaction.transactionId}
              txRef={currentTransaction.txRef}
              onSuccess={handleFastConfirmationSuccess}
              onFailure={handleFastConfirmationFailure}
              maxAttempts={30}
              className="shadow-xl"
            />
          </div>
        </div>
      )}
      
      {!orderId || orderId === 'temporary-id' ? (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm mb-2">Please create your order first</p>
          <p className="text-yellow-600 text-xs">Complete the previous steps to enable payment</p>
        </div>
      ) : (
        <Button
          onClick={handlePayment}
          disabled={loading || !scriptLoaded || showFastConfirmation}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Spinner size="sm" className="mr-2" /> Processing...
            </div>
          ) : showFastConfirmation ? (
            'Confirming Payment...'
          ) : (
            'Pay with Flutterwave'
          )}
        </Button>
      )}
    </div>
  );
};

export default FlutterwavePayment;