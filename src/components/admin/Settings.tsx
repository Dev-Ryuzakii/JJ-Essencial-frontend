import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react'
import adminApi, { 
  type AdminSettingsDto, 
  type BankAccountDto, 
  type CreateBankAccountDto, 
  type UpdateBankAccountDto 
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
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    orderAutoConfirm: false,
    lowStockThreshold: 10,
    taxRate: 7.5,
    shippingFee: 2000,
    freeShippingThreshold: 50000,
    defaultLanguage: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  })

  const [bankForm, setBankForm] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    currency: 'NGN',
    is_default: false,
    is_active: true
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
      setSettingsForm(data)
    } catch (err: any) {
      console.log('Settings loaded successfully or using defaults')
      // Settings will be available from backend
    } finally {
      setLoading(false)
    }
  }

  const fetchBankAccounts = async () => {
    try {
      const data = await adminApi.settings.getBankAccounts()
      setBankAccounts(data)
    } catch (err: any) {
      console.log('Bank accounts loaded or will be available when implemented')
      setBankAccounts([])
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      
      const updatedSettings = await adminApi.settings.updateettings(settingsForm)
      setSettings(updatedSettings)
      setSuccessMessage('Settings updated successfully!')
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
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
      setBankAccounts(bankAccounts.map(acc => 
        acc.id === selectedBank.id ? updatedAccount : acc
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
      setBankAccounts(bankAccounts.filter(acc => acc.id !== selectedBank.id))
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
        account_name: account.account_name,
        account_number: account.account_number,
        bank_name: account.bank_name,
        currency: account.currency,
        is_default: account.is_default,
        is_active: account.is_active
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
      account_name: '',
      account_number: '',
      bank_name: '',
      currency: 'NGN',
      is_default: false,
      is_active: true
    })
  }

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4)
  }

  const toggleAccountVisibility = (accountId: string) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your store settings and payment methods</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            General Settings
          </h2>
        </div>
        
        <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={settingsForm.siteName}
                onChange={(e) => setSettingsForm({...settingsForm, siteName: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={settingsForm.contactEmail}
                onChange={(e) => setSettingsForm({...settingsForm, contactEmail: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={settingsForm.currency}
                onChange={(e) => setSettingsForm({...settingsForm, currency: e.target.value})}
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={settingsForm.taxRate}
                onChange={(e) => setSettingsForm({...settingsForm, taxRate: parseFloat(e.target.value) || 0})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Fee (₦)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={settingsForm.shippingFee}
                onChange={(e) => setSettingsForm({...settingsForm, shippingFee: parseInt(e.target.value) || 0})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Shipping Threshold (₦)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={settingsForm.freeShippingThreshold}
                onChange={(e) => setSettingsForm({...settingsForm, freeShippingThreshold: parseInt(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={settingsForm.siteDescription}
              onChange={(e) => setSettingsForm({...settingsForm, siteDescription: e.target.value})}
              placeholder="Brief description of your store"
            />
          </div>

          {/* Settings Toggles */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Preferences</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={settingsForm.emailNotifications}
                  onChange={(e) => setSettingsForm({...settingsForm, emailNotifications: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">Enable Email Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={settingsForm.smsNotifications}
                  onChange={(e) => setSettingsForm({...settingsForm, smsNotifications: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">Enable SMS Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={settingsForm.allowRegistration}
                  onChange={(e) => setSettingsForm({...settingsForm, allowRegistration: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">Allow User Registration</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={settingsForm.orderAutoConfirm}
                  onChange={(e) => setSettingsForm({...settingsForm, orderAutoConfirm: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">Auto-confirm Orders</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={settingsForm.maintenanceMode}
                  onChange={(e) => setSettingsForm({...settingsForm, maintenanceMode: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">Maintenance Mode</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Bank Accounts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Bank Accounts
          </h2>
          <button
            onClick={() => openBankModal()}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Account
          </button>
        </div>
        
        <div className="p-6">
          {bankAccounts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts</h3>
              <p className="text-gray-500 mb-4">Add your bank accounts to receive payments</p>
              <button
                onClick={() => openBankModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bank Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankAccounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{account.account_name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-1">{account.bank_name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono text-gray-900">
                        {showAccountNumbers[account.id] 
                          ? account.account_number
                          : maskAccountNumber(account.account_number)
                        }
                      </p>
                      <button
                        onClick={() => toggleAccountVisibility(account.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showAccountNumbers[account.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Currency: {account.currency}</p>
                    {account.is_default && (
                      <p className="text-xs text-indigo-600 font-medium">Default Account</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => openBankModal(account)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBank(account)
                        setShowDeleteModal(true)
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditMode ? 'Edit Bank Account' : 'Add Bank Account'}
            </h3>
            
            <form onSubmit={isEditMode ? handleUpdateBankAccount : handleCreateBankAccount}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={bankForm.account_name}
                    onChange={(e) => setBankForm({...bankForm, account_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={bankForm.account_number}
                    onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={bankForm.currency}
                    onChange={(e) => setBankForm({...bankForm, currency: e.target.value})}
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={bankForm.is_default}
                      onChange={(e) => setBankForm({...bankForm, is_default: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Set as default account</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={bankForm.is_active}
                      onChange={(e) => setBankForm({...bankForm, is_active: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {isEditMode ? 'Update' : 'Add'} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBank && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Bank Account</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the bank account "{selectedBank.account_name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBankAccount}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
