import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  CheckCircle,
  Truck,
  Calendar,
  Shield,
  Gift,
  AlertCircle,
  Trash2,
  RefreshCw,
  Copy
} from 'lucide-react'

import { useCart, useAuth } from '../hooks'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency } from '../lib/utils'
import { ordersApi, productsApi, paymentsApi } from '../services'
import toast from 'react-hot-toast'

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  postalCode: string
  country: string
  phone: string
  shippingMethod: 'standard' | 'express' | 'overnight'
  paymentMethod: 'card' | 'paypal' | 'apple_pay' | 'bank_transfer'
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
  saveCard: boolean
  billingAddressSame: boolean
  specialInstructions: string
}

interface BankAccount {
  bankName: string
  accountName: string
  accountNumber: string
  sortCode?: string
  swiftCode?: string
  currency: string
}

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { items, clearCart, removeFromCart, getSubtotal, getFinalAmount } = useCart()
  const { isAuthenticated, user } = useAuth()
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false)
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  
  const [formData, setFormData] = useState<CheckoutForm>({
    email: user?.email || '',
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    postalCode: '',
    country: 'Nigeria',
    phone: user?.phone || '',
    shippingMethod: 'standard',
    paymentMethod: 'bank_transfer',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false,
    billingAddressSame: true,
    specialInstructions: ''
  })

  const subtotal = getSubtotal()
  const total = getFinalAmount()
  const tax = 0 // Remove tax for Nigerian context
  
  const shippingCosts = {
    standard: 0,
    express: 1500, // ₦1,500 for express delivery
    overnight: 3000 // ₦3,000 for overnight delivery
  }
  
  const shipping = shippingCosts[formData.shippingMethod]

  // Function to copy account number to clipboard
  const copyToClipboard = async (text: string, type: string = 'Account number') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type} copied to clipboard!`)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  // Fetch bank accounts on component mount
  useEffect(() => {
    const fetchBankAccounts = async () => {
      console.log('🧪 Fetching bank accounts using new API structure...\n');
      setLoadingBankAccounts(true)
      try {
        console.log('🔍 Making API request to: /api/v1/payments/bank-accounts');
        const response = await paymentsApi.getBankAccounts()
        
        console.log('📊 API Response structure:', {
          success: response.success,
          hasData: !!(response as any).data,
          dataLength: (response as any).data?.length || 0
        });
        
        // 🚨 DETAILED DEBUGGING: Full response analysis
        console.log('🔬 FULL API RESPONSE ANALYSIS:');
        console.log('Response object keys:', Object.keys(response));
        console.log('Response.data type:', typeof (response as any).data);
        console.log('Response.data is Array:', Array.isArray((response as any).data));
        console.log('Full raw response:', JSON.stringify(response, null, 2));
        
        // Check if API is filtering results
        if ((response as any).data && (response as any).data.length === 1) {
          console.log('⚠️ ONLY 1 ACCOUNT RETURNED - POSSIBLE CAUSES:');
          console.log('   1. Backend API filtering by is_active=true');
          console.log('   2. Query limit set to 1');
          console.log('   3. User permission restricting access');
          console.log('   4. Database query issue');
          console.log('   5. API endpoint implementation problem');
        }
        
        if (response.success && (response as any).data) {
          console.log(`✅ Successfully loaded ${(response as any).data.length} bank account(s)`);
          
          // Transform snake_case API response to camelCase for UI
          const transformedAccounts = (response as any).data.map((account: any) => ({
            bankName: account.bank_name || account.bankName,
            accountName: account.account_name || account.accountName,
            accountNumber: account.account_number || account.accountNumber,
            currency: account.currency || 'NGN',
            sortCode: account.sort_code || account.sortCode,
            swiftCode: account.swift_code || account.swiftCode
          }));
          
          const validAccounts = transformedAccounts.filter((account: any) => {
            const isValid = account.bankName && account.accountName && account.accountNumber;
            if (!isValid) {
              console.warn('⚠️ Invalid account found:', account);
              console.warn('Raw account data:', (response as any).data.find((raw: any) => 
                (raw.bank_name || raw.bankName) === account.bankName
              ));
            }
            return isValid;
          });

          console.log('💳 Bank accounts ready for display:');
          validAccounts.forEach((account: any, index: number) => {
            console.log(`   ${index + 1}. ${account.bankName}`);
            console.log(`      Account Name: ${account.accountName}`);
            console.log(`      Account Number: ${account.accountNumber}`);
            console.log(`      Currency: ${account.currency || 'NGN'}`);
            if (account.sortCode) console.log(`      Sort Code: ${account.sortCode}`);
            if (account.swiftCode) console.log(`      Swift Code: ${account.swiftCode}`);
            console.log('');
          });
          
          setBankAccounts(validAccounts);
          console.log('🎉 Bank accounts loaded successfully into state!');
        } else {
          console.error('❌ API response indicates failure:', {
            success: response.success,
            message: (response as any).message || 'No message provided',
            data: (response as any).data
          });
          toast.error((response as any).message || 'Failed to load bank account details');
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch bank accounts:', error);
        console.error('Full error context:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          url: error.config?.url
        });
        
        // More specific error messages based on the new API structure
        let errorMessage = 'Failed to load bank account details';
        if (error.response?.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied. Insufficient permissions.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Bank accounts service not found. Please try again later.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        toast.error(errorMessage);
      } finally {
        setLoadingBankAccounts(false)
      }
    }

    fetchBankAccounts()
  }, [])

  const validateCartProducts = async () => {
    console.log('Validating cart products...');
    const invalidItems: string[] = [];
    const validationResults: Array<{id: string, name: string, status: string}> = [];
    
    for (const item of items) {
      try {
        // Ensure we're using the right ID for validation - cart uses productId
        const productId = item.productId || item.id;
        console.log(`Checking product ${productId} (${item.name})...`);
        
        // Explicitly log the raw API request to ensure correct endpoint
        console.log(`🔍 Making API request to: /products/${productId}`);
        
        const product = await productsApi.getById(productId);
        
        if (!product) {
          console.log(`Product ${productId} (${item.name}) not found`);
          invalidItems.push(productId);
          validationResults.push({id: productId, name: item.name, status: 'NOT_FOUND'});
        } else {
          // Enhanced validation with more robust checking and detailed logging
          
          // First, log all relevant fields from the product response
          console.log(`🔍 Raw product fields:`, {
            id: product.id,
            name: product.name,
            isActive: product.isActive,
            is_active: (product as any).is_active,
            active: (product as any).active,
            status: (product as any).status,
            stock: product.stock
          });
          
          // Handle both camelCase and snake_case field names, with robust fallback
          const isActive = product.isActive !== undefined ? product.isActive : 
                          (product as any).is_active !== undefined ? (product as any).is_active : 
                          (product as any).active !== undefined ? (product as any).active :
                          (product as any).status === 'active' ? true :
                          true; // Default to true if field is missing (assumes product is active if field not provided)
          
          console.log(`Product ${productId} field debug:`, {
            isActive: product.isActive,
            is_active: (product as any).is_active,
            calculated: isActive
          });
          
          if (isActive === false) {
            console.log(`Product ${productId} (${item.name}) is inactive`);
            invalidItems.push(productId);
            validationResults.push({id: productId, name: item.name, status: 'INACTIVE'});
          } else if (product.stock <= 0) {
            console.log(`Product ${productId} (${item.name}) is out of stock`);
            invalidItems.push(productId);
            validationResults.push({id: productId, name: item.name, status: 'OUT_OF_STOCK'});
          } else {
            console.log(`Product ${productId} (${item.name}) is valid`);
            validationResults.push({id: productId, name: item.name, status: 'VALID'});
          }
        }
      } catch (error) {
        console.log(`Error validating product ${item.productId || item.id} (${item.name}):`, error);
        invalidItems.push(item.productId || item.id);
        validationResults.push({id: item.productId || item.id, name: item.name, status: 'ERROR'});
      }
    }
    
    console.log('Validation results:', validationResults);
    return { invalidItems, validationResults };
  };

  const handleClearCart = () => {
    if (items.length === 0) {
      toast.error('Cart is already empty');
      return;
    }
    
    const itemCount = items.length;
    clearCart();
    toast.success(`Cart cleared successfully. Removed ${itemCount} item(s). Please add fresh products to continue.`, {
      duration: 5000,
    });
    console.log(`🗑️ Cart cleared: removed ${itemCount} items`);
  };

  const refreshCartFromBackend = async () => {
    console.log('🔄 Refreshing cart items from backend...');
    toast.loading('Refreshing cart...', { id: 'refresh' });
    
    try {
      let updatedCount = 0;
      let removedCount = 0;
      
      for (const item of items) {
        try {
          const response = await productsApi.getById(item.productId || item.id);
          
          // Handle the new API response structure
          let product;
          let isValidResponse = false;
          
          if (response && typeof response === 'object') {
            // Check if it's a SuccessResponseDto structure
            if ('success' in response && 'data' in response && response.success) {
              product = response.data;
              isValidResponse = true;
            } else if ('id' in response) {
              // Direct product object
              product = response;
              isValidResponse = true;
            }
          }
          
          if (!isValidResponse || !product) {
            console.log(`❌ Product ${item.productId || item.id} (${item.name}) - Invalid API response`);
            removeFromCart(item.productId || item.id);
            removedCount++;
            continue;
          }
          
          // Check if product is active using the new API structure
          const isActive = product.isActive !== undefined ? product.isActive : true;
          
          if (isActive && product.stockQuantity > 0) {
            console.log(`✅ Refreshed: ${item.name}`);
            updatedCount++;
          } else {
            console.log(`❌ Removing unavailable product: ${item.name} (Active: ${isActive}, Stock: ${product.stockQuantity})`);
            removeFromCart(item.productId || item.id);
            removedCount++;
          }
        } catch (error) {
          console.log(`❌ Error checking ${item.name}, removing from cart:`, error);
          removeFromCart(item.productId || item.id);
          removedCount++;
        }
      }
      
      toast.success(
        `Cart refreshed! Updated: ${updatedCount}, Removed: ${removedCount}`,
        { id: 'refresh', duration: 4000 }
      );
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      toast.error('Failed to refresh cart. Please try clearing and re-adding items.', {
        id: 'refresh',
        duration: 5000,
      });
    }
  };

  const handleRemoveInvalidItems = async () => {
    const { invalidItems, validationResults } = await validateCartProducts();
    
    console.log('Cart validation complete:', validationResults);
    
    if (invalidItems.length > 0) {
      invalidItems.forEach(productId => {
        removeFromCart(productId);
      });
      
      const invalidDetails = validationResults
        .filter(result => result.status !== 'VALID')
        .map(result => `${result.name} (${result.status})`)
        .join(', ');
      
      toast.success(`Removed ${invalidItems.length} invalid item(s): ${invalidDetails}`);
    } else {
      toast.success('All items in cart are valid and ready for checkout');
    }
  };
  const finalTotal = total + tax + shipping

  const handleInputChange = (field: keyof CheckoutForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid file (JPG, PNG, or PDF)')
        return
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error('File size should be less than 5MB')
        return
      }
      
      setPaymentReceipt(file)
      toast.success('Payment receipt selected successfully')
    }
  }

  const removeReceipt = () => {
    setPaymentReceipt(null)
    toast.success('Payment receipt removed')
  }

  const validateStep = (currentStep: string): boolean => {
    switch (currentStep) {
      case 'shipping':
        return !!(
          formData.email &&
          formData.firstName &&
          formData.lastName &&
          formData.address &&
          formData.city &&
          formData.state &&
          formData.zipCode &&
          formData.phone
        )
      case 'payment':
        // For bank transfer, require receipt upload
        if (formData.paymentMethod === 'bank_transfer') {
          if (!paymentReceipt) {
            toast.error('Please upload your payment receipt for bank transfers');
            return false;
          }
          return true;
        }
        // For other payment methods, no additional validation needed at this stage
        return true;
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep(step)) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (step === 'shipping') {
      setStep('payment')
    } else if (step === 'payment') {
      setStep('review')
    }
  }

  const handleBack = () => {
    if (step === 'payment') {
      setStep('shipping')
    } else if (step === 'review') {
      setStep('payment')
    }
  }

  const handlePlaceOrder = async () => {
    if (!validateStep('payment')) {
      toast.error('Please check your payment information')
      return
    }
    
    // Validate receipt upload for bank transfers
    if (formData.paymentMethod === 'bank_transfer' && !paymentReceipt) {
      toast.error('Please upload your payment receipt for bank transfers')
      return
    }

    setIsProcessing(true)
    try {
      // Log cart items for debugging
      console.log('Cart items for order:', items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        finalProductId: item.productId || item.id, // This is what we'll send
        fullItem: item
      })));

      // Validate cart products before creating order
      console.log('Pre-order validation...');
      const { invalidItems, validationResults } = await validateCartProducts();
      
      if (invalidItems.length > 0) {
        const invalidDetails = validationResults
          .filter(result => result.status !== 'VALID')
          .map(result => `${result.name} (${result.status})`)
          .join(', ');
        
        toast.error(`Cannot proceed: Invalid items found - ${invalidDetails}. Please use "Validate Cart" to remove them.`);
        setIsProcessing(false);
        return;
      }

      console.log('All products validated successfully, proceeding with order creation...');

      // Create the order with proper structure matching backend DTO
      const orderData = {
        items: items.map(item => ({
          productId: item.productId || item.id,    // ✅ Use productId from cart, fallback to id
          quantity: item.quantity                  // ✅ Removed price field
        })),
        deliveryAddress: {
          phone: formData.phone || "+234XXXXXXXXX",     // ✅ Added required phone field
          address: formData.address,                     // ✅ Changed from street to address
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode || '100001',      // ✅ Changed from zipCode to postalCode
          country: formData.country
          // ✅ Removed fullName field
        },
        orderNotes: formData.specialInstructions        // ✅ Changed from specialInstructions to orderNotes
        // ✅ Removed paymentMethod, shippingMethod (handle separately)
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));
      
      // Create the order first
      const orderResponse = await ordersApi.create(orderData);
      
      if (orderResponse.success && orderResponse.data) {
        const orderId = orderResponse.data.id;
        console.log('Order created successfully:', orderId);
        
        // Clear the cart after successful order creation
        clearCart();
        
        // Handle payment method separately after order creation
        if (formData.paymentMethod === 'bank_transfer') {
          console.log('Initiating bank transfer payment...');
          
          try {
            // Call the bank transfer initiation API
            const paymentResponse = await paymentsApi.initiateBankTransfer({
              orderId: orderId
            });
            
            if (paymentResponse.success && paymentResponse.data) {
              console.log('Bank transfer initiated successfully');
              
              // If user uploaded a receipt, upload it now
              if (paymentReceipt) {
                setUploadingReceipt(true);
                try {
                  console.log('Uploading payment receipt...');
                  await paymentsApi.uploadReceipt(paymentReceipt, paymentResponse.data.reference);
                  toast.success('Payment receipt uploaded successfully!');
                  console.log('Receipt uploaded successfully');
                } catch (receiptError: any) {
                  console.error('Failed to upload receipt:', receiptError);
                  
                  // Handle specific error cases
                  if (receiptError.response?.status === 404) {
                    console.log('Payment reference not found - this is expected for new transfers');
                    toast.success('Order created successfully! You can upload your receipt after making the payment.');
                  } else {
                    toast.error('Order created but failed to upload receipt. You can upload it later from the order details.');
                  }
                } finally {
                  setUploadingReceipt(false);
                }
              }
              
              // Navigate to bank transfer payment page with the payment details
              const paymentData = encodeURIComponent(JSON.stringify(paymentResponse.data));
              navigate(`/checkout/bank-transfer?orderId=${orderId}&paymentData=${paymentData}`);
            } else {
              console.error('Bank transfer initiation failed:', paymentResponse);
              toast.error('Failed to initiate bank transfer. Please try again.');
              navigate(`/orders/${orderId}`); // Fallback to order page
            }
          } catch (paymentError) {
            console.error('Bank transfer initiation error:', paymentError);
            toast.error('Order created successfully! Bank transfer details will be available in your order.');
            navigate(`/orders/${orderId}`); // Fallback to order page
          }
        } else {
          // Handle other payment methods separately
          toast.success('Order placed successfully!');
          navigate(`/orders/confirmation?orderId=${orderId}`);
        }
      } else {
        console.error('Order creation failed:', orderResponse);
        toast.error(orderResponse.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      
      // Debug: Log the full error response for investigation
      if (error.response) {
        console.error('Full error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // CRITICAL DEBUG: Log the exact backend error structure
        console.error('🔥 BACKEND ERROR DETAILS:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Extract specific error message from API response  
      let errorMessage = 'Failed to place order. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        console.log('API Error Message:', errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show specific error to user with actionable solutions based on backend fixes
      if (errorMessage.includes('products not found') || errorMessage.includes('inactive')) {
        // ✅ Enhanced error handling for backend product validation
        toast.error('⚠️ Some products in your cart are no longer available or have changed. Please validate or refresh your cart.', {
          duration: 8000,
        });
        console.log('Backend validation failed - suggests products have changed since being added to cart');
        console.log('User should use the Validate Cart or Clear Cart buttons to resolve this');
      } else if (errorMessage.includes('field') && errorMessage.includes('required')) {
        // ✅ Handle backend field validation errors
        toast.error('Missing required information. Please check all form fields and try again.', {
          duration: 6000,
        });
      } else if (errorMessage.includes('status') && errorMessage.includes('PENDING')) {
        // ✅ Handle backend status validation
        toast.error('Order processing error. Please contact support if this persists.', {
          duration: 6000,
        });
      } else if (errorMessage.includes('database') || errorMessage.includes('constraint')) {
        // ✅ Handle database constraint errors from backend
        toast.error('System error occurred. Please try again or contact support.', {
          duration: 6000,
        });
      } else if (errorMessage.includes('stock')) {
        toast.error('Some items in your cart are out of stock. Please update quantities or remove them.', {
          duration: 6000,
        });
      } else if (errorMessage.includes('address') || errorMessage.includes('delivery')) {
        toast.error('Please check your delivery address information and try again.', {
          duration: 6000,
        });
      } else if (errorMessage.includes('phone')) {
        // ✅ Handle phone validation errors
        toast.error('Please provide a valid phone number for delivery.', {
          duration: 6000,
        });
      } else {
        toast.error(`Order failed: ${errorMessage}`, {
          duration: 6000,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
        <Button asChild>
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Shipping */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'shipping' ? 'bg-blue-600 text-white' : 
            ['payment', 'review'].includes(step) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {['payment', 'review'].includes(step) ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span>1</span>
            )}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">Shipping</span>
        </div>
        
        <div className={`w-16 h-0.5 ${
          ['payment', 'review'].includes(step) ? 'bg-green-600' : 'bg-gray-300'
        }`} />
        
        {/* Payment */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'payment' ? 'bg-blue-600 text-white' : 
            step === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {step === 'review' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span>2</span>
            )}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">Payment</span>
        </div>
        
        <div className={`w-16 h-0.5 ${
          step === 'review' ? 'bg-green-600' : 'bg-gray-300'
        }`} />
        
        {/* Review */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            <span>3</span>
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">Review</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your order</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/cart">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <StepIndicator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Shipping Information */}
          {step === 'shipping' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+234 123 456 7890"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lagos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lagos State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                  </select>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
                <div className="space-y-4">
                  {[
                    { key: 'standard', name: 'Local Pickup', time: '5-7 business days', price: 0 },
                    { key: 'express', name: 'Delivery Fee to Park', time: '2-3 business days', price: 1500 },
                    
                  ].map((method) => (
                    <label key={method.key} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.key}
                        checked={formData.shippingMethod === method.key}
                        onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.time}</p>
                          </div>
                          <span className="font-medium text-gray-900">
                            {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={handleNext} disabled={!validateStep('shipping')}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h2>
              
              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg bg-blue-50 border-blue-200">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={true}
                      readOnly
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <CreditCard className="ml-3 w-5 h-5 text-blue-600" />
                    <span className="ml-3 font-medium text-gray-900">Bank Transfer</span>
                  </label>
                </div>
                
             

                {/* Show Bank Accounts Preview */}
                {bankAccounts.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Available Bank Accounts Preview</h4>
                    <div className="space-y-2">
                      {bankAccounts.slice(0, 2).map((account, index) => (
                        <div key={`${account.bankName}-${index}`} className="p-3 bg-gray-50 rounded-lg text-sm">
                          <div className="font-medium text-gray-900">{account.bankName}</div>
                          <div className="text-gray-600">{account.accountName}</div>
                          <div className="flex items-center justify-between group">
                            <span className="text-gray-600">Account: {account.accountNumber}</span>
                            <button
                              onClick={() => copyToClipboard(account.accountNumber, 'Account number')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200 rounded"
                              title="Copy account number"
                            >
                              <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                            </button>
                          </div>
                          {account.sortCode && (
                            <div className="flex items-center justify-between group">
                              <span className="text-gray-600">Sort Code: {account.sortCode}</span>
                              <button
                                onClick={() => copyToClipboard(account.sortCode, 'Sort code')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200 rounded"
                                title="Copy sort code"
                              >
                                <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                              </button>
                            </div>
                          )}
                          {account.swiftCode && (
                            <div className="flex items-center justify-between group">
                              <span className="text-gray-600">Swift Code: {account.swiftCode}</span>
                              <button
                                onClick={() => copyToClipboard(account.swiftCode, 'Swift code')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200 rounded"
                                title="Copy swift code"
                              >
                                <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                              </button>
                            </div>
                          )}
                          <div className="text-gray-500 text-xs">Currency: {account.currency}</div>
                        </div>
                      ))}
                      {bankAccounts.length > 2 && (
                        <div className="text-sm text-gray-500 pl-3">
                          +{bankAccounts.length - 2} more account(s) available
                        </div>
                      )}
                    </div>
                  </div>
                ) : !loadingBankAccounts ? (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-800">No bank accounts available. Bank details will be provided after order creation.</span>
                    </div>
                  </div>
                ) : null}

                {loadingBankAccounts && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    Loading bank account details...
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Add any special instructions or notes for your order..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can include delivery preferences, gift messages, or any other special requests.
                </p>
              </div>

              {/* Payment Receipt Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Receipt (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {!paymentReceipt ? (
                    <div className="text-center">
                      <input
                        type="file"
                        id="receipt-upload"
                        accept="image/*,.pdf"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Click to upload payment receipt
                          </span>
                          <p className="text-gray-500 mt-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          JPG, PNG or PDF (max 5MB)
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{paymentReceipt.name}</p>
                          <p className="text-xs text-green-700">
                            {(paymentReceipt.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeReceipt}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove receipt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.paymentMethod === 'bank_transfer' ? (
                    <span className="text-red-600 font-medium">
                      Payment receipt upload is mandatory for bank transfers. Your order cannot be processed without proof of payment.
                    </span>
                  ) : (
                    "Upload your payment receipt for faster order processing. You can also upload it later from your order details."
                  )}
                </p>
              </div>

              {/* Confirmation Note */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-2">Ready for Bank Transfer</h4>
                    <p className="text-sm text-green-700">
                      Your order will be processed using bank transfer. Complete payment details will be provided after order confirmation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back to Shipping
                </Button>
                <Button onClick={handleNext} disabled={!validateStep('payment')}>
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Order Review */}
          {step === 'review' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Your Order</h2>
              
              {/* Cart Management */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">Cart Management</h3>
                    <p className="text-xs text-yellow-700">
                      Having issues with your order? Validate, refresh, or clear your cart
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshCartFromBackend}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveInvalidItems}
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-100 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Validate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      className="text-red-700 border-red-300 hover:bg-red-100 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Order Items</h3>
                <div className="space-y-4">
                  {items.map((item) => {
                    if (!item) {
                      return null;
                    }
                    
                    return (
                      <div key={item.productId || item.id || 'unknown'} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={typeof item.image === 'string' ? item.image : 'https://via.placeholder.com/60/60?text=No+Image'}
                          alt={item.name || 'Product'}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/60/60?text=No+Image';
                          }}
                          
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(((parseFloat(item.discountPrice || item.price) || 0) * (item.quantity || 1)))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                <p className="text-sm text-gray-900">
                  {formData.firstName} {formData.lastName}<br />
                  {formData.address}<br />
                  {formData.city}, {formData.state} {formData.zipCode}<br />
                  {formData.country}
                </p>
              </div>

              {/* Payment Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-gray-900 font-medium">Bank Transfer</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Receipt:</span>
                    <span className={`font-medium ${paymentReceipt ? 'text-green-600' : 'text-gray-500'}`}>
                      {paymentReceipt ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Uploaded</span>
                        </div>
                      ) : (
                        'Not uploaded'
                      )}
                    </span>
                  </div>
                  {formData.specialInstructions && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Special Instructions:</span>
                      <p className="text-gray-900 mt-1">{formData.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Secure Checkout</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your order information is encrypted and secure. Bank transfer details will be provided securely.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back to Payment
                </Button>
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={isProcessing}
                  className="min-w-[150px]"
                >
                  {isProcessing ? 'Processing...' : `Place Order • ${formatCurrency(finalTotal)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  if (!item) {
                    return null;
                  }
                  
                  return (
                    <div key={item.productId || item.id || 'unknown'} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                          {item.quantity || 1}
                        </span>
                        <span className="text-gray-900 truncate">{item.name || 'Unknown Product'}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(((parseFloat(item.discountPrice || item.price) || 0) * (item.quantity || 1)))}
                      </span>
                    </div>
                  );
                })}
              </div>

              <hr className="my-4" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure Bank Transfer</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free Returns within 30 days</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Fast Payment Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout