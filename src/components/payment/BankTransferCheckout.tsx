import React, { useState } from 'react';
import { bankTransferApi, type BankTransferData, type ReceiptData } from '../../services';
import BankTransferPayment from '../payment/BankTransferPayment';
import ReceiptUpload from '../payment/ReceiptUpload';
import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

interface BankTransferCheckoutProps {
  order: Order;
  onOrderComplete: (paymentData: any) => void;
}

const BankTransferCheckout: React.FC<BankTransferCheckoutProps> = ({ 
  order, 
  onOrderComplete 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'card' | null>(null);
  const [transferData, setTransferData] = useState<BankTransferData | null>(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentMethodSelect = (method: 'bank_transfer' | 'card') => {
    setPaymentMethod(method);
    setError(null);
  };

  const handleBankTransferInitiated = (data: BankTransferData) => {
    setTransferData(data);
  };

  const handleReceiptUploaded = (receiptData: ReceiptData) => {
    setReceiptUploaded(true);
    onOrderComplete({
      type: 'bank_transfer',
      reference: transferData?.reference,
      receipt: receiptData,
      status: 'awaiting_verification'
    });
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Order Summary */}
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₦{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 pb-0">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        {!paymentMethod && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              <button
                onClick={() => handlePaymentMethodSelect('bank_transfer')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-left"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold">Bank Transfer</h4>
                    <p className="text-gray-600">Transfer to our bank account and upload receipt</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect('card')}
                disabled
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-left opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-500">Card Payment</h4>
                    <p className="text-gray-400">Coming Soon - Pay with debit/credit card</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Bank Transfer Flow */}
        {paymentMethod === 'bank_transfer' && !receiptUploaded && (
          <div className="p-6">
            {!transferData ? (
              <BankTransferPayment
                orderId={order.id}
                orderAmount={order.totalAmount}
                onPaymentInitiated={handleBankTransferInitiated}
                onError={handleError}
              />
            ) : (
              <ReceiptUpload
                paymentReference={transferData.reference}
                onUploadSuccess={handleReceiptUploaded}
                onError={handleError}
              />
            )}
          </div>
        )}

        {/* Success State */}
        {receiptUploaded && (
          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Receipt Uploaded Successfully!</h3>
              <p className="text-gray-600 mb-4">
                Your payment receipt has been uploaded and is being verified. 
                You will receive an email confirmation once your payment is approved.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-700 text-sm">
                  <strong>Reference:</strong> {transferData?.reference}<br />
                  <strong>Verification Time:</strong> Within 24 hours
                </p>
              </div>
              
              <Link to="/orders">
                <Button>View Your Orders</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Back Button */}
        {paymentMethod && !receiptUploaded && (
          <div className="border-t p-6">
            <button
              onClick={() => {
                setPaymentMethod(null);
                setTransferData(null);
                setError(null);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Payment Methods
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankTransferCheckout;
