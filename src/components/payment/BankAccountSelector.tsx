import React, { useState, useEffect } from 'react';
import { bankTransferApi, type BankAccount } from '../../services';
import { Loader2 } from 'lucide-react';

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
      const result = await bankTransferApi.getBankAccounts();

      if (result.success) {
        setBankAccounts(result.data || []);
        
        // Auto-select first account if none selected
        if (result.data.length > 0 && !selectedAccount) {
          onSelect(result.data[0]);
        }
      } else {
        setError('Failed to load bank accounts');
      }
    } catch (err) {
      setError('Error loading bank accounts');
      console.error('Error fetching bank accounts:', err);
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
            <div>
              <h4 className="font-semibold text-gray-900">{account.bank_name}</h4>
              <p className="text-gray-600">{account.account_name}</p>
              <p className="text-lg font-mono font-bold text-blue-600">
                {account.account_number}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">{account.currency}</span>
              {selectedAccount?.id === account.id && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Selected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BankAccountSelector;
