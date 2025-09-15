import { useState, useCallback } from 'react';
import { fastPaymentService, type FastPaymentResult } from '../services/fastPaymentService';

export interface UseFastPaymentReturn {
  confirming: boolean;
  result: FastPaymentResult | null;
  error: string | null;
  confirmPayment: (transactionId: string, txRef: string, maxAttempts?: number) => Promise<FastPaymentResult>;
  reset: () => void;
}

export const useFastPayment = (): UseFastPaymentReturn => {
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<FastPaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmPayment = useCallback(async (
    transactionId: string, 
    txRef: string, 
    maxAttempts: number = 30
  ): Promise<FastPaymentResult> => {
    setConfirming(true);
    setError(null);
    setResult(null);

    try {
      const paymentResult = await fastPaymentService.confirmPaymentFast(
        transactionId, 
        txRef, 
        maxAttempts
      );
      
      setResult(paymentResult);
      
      if (!paymentResult.success) {
        setError(paymentResult.error || 'Payment confirmation failed');
      }
      
      return paymentResult;
    } catch (err: any) {
      const errorMessage = err.message || 'Payment confirmation error';
      setError(errorMessage);
      
      const errorResult: FastPaymentResult = {
        success: false,
        status: 'FAILED',
        error: errorMessage,
      };
      
      setResult(errorResult);
      return errorResult;
    } finally {
      setConfirming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setConfirming(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    confirming,
    result,
    error,
    confirmPayment,
    reset,
  };
};

export default useFastPayment;