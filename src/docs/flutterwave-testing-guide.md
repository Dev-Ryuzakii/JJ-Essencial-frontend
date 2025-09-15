# Flutterwave Payment Integration - Testing Guide

## Overview
This document provides instructions for testing the Flutterwave payment integration in our application.

## Test Card Details

Use these test card details for testing payments:

### Card 1: Successful Transaction
- Card Number: 4187 4274 1556 4246
- Expiry Date: Any future date (e.g., 09/30)
- CVV: 828
- PIN: 3310
- OTP: 12345

### Card 2: Insufficient Funds
- Card Number: 5531 8866 5214 2950
- Expiry Date: Any future date (e.g., 09/30)
- CVV: 564
- PIN: 3310
- OTP: 12345

### Card 3: Failed Transaction
- Card Number: 5438 8980 1456 0229
- Expiry Date: Any future date (e.g., 09/30)
- CVV: 883
- PIN: 3310
- OTP: 12345

## Test Bank Accounts

For bank account transfers, use these test accounts:

### Account 1
- Bank: Guaranty Trust Bank
- Account Number: 0000000000

### Account 2
- Bank: Access Bank
- Account Number: 0000000000

## Testing Process

1. **Setup Stage**:
   - Ensure your `.env` file has Flutterwave test API keys
   - Confirm the backend is properly configured to accept Flutterwave payments

2. **Checkout Flow Testing**:
   - Add items to cart
   - Proceed to checkout
   - Choose "Flutterwave" as the payment method
   - Fill out the required shipping information
   - Review the order details
   - Click on the "Pay with Flutterwave" button
   - You should see the Flutterwave payment modal

3. **Payment Verification**:
   - After submitting payment, check that the system redirects to the order confirmation page
   - Verify that the order status is updated correctly in the database
   - Check that the payment confirmation webhook is received and processed

## Debugging Tips

If you encounter issues with the Flutterwave integration:

1. Check browser console logs for any JavaScript errors
2. Verify that the Flutterwave script is loading correctly
3. Ensure that the public key is set correctly in the payment request
4. Check that the transaction reference (tx_ref) is unique for each payment
5. Verify that the webhook URL is accessible and correctly handling payment notifications

## Production Deployment Checklist

Before going live with Flutterwave payments:

- [ ] Switch API keys from test to live
- [ ] Update webhook URL to production endpoint
- [ ] Test the entire payment flow in a staging environment
- [ ] Ensure error handling is robust for all edge cases
- [ ] Configure proper security headers and CORS policies
- [ ] Set up monitoring for payment failures

## Support

For issues with the Flutterwave integration, contact:
- Flutterwave Support: https://support.flutterwave.com
- Developer Team: dev@jjessencial.com