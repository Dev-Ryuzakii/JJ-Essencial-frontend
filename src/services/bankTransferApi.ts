import { get, post, patch } from './apiClient';
import type { ApiResponse, BankAccount } from '../types';

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
   * GET /payments/bank-transfer/bank-accounts
   */
  getBankAccounts: async (): Promise<ApiResponse<BankAccount[]>> => {
    return await get<BankAccount[]>('/payments/bank-transfer/bank-accounts');
  },

  /**
   * Initiate bank transfer payment
   * POST /payments/bank-transfer/initiate
   * @param orderId Order ID for the payment
   * @param options Optional parameters (bankId for preferred bank account)
   */
  initiateTransfer: async (
    orderId: string, 
    options?: { bankId?: string }
  ): Promise<ApiResponse<BankTransferData>> => {
    return await post<BankTransferData>(
      '/payments/bank-transfer/initiate', 
      { orderId, ...(options || {}) }
    );
  },

  /**
   * Upload payment receipt
   * POST /payments/receipt/upload
   */
  uploadReceipt: async (reference: string, file: File): Promise<ApiResponse<ReceiptData>> => {
    const formData = new FormData();
    formData.append('reference', reference);
    formData.append('file', file);

    return await post<ReceiptData>('/payments/receipt/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Check payment status by reference
   * GET /payments/bank-transfer/status/:reference
   */
  checkPaymentStatus: async (reference: string): Promise<ApiResponse<{
    status: BankTransferStatus;
    receipt?: ReceiptData;
    message?: string;
  }>> => {
    return await get<{
      status: BankTransferStatus;
      receipt?: ReceiptData;
      message?: string;
    }>(`/payments/bank-transfer/status/${reference}`);
  },

  /**
   * Get payment details by reference
   * GET /payments/bank-transfer/:reference
   */
  getPaymentDetails: async (reference: string): Promise<ApiResponse<BankTransferData>> => {
    return await get<BankTransferData>(`/payments/bank-transfer/${reference}`);
  },

  /**
   * Get receipt by reference
   * GET /payments/receipt/:reference
   */
  getReceipt: async (reference: string): Promise<ApiResponse<ReceiptData>> => {
    return await get<ReceiptData>(`/payments/receipt/${reference}`);
  },
  
  /**
   * Get pending receipts for verification (Admin only)
   * GET /payments/receipts/pending
   */
  getPendingReceipts: async (): Promise<ApiResponse<ReceiptData[]>> => {
    return await get<ReceiptData[]>('/payments/receipts/pending');
  },

  /**
   * Verify payment receipt (Admin only)
   * PATCH /payments/receipt/:receiptId/verify
   */
  verifyReceipt: async (
    receiptId: string, 
    status: 'APPROVED' | 'REJECTED', 
    adminNote?: string
  ): Promise<ApiResponse<any>> => {
    return await patch<any>(
      `/payments/receipt/${receiptId}/verify`, 
      { status, adminNote }
    );
  }
};

export default bankTransferApi;
