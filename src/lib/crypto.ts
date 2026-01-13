// Simple encryption utilities for credential obfuscation
// Note: This is NOT production-grade encryption. For production, use HTTPS/TLS.
// This only prevents credentials from being visible in plain text in network requests.

/**
 * Encodes credentials to Base64 to prevent plain text exposure in network logs
 */
export const encodeCredentials = (email: string, password: string): string => {
  const credentials = JSON.stringify({ email, password });
  return btoa(encodeURIComponent(credentials));
};

/**
 * Decodes Base64 encoded credentials
 */
export const decodeCredentials = (encoded: string): { email: string; password: string } => {
  const decoded = decodeURIComponent(atob(encoded));
  return JSON.parse(decoded);
};

/**
 * Simple XOR encryption for additional obfuscation
 */
export const encryptData = (data: string, key: string = 'pawstore_secret_key'): string => {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

/**
 * Decrypt XOR encrypted data
 */
export const decryptData = (encrypted: string, key: string = 'pawstore_secret_key'): string => {
  const data = atob(encrypted);
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};
