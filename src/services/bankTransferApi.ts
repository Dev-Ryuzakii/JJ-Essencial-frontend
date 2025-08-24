import { get, post, patch } from './apiClient';
import type { ApiResponse } from './apiClient';

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
}

export interface BankTransferData {
  reference: string;
  amount: number;
  orderId: string;
  bankAccounts: Array<{
    bankName: string;
    accountName: string;
    accountNumber: string;
    sortCode?: string;
    currency: string;
  }>;
  instructions: string[];
}

export interface ReceiptData {
  id: string;
  reference: string;
  userId: string;
  receiptUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
}

const bankTransferApi = {
  /**
   * Get bank accounts for manual transfers (Public)
   * GET /api/v1/payments/bank-accounts
   */
  getBankAccounts: async (): Promise<ApiResponse<BankAccount[]>> => {
    const response = await get<ApiResponse<BankAccount[]>>('/api/v1/payments/bank-accounts');
    return response.data;
  },

  /**
   * Initiate bank transfer payment
   * POST /api/v1/payments/bank-transfer/initiate
   */
  initiateTransfer: async (orderId: string): Promise<ApiResponse<BankTransferData>> => {
    const response = await post<ApiResponse<BankTransferData>>('/api/v1/payments/bank-transfer/initiate', { orderId });
    return response.data;
  },

  /**
   * Upload payment receipt
   * POST /api/v1/payments/receipt/upload
   */
  uploadReceipt: async (reference: string, file: File): Promise<ApiResponse<ReceiptData>> => {
    const formData = new FormData();
    formData.append('reference', reference);
    formData.append('file', file);

    const response = await post<ApiResponse<ReceiptData>>('/api/v1/payments/receipt/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  /**
   * Get pending receipts for verification (Admin only)
   * GET /api/v1/payments/receipts/pending
   */
  getPendingReceipts: async (): Promise<ApiResponse<ReceiptData[]>> => {
    const response = await get<ApiResponse<ReceiptData[]>>('/api/v1/payments/receipts/pending');
    return response.data;
  },

  /**
   * Verify payment receipt (Admin only)
   * PATCH /api/v1/payments/receipt/:receiptId/verify
   */
  verifyReceipt: async (
    receiptId: string, 
    status: 'APPROVED' | 'REJECTED', 
    adminNote?: string
  ): Promise<ApiResponse<any>> => {
    const response = await patch<ApiResponse<any>>(
      `/api/v1/payments/receipt/${receiptId}/verify`, 
      { status, adminNote }
    );
    return response.data;
  }
};

export default bankTransferApi;
