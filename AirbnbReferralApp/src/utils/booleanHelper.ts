/**
 * Hermes-compatible boolean helper
 * Physical devices use Hermes engine which is very strict about types
 * This ensures we always pass literal boolean primitives to native components
 */

/**
 * Converts any value to a strict boolean primitive (true or false)
 * Never returns anything other than literal true or false
 */
export function toStrictBoolean(value: any): boolean {
  // Use strict comparison - only true is true, everything else is false
  if (value === true) {
    return true;
  }
  return false;
}

/**
 * Converts a value to boolean, handling string "true"/"false" cases
 * This is needed because some serialization might convert booleans to strings
 */
export function ensureBoolean(value: any): boolean {
  // Handle string "true" or "false"
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  // Handle actual boolean
  if (typeof value === 'boolean') {
    return value === true;
  }
  // Everything else is false
  return false;
}






