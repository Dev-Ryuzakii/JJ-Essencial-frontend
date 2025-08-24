import React, { useState } from 'react';
import { bankTransferApi, type BankAccount, type BankTransferData } from '../../services';
import { Loader2, ClipboardCopy } from 'lucide-react';
import BankAccountSelector from './BankAccountSelector';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface BankTransferPaymentProps {
  orderId: string;
  orderAmount: number;
  onPaymentInitiated: (data: BankTransferData) => void;
  onError: (error: string) => void;
}

const BankTransferPayment: React.FC<BankTransferPaymentProps> = ({
  orderId,
  orderAmount,
  onPaymentInitiated,
  onError
}) => {
  const [transferData, setTransferData] = useState<BankTransferData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  const initiateBankTransfer = async () => {
    try {
      setLoading(true);
      
      const result = await bankTransferApi.initiateTransfer(orderId);

      if (result.success) {
        setTransferData(result.data);
        onPaymentInitiated(result.data);
      } else {
        onError(result.message || 'Failed to initiate bank transfer');
      }
    } catch (error) {
      onError('Error initiating bank transfer');
      console.error('Bank transfer error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!transferData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Bank Transfer Payment</h3>
          <p className="text-gray-600">
            You will receive bank account details to complete your payment of ₦{orderAmount.toLocaleString()}
          </p>
        </div>

        <BankAccountSelector 
          onSelect={setSelectedAccount}
          selectedAccount={selectedAccount}
        />

        <Button
          onClick={initiateBankTransfer}
          disabled={loading || !selectedAccount}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Initiating...
            </>
          ) : 'Proceed with Bank Transfer'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Bank Transfer Details
        </h3>
        <p className="text-green-700">
          Please complete the transfer and upload your receipt for verification.
        </p>
      </div>

      {/* Transfer Details */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount to Transfer</label>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              ₦{transferData.amount.toLocaleString()}
            </span>
            <button
              onClick={() => copyToClipboard(transferData.amount.toString())}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <ClipboardCopy className="w-4 h-4 mr-1" /> Copy
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Reference</label>
          <div className="flex items-center justify-between">
            <span className="font-mono text-lg">{transferData.reference}</span>
            <button
              onClick={() => copyToClipboard(transferData.reference)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <ClipboardCopy className="w-4 h-4 mr-1" /> Copy
            </button>
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="space-y-3">
        <h4 className="font-semibold">Transfer to any of these accounts:</h4>
        {transferData.bankAccounts.map((account, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{account.bankName}</span>
                  <button
                    onClick={() => copyToClipboard(account.bankName)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <ClipboardCopy className="w-4 h-4 mr-1" /> Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{account.accountName}</span>
                  <button
                    onClick={() => copyToClipboard(account.accountName)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <ClipboardCopy className="w-4 h-4 mr-1" /> Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-blue-600">
                    {account.accountNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(account.accountNumber)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <ClipboardCopy className="w-4 h-4 mr-1" /> Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <span className="font-semibold">{account.currency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h4>
        <ul className="list-disc list-inside space-y-1 text-yellow-700">
          {transferData.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BankTransferPayment;
