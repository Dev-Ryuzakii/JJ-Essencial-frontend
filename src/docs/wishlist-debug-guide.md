# Bank Transfer Payment Troubleshooting Guide

This guide helps identify and resolve common issues with the bank transfer payment flow.

## Common Issues & Solutions

### 1. Customer Cannot See Bank Account Details

**Symptoms:**
- "Bank account details not shown" error message
- Empty bank account selector

**Possible Causes:**
- API endpoint failure
- Missing bank account configurations
- Network connectivity issues

**Solutions:**
- Check if bank accounts are configured in the admin panel
- Verify the `/api/v1/payments/bank-accounts` endpoint is working
- Check browser console for specific API errors
- Ensure the user has internet connectivity

### 2. Receipt Upload Failures

**Symptoms:**
- Upload button doesn't respond
- Error messages during upload
- Receipt appears to upload but doesn't show in admin panel

**Possible Causes:**
- File size too large (>5MB)
- Unsupported file format
- Network timeout during upload
- Backend storage issues

**Solutions:**
- Check file size and reduce if necessary
- Convert file to supported format (JPG, PNG, PDF)
- Check network connectivity
- Try uploading a smaller file as a test
- Verify the storage configuration on the backend

### 3. Payment Verification Delays

**Symptoms:**
- Customer complains about long wait times for verification
- Order status stuck at "Awaiting Verification"

**Possible Causes:**
- Admin notification system failure
- Staffing issues (no one checking verifications)
- Backend queue processing issues

**Solutions:**
- Check admin notification settings
- Verify that admin users have proper permissions
- Set up email alerts for pending verifications
- Create an SLA for verification response times
- Add automated reminders for pending verifications

### 4. Reference Number Issues

**Symptoms:**
- "Invalid reference" errors during receipt upload
- Multiple receipts attached to wrong orders

**Possible Causes:**
- Reference number corruption
- User entering wrong reference
- Session timeout issues

**Solutions:**
- Use copy-to-clipboard functionality for reference numbers
- Add reference number validation with checksum
- Make reference numbers shorter and more readable
- Include reference in URL parameters for direct returns

### 5. Mobile Device Compatibility

**Symptoms:**
- Upload functionality doesn't work on some mobile devices
- Camera capture issues on mobile

**Possible Causes:**
- Browser compatibility issues
- Camera permission issues
- Responsive design problems

**Solutions:**
- Test on multiple mobile browsers and devices
- Ensure proper camera permissions handling
- Optimize file upload UI for touch screens
- Add clear instructions for mobile users

## Best Practices for Customer Experience

1. **Clear Communication**
   - Always show expected verification timeframes
   - Send SMS/email confirmations at each step
   - Provide clear instructions with visual guides

2. **Simplified Process**
   - Minimize steps in the payment flow
   - Use copy buttons for all reference numbers and amounts
   - Pre-fill information wherever possible

3. **Receipt Upload Optimization**
   - Allow direct camera capture in modern browsers
   - Support multiple file formats
   - Provide preview functionality before final upload

## Admin Verification Best Practices

1. **Verification Checklist**
   - Match transfer amount with order amount
   - Verify transfer date and time
   - Check account details match your company accounts
   - Verify reference number matches

2. **Handling Discrepancies**
   - Clear process for partial payments
   - Standard responses for rejected receipts
   - Customer communication templates

3. **Process Efficiency**
   - Batch processing of verifications
   - Keyboard shortcuts for common actions
   - Dashboard view of pending verifications

## Debugging Tools

For developers troubleshooting the bank transfer system:

1. **Client-side Logs**
   - Check browser console for API errors
   - Verify localStorage/sessionStorage for order data integrity
   - Test network connectivity to API endpoints

2. **Server-side Verification**
   - Verify webhook configurations for notifications
   - Check file storage permissions and quotas
   - Ensure database consistency between orders and payments

3. **Environment-specific Issues**
   - Separate configurations for development/production
   - Mock bank account data for testing
   - Test receipt upload in sandbox mode
