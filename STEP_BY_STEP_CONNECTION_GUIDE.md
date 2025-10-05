# Step-by-Step POS API Connection Guide
## Connecting Your POS System to Negentropy

---

## 📌 Before You Start

### Prerequisites Checklist
- [ ] You have completed the POS Provider Checklist
- [ ] You have your API URL from your POS provider
- [ ] You have your API Key or authentication credentials
- [ ] You have API documentation from your provider
- [ ] You have example API responses
- [ ] You understand the authentication method required

**⚠️ IMPORTANT:** Test your API connection using the `API_TESTING_TEMPLATE.md` file BEFORE connecting to your dashboard.

---

## 🎯 Overview

You will complete these 5 main steps:

1. **Configure API Settings** (5 minutes)
2. **Test API Connection** (10 minutes)
3. **Enable Real API Calls** (10 minutes)
4. **Verify Data Display** (5 minutes)
5. **Monitor and Troubleshoot** (ongoing)

**Total Time:** Approximately 30 minutes

---

## 📝 STEP 1: Configure API Settings

### What You're Doing
You'll enter your API credentials into the Negentropy configuration file.

### Instructions

1. **Open the configuration file:**
   - File location: `src/config/posApiConfig.ts`
   - You can open this in any text editor

2. **Find the API configuration section:**
   - Look for: `export const POS_API_CONFIG = {`

3. **Update the API URL:**

   **FIND THIS:**
   ```typescript
   API_URL: 'https://api.yourpos.com/v1',
   ```

   **REPLACE WITH YOUR ACTUAL URL:**
   ```typescript
   API_URL: 'https://api.your-actual-pos.com/v1',
   ```

   **Example for Square POS:**
   ```typescript
   API_URL: 'https://connect.squareup.com/v2',
   ```

   **Example for Lightspeed:**
   ```typescript
   API_URL: 'https://api.lightspeedapp.com/retail/v1',
   ```

4. **Update the API Key:**

   **FIND THIS:**
   ```typescript
   API_KEY: 'your_api_key_here',
   ```

   **REPLACE WITH YOUR ACTUAL KEY:**
   ```typescript
   API_KEY: 'sk_live_abc123xyz789...',
   ```

   ⚠️ **Security Note:** 
   - Never share your API key
   - Never commit it to public repositories
   - Keep this file secure

5. **Keep USE_MOCK_DATA as true for now:**

   **LEAVE THIS AS IS (for now):**
   ```typescript
   USE_MOCK_DATA: true,  // Don't change this yet
   ```

   We'll change this to `false` in Step 3.

6. **Verify endpoint paths match your POS system:**

   **Check these paths:**
   ```typescript
   ENDPOINTS: {
     SALES: '/api/sales',           // Update if your POS uses different paths
     TRANSACTIONS: '/api/transactions',
     PRODUCTS: '/api/products',
     ANALYTICS: '/api/analytics',
     SUSTAINABILITY: '/api/sustainability',
     CUSTOMERS: '/api/customers',
   }
   ```

   **Update if needed based on your POS documentation.**

   **Example for Square:**
   ```typescript
   ENDPOINTS: {
     SALES: '/payments',
     TRANSACTIONS: '/orders',
     PRODUCTS: '/catalog/list',
     ANALYTICS: '/reports',
   }
   ```

7. **Save the file**
   - Make sure all changes are saved
   - Close the editor

### ✅ Step 1 Complete
You've configured your API credentials. Next, we'll test the connection.

---

## 🧪 STEP 2: Test API Connection

### What You're Doing
Before connecting to your full dashboard, you'll verify that your API credentials work correctly using a simple test script.

### Instructions

1. **Open the API testing template:**
   - File: `API_TESTING_TEMPLATE.md`
   - Follow the instructions in that file

2. **Create a test file:**
   - Create file: `test-pos-connection.html`
   - Copy the test code from `API_TESTING_TEMPLATE.md`

3. **Update the test file with your credentials:**
   - Replace `YOUR_API_URL` with your actual URL
   - Replace `YOUR_API_KEY` with your actual key

4. **Open the test file in your browser:**
   - Double-click `test-pos-connection.html`
   - Open your browser's console (press F12)

5. **Run the test:**
   - Click the \"Test Connection\" button
   - Check the console for results

6. **Expected Results:**

   **✅ SUCCESS - You should see:**
   ```
   ✅ Connection successful!
   Response: { your data here }
   ```

   **❌ FAILURE - If you see errors:**
   - \"CORS error\" → Your POS provider needs to whitelist your domain
   - \"401 Unauthorized\" → Check your API key is correct
   - \"404 Not Found\" → Check your endpoint URL is correct
   - \"Network error\" → Check your internet connection

7. **Troubleshooting:**
   - If tests fail, refer to Section 6 of this guide
   - Contact your POS provider with error messages
   - Don't proceed until tests pass

### ✅ Step 2 Complete
Your API connection is working. Now we'll enable it in the dashboard.

---

## 🔌 STEP 3: Enable Real API Calls

### What You're Doing
You'll switch from sample data to real POS data and activate the API calls in your dashboard.

### Part A: Disable Mock Data

1. **Open the configuration file again:**
   - File: `src/config/posApiConfig.ts`

2. **Change USE_MOCK_DATA to false:**

   **FIND THIS:**
   ```typescript
   USE_MOCK_DATA: true,
   ```

   **CHANGE TO:**
   ```typescript
   USE_MOCK_DATA: false,  // ✅ Now using real POS data
   ```

3. **Save the file**

### Part B: Enable API Functions

1. **Open the API service file:**
   - File: `src/services/posApiService.ts`

