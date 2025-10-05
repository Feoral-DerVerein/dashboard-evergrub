/**
 * POS API Configuration
 * 
 * INSTRUCTIONS FOR CONNECTING TO YOUR REAL POS SYSTEM:
 * =====================================================
 * 
 * 1. Get your API credentials from your POS provider:
 *    - API URL (base endpoint)
 *    - API Key (authentication token)
 * 
 * 2. Replace the values below with your actual credentials:
 *    - Change API_URL to your POS system's base URL
 *    - Change API_KEY to your authentication key
 * 
 * 3. Set USE_MOCK_DATA to false when you're ready to use real data
 * 
 * 4. Make sure your POS system has CORS enabled for your domain
 */

export const POS_API_CONFIG = {
  // ========================================
  // PASTE YOUR API URL HERE
  // Example: 'https://api.yourpos.com/v1'
  // ========================================
  API_URL: 'https://api.yourpos.com/v1',
  
  // ========================================
  // PASTE YOUR API KEY HERE
  // Example: 'sk_live_abc123xyz456'
  // ========================================
  API_KEY: 'your_api_key_here',
  
  // ========================================
  // SET TO FALSE WHEN READY TO USE REAL DATA
  // ========================================
  USE_MOCK_DATA: true,
  
  // Auto-refresh interval in milliseconds (5 minutes = 300000ms)
  AUTO_REFRESH_INTERVAL: 300000,
  
  // API Endpoints (adjust these based on your POS system)
  ENDPOINTS: {
    SALES: '/api/sales',
    TRANSACTIONS: '/api/transactions',
    PRODUCTS: '/api/products',
    ANALYTICS: '/api/analytics',
    SUSTAINABILITY: '/api/sustainability',
    CUSTOMERS: '/api/customers',
  },
  
  // Timezone for Australian formatting
  TIMEZONE: 'Australia/Sydney',
  
  // Currency
  CURRENCY: 'AUD',
};

/**
 * WHAT TO REQUEST FROM YOUR POS PROVIDER:
 * ========================================
 * 
 * 1. API Documentation
 *    - Request complete API documentation
 *    - Ask for example responses for each endpoint
 * 
 * 2. Authentication
 *    - API Key or OAuth credentials
 *    - Authentication method (Bearer token, API key header, etc.)
 * 
 * 3. Endpoints You Need:
 *    - Sales data (daily, weekly, monthly totals)
 *    - Transaction details (count, average value)
 *    - Product inventory and movement
 *    - Customer analytics
 *    - Profit and revenue data
 * 
 * 4. Data Format
 *    - JSON response format
 *    - Date/time format used
 *    - Currency format
 * 
 * 5. Rate Limits
 *    - How many requests per minute/hour
 *    - Any usage restrictions
 * 
 * 6. Support
 *    - Technical support contact
 *    - API status page
 */
