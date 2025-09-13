import { api } from '../lib/api';
import type { ApiResponse, BankAccount } from '../types';

export interface BankTransferInitiateData {
  orderId: string
}

export interface BankTransferResponse {
  reference: string
  amount: number
  instructions: string[]
  bankAccounts: BankAccount[]
}

export const paymentsApi = {
  // Get available bank accounts for transfers
  getBankAccounts: async (): Promise<ApiResponse<BankAccount[]>> => {
    try {
      console.log('🚀 paymentsApi.getBankAccounts: Making request to /payments/bank-accounts');
      const response = await api.get('/payments/bank-accounts')
      console.log('📥 paymentsApi.getBankAccounts: Raw response received:', {
        responseType: typeof response,
        hasSuccess: 'success' in response,
        hasData: 'data' in response,
        responseKeys: Object.keys(response),
        dataLength: response.data?.length || 0
      });
      
      let accounts = response.data || response;
      
      // Transform data exactly like the service does - handle snake_case to camelCase conversion
      if (Array.isArray(accounts)) {
        const bankAccountDtos = accounts.map(account => ({
          bankName: account.bank_name || account.bankName,
          accountName: account.account_name || account.accountName,
          accountNumber: account.account_number || account.accountNumber,
          sortCode: account.sort_code || account.sortCode || undefined,
          swiftCode: account.swift_code || account.swiftCode || undefined,
          currency: account.currency,
        }));
        accounts = bankAccountDtos;
      }
      
      // Handle both new and legacy response formats
      if (response.success && response.data) {
        console.log('✅ paymentsApi.getBankAccounts: Using new response format');
        return {
          ...response,
          data: accounts
        } as ApiResponse<BankAccount[]>
      }
      
      // Legacy format - data is directly in response
      console.log('🔄 paymentsApi.getBankAccounts: Using legacy response format');
      return {
        success: true,
        data: accounts,
        message: 'Bank accounts retrieved successfully',
        timestamp: new Date().toISOString()
      } as ApiResponse<BankAccount[]>
    } catch (error) {
      console.error('❌ paymentsApi.getBankAccounts: Failed to get bank accounts:', error)
      throw error
    }
  },

  // Initiate bank transfer payment - Exact match with integration guide
  initiateBankTransfer: async (data: BankTransferInitiateData): Promise<ApiResponse<BankTransferResponse>> => {
    try {
      console.log('🏦 Initiating bank transfer for order:', data.orderId);
      
      // ✅ EXACT match with integration guide: Only send orderId
      const requestPayload = {
        orderId: data.orderId
      };
      
      console.log('💳 Bank transfer request payload:', requestPayload);
      console.log('🌐 Using API endpoint: /payments/bank-transfer/initiate');
      
      const response = await api.post('/payments/bank-transfer/initiate', requestPayload)
      
      console.log('📦 Bank transfer response received:', response);
      
      // Backend returns response in the exact format from the guide
      if (response.success && response.data) {
        console.log('✅ Bank transfer initiated successfully:', {
          reference: response.data.reference,
          amount: response.data.amount,
          accountsCount: response.data.bankAccounts?.length || 0
        });
        return response as ApiResponse<BankTransferResponse>
      }
      
      // If response doesn't match expected structure, wrap it properly
      console.log('🔄 Wrapping non-standard response format');
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Bank transfer details provided successfully',
        timestamp: new Date().toISOString()
      } as ApiResponse<BankTransferResponse>
    } catch (error) {
      console.error('❌ Bank transfer initiation failed:', error)
      console.error('❌ Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      throw error
    }
  },

  // Upload payment receipt
  uploadReceipt: async (file: File, reference: string): Promise<ApiResponse<any>> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('reference', reference)

      const response = await api.post('/payments/receipt/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Handle both new and legacy response formats
      if (response.success && response.data) {
        // After successful receipt upload, attempt to update payment status to PAID
        try {
          await api.patch(`/payments/status/${reference}`, {
            status: 'PAID',
            notes: 'Payment receipt uploaded by customer'
          });
          console.log('✅ Payment status updated to PAID after receipt upload');
        } catch (statusError) {
          console.warn('⚠️ Could not update payment status, but receipt was uploaded:', statusError);
        }
        
        return response as ApiResponse<any>
      }
      // Legacy format - data is directly in response
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Receipt uploaded successfully',
        timestamp: new Date().toISOString()
      } as ApiResponse<any>
    } catch (error) {
      console.error('Failed to upload receipt:', error)
      throw error
    }
  },

  // Verify payment status
  verifyPayment: async (reference: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/payments/verify', { reference })
      // Handle both new and legacy response formats
      if (response.success && response.data) {
        return response as ApiResponse<any>
      }
      // Legacy format - data is directly in response
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Payment verified successfully',
        timestamp: new Date().toISOString()
      } as ApiResponse<any>
    } catch (error) {
      console.error('Failed to verify payment:', error)
      throw error
    }
  },

  // Flutterwave payment endpoints
  flutterwave: {
    // Initiate Flutterwave payment
    initiate: async (data: {
      orderId: string;
      amount: number;
      currency?: string;
      customer: { email: string; name: string; phone?: string };
    }): Promise<ApiResponse<any>> => {
      try {
        console.log('🚀 Initiating Flutterwave payment:', data);
        const response = await api.post('/payments/flutterwave/initiate', data);
        console.log('✅ Flutterwave payment initiated successfully:', response);
        return response as ApiResponse<any>;
      } catch (error) {
        console.error('❌ Failed to initiate Flutterwave payment:', error);
        throw error;
      }
    },

    // Confirm Flutterwave payment
    confirm: async (data: {
      transaction_id: string;
      tx_ref: string;
    }): Promise<ApiResponse<any>> => {
      try {
        console.log('🔍 Confirming Flutterwave payment:', data);
        // Use shorter timeout for confirmation to fail faster
        const response = await api.post('/payments/flutterwave/confirm', data, {
          timeout: 15000 // 15 seconds timeout for confirmation
        });
        console.log('✅ Flutterwave payment confirmed:', response);
        return response as ApiResponse<any>;
      } catch (error) {
        console.error('❌ Failed to confirm Flutterwave payment:', error);
        throw error;
      }
    }
  }
}