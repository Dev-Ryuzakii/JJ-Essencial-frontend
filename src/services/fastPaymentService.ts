import { paymentsApi } from './paymentsApi';
import toast from 'react-hot-toast';

export interface FastPaymentResult {
  success: boolean;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  message?: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
  };
  attempts?: number;
  error?: string;
}

export class FastPaymentService {
  /**
   * Fast payment confirmation with polling
   * @param transactionId Flutterwave transaction ID
   * @param txRef Transaction reference
   * @param maxAttempts Maximum polling attempts (default: 30)
   * @returns Promise<FastPaymentResult>
   */
  async confirmPaymentFast(
    transactionId: string, 
    txRef: string, 
    maxAttempts: number = 30
  ): Promise<FastPaymentResult> {
    try {
      console.log('⚡ Starting fast payment confirmation for:', { transactionId, txRef });
      
      // Step 1: Try fast confirmation first (if backend supports it)
      try {
        const fastResponse = await paymentsApi.flutterwave.fastConfirm({
          transaction_id: transactionId,
          tx_ref: txRef,
        });

        if (fastResponse.success && fastResponse.data?.status === 'PROCESSING') {
          console.log('⚡ Fast confirmation initiated, starting polling...');
          // Start polling for status
          return this.pollPaymentStatus(txRef, maxAttempts);
        }

        // If fast confirm returns completed immediately
        if (fastResponse.success && fastResponse.data?.status === 'COMPLETED') {
          return {
            success: true,
            status: 'COMPLETED',
            order: fastResponse.data.order,
            attempts: 1,
          };
        }
      } catch (fastError: any) {
        console.warn('⚠️ Fast confirmation not available, falling back to regular confirmation');
        // Fallback to regular confirmation
      }

      // Step 2: Fallback to regular confirmation with polling
      try {
        const response = await paymentsApi.flutterwave.confirm({
          transaction_id: transactionId,
          tx_ref: txRef,
        });

        if (response.success) {
          return {
            success: true,
            status: 'COMPLETED',
            order: response.data?.order,
            attempts: 1,
          };
        }
      } catch (confirmError: any) {
        console.warn('⚠️ Regular confirmation failed, starting status polling...');
        // If confirmation fails but payment was successful on Flutterwave side,
        // start polling to check if backend eventually processes it
        return this.pollPaymentStatus(txRef, maxAttempts);
      }

      return {
        success: false,
        status: 'FAILED',
        error: 'Payment confirmation failed',
      };

    } catch (error: any) {
      console.error('🚨 Fast confirmation error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error.message || 'Payment confirmation failed',
      };
    }
  }

  /**
   * Poll payment status until completion or timeout
   * @param reference Payment reference
   * @param maxAttempts Maximum polling attempts
   * @returns Promise<FastPaymentResult>
   */
  async pollPaymentStatus(
    reference: string, 
    maxAttempts: number = 30
  ): Promise<FastPaymentResult> {
    console.log(`🔄 Starting payment status polling for ${reference} (max ${maxAttempts} attempts)`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`📡 Polling attempt ${attempt}/${maxAttempts} for ${reference}`);
        
        const response = await paymentsApi.flutterwave.getStatus(reference);
        
        // Handle both success and error response structures
        const responseData = 'data' in response ? response.data : null;
        
        if (response.success && responseData?.is_completed) {
          console.log(`✅ Payment completed after ${attempt} attempts`);
          return {
            success: true,
            status: 'COMPLETED',
            order: responseData.order,
            attempts: attempt,
          };
        }

        // Check if payment failed
        if (responseData?.status === 'FAILED' || responseData?.status === 'CANCELLED') {
          return {
            success: false,
            status: 'FAILED',
            error: 'Payment was cancelled or failed',
            attempts: attempt,
          };
        }

        // Progressive backoff: start with 1s, increase to max 5s
        const delay = Math.min(1000 + (attempt - 1) * 200, 5000);
        console.log(`⏰ Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error: any) {
        console.warn(`⚠️ Polling attempt ${attempt} failed:`, error.message);
        
        // If it's the last attempt, return failure
        if (attempt === maxAttempts) {
          return {
            success: false,
            status: 'TIMEOUT',
            error: 'Payment verification timed out',
            attempts: attempt,
          };
        }
        
        // For non-final attempts, continue after a short delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      success: false,
      status: 'TIMEOUT',
      error: 'Payment verification timed out after maximum attempts',
      attempts: maxAttempts,
    };
  }

  /**
   * Show appropriate user feedback based on payment result
   * @param result FastPaymentResult
   */
  showUserFeedback(result: FastPaymentResult): void {
    switch (result.status) {
      case 'COMPLETED':
        toast.success(
          `🎉 Payment confirmed successfully! ${result.attempts ? `(${result.attempts} attempts)` : ''}`,
          { duration: 5000 }
        );
        break;
      
      case 'PROCESSING':
        toast.loading('⚡ Confirming your payment...', { duration: 3000 });
        break;
      
      case 'TIMEOUT':
        toast.error(
          '⏰ Payment verification timed out. Your payment may still be processing. Please check your order status or contact support.',
          { duration: 8000 }
        );
        break;
      
      case 'FAILED':
        toast.error(
          `❌ Payment confirmation failed. ${result.error || 'Please try again or contact support.'}`,
          { duration: 6000 }
        );
        break;
    }
  }
}

// Export singleton instance
export const fastPaymentService = new FastPaymentService();
export default fastPaymentService;