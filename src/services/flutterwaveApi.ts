import { api } from '../lib/api';
import type { ApiResponse } from '../types';

// Payment initialization response
export interface PaymentInitiateResponse {
  publicKey: string;
  tx_ref: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone?: string;
  };
}

// Payment confirmation request
export interface PaymentConfirmRequest {
  tx_ref: string;
  transaction_id: string;
}

// Payment confirmation response
export interface PaymentConfirmResponse {
  ok: boolean;
  data?: any;
  message?: string;
}

// Flutterwave checkout parameters
export interface FlutterwaveCheckoutParams {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  callback: (response: any) => void;
  onclose: () => void;
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
}

// Flutterwave API service
export const flutterwaveApi = {
  /**
   * Initiate a payment with the backend
   * @param payload The full payload including orderId, amount, currency, customer
   */
  initiatePayment: async (
    payload: {
      orderId: string;
      amount: number;
      currency?: string;
      customer: { email: string; name: string; phone?: string };
    }
  ): Promise<{ success: boolean; message: string; data: PaymentInitiateResponse }> => {
    try {
      console.log('🚀 Initiating Flutterwave payment:', payload);
      const response = await api.post<{ success: boolean; message: string; data: PaymentInitiateResponse }>(
        '/payments/flutterwave/initiate',
        payload
      );
      console.log('✅ Payment initiated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to initiate payment:', error);
      throw error;
    }
  },

  /**
   * Confirm a payment with the backend
   * @param transaction_id Flutterwave transaction ID
   * @param tx_ref Transaction reference
   */
  confirmPayment: async (
    transaction_id: string,
    tx_ref: string
  ): Promise<ApiResponse<PaymentConfirmResponse>> => {
    try {
      console.log('🔍 Confirming Flutterwave payment:', { transaction_id, tx_ref });
      
      const response = await api.post<ApiResponse<PaymentConfirmResponse>>('/payments/flutterwave/confirm', {
        transaction_id,
        tx_ref
      });
      
      console.log('✅ Payment confirmation response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to confirm payment:', error);
      throw error;
    }
  }
};

// Type definition for the FlutterwaveCheckout function
export interface FlutterwaveWindow extends Window {
  FlutterwaveCheckout: (params: FlutterwaveCheckoutParams) => void;
}

// Helper to check if Flutterwave script is loaded
export const isFlutterwaveLoaded = (): boolean => {
  return typeof (window as unknown as FlutterwaveWindow).FlutterwaveCheckout === 'function';
};

// Helper to load Flutterwave script
export const loadFlutterwaveScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isFlutterwaveLoaded()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.body.appendChild(script);
  });
};

export default flutterwaveApi;