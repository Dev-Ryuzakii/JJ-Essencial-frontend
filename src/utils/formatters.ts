/**
 * Utility functions for formatting data across the application
 */

/**
 * Format a number as Nigerian Naira currency
 * @param amount - Number to format as currency
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, options: Intl.NumberFormatOptions = {}): string => {
  // Use 0 as default if amount is undefined/null
  const safeAmount = amount ?? 0;
  
  // Create formatter with NGN currency code and provided options
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0, // No decimal places for whole naira amounts
    maximumFractionDigits: 2,
    ...options
  });
  
  return formatter.format(safeAmount);
};

/**
 * Format a date string or Date object to a human-readable format
 * @param date - Date to format
 * @param format - Format style: 'short', 'medium', 'long', or 'full'
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format options based on requested format
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? { day: 'numeric', month: 'short', year: 'numeric' } :
    format === 'medium' ? { day: 'numeric', month: 'long', year: 'numeric' } :
    format === 'long' ? { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' } :
    { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' };
  
  return new Intl.DateTimeFormat('en-NG', options).format(dateObj);
};

/**
 * Format a phone number to a standard format
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a Nigerian number
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    // Format as +234 xxx xxx xxxx
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Format as 0xxx xxx xxxx
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  // Return the original string if it doesn't match expected formats
  return phone;
};

/**
 * Format file size in bytes to human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text to a specified length and add ellipsis if needed
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};
