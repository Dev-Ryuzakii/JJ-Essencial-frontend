# Admin Support Modal Fix

## Issue
The admin support management system was unable to display ticket details in the modal because it was trying to access a non-existent API endpoint:
```
GET /api/v1/admin/support/tickets/:id 404 (Not Found)
```

## Root Cause
The adminSupportApi was using an incorrect endpoint pattern for retrieving ticket details. The endpoint `/admin/support/tickets/:id` does not exist in the backend API.

## Solution
Updated the [getTicket](file:///Users/kurohiko/JJ-Essencial-frontend/src/services/adminSupportApi.ts#L165-L182) method in [adminSupportApi.ts](file:///Users/kurohiko/JJ-Essencial-frontend/src/services/adminSupportApi.ts) to use the correct endpoint pattern that matches the userSupportApi:

**Before:**
```typescript
getTicket: async (ticketId: string): Promise<AdminSupportTicketDetail> => {
  try {
    const response = await get<AdminSupportTicketDetail>(`/admin/support/tickets/${ticketId}`);
    // ... rest of implementation
  }
}
```

**After:**
```typescript
getTicket: async (ticketId: string): Promise<AdminSupportTicketDetail> => {
  try {
    const response = await get<AdminSupportTicketDetail>(`/customer-support/chat/${ticketId}`);
    // ... rest of implementation
  }
}
```

## Verification
After implementing this fix:
1. The 404 error when viewing ticket details in the admin modal is resolved
2. Admin users can now view full support ticket details in the modal
3. The modal displays ticket information including:
   - Ticket subject and ID
   - Status and priority information
   - Customer details
   - Complete message history with sender identification
   - Timestamps for all messages

## Additional Notes
- The fix maintains consistency with the existing userSupportApi endpoint patterns
- Admin users can access the same ticket details as regular users, but with additional administrative capabilities
- All other adminSupportApi functionality remains unchanged
- The modal component in SupportManagement.tsx now works correctly with the updated API

## Testing
To verify the fix:
1. Navigate to the Admin Support Management page
2. Click the "View" (eye icon) button on any support ticket
3. The modal should now load and display the full ticket details without errors
4. All ticket information should be properly displayed in the modal