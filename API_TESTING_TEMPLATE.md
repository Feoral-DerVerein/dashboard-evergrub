# API Testing Template
## Test Your POS Connection Before Full Integration

---

## 🎯 Purpose

Use this testing template to verify your POS API credentials work correctly BEFORE connecting them to your full Negentropy dashboard.

This simple test will:
- ✅ Verify your API URL is correct
- ✅ Verify your API Key is valid
- ✅ Check authentication method works
- ✅ Confirm data format is correct
- ✅ Identify CORS or connectivity issues

**⏱️ Time Required:** 5-10 minutes

---

## 📋 Prerequisites

Before using this template:
- [ ] You have your API URL
- [ ] You have your API Key
- [ ] You know your authentication method (Bearer token, API Key header, etc.)
- [ ] You have your POS API documentation

---

## 🧪 Method 1: Browser-Based Test (Easiest)

### What You'll Do
Create a simple HTML file that tests your API connection directly in your browser.

### Step 1: Create Test File

1. **Create a new file** called `test-pos-connection.html`
2. **Copy the code below** into the file
3. **Save it** to your computer

### Step 2: Copy This Code

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POS API Connection Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2e6b3f;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .input-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
        }
        input, select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
        }
        button {
            background: #2e6b3f;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
        }
        button:hover {
            background: #1e4b2f;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .result {
            margin-top: 30px;
            padding: 20px;
            border-radius: 8px;
            display: none;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
        }
        .response-data {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .loading {
            text-align: center;
            padding: 20px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #2e6b3f;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .steps {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
        }
        .steps h3 {
            margin-top: 0;
            color: #2e6b3f;
        }
        .steps ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .steps li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 POS API Connection Test</h1>
        <p class="subtitle">Test your POS system API before connecting to Negentropy</p>

        <div class="info-box">
            <strong>⚠️ Important:</strong> This test runs directly in your browser. Your API credentials will not be sent anywhere except to your POS system. Keep your API key confidential.
        </div>

        <form id="testForm">
            <div class="input-group">
                <label for="apiUrl">API Base URL *</label>
                <input 
                    type="text" 
                    id="apiUrl" 
                    placeholder="https://api.yourpos.com/v1" 
                    required
                />
                <small style="color: #666; display: block; margin-top: 5px;">
                    The base URL from your POS provider
                </small>
            </div>

            <div class="input-group">
                <label for="apiKey">API Key *</label>
                <input 
                    type="password" 
                    id="apiKey" 
                    placeholder="Your API key here" 
                    required
                />
                <small style="color: #666; display: block; margin-top: 5px;">
                    Your authentication key from your POS system
                </small>
            </div>

            <div class="input-group">
                <label for="authMethod">Authentication Method *</label>
                <select id="authMethod" required>
                    <option value="bearer">Bearer Token (Authorization: Bearer ...)</option>
                    <option value="apikey">API Key Header (X-API-Key: ...)</option>
                    <option value="basic">Basic Auth</option>
                    <option value="custom">Custom (will need to modify code)</option>
                </select>
            </div>

            <div class="input-group">
                <label for="endpoint">Test Endpoint</label>
                <input 
                    type="text" 
                    id="endpoint" 
                    placeholder="/api/sales" 
                    value="/api/sales"
                />
                <small style="color: #666; display: block; margin-top: 5px;">
                    Which endpoint to test (e.g., /api/sales, /payments, /transactions)
                </small>
            </div>

            <button type="submit" id="testButton">
                🚀 Test Connection
            </button>
        </form>

        <div id="loading" class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Testing connection...</p>
        </div>

        <div id="result" class="result"></div>

        <div class="steps">
            <h3>📖 How to Use This Test</h3>
            <ol>
                <li>Enter your POS API URL (from your provider)</li>
                <li>Enter your API Key (keep this confidential)</li>
                <li>Select your authentication method</li>
                <li>Optionally change the test endpoint</li>
                <li>Click "Test Connection"</li>
                <li>Check the results below</li>
                <li>Open browser console (F12) for detailed error messages</li>
            </ol>
        </div>
    </div>

    <script>
        document.getElementById('testForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form values
            const apiUrl = document.getElementById('apiUrl').value.trim();
            const apiKey = document.getElementById('apiKey').value.trim();
            const authMethod = document.getElementById('authMethod').value;
            const endpoint = document.getElementById('endpoint').value.trim();
            
            // Validate inputs
            if (!apiUrl || !apiKey) {
                showResult('error', 'Please fill in all required fields', null);
                return;
            }

            // Show loading
            document.getElementById('testButton').disabled = true;
            document.getElementById('loading').style.display = 'block';
            document.getElementById('result').style.display = 'none';

            // Build full URL
            const fullUrl = apiUrl + endpoint;

            // Build headers based on auth method
            const headers = {
                'Content-Type': 'application/json',
            };

            switch (authMethod) {
                case 'bearer':
                    headers['Authorization'] = `Bearer ${apiKey}`;
                    break;
                case 'apikey':
                    headers['X-API-Key'] = apiKey;
                    break;
                case 'basic':
                    headers['Authorization'] = `Basic ${btoa(apiKey)}`;
                    break;
            }

            console.log('🔍 Testing API Connection...');
            console.log('URL:', fullUrl);
            console.log('Headers:', headers);

            try {
                // Make the API request
                const response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: headers,
                    mode: 'cors',
                });

                console.log('📡 Response Status:', response.status);
                console.log('📡 Response Headers:', response.headers);

                // Try to parse response
                let responseData;
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    responseData = await response.json();
                } else {
                    responseData = await response.text();
                }

                console.log('📦 Response Data:', responseData);

                // Check if successful
                if (response.ok) {
                    showResult('success', 
                        `✅ Success! Connection working correctly.\n\nStatus: ${response.status} ${response.statusText}`,
                        responseData
                    );
                } else {
                    showResult('error',
                        `❌ API Error: ${response.status} ${response.statusText}\n\nThe API returned an error. Check your credentials and endpoint.`,
                        responseData
                    );
                }

            } catch (error) {
                console.error('❌ Connection Error:', error);
                
                let errorMessage = '❌ Connection Failed\n\n';
                
                if (error.message.includes('CORS')) {
                    errorMessage += 'CORS Error: Your POS provider needs to enable CORS for your domain.\n\n';
                    errorMessage += 'Contact your POS provider and ask them to:\n';
                    errorMessage += '• Enable CORS for your website domain\n';
                    errorMessage += '• Add your domain to their allowed origins list';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage += 'Network Error: Cannot reach the API.\n\n';
                    errorMessage += 'Possible causes:\n';
                    errorMessage += '• Incorrect API URL\n';
                    errorMessage += '• Internet connection issue\n';
                    errorMessage += '• API endpoint doesn\'t exist\n';
                    errorMessage += '• CORS not enabled';
                } else {
                    errorMessage += `Error: ${error.message}`;
                }
                
                showResult('error', errorMessage, null);
            } finally {
                // Hide loading
                document.getElementById('testButton').disabled = false;
                document.getElementById('loading').style.display = 'none';
            }
        });

        function showResult(type, message, data) {
            const resultDiv = document.getElementById('result');
            resultDiv.className = `result ${type}`;
            resultDiv.style.display = 'block';
            
            let html = `<div style="white-space: pre-wrap;">${message}</div>`;
            
            if (data) {
                html += `
                    <div class="response-data">
                        <strong>API Response:</strong><br><br>
                        ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
                    </div>
                `;
            }
            
            if (type === 'success') {
                html += `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #c3e6cb;">
                        <strong>✨ Next Steps:</strong><br>
                        1. ✅ Your API is working!<br>
                        2. ✅ Note down your API URL and Key<br>
                        3. ✅ Follow the Step-by-Step Connection Guide<br>
                        4. ✅ Configure these credentials in Negentropy
                    </div>
                `;
            } else if (type === 'error') {
                html += `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f5c6cb;">
                        <strong>🔧 Troubleshooting Tips:</strong><br>
                        • Check browser console (F12) for detailed errors<br>
                        • Verify API URL has no typos<br>
                        • Verify API Key is copied correctly<br>
                        • Try different authentication methods<br>
                        • Contact your POS provider's support<br>
                        • Share console error messages with support
                    </div>
                `;
            }
            
            resultDiv.innerHTML = html;
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Show tips on page load
        console.log('💡 POS API Connection Test Ready');
        console.log('📖 Enter your POS credentials above and click "Test Connection"');
        console.log('🔍 Watch this console for detailed connection information');
    </script>
</body>
</html>
```

### Step 3: Configure Your Credentials

1. **Open** `test-pos-connection.html` in your browser
2. **Enter** your POS API URL
3. **Enter** your API Key
4. **Select** your authentication method
5. **Update** the endpoint path if needed

### Step 4: Run the Test

1. **Click** "Test Connection"
2. **Wait** for the response
3. **Check** the results on the page
4. **Open** browser console (press F12) for detailed information

### Step 5: Interpret Results

**✅ SUCCESS - You should see:**
```
✅ Success! Connection working correctly.
Status: 200 OK
API Response: { your actual data }
```
**→ You're ready to proceed with Step-by-Step Connection Guide**

**❌ ERROR - Common Issues:**

1. **"CORS Error"**
   - **Problem:** Your POS hasn't enabled cross-origin requests
   - **Solution:** Contact POS provider, ask to whitelist your domain

2. **"401 Unauthorized"**
   - **Problem:** API Key is incorrect or expired
   - **Solution:** Check API Key, generate new one if needed

3. **"404 Not Found"**
   - **Problem:** Endpoint doesn't exist
   - **Solution:** Check endpoint path in POS documentation

4. **"Network Error"**
   - **Problem:** Can't reach API
   - **Solution:** Check API URL, check internet connection

5. **"Failed to fetch"**
   - **Problem:** Multiple possible causes
   - **Solution:** Check console for specific error message

---

## 🧪 Method 2: cURL Test (Advanced)

### What You'll Do
Use command-line tool to test API directly (for technical users).

### Step 1: Open Terminal/Command Prompt

**Mac:** Open Terminal  
**Windows:** Open Command Prompt or PowerShell  
**Linux:** Open Terminal

### Step 2: Run cURL Command

**For Bearer Token Authentication:**
```bash
curl -X GET \
  'YOUR_API_URL/api/sales' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

**For API Key Header:**
```bash
curl -X GET \
  'YOUR_API_URL/api/sales' \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: YOUR_API_KEY'
```

### Step 3: Replace Placeholders

Replace:
- `YOUR_API_URL` → Your actual API URL
- `YOUR_API_KEY` → Your actual API key

### Example:
```bash
curl -X GET \
  'https://api.square.com/v2/payments' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sq0atp-abc123xyz789'
```

### Step 4: Check Response

**Success:**
```json
{
  "total": 142,
  "change_percentage": 12.5,
  "currency": "AUD"
}
```

**Error:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

---

## 🧪 Method 3: Postman Test (Recommended for Complex APIs)

### What You'll Do
Use Postman app to test and save API requests.

### Step 1: Install Postman

1. Download from: https://www.postman.com/downloads/
2. Install and open Postman

### Step 2: Create New Request

1. Click **"New"** → **"HTTP Request"**
2. Set method to **GET**
3. Enter URL: `YOUR_API_URL/api/sales`

### Step 3: Add Headers

Click **"Headers"** tab:

**For Bearer Token:**
- Key: `Authorization`
- Value: `Bearer YOUR_API_KEY`

**For API Key:**
- Key: `X-API-Key`
- Value: `YOUR_API_KEY`

Add:
- Key: `Content-Type`
- Value: `application/json`

### Step 4: Send Request

1. Click **"Send"**
2. Check response below
3. Status 200 = Success
4. Status 401/403 = Authentication problem
5. Status 404 = Wrong endpoint

### Step 5: Save Request

1. Click **"Save"**
2. Name: "POS Sales Test"
3. Save for future testing

---

## 📊 Understanding Test Results

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | ✅ API working correctly |
| 201 | Created | ✅ Resource created |
| 400 | Bad Request | ❌ Check request format |
| 401 | Unauthorized | ❌ Check API key |
| 403 | Forbidden | ❌ Check permissions |
| 404 | Not Found | ❌ Check endpoint URL |
| 429 | Too Many Requests | ❌ Rate limit exceeded |
| 500 | Server Error | ❌ POS system issue |

### Expected Response Format

Your POS should return JSON data like:

```json
{
  "sales": {
    "total": 142.50,
    "count": 18,
    "date": "2025-10-05"
  },
  "change": {
    "amount": 12.5,
    "percentage": 8.2
  }
}
```

**Check:**
- ✅ Data is in JSON format
- ✅ Contains expected fields
- ✅ Numbers are correct format (decimal or integer)
- ✅ Dates are readable format

---

## ✅ Test Success Checklist

Before proceeding to full integration:

- [ ] API URL is correct and accessible
- [ ] API Key authenticates successfully  
- [ ] Response status is 200 (OK)
- [ ] Response is valid JSON
- [ ] Response contains expected data fields
- [ ] Numbers are in correct format
- [ ] Dates are parseable
- [ ] No CORS errors
- [ ] No authentication errors
- [ ] Response time is reasonable (< 5 seconds)

---

## 🚀 Next Steps

### If Tests Passed ✅

**Congratulations! Your API is working.**

1. **Document your findings:**
   - Note exact API URL used
   - Note authentication method that worked
   - Save sample response for reference

2. **Proceed to connection:**
   - Open: `STEP_BY_STEP_CONNECTION_GUIDE.md`
   - Follow Step 1: Configure API Settings
   - Use the credentials you just tested

### If Tests Failed ❌

**Don't worry, let's troubleshoot.**

1. **Review error messages carefully**
2. **Check common issues:**
   - Typo in API URL?
   - Typo in API Key?
   - Wrong authentication method?
   - Wrong endpoint path?

3. **Contact your POS provider:**
   - Share error messages
   - Ask about CORS settings
   - Request sample cURL command
   - Ask for test credentials

4. **Try again:**
   - Generate new API key
   - Use different endpoint
   - Try different authentication method

---

## 📞 Need Help?

### Getting Error Messages

**To see detailed errors:**
1. Open browser (Chrome/Firefox)
2. Press **F12** to open Developer Tools
3. Click **"Console"** tab
4. Look for red error messages
5. Take screenshots
6. Share with support

### Resources

- **Your POS Provider Support:** First point of contact
- **POS API Documentation:** Check for troubleshooting section
- **Negentropy Support:** support@negentropy.com (for dashboard issues)

### Include When Asking for Help

When contacting support, provide:
1. ✅ Your POS system name
2. ✅ Exact error message
3. ✅ Screenshot of error
4. ✅ What you've already tried
5. ✅ Browser console errors (F12)

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**For:** Australian Negentropy Users  
**Test Duration:** 5-10 minutes
