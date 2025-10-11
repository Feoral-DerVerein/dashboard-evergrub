/**
 * Square OAuth Configuration
 * 
 * This file contains the Square application configuration.
 * The Application ID is safe to expose in the client since it's used for OAuth flows.
 * The Application Secret is stored securely in Supabase secrets.
 */

export const SQUARE_CONFIG = {
  // Your Square Application ID (Sandbox or Production)
  // Replace with your actual Application ID from Square Developer Dashboard
  APPLICATION_ID: 'sandbox-sq0idb-KN7kLwnW8eDIo_hkpac...',
  
  // Environment: 'sandbox' for testing, 'production' for live
  ENVIRONMENT: 'sandbox' as 'sandbox' | 'production',
  
  // OAuth URLs based on environment
  get OAUTH_URL() {
    return this.ENVIRONMENT === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';
  },
  
  get API_URL() {
    return this.ENVIRONMENT === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';
  },
  
  // OAuth scopes needed for POS integration
  OAUTH_SCOPES: [
    'MERCHANT_PROFILE_READ',
    'ITEMS_READ',
    'ORDERS_READ',
    'PAYMENTS_READ',
  ].join('+'),
};
