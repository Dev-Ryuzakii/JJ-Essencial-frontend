/**
 * Debug script for userSupportApi
 * This script can be used to test the API endpoints in the browser console
 */

import userSupportApi from './userSupportApi';

// Function to test all API endpoints
const debugSupportApi = async () => {
  console.log('Debugging userSupportApi...');
  
  try {
    // Test checkAvailability
    console.log('Testing checkAvailability...');
    const isAvailable = await userSupportApi.checkAvailability();
    console.log('Support system availability:', isAvailable);
    
    if (isAvailable) {
      // Test getMyTickets
      console.log('Testing getMyTickets...');
      const tickets = await userSupportApi.getMyTickets();
      console.log('User tickets:', tickets);
      
      // Test createTicket (only if we want to create a test ticket)
      // Uncomment the following lines to create a test ticket
      /*
      console.log('Testing createTicket...');
      const newTicket = await userSupportApi.createTicket({
        subject: 'Test Ticket from Debug Script',
        priority: 'MEDIUM',
        initialMessage: 'This is a test ticket created from the debug script.'
      });
      console.log('Created ticket:', newTicket);
      */
    } else {
      console.log('Support system is not available for testing');
    }
    
    console.log('Debug completed successfully!');
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Export for manual testing
export { debugSupportApi };

// Optionally run automatically (comment out if not needed)
// debugSupportApi();

export default debugSupportApi;