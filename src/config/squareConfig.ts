/**
 * Square OAuth Configuration
 * 
 * This file contains the Square application configuration.
 * The Application ID is safe to expose in the client since it's used for OAuth flows.
 * The Application Secret is stored securely in Supabase secrets.
 */

// OAuth Redirect URI - uses custom domain
export const SQUARE_REDIRECT_URI = 'https://negentropyfood.cloud/square-callback';

export const SQUARE_CONFIG = {
  // Your Square Application ID (Sandbox or Production)
  APPLICATION_ID: 'sandbox-sq0idb-KN7kLwnW8eDIo_hkpacHSg',
  
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
    'INVENTORY_READ',
    'ORDERS_READ',
    'PAYMENTS_READ',
  ].join('+'),
};
