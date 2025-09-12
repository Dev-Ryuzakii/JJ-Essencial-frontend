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

  // Initiate bank transfer payment
  initiateBankTransfer: async (data: BankTransferInitiateData): Promise<ApiResponse<BankTransferResponse>> => {
    try {
      const response = await api.post('/payments/bank-transfer/initiate', data)
      // Handle both new and legacy response formats
      if (response.success && response.data) {
        return response as ApiResponse<BankTransferResponse>
      }
      // Legacy format - data is directly in response
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Bank transfer initiated successfully',
        timestamp: new Date().toISOString()
      } as ApiResponse<BankTransferResponse>
    } catch (error) {
      console.error('Failed to initiate bank transfer:', error)
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
  }
}