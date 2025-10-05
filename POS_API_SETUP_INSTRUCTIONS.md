# Negentropy POS API Integration Guide

## 📋 Overview

Your Negentropy dashboard is currently running with **realistic sample data** that simulates a real POS system. When you're ready to connect to your actual POS system, you'll only need to update a few configuration values.

---

## 🚀 Current Status

✅ **Dashboard is fully functional** with sample data  
✅ **All metrics update automatically** every 5 minutes  
✅ **Ready to connect** to your real POS system  
⚠️ **Currently using simulated data** (will show "Using sample data" indicator)

---

## 📝 What You Need From Your POS Provider

Before connecting to your real POS system, request the following from your POS provider:

### 1. API Credentials
- [ ] **API Base URL** (e.g., `https://api.yourpos.com/v1`)
- [ ] **API Key** or **OAuth Token**
- [ ] **Authentication method** (Bearer token, API key header, etc.)

### 2. API Documentation
- [ ] Complete API documentation
- [ ] Example API responses for each endpoint
- [ ] Data format specifications (JSON structure)
- [ ] Date/time format used by the system

### 3. Available Endpoints
Ask if they have endpoints for:
- [ ] Sales data (`/api/sales`)
- [ ] Transaction details (`/api/transactions`)
- [ ] Product inventory (`/api/products`)
- [ ] Analytics data (`/api/analytics`)
- [ ] Sustainability metrics (if available)
- [ ] Customer data (`/api/customers`)

### 4. Technical Details
- [ ] **Rate limits** (requests per minute/hour)
- [ ] **CORS settings** (must allow your domain)
- [ ] **Support contact** for technical issues
- [ ] **API status page** (to check for outages)

---

## 🔧 How to Connect Your POS System

### Step 1: Configure API Settings

1. Open the file: `src/config/posApiConfig.ts`

2. Find these lines and replace with your actual credentials:

```typescript
export const POS_API_CONFIG = {
  // Replace this with your POS API URL
  API_URL: 'https://api.yourpos.com/v1',
  
  // Replace this with your API Key
  API_KEY: 'your_actual_api_key_here',
  
  // Change this to false when ready to use real data
  USE_MOCK_DATA: false,  // ⬅️ CHANGE THIS TO FALSE
};
```

### Step 2: Verify Endpoints

Check that the endpoint paths match your POS system:

```typescript
ENDPOINTS: {
  SALES: '/api/sales',           // Update if different
  TRANSACTIONS: '/api/transactions',
  PRODUCTS: '/api/products',
  ANALYTICS: '/api/analytics',
  SUSTAINABILITY: '/api/sustainability',
  CUSTOMERS: '/api/customers',
}
```

### Step 3: Test the Connection

1. **Save your changes**
2. **Refresh your dashboard**
3. Look for the status indicator:
   - ✅ "Connected to POS" = Success!
   - ❌ "Using sample data" = Still using mock data
   - ⚠️ "Connection error" = Check your API credentials

### Step 4: Enable Real API Calls

1. Open the file: `src/services/posApiService.ts`

2. Find each function (e.g., `fetchSalesData`)

3. **Uncomment** the API call section (remove the `/*` and `*/`)

4. **Comment out** or **delete** the mock data section

**Before:**
```typescript
if (POS_API_CONFIG.USE_MOCK_DATA) {
  return {
    success: true,
    data: generateMockMetrics(),
    timestamp: new Date(),
  };
}

/* UNCOMMENT THIS SECTION WHEN READY TO USE REAL API
try {
  const response = await fetch(...);
  ...
}
*/
```

**After:**
```typescript
// Removed mock data section

// Uncommented real API section
try {
  const response = await fetch(
    `${POS_API_CONFIG.API_URL}${POS_API_CONFIG.ENDPOINTS.SALES}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POS_API_CONFIG.API_KEY}`,
      },
    }
  );
  
  const data = await response.json();
  return {
    success: true,
    data,
    timestamp: new Date(),
  };
} catch (error) {
  console.error('Error fetching sales data:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date(),
  };
}
```

---

## 📊 Expected Data Format

Your POS system should return data in this format:

### Sales Endpoint Response:
```json
{
  "total": 142,
  "change_percentage": 12.5,
  "currency": "AUD",
  "period": "today"
}
```

### Transactions Endpoint Response:
```json
{
  "count": 18,
  "change_percentage": 8.2,
  "average_value": 8,
  "period": "today"
}
```

### Analytics Endpoint Response:
```json
{
  "profit": 36,
  "revenue": 164,
  "conversion_rate": 14,
  "return_rate": 3,
  "cost_savings": 21
}
```

### Sustainability Endpoint Response:
```json
{
  "co2_saved_kg": 27,
  "waste_reduced_percentage": 3,
  "food_waste_reduced_kg": 16,
  "operational_savings": 26
}
```

---

## 🔍 Troubleshooting

### Problem: "Connection error" message

**Possible causes:**
1. **Incorrect API URL or API Key**
   - Double-check your credentials in `posApiConfig.ts`
   - Verify with your POS provider

2. **CORS not enabled**
   - Ask your POS provider to enable CORS for your domain
   - They need to add your domain to their allowed origins

3. **Wrong endpoint paths**
   - Check that `/api/sales`, `/api/transactions` etc. match your system
   - Update in `posApiConfig.ts` if needed

4. **Authentication format**
   - Some systems use `X-API-Key` header instead of `Bearer` token
   - Check your POS documentation for the correct format

### Problem: Data looks incorrect

**Solutions:**
1. Check the API response format matches what we expect
2. You may need to transform the data - edit `posApiService.ts` functions
3. Enable browser console to see actual API responses
4. Contact your POS provider for correct data structure

### Problem: Dashboard not updating

**Solutions:**
1. Check auto-refresh is enabled (default: 5 minutes)
2. Manually click "Refresh data" button
3. Check browser console for errors
4. Verify your internet connection

---

## ⚙️ Configuration Options

You can customise these settings in `posApiConfig.ts`:

```typescript
// Auto-refresh interval (in milliseconds)
AUTO_REFRESH_INTERVAL: 300000,  // 5 minutes
// Change to: 60000 for 1 minute
// Change to: 600000 for 10 minutes

// Timezone
TIMEZONE: 'Australia/Sydney',
// Other options: 'Australia/Melbourne', 'Australia/Brisbane'

// Currency
CURRENCY: 'AUD',
```

---

## 📞 Getting Help

If you're stuck:

1. **Check the browser console** (F12) for error messages
2. **Contact your POS provider** for API support
3. **Email Negentropy support** with:
   - Error messages from console
   - Your POS system name
   - What you've already tried

---

## ✅ Checklist

Before going live with real data:

- [ ] Got API credentials from POS provider
- [ ] Updated `API_URL` in config file
- [ ] Updated `API_KEY` in config file
- [ ] Verified endpoint paths are correct
- [ ] Changed `USE_MOCK_DATA` to `false`
- [ ] Uncommented API call code
- [ ] Tested connection successfully
- [ ] Data displays correctly
- [ ] Auto-refresh working
- [ ] Checked timezone and currency format

---

## 🎯 Quick Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/config/posApiConfig.ts` | API credentials and settings | First, to add your API details |
| `src/services/posApiService.ts` | API call functions | Second, to enable real API calls |
| `src/services/dashboardApiService.ts` | Integration handler | Rarely (already configured) |

---

**Current Version:** 1.0  
**Last Updated:** October 2025  
**Status:** ✅ Ready for production use
