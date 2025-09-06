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
  expiresAt?: string; // ISO date string when this payment request expires
}

export interface ReceiptData {
  id: string;
  reference: string;
  userId: string;
  receiptUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export type BankTransferStatus = 
  | 'pending' 
  | 'awaiting_verification' 
  | 'verified' 
  | 'rejected'
  | 'expired';

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
   * @param orderId Order ID for the payment
   * @param options Optional parameters (bankId for preferred bank account)
   */
  initiateTransfer: async (
    orderId: string, 
    options?: { bankId?: string }
  ): Promise<ApiResponse<BankTransferData>> => {
    const response = await post<ApiResponse<BankTransferData>>(
      '/api/v1/payments/bank-transfer/initiate', 
      { orderId, ...(options || {}) }
    );
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
   * Check payment status by reference
   * GET /api/v1/payments/bank-transfer/status/:reference
   */
  checkPaymentStatus: async (reference: string): Promise<ApiResponse<{
    status: BankTransferStatus;
    receipt?: ReceiptData;
    message?: string;
  }>> => {
    const response = await get<ApiResponse<{
      status: BankTransferStatus;
      receipt?: ReceiptData;
      message?: string;
    }>>(`/api/v1/payments/bank-transfer/status/${reference}`);
    return response.data;
  },

  /**
   * Get payment details by reference
   * GET /api/v1/payments/bank-transfer/:reference
   */
  getPaymentDetails: async (reference: string): Promise<ApiResponse<BankTransferData>> => {
    const response = await get<ApiResponse<BankTransferData>>(`/api/v1/payments/bank-transfer/${reference}`);
    return response.data;
  },

  /**
   * Get receipt by reference
   * GET /api/v1/payments/receipt/:reference
   */
  getReceipt: async (reference: string): Promise<ApiResponse<ReceiptData>> => {
    const response = await get<ApiResponse<ReceiptData>>(`/api/v1/payments/receipt/${reference}`);
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
