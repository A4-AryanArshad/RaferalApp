/**
 * CRITICAL: Hermes-compatible boolean prop wrapper
 * Physical devices use Hermes engine which is VERY strict about types
 * This ensures ALL boolean props are literal primitives before passing to native components
 */

/**
 * Ensures a value is a strict boolean primitive
 * Handles edge cases where values might be strings from serialization
 */
export function toBoolean(value: any): boolean {
  if (value === true || value === 'true') {
    return true;
  }
  return false;
}

/**
 * Wraps an object to ensure all boolean properties are primitives
 * Use this before passing props to native components
 */
export function ensureBooleanProps<T extends Record<string, any>>(props: T): T {
  const result = {...props};
  
  // List of known boolean prop names in React Native
  const booleanProps = [
    'editable',
    'disabled',
    'secureTextEntry',
    'multiline',
    'autoFocus',
    'selectTextOnFocus',
    'clearButtonMode',
    'keyboardType',
    'returnKeyType',
    'blurOnSubmit',
    'headerShown',
    'tabBarShowLabel',
    'tabBarHideOnKeyboard',
    'lazy',
    'detachInactiveScreens',
  ];
  
  for (const key of booleanProps) {
    if (key in result) {
      result[key] = toBoolean(result[key]);
    }
  }
  
  return result;
}



