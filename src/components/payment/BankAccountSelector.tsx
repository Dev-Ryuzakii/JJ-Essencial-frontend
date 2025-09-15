import React, { useState, useEffect } from 'react';
import { bankTransferApi, type BankAccount } from '../../services';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BankAccountSelectorProps {
  onSelect: (account: BankAccount) => void;
  selectedAccount?: BankAccount;
}

const BankAccountSelector: React.FC<BankAccountSelectorProps> = ({ 
  onSelect, 
  selectedAccount 
}) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      console.log('Fetching bank accounts...');
      
      const result = await bankTransferApi.getBankAccounts();
      console.log('Bank accounts API result:', result);

      if (result.success) {
        console.log('Bank accounts loaded successfully:', result.data);
        setBankAccounts(result.data || []);
        
        // Auto-select first account if none selected
        if (result.data.length > 0 && !selectedAccount) {
          console.log('Auto-selecting first account:', result.data[0]);
          onSelect(result.data[0]);
        }
      } else {
        console.error('Failed to load bank accounts:', result.message);
        setError(result.message || 'Failed to load bank accounts');
      }
    } catch (err: any) {
      console.error('Error fetching bank accounts:', err);
      setError(err?.response?.data?.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-2" />
        <span>Loading bank accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-lg">
        {error}
      </div>
    );
  }

  if (bankAccounts.length === 0) {
    return (
      <div className="text-gray-600 p-4 border border-gray-200 rounded-lg">
        No bank accounts available for transfers.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Select Bank Account for Transfer</h3>
      {bankAccounts.map((account) => (
        <div
          key={account.id}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedAccount?.id === account.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSelect(account)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <div className="flex items-center mb-1">
                <h4 className="font-semibold text-gray-900">{account.bank_name}</h4>
                <div className="ml-2 px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">
                  {account.currency}
                </div>
              </div>
              <p className="text-gray-600">{account.account_name}</p>
              <div className="flex items-center mt-1">
                <p className="text-lg font-mono font-bold text-blue-600">
                  {account.account_number}
                </p>
                <button 
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(account.account_number);
                    toast.success('Account number copied!');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-right">
              {selectedAccount?.id === account.id ? (
                <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BankAccountSelector;
