import React, { useState, useEffect } from 'react';
import { bankTransferApi, type ReceiptData } from '../../services';
import { Button } from '../ui/Button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface VerificationReceiptData extends ReceiptData {
  user: {
    fullName: string;
    email: string;
  };
  payment: {
    amount: number;
    orderId: string;
  };
}

const AdminReceiptVerification: React.FC = () => {
  const [receipts, setReceipts] = useState<VerificationReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingReceipts();
  }, []);

  const fetchPendingReceipts = async () => {
    try {
      setLoading(true);
      const response = await bankTransferApi.getPendingReceipts();
      
      if (response && response.data) {
        setReceipts(response.data as VerificationReceiptData[]);
      } else {
        setError('Failed to load pending receipts');
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setError('Error loading receipts');
    } finally {
      setLoading(false);
    }
  };

  const verifyReceipt = async (receiptId: string, status: 'APPROVED' | 'REJECTED', note?: string) => {
    try {
      const response = await bankTransferApi.verifyReceipt(receiptId, status, note);
      
      if (response && response.data) {
        // Remove from pending list
        setReceipts(prev => prev.filter(r => r.id !== receiptId));
        toast.success(`Receipt ${status.toLowerCase()} successfully`);
      } else {
        toast.error(`Failed to ${status.toLowerCase()} receipt`);
      }
    } catch (error) {
      console.error('Error verifying receipt:', error);
      toast.error('Error processing verification');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-2" />
        <span>Loading receipts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-lg">
        {error}
        <Button 
          onClick={fetchPendingReceipts} 
          variant="outline" 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment Receipt Verification</h2>
      
      {receipts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          No pending receipts to verify
        </div>
      ) : (
        <div className="grid gap-6">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
                  <div className="space-y-2">
                    <p><strong>Reference:</strong> {receipt.reference}</p>
                    <p><strong>Amount:</strong> ₦{receipt.payment.amount.toLocaleString()}</p>
                    <p><strong>Order ID:</strong> {receipt.payment.orderId}</p>
                    <p><strong>Customer:</strong> {receipt.user.fullName}</p>
                    <p><strong>Email:</strong> {receipt.user.email}</p>
                    <p><strong>Uploaded:</strong> {new Date(receipt.uploadedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Receipt Image</h4>
                  <img 
                    src={receipt.receiptUrl} 
                    alt="Payment receipt" 
                    className="max-w-full h-auto rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/300/400';
                      target.alt = 'Receipt image (failed to load)';
                    }}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={() => verifyReceipt(receipt.id, 'APPROVED')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => verifyReceipt(receipt.id, 'REJECTED', 'Receipt unclear or invalid')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReceiptVerification;
