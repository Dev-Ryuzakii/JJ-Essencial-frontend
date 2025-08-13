import React, { useState, useEffect } from 'react'
import { 
  Save, 
  RefreshCw, 
  Settings as SettingsIcon,
  CreditCard,
  Building,
  Globe,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react'
import adminApi, { 
  AdminSettingsDto, 
  BankAccountDto, 
  CreateBankAccountDto, 
  UpdateBankAccountDto 
} from '../../services/adminApi'

export default function Settings() {
  const [settings, setSettings] = useState<AdminSettingsDto | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Modal states
  const [showBankModal, setShowBankModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState<BankAccountDto | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Form states
  const [settingsForm, setSettingsForm] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    currency: 'USD',
    taxRate: '0',
    enableNotifications: true,
    enablePayments: true,
    enableRegistration: true
  })

  const [bankForm, setBankForm] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
    isActive: true
  })

  const [showAccountNumbers, setShowAccountNumbers] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    fetchSettings()
    fetchBankAccounts()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await adminApi.settings.getSettings()
      setSettings(data)
      setSettingsForm({
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        currency: data.currency,
        taxRate: data.taxRate.toString(),
        enableNotifications: data.enableNotifications,
        enablePayments: data.enablePayments,
        enableRegistration: data.enableRegistration
      })
    } catch (err) {
      setError('Failed to fetch settings. Please try again.')
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBankAccounts = async () => {
    try {
      const data = await adminApi.settings.getBankAccounts()
      setBankAccounts(data)
    } catch (err) {
      console.error('Error fetching bank accounts:', err)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      
      const updateData = {
        ...settingsForm,
        taxRate: parseFloat(settingsForm.taxRate)
      }
      
      const updatedSettings = await adminApi.settings.updateSettings(updateData)
      setSettings(updatedSettings)
      setSuccessMessage('Settings updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to update settings. Please try again.')
      console.error('Error updating settings:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBankAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newAccount = await adminApi.settings.createBankAccount(bankForm as CreateBankAccountDto)
      setBankAccounts([...bankAccounts, newAccount])
      setShowBankModal(false)
      resetBankForm()
      setSuccessMessage('Bank account added successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to create bank account. Please try again.')
      console.error('Error creating bank account:', err)
    }
  }

  const handleUpdateBankAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBank) return

    try {
      const updatedAccount = await adminApi.settings.updateBankAccount(
        selectedBank.id, 
        bankForm as UpdateBankAccountDto
      )
      setBankAccounts(bankAccounts.map(account => 
        account.id === selectedBank.id ? updatedAccount : account
      ))
      setShowBankModal(false)
      resetBankForm()
      setSuccessMessage('Bank account updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to update bank account. Please try again.')
      console.error('Error updating bank account:', err)
    }
  }

  const handleDeleteBankAccount = async () => {
    if (!selectedBank) return

    try {
      await adminApi.settings.deleteBankAccount(selectedBank.id)
      setBankAccounts(bankAccounts.filter(account => account.id !== selectedBank.id))
      setShowDeleteModal(false)
      setSelectedBank(null)
      setSuccessMessage('Bank account deleted successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to delete bank account. Please try again.')
      console.error('Error deleting bank account:', err)
    }
  }

  const openBankModal = (account?: BankAccountDto) => {
    if (account) {
      setSelectedBank(account)
      setBankForm({
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        bankCode: account.bankCode,
        isActive: account.isActive
      })
      setIsEditMode(true)
    } else {
      setSelectedBank(null)
      resetBankForm()
      setIsEditMode(false)
    }
    setShowBankModal(true)
  }

  const resetBankForm = () => {
    setBankForm({
      accountName: '',
      accountNumber: '',
      bankName: '',
      bankCode: '',
      isActive: true
    })
  }

  const toggleAccountNumberVisibility = (accountId: string) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber
    return '••••••••' + accountNumber.slice(-4)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your system configuration and bank accounts</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="ml-2 text-gray-500">Loading settings...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <SettingsIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
              </div>
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.siteName}
                    onChange={(e) => setSettingsForm({...settingsForm, siteName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({...settingsForm, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({...settingsForm, contactPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={settingsForm.currency}
                    onChange={(e) => setSettingsForm({...settingsForm, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settingsForm.taxRate}
                    onChange={(e) => setSettingsForm({...settingsForm, taxRate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Description
                </label>
                <textarea
                  value={settingsForm.siteDescription}
                  onChange={(e) => setSettingsForm({...settingsForm, siteDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Feature Toggles */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">System Features</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableNotifications}
                      onChange={(e) => setSettingsForm({...settingsForm, enableNotifications: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Enable Email Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settingsForm.enablePayments}
                      onChange={(e) => setSettingsForm({...settingsForm, enablePayments: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Enable Payment Processing
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableRegistration}
                      onChange={(e) => setSettingsForm({...settingsForm, enableRegistration: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Enable User Registration
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Bank Accounts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Bank Accounts</h3>
                </div>
                <button
                  onClick={() => openBankModal()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {bankAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No bank accounts</h3>
                  <p className="text-gray-500">Add a bank account to receive payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{account.accountName}</h4>
                            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                              account.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {account.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{account.bankName}</p>
                          <div className="flex items-center">
                            <p className="text-sm font-mono text-gray-900">
                              {showAccountNumbers[account.id] 
                                ? account.accountNumber 
                                : maskAccountNumber(account.accountNumber)
                              }
                            </p>
                            <button
                              onClick={() => toggleAccountNumberVisibility(account.id)}
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              {showAccountNumbers[account.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Bank Code: {account.bankCode}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openBankModal(account)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBank(account)
                              setShowDeleteModal(true)
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowBankModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <form onSubmit={isEditMode ? handleUpdateBankAccount : handleCreateBankAccount}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {isEditMode ? 'Edit Bank Account' : 'Add Bank Account'}
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={bankForm.accountName}
                      onChange={(e) => setBankForm({...bankForm, accountName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Code
                    </label>
                    <input
                      type="text"
                      value={bankForm.bankCode}
                      onChange={(e) => setBankForm({...bankForm, bankCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bankForm.isActive}
                      onChange={(e) => setBankForm({...bankForm, isActive: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active account
                    </label>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBankModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {isEditMode ? 'Update Account' : 'Add Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBank && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Delete Bank Account</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this bank account? This action cannot be undone.
                </p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Account:</strong> {selectedBank.accountName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Bank:</strong> {selectedBank.bankName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Number:</strong> {maskAccountNumber(selectedBank.accountNumber)}
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBankAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
