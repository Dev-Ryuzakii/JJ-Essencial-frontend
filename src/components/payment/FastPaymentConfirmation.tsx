import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { fastPaymentService, type FastPaymentResult } from '../../services/fastPaymentService';

interface FastPaymentConfirmationProps {
  transactionId: string;
  txRef: string;
  onSuccess?: (result: FastPaymentResult) => void;
  onFailure?: (result: FastPaymentResult) => void;
  maxAttempts?: number;
  className?: string;
}

export const FastPaymentConfirmation: React.FC<FastPaymentConfirmationProps> = ({
  transactionId,
  txRef,
  onSuccess,
  onFailure,
  maxAttempts = 30,
  className = '',
}) => {
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed' | 'timeout'>('processing');
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('Confirming your payment...');
  const [result, setResult] = useState<FastPaymentResult | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        setStatus('processing');
        setMessage('⚡ Starting fast payment confirmation...');
        setProgress(10);

        // Start the fast confirmation process
        const paymentResult = await fastPaymentService.confirmPaymentFast(
          transactionId, 
          txRef, 
          maxAttempts
        );
        
        setResult(paymentResult);
        setAttempts(paymentResult.attempts || 0);
        
        if (paymentResult.success && paymentResult.status === 'COMPLETED') {
          setStatus('completed');
          setProgress(100);
          setMessage('🎉 Payment confirmed successfully!');
          fastPaymentService.showUserFeedback(paymentResult);
          if (onSuccess) onSuccess(paymentResult);
        } else if (paymentResult.status === 'TIMEOUT') {
          setStatus('timeout');
          setProgress(75);
          setMessage('⏰ Payment verification timed out');
          fastPaymentService.showUserFeedback(paymentResult);
          if (onFailure) onFailure(paymentResult);
        } else {
          setStatus('failed');
          setProgress(50);
          setMessage('❌ Payment confirmation failed');
          fastPaymentService.showUserFeedback(paymentResult);
          if (onFailure) onFailure(paymentResult);
        }
      } catch (error: any) {
        const errorResult: FastPaymentResult = {
          success: false,
          status: 'FAILED',
          error: error.message || 'Payment confirmation failed',
        };
        
        setResult(errorResult);
        setStatus('failed');
        setProgress(0);
        setMessage('❌ Payment confirmation error');
        fastPaymentService.showUserFeedback(errorResult);
        if (onFailure) onFailure(errorResult);
      }
    };

    confirmPayment();
  }, [transactionId, txRef, maxAttempts, onSuccess, onFailure]);

  // Simulate progress during processing
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 2, 90); // Cap at 90% until completion
          return newProgress;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'timeout':
        return <Clock className="w-8 h-8 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'timeout':
        return 'bg-yellow-600';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getEstimatedTime = () => {
    if (status === 'completed') return '';
    if (status === 'processing') {
      const remainingAttempts = maxAttempts - attempts;
      const estimatedSeconds = remainingAttempts * 2; // Rough estimate
      return `Est. ${Math.max(5, estimatedSeconds)}s remaining`;
    }
    return '';
  };

  return (
    <div className={`payment-confirmation bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex flex-col items-center text-center">
        {/* Status Icon */}
        <div className="mb-4">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {status === 'processing' && 'Confirming Payment'}
          {status === 'completed' && 'Payment Confirmed!'}
          {status === 'timeout' && 'Verification Timeout'}
          {status === 'failed' && 'Confirmation Failed'}
        </h3>

        <p className="text-sm text-gray-600 mb-4">{message}</p>

        {/* Progress Bar */}
        {status === 'processing' && (
          <div className="w-full max-w-xs mb-4">
            <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${getStatusColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>{progress}%</span>
              <span>{getEstimatedTime()}</span>
            </div>
          </div>
        )}

        {/* Attempt Counter */}
        {attempts > 0 && (
          <p className="text-xs text-gray-500 mb-4">
            {status === 'processing' ? `Attempt ${attempts}/${maxAttempts}` : `Completed in ${attempts} attempts`}
          </p>
        )}

        {/* Status-specific Information */}
        {status === 'completed' && result?.order && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg w-full">
            <div className="text-sm text-green-800">
              <p><strong>Order:</strong> #{result.order.orderNumber || result.order.id}</p>
              <p><strong>Status:</strong> {result.order.status}</p>
            </div>
          </div>
        )}

        {status === 'timeout' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Payment may still be processing</p>
              <p>Please check your order status or contact support if payment was deducted.</p>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg w-full">
            <div className="text-sm text-red-800">
              <p className="font-medium">Payment confirmation failed</p>
              <p>{result?.error || 'Please try again or contact support.'}</p>
            </div>
          </div>
        )}

        {/* Technical Details (for debugging in development) */}
        {process.env.NODE_ENV === 'development' && result && (
          <details className="mt-4 w-full">
            <summary className="text-xs text-gray-400 cursor-pointer">Technical Details</summary>
            <pre className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify({ transactionId, txRef, result }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default FastPaymentConfirmation;