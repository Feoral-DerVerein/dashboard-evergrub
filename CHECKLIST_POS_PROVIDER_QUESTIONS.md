# POS Provider API Checklist
## Questions to Ask Your POS Provider

---

## 📋 Use This Checklist When Contacting Your POS Provider

Print this page or copy these questions when speaking with your POS provider's technical support team.

---

## 1️⃣ API Access & Authentication

### Basic Access
- [ ] **Do you provide API access for third-party integrations?**
  - If yes, what plan/tier is required?
  - Is there an additional cost?
  - How long does approval take?

- [ ] **What is the base API URL?**
  - Example format: `https://api.yourpos.com/v1`
  - Is this the production URL or are there separate staging/test URLs?

- [ ] **How do I authenticate API requests?**
  - [ ] API Key (preferred)
  - [ ] Bearer Token
  - [ ] OAuth 2.0
  - [ ] Basic Auth
  - [ ] Other: ________________

- [ ] **Where do I find or generate my API credentials?**
  - Dashboard location?
  - Do I need special permissions?

### Security
- [ ] **Do you support CORS (Cross-Origin Resource Sharing)?**
  - Can you whitelist my domain: ________________
  - Do I need to provide a list of allowed origins?

- [ ] **Are API keys different for test and production environments?**

- [ ] **How should I securely store and use the API key?**
  - Should it be in headers?
  - What header name? (e.g., `Authorization`, `X-API-Key`)

---

## 2️⃣ Available Data & Endpoints

### Sales Data
- [ ] **Can I retrieve today's sales data via API?**
  - Endpoint path: ________________
  - Example: `/api/v1/sales/daily`

- [ ] **What sales metrics are available?**
  - [ ] Total sales amount
  - [ ] Number of transactions
  - [ ] Average transaction value
  - [ ] Sales by category
  - [ ] Sales by product
  - [ ] Hourly breakdown
  - [ ] Period comparisons (day/week/month)

### Transaction Data
- [ ] **Can I get transaction details?**
  - Endpoint path: ________________
  - Example: `/api/v1/transactions`

- [ ] **What transaction information is included?**
  - [ ] Transaction count
  - [ ] Transaction ID
  - [ ] Timestamp
  - [ ] Items purchased
  - [ ] Payment method
  - [ ] Customer information

### Product & Inventory
- [ ] **Can I access product inventory data?**
  - Endpoint path: ________________
  - Example: `/api/v1/inventory`

- [ ] **What inventory information is available?**
  - [ ] Stock levels
  - [ ] Product details
  - [ ] SKU/barcode
  - [ ] Pricing
  - [ ] Categories
  - [ ] Expiry dates (critical for food businesses)

### Analytics & Reports
- [ ] **Can I retrieve business analytics?**
  - Endpoint path: ________________
  - Example: `/api/v1/analytics`

- [ ] **What analytics metrics are provided?**
  - [ ] Profit/revenue
  - [ ] Cost of goods sold
  - [ ] Gross margin
  - [ ] Top-selling products
  - [ ] Customer insights
  - [ ] Conversion rates
  - [ ] Return/refund data

### Sustainability Metrics (if applicable)
- [ ] **Do you track food waste or sustainability data?**
  - Endpoint path: ________________
  
- [ ] **What sustainability information is available?**
  - [ ] Items marked as waste
  - [ ] Expired products
  - [ ] Donation records
  - [ ] Carbon footprint data

---

## 3️⃣ Data Format & Structure

### Response Format
- [ ] **What format does the API return?**
  - [ ] JSON (preferred)
  - [ ] XML
  - [ ] CSV
  - [ ] Other: ________________

- [ ] **Can you provide example API responses?**
  - Request a sample response for each endpoint I'll use

### Date & Time Format
- [ ] **What date/time format do you use?**
  - [ ] ISO 8601 (e.g., `2025-10-05T14:30:00Z`)
  - [ ] Unix timestamp
  - [ ] Custom format: ________________

- [ ] **What timezone are timestamps in?**
  - [ ] UTC
  - [ ] Australian Eastern Time (AEST/AEDT)
  - [ ] User's local timezone
  - [ ] Other: ________________

### Currency & Numbers
- [ ] **How are currency amounts formatted?**
  - [ ] Decimal (e.g., `142.50`)
  - [ ] Cents (e.g., `14250`)
  - Currency code included? (e.g., `AUD`)

- [ ] **How are percentages formatted?**
  - [ ] Decimal (e.g., `0.125` for 12.5%)
  - [ ] Whole number (e.g., `12.5`)

---

## 4️⃣ Technical Requirements

### Rate Limits
- [ ] **What are the API rate limits?**
  - Requests per minute: ________________
  - Requests per hour: ________________
  - Requests per day: ________________

- [ ] **What happens if I exceed rate limits?**
  - Error code returned?
  - Temporary block duration?

### Request Methods
- [ ] **What HTTP methods does the API support?**
  - [ ] GET (for reading data)
  - [ ] POST (for creating data)
  - [ ] PUT/PATCH (for updating data)
  - [ ] DELETE (for removing data)

### Error Handling
- [ ] **How does the API communicate errors?**
  - HTTP status codes used?
  - Error message format?
  - Can you provide a list of possible error codes?

### Data Freshness
- [ ] **How often is the API data updated?**
  - Real-time?
  - Every 5 minutes?
  - Hourly?
  - Daily?

- [ ] **How far back can I retrieve historical data?**
  - Days/weeks/months/years?

---

## 5️⃣ Documentation & Support

### API Documentation
- [ ] **Where is your API documentation located?**
  - URL: ________________
  - Username/password if required: ________________

- [ ] **Do you have code examples?**
  - [ ] JavaScript/TypeScript
  - [ ] Python
  - [ ] cURL commands
  - [ ] Other languages

### Testing Environment
- [ ] **Do you provide a sandbox/test environment?**
  - Test API URL: ________________
  - Test API credentials: ________________

- [ ] **Can I test without affecting production data?**

### Technical Support
- [ ] **Who can I contact for API technical support?**
  - Support email: ________________
  - Support phone: ________________
  - Support hours: ________________

- [ ] **Do you have a developer forum or community?**
  - URL: ________________

- [ ] **Is there an API status page?**
  - URL: ________________
  - Where can I check for outages?

### Updates & Changes
- [ ] **How will I be notified of API changes?**
  - Email notifications?
  - Changelog location?

- [ ] **What is your API versioning policy?**
  - How long are old versions supported?

---

## 6️⃣ Integration Specifics for Negentropy

### Custom Requirements
- [ ] **We need the following specific data points:**
  - Daily sales total with percentage change
  - Transaction count with percentage change
  - Profit data
  - Revenue breakdown
  - Operational costs/savings
  - Average order value
  - Customer conversion rate
  - Return/refund rate

- [ ] **Do you support filtering data by:**
  - [ ] Date range
  - [ ] Product category
  - [ ] Payment method
  - [ ] Location/store (if multi-location)

### Food Waste Specific (Critical for Negentropy)
- [ ] **Can I track products approaching expiry?**
- [ ] **Can I identify waste/spoilage events?**
- [ ] **Can I record donation activities?**
- [ ] **Is there a way to mark products as "rescued"?**

---

## 7️⃣ Costs & Compliance

### Pricing
- [ ] **Is there a cost for API access?**
  - Setup fee?
  - Monthly fee?
  - Per-request pricing?

- [ ] **Are there any usage-based charges?**

### Compliance & Privacy
- [ ] **Does your API comply with Australian privacy laws?**
  - Privacy Act 1988
  - Australian Privacy Principles (APPs)

- [ ] **How is customer data protected?**
  - Encryption in transit?
  - Data retention policies?

- [ ] **Do I need to sign any agreements?**
  - API Terms of Service?
  - Data Processing Agreement?

---

## 8️⃣ Specific Data Examples I Need

### Ask for Actual Sample Responses

**Request:** "Can you provide example JSON responses for these scenarios?"

1. **Daily Sales Response:**
```
What does a GET request to /api/sales/today return?
Please provide actual sample JSON.
```

2. **Transaction List Response:**
```
What does a GET request to /api/transactions return?
Please provide actual sample JSON with 2-3 example transactions.
```

3. **Product Inventory Response:**
```
What does a GET request to /api/inventory return?
Please provide actual sample JSON with a few products.
```

4. **Error Response:**
```
What does an error response look like?
Please provide examples of common errors.
```

---

## ✅ Before Ending the Call/Email

### Final Checks
- [ ] I have the API base URL
- [ ] I have my API key or know how to generate it
- [ ] I have access to the API documentation
- [ ] I understand the authentication method
- [ ] I have example API responses
- [ ] I know the rate limits
- [ ] I have technical support contact details
- [ ] I know if there are any costs involved
- [ ] I have test/sandbox credentials (if available)

---

## 📝 Notes Section

**POS System Name:** ________________

**Contact Person:** ________________

**Contact Email:** ________________

**Contact Phone:** ________________

**Date of Enquiry:** ________________

**Follow-up Required:** ________________

---

## 🚀 What to Do After Getting This Information

Once you have answers to these questions:

1. ✅ Go to `STEP_BY_STEP_CONNECTION_GUIDE.md`
2. ✅ Follow the numbered instructions to connect your API
3. ✅ Use the testing template in `API_TESTING_TEMPLATE.md` to verify

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**For:** Australian Negentropy Users
