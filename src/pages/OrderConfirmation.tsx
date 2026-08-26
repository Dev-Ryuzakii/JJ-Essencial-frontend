import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Clipboard, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ordersApi } from '../services';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import type { Order } from '../services/ordersApi';

const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // If we don't have an orderId, we'll show a generic confirmation
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const loadOrderDetails = async () => {
      try {
        setIsLoading(true);
        
        try {
          // Try to use the confirmation endpoint first
          const response = await ordersApi.getOrderConfirmation(orderId);
          if (response.success && response.data) {
            setOrder(response.data);
          } else {
            // If that fails, fall back to the regular getById
            const fallbackResponse = await ordersApi.getById(orderId);
            if (fallbackResponse.success && fallbackResponse.data) {
              setOrder(fallbackResponse.data);
            } else {
              setError('Unable to load order details');
            }
          }
        } catch (apiError) {
          console.error('Error fetching from API:', apiError);
          setError('Failed to load order details');
        }
      } catch (err) {
        console.error('Error in loadOrderDetails:', err);
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId]);

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(`ORD-${order.id.slice(0, 8).toUpperCase()}`);
      toast.success('Order number copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-50 p-8 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thank You for Your Order!
            </h1>
            
            <p className="text-lg text-gray-600">
              {order 
                ? `Your order #ORD-${order.id.slice(0, 8).toUpperCase()} has been placed successfully.`
                : 'Your order has been placed successfully.'}
            </p>

            {order && (
              <button 
                onClick={copyOrderNumber}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mt-2"
              >
                <Clipboard className="h-4 w-4 mr-1" />
                <span>Copy order number</span>
              </button>
            )}
          </div>

          <div className="p-8">
            {error ? (
              <div className="text-center py-6">
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-gray-600 mb-8">
                  Don't worry! If your payment was successful, you'll receive an order confirmation email shortly.
                </p>
              </div>
            ) : !order ? (
              <div className="text-center py-6">
                <p className="text-gray-800 mb-8">
                  We've sent a confirmation email with your order details. Your order is being processed.
                </p>
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Order Processing</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your order is being processed and you will receive update via email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-6">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={item.product.image || '/api/placeholder/64/64'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/api/placeholder/64/64';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                          {formatCurrency(item.finalPrice)}
                        </div>
                      </div>
                    ))}

                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-600 italic">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Information</h3>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && (
                          <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="mt-2">{order.shippingAddress.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
                      <p className="text-sm text-gray-600">
                        {order.paymentMethod}
                      </p>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Status</h3>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Package className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">What's Next?</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      We're processing your order. You'll receive an email with tracking information once your package ships.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link to="/orders">
                    View Your Orders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline">
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
