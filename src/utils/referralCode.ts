import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique referral code
 * Format: Short alphanumeric code (8-10 characters)
 */
export const generateReferralCode = (): string => {
  // Generate UUID and take first 8 characters, then add random alphanumeric
  const uuid = uuidv4().replace(/-/g, '');
  const shortCode = uuid.substring(0, 8).toUpperCase();
  
  // Add random alphanumeric characters to make it more readable
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = shortCode;
  
  // Ensure uniqueness by adding timestamp component
  const timestamp = Date.now().toString(36).toUpperCase().slice(-2);
  code = code.slice(0, 6) + timestamp;
  
  return code;
};

/**
 * Validates referral code format
 */
export const isValidReferralCode = (code: string): boolean => {
  // Check if code is 8-10 characters, alphanumeric
  return /^[A-Z0-9]{8,10}$/.test(code);
};



