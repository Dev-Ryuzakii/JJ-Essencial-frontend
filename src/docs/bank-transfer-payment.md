# Manual Bank Transfer Payment System

This documentation explains how to use the manual bank transfer payment system in your e-commerce application.

## Overview

The manual bank transfer payment system allows customers to pay for orders by transferring money directly to your company's bank account and uploading proof of payment. This payment method is particularly useful in regions where digital payment methods are limited or when customers prefer direct bank transfers.

## System Flow

1. **User selects bank transfer** as the payment method during checkout
2. **User receives bank account details** for making the transfer
3. **User makes the transfer** using their bank's app or website
4. **User uploads proof of payment** (receipt/screenshot)
5. **Admin verifies the payment** and updates the order status
6. **User receives confirmation** once payment is verified

## Components

The system consists of the following components:

### Customer-Facing Components

1. **BankTransferCheckout**: Main component that orchestrates the bank transfer payment flow
2. **BankAccountSelector**: Displays available bank accounts for customers to choose from
3. **BankTransferPayment**: Shows bank account details and transfer instructions
4. **ReceiptUpload**: Allows customers to upload proof of payment

### Admin Components

1. **AdminReceiptVerification**: Allows admins to view and verify uploaded payment receipts

## API Endpoints

### Public Endpoints (No Authentication Required)
```
GET /api/v1/payments/bank-accounts - Get bank accounts for customer checkout
```

### Authenticated Endpoints (Require JWT Token)
```
POST /api/v1/payments/bank-transfer/initiate - Initiate bank transfer payment
POST /api/v1/payments/receipt/upload - Upload payment receipt
```

### Admin Endpoints (Require Admin Role)
```
GET /api/v1/admin/settings/bank-accounts - Admin bank account management
POST /api/v1/admin/settings/bank-accounts - Add new bank account
GET /api/v1/payments/receipts/pending - View pending receipt verifications
PATCH /api/v1/payments/receipt/:receiptId/verify - Verify payment receipts
```

## Implementation Guide

### 1. Integrating Bank Transfer Payment in Checkout

To add bank transfer payment to your checkout process, import and use the `BankTransferCheckout` component:

```tsx
import { BankTransferCheckout } from '../components/payment';

const CheckoutPage: React.FC = () => {
  // Your order data
  const order = {
    id: 'order-123',
    totalAmount: 25000,
    items: [/* order items */]
  };

  const handleOrderComplete = (paymentData: any) => {
    // Handle order completion, e.g., redirect to order confirmation page
    console.log('Payment completed:', paymentData);
  };

  return (
    <div>
      <h1>Checkout</h1>
      <BankTransferCheckout 
        order={order}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
};
```

### 2. Adding Receipt Verification to Admin Panel

To add receipt verification to your admin panel, import and use the `AdminReceiptVerification` component:

```tsx
import { AdminReceiptVerification } from '../components/admin';

const AdminPaymentsPage: React.FC = () => {
  return (
    <div>
      <h1>Admin Payments</h1>
      <AdminReceiptVerification />
    </div>
  );
};
```

## Customization

You can customize the look and feel of the components by modifying their CSS classes. The components use Tailwind CSS for styling, so you can easily adjust colors, spacing, and other visual elements.

## Security Considerations

1. **File Validation**: The system validates file types and sizes before upload
2. **Authentication**: All sensitive endpoints require authentication
3. **Authorization**: Admin functions are restricted to users with admin roles
4. **Reference Numbers**: Each transaction has a unique reference number for tracking

## Troubleshooting

### Common Issues

1. **Payment reference missing**: Ensure the bank transfer initiation API is called before uploading receipts
2. **File upload errors**: Check file size and type constraints
3. **Verification errors**: Ensure admin users have proper permissions

## Best Practices

1. **Provide clear instructions** to customers on how to complete the transfer
2. **Use unique reference numbers** for each transaction
3. **Verify receipts promptly** to avoid customer frustration
4. **Send email notifications** when payment status changes
5. **Include bank transfer details** in order confirmation emails

## Future Enhancements

1. **Automated verification**: Use image recognition to verify receipt details
2. **Multiple bank accounts**: Support for multiple currencies and international transfers
3. **Direct bank integration**: API integration with banks for automatic verification
4. **Mobile capture optimization**: Improve mobile camera capture for receipts