2. **Find the first function** (`fetchSalesData`):

   **You'll see code that looks like this:**
   ```typescript
   if (POS_API_CONFIG.USE_MOCK_DATA) {
     // MOCK DATA - Remove this section when using real API
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

3. **Remove or comment out the mock data section:**

   **DELETE OR COMMENT OUT THIS:**
   ```typescript
   if (POS_API_CONFIG.USE_MOCK_DATA) {
     return {
       success: true,
       data: generateMockMetrics(),
       timestamp: new Date(),
     };
   }
   ```

4. **Uncomment the real API section:**

   **REMOVE THE `/*` at the start and `*/` at the end:**

   **Before:**
   ```typescript
   /* UNCOMMENT THIS SECTION WHEN READY TO USE REAL API
   try {
     const response = await fetch(...);
   */
   ```

   **After:**
   ```typescript
   // ✅ Real API code (uncommented)
   try {
     const response = await fetch(
   ```

5. **Check the authentication header:**

   Inside the `fetch` call, verify the authentication matches your POS system:

   **For Bearer Token:**
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${POS_API_CONFIG.API_KEY}`,
   },
   ```

   **For API Key Header:**
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'X-API-Key': POS_API_CONFIG.API_KEY,
   },
   ```

   Use the method specified by your POS provider.

6. **Repeat for all functions:**
   - `fetchSalesData()`
   - `fetchTransactionsData()`
   - `fetchAnalyticsData()`
   - `fetchSustainabilityData()`
   - `fetchAllDashboardData()`

   For each function:
   - Remove/comment mock data section
   - Uncomment real API section
   - Verify authentication headers

7. **Save the file**

### ✅ Step 3 Complete
Your dashboard is now configured to use real POS data.

---

## 👀 STEP 4: Verify Data Display

### What You're Doing
You'll check that your dashboard is displaying real data correctly.

### Instructions

1. **Open your Negentropy dashboard:**
   - Log in to your account
   - Navigate to the main dashboard

2. **Check the status indicator:**
   - Look at the top right of the dashboard
   - You should see: **\"Connected to POS\"** (green badge)
   - If you see: **\"Using sample data\"** (yellow badge) → Something's wrong, go to Step 6

3. **Check the \"Last updated\" timestamp:**
   - Should show current Australian time
   - Format: \"5 Oct 2025, 2:30 pm\"

4. **Verify the data looks correct:**

   **Check these metrics:**
   - [ ] Total Sales matches your POS
   - [ ] Transaction count is realistic
   - [ ] Revenue figures are correct
   - [ ] Profit calculations make sense
   - [ ] No negative or zero values (unless accurate)

5. **Test the Refresh button:**
   - Click \"Refresh\" button in top right
   - Should see spinning icon
   - Data should update (may be same if no new sales)
   - Check \"Last updated\" timestamp changes

6. **Monitor for errors:**
   - Open browser console (F12)
   - Look for red error messages
   - If errors appear, note them for troubleshooting

7. **Test auto-refresh:**
   - Leave dashboard open for 5+ minutes
   - Data should automatically refresh
   - Check \"Last updated\" timestamp

8. **Compare with POS system:**
   - Log into your actual POS system
   - Compare key numbers:
     - Today's total sales
     - Number of transactions
     - Top products
   - Numbers should match (allowing for timing differences)

### ✅ Step 4 Complete
Your dashboard is successfully displaying real POS data!

---

## 📊 STEP 5: Ongoing Monitoring

### What You're Doing
You'll set up practices to ensure your integration continues working smoothly.

### Daily Checks

**Quick 30-second check each day:**
- [ ] Dashboard shows \"Connected to POS\" status
- [ ] Data is updating (check \"Last updated\" timestamp)
- [ ] No error messages visible
- [ ] Numbers look realistic

### Weekly Checks

**5-minute check each week:**
- [ ] Compare dashboard totals with POS reports
- [ ] Verify historical data is accurate
- [ ] Check that all metrics are populating
- [ ] Test manual refresh function

### If Something Goes Wrong

**See Section 6: Troubleshooting** below.

### Regular Maintenance

**Monthly tasks:**
- [ ] Review API usage (check if approaching rate limits)
- [ ] Verify API key hasn't expired
- [ ] Check for POS system updates that might affect API
- [ ] Review and update any customisations

### Keep Records

**Document these details:**
- Date connection was established
- Any custom endpoint configurations
- Authentication method used
- Technical support contacts
- Any special requirements or notes

---

## 🔧 STEP 6: Troubleshooting

### Common Issues and Solutions

---

### Issue 1: \"Using sample data\" badge won't change to \"Connected to POS\"

**Possible Causes:**
1. `USE_MOCK_DATA` is still `true`
2. API calls haven't been uncommented
3. Browser cache needs clearing

**Solutions:**
1. ✅ Open `src/config/posApiConfig.ts`
2. ✅ Verify: `USE_MOCK_DATA: false,`
3. ✅ Save file
4. ✅ Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
5. ✅ Clear browser cache
6. ✅ Check `posApiService.ts` - ensure API code is uncommented

---

### Issue 2: \"Connection error\" or red error messages

**Possible Causes:**
1. Incorrect API URL
2. Incorrect API Key
3. Wrong authentication method
4. CORS not enabled
5. Rate limits exceeded
6. POS system outage

**Solutions:**

**Check 1: Verify API Credentials**
- Open `posApiConfig.ts`
- Double-check API URL (no typos)
- Double-check API Key (copy directly from POS provider)
- Verify endpoints match your POS documentation

**Check 2: Verify Authentication Method**
- Open `posApiService.ts`
- Find the `headers:` section in `fetch` calls
- Ensure authentication header matches your POS requirements:

```typescript
// Method 1: Bearer Token
'Authorization': `Bearer ${POS_API_CONFIG.API_KEY}`

// Method 2: API Key Header  
'X-API-Key': POS_API_CONFIG.API_KEY

// Method 3: Other (check your POS docs)
```

**Check 3: Test Direct API Call**
- Use the testing template from Step 2
- If test passes but dashboard fails, there's a code issue
- If test fails, it's an API/credential issue

**Check 4: CORS Issues**
- Look for \"CORS\" in error messages
- Contact POS provider: \"Please enable CORS for my domain\"
- Provide your website URL

**Check 5: Check Browser Console**
- Press F12 to open console
- Look for specific error messages
- Take screenshots of errors
- Share with your POS provider's support

---

### Issue 3: Data looks wrong or unusual

**Possible Causes:**
1. Data format doesn't match expectations
2. Timezone issues
3. Currency format issues
4. Calculation errors

**Solutions:**

**Check 1: Verify Data Format**
- Open browser console
- Look at actual API responses
- Compare with expected format in code
- You may need to transform the data

**Check 2: Check Sample API Response**
- Request sample response from POS provider
- Compare structure with what code expects
- You may need to modify `posApiService.ts` to map fields

**Example data transformation:**
```typescript
// If your POS returns \"totalAmount\" but code expects \"total\"
const transformedData = {
  total: apiResponse.totalAmount,  // Map field names
  // ... other fields
};
```

**Check 3: Timezone Issues**
- Verify `TIMEZONE` in `posApiConfig.ts` is correct
- Should be: `'Australia/Sydney'` (or your state)

**Check 4: Currency Format**
- Verify `CURRENCY` is set to `'AUD'`
- Check POS returns amounts in dollars, not cents

---

### Issue 4: Auto-refresh not working

**Possible Causes:**
1. Browser in background too long
2. Network issues
3. Configuration issue

**Solutions:**
1. ✅ Check `AUTO_REFRESH_INTERVAL` in `posApiConfig.ts`
2. ✅ Default is 300000 (5 minutes)
3. ✅ Keep browser tab active
4. ✅ Check browser console for errors during refresh
5. ✅ Test manual refresh button works

---

### Issue 5: Some data showing, others not

**Possible Causes:**
1. Some endpoints not working
2. Incomplete API access
3. Permission issues

**Solutions:**
1. ✅ Test each endpoint individually using test template
2. ✅ Check which endpoints have data
3. ✅ Contact POS provider about missing endpoints
4. ✅ You may need different API plans/permissions

---

### Issue 6: \"Rate limit exceeded\" errors

**Possible Causes:**
1. Too many refresh requests
2. Multiple users/tabs open
3. Auto-refresh too frequent

**Solutions:**
1. ✅ Increase `AUTO_REFRESH_INTERVAL` in config
2. ✅ Close other tabs with dashboard open
3. ✅ Wait for rate limit to reset (usually 1 hour)
4. ✅ Contact POS provider about increasing limits
5. ✅ Consider upgrading POS API plan

---

### Issue 7: Worked yesterday, broken today

**Possible Causes:**
1. API key expired
2. POS system updated
3. Changed settings
4. API outage

**Solutions:**
1. ✅ Check POS provider's status page
2. ✅ Verify API key still valid
3. ✅ Try generating new API key
4. ✅ Check for emails from POS provider about changes
5. ✅ Review any changes you made recently
6. ✅ Restore from backup if needed

---

## 📞 Getting Help

### When to Contact Your POS Provider

Contact your POS technical support if:
- ❌ API tests fail consistently
- ❌ Authentication errors
- ❌ CORS errors
- ❌ Rate limit issues
- ❌ Missing data or endpoints
- ❌ API key problems

**What to tell them:**
1. \"I'm integrating with a third-party waste management dashboard\"
2. Share the specific error messages
3. Share what you've already tried
4. Ask for their integration best practices

### When to Contact Negentropy Support

Contact Negentropy support if:
- ❌ API tests pass but dashboard doesn't display data
- ❌ Data transformation issues
- ❌ Dashboard-specific errors
- ❌ Configuration questions

**Email:** support@negentropy.com  
**Include:**
- Screenshots of errors
- Your POS system name
- What you've already tried
- Console error messages (F12)

---

## ✅ Final Checklist

Before considering your integration complete:

- [ ] API credentials configured correctly
- [ ] API connection tested and passing
- [ ] Mock data disabled (`USE_MOCK_DATA: false`)
- [ ] Real API calls enabled (uncommented)
- [ ] Dashboard shows \"Connected to POS\" badge
- [ ] Data looks accurate compared to POS
- [ ] Refresh button works
- [ ] Auto-refresh working
- [ ] No console errors
- [ ] Tested for at least 24 hours
- [ ] Dashboard matches POS reports
- [ ] Documented any custom configurations
- [ ] Saved POS support contact details

---

## 🎉 You're Done!

Congratulations! Your Negentropy dashboard is now connected to your POS system and displaying real-time data.

### What's Next?

1. **Use your dashboard daily** to track waste reduction
2. **Monitor trends** in sales and sustainability
3. **Generate reports** for compliance
4. **Make data-driven decisions** for your business

### Need More Help?

- 📖 Review `POS_API_SETUP_INSTRUCTIONS.md` for reference
- 🧪 Keep `API_TESTING_TEMPLATE.md` for troubleshooting
- 📋 Refer to `CHECKLIST_POS_PROVIDER_QUESTIONS.md` if requesting new features

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**For:** Australian Negentropy Users  
**Estimated Setup Time:** 30-60 minutes
