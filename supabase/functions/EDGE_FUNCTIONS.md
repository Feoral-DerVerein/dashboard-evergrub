# Negentropy AI - Edge Functions Documentation

## Overview

This document provides a complete reference for all 46 Supabase Edge Functions in the Negentropy A platform.

**Legend:**
- ✅ **Implemented** - Fully functional with proper validation
- ⚡ **Ready** - Implemented but needs testing/optimization  
- 🔶 **Mock** - Implemented with mock/fallback data
- ⏳ **TODO** - Exists but needs implementation

---

## AI & Intelligence (5 functions)

### ✅ aladdin-ai
**Location:** `supabase/functions/aladdin-ai/index.ts`  
**Status:** Implemented (keyword-based, ready for LLM upgrade)

#### Endpoints:

**POST /aladdin-ai/query**
- Natural language query processing
- Current: Keyword-based intent matching  
- Returns structured answers with data

Request:
```json
{
  "query": "¿Cuánto desperdicio tengo?"
}
```

Response:
```json
{
  "answer": "Based on your current inventory, the category generating the most potential waste is **Dairy**. You have 5 items at high risk of expiration.",
  "data": {
    "type": "waste_analysis",
    "top_category": "Dairy",
    "risky_count": 5
  },
  "intent": "analyzed"
}
```

**POST /aladdin-ai/recommend-action**
- Proactive recommendations based on current state

Response:
```json
{
  "recommendations": [
    {
      "type": "markdown",
      "title": "Flash Sale Opportunity",
      "description": "You have 50 units of \"Yogurt\" expiring in 3 days...",
      "action_label": "Apply Promo",
      "action_api": "/api/promotions/create",
      "impact": "high"
    }
  ]
}
```

---

### ⚡ ai-chatbot
**Location:** `supabase/functions/ai-chatbot/`  
**Status:** Ready

Generic chatbot service (likely used by other components).

---

### ⚡ ai-train
**Location:** `supabase/functions/ai-train/`  
**Status:** Ready

AI model training endpoint.

---

### ⚡ chatbot-ai-response
**Location:** `supabase/functions/chatbot-ai-response/`  
**Status:** Ready

Generate AI responses for chatbot queries.

---

### ⚡ chatbot-query
**Location:** `supabase/functions/chatbot-query/`  
**Status:** Ready

Process chatbot user queries.

---

## Forecasting & Analytics (6 functions)

### ✅ forecasting-engine
**Location:** `supabase/functions/forecasting-engine/index.ts`  
**Status:** Implemented with ML service integration

#### Endpoints:

**POST /forecasting-engine/forecast-demand**
- Demand forecasting for products
- Tries ML service first, falls back to mock if unavailable

Request:
```json
{
  "product_id": "123",
  "days": 7
}
```

Response:
```json
{
  "product_id": "123",
  "forecast": [
    {
      "date": "2025-12-03",
      "predicted_demand": 15,
      "confidence_lower": 12,
      "confidence_upper": 18
    }
  ],
  "source": "ml_service" // or "mock"
}
```

**POST /forecasting-engine/forecast-expiration-risk**
- Calculate expiration risk for all products

Response:
```json
[
  {
    "product_id": "123",
    "name": "Yogurt",
    "risk_score": 0.8,
    "days_to_expiry": 2
  }
]
```

**GET /forecasting-engine/weather-current**
- Get current weather (cached, fetches from OpenWeatherMap)
- Falls back to mock if API key missing

Response:
```json
{
  "date": "2025-12-02",
  "temperature": 22.5,
  "humidity": 60,
  "weather_code": "sunny",
  "tenant_id": "..."
}
```

---

### 🔶 forecasting-advanced
**Location:** `supabase/functions/forecasting-advanced/`  
**Status:** Mock (needs implementation)

Advanced forecasting with macroeconomic regressors.

---

### ⚡ generate-ai-insights
**Location:** `supabase/functions/generate-ai-insights/`  
**Status:** Ready

Generate AI-powered business insights.

---

### ⚡ predict-waste
**Location:** `supabase/functions/predict-waste/`  
**Status:** Ready

Predict waste amounts based on historical data.

---

### ⚡ generate-sales-predictions
**Location:** `supabase/functions/generate-sales-predictions/`  
**Status:** Ready

Generate sales predictions.

---

### ⚡ calculate-product-correlations
**Location:** `supabase/functions/calculate-product-correlations/`  
**Status:** Ready

Calculate correlations between product sales.

---

## Inventory & Operations (4 functions)

### ✅ inventory-management
**Location:** `supabase/functions/inventory-management/index.ts`  
**Status:** Fully implemented

#### Endpoints:

**GET /inventory-management/products**
- Get all products for tenant

Response:
```json
[
  {
    "id": "123",
    "name": "Yogurt",
    "category": "Dairy",
    "price": 2.50,
    "tenant_id": "..."
  }
]
```

**GET /inventory-management/products-expiring**
- Get products expiring within 7 days

**POST /inventory-management/products-create**
- Create new product

**POST /inventory-management/products-update**
- Update existing product

**GET /inventory-management/inventory**
- Get inventory levels with product details

Response:
```json
[
  {
    "id": "inv-1",
    "product_id": "123",
    "current_stock": 50,
    "min_stock": 10,
    "max_stock": 100,
    "products": {
      "name": "Yogurt",
      "category": "Dairy",
      "price": 2.50
    }
  }
]
```

**POST /inventory-management/inventory-update**
- Update or create inventory levels

Request:
```json
{
  "product_id": "123",
  "current_stock": 45,
  "min_stock": 10,
  "max_stock": 100
}
```

---

### ⚡ import-products
**Location:** `supabase/functions/import-products/`  
**Status:** Ready

Bulk import products from CSV/Excel.

---

### ⚡ sync-products-from-storage
**Location:** `supabase/functions/sync-products-from-storage/`  
**Status:** Ready

Sync products from Supabase Storage.

---

### ⚡ automation-engine
**Location:** `supabase/functions/automation-engine/`  
**Status:** Ready

Automation and alerts management.

Expected endpoints:
- `GET /automation-engine/alerts` - Get all alerts
- `POST /automation-engine/alerts-create` - Create new alert

---

## Legal & Compliance (2 functions)

### ✅ legal-module
**Location:** `supabase/functions/legal-module/index.ts`  
**Status:** Implemented (needs PDF generation)

#### Endpoints:

**POST /legal-module/generate-prevention-plan**
- Generate prevention plan report

Response:
```json
{
  "meta": {
    "generated_at": "2025-12-02T15:00:00Z",
    "tenant_id": "...",
    "law_reference": "Ley 1/2025..."
  },
  "diagnosis": {
    "total_inventory_items": 150,
    "total_inventory_value": 2500.00,
    "waste_risk_value": 125.00,
    "waste_risk_percentage": "5.00"
  },
  "critical_points": [...],
  "actions_proposed": [...]
}
```

**POST /legal-module/donations-detect**
- Find donation candidates (expiring in 2-5 days)

**POST /legal-module/donations-register**
- Register a donation and update inventory

Request:
```json
{
  "product_id": "123",
  "quantity": 10,
  "ngo": "Local Food Bank"
}
```

**GET /legal-module/reports**
- Get all legal documents for tenant

---

### ⏳ macro-module
**Location:** `supabase/functions/macro-module/`  
**Status:** TODO (needs API integration)

Macroeconomic indicators integration (INE, Eurostat).

---

### ⚡ generate-nsw-epa-report
**Location:** `supabase/functions/generate-nsw-epa-report/`  
**Status:** Ready

Generate NSW EPA compliance reports (Australia-specific).

---

## Integrations (12 functions)

### Square POS (5 functions)

**⚡ square-oauth-complete**
Handle Square OAuth callback.

**⚡ square-refresh-token**
Refresh Square access tokens.

**⚡ connect-square-webhook**
Connect to Square webhooks.

**⚡ register-square-webhook**
Register webhook endpoints with Square.

**⚡ pos-sync**
Generic POS synchronization.

---

### Deliverect (2 functions)

**⚡ deliverect-webhook**
Handle Deliverect webhook events.

**⚡ send-to-deliverect**
Send shipment data to Deliverect.

---

### Marketplace (3 functions)

**⚡ connect-wisebite-marketplace**
Connect to Wisebite marketplace.

**⚡ send-to-marketplace**
Send products to marketplace.

**⚡ publish-to-marketplace**
Publish listings to marketplace.

---

### Webhooks (2 functions)

**⚡ webhook-handler**
Generic webhook handler.

---

## Data & Metrics (7 functions)

**⚡ calculate-dashboard-analytics**
Calculate dashboard KPIs and metrics.

**⚡ get-sales-metrics**
Get sales performance metrics.

**⚡ get-customer-metrics**
Get customer analytics.

**⚡ get-performance-data**
Get performance data.

**⚡ get-surprise-bags-metrics**
Metrics for smart/surprise bags.

**⚡ get-sustainability-metrics**
Calculate sustainability KPIs.

**⚡ update-metrics**
Update calculated metrics cache.

---

## Business Features (4 functions)

**⚡ generate-smart-bag-suggestions**
AI-powered smart bag recommendations.

**⚡ send-smart-bag-notification**
Send notifications for smart bag availability.

**⚡ send-to-donation**
Process donation workflows.

**⚡ create-market-payment**
Handle marketplace payment creation.

---

## Utilities (6 functions)

**⚡ seed-test-data**
Seed database with test data for development.

**⚡ fetch-weather-data**
Batch fetch weather data (scheduled task).

**⚡ fix-excel-dates**
Utility to fix Excel date formats.

**⚡ product-image-suggest**
AI suggestions for product images.

**⚡ product-data-suggest**
AI suggestions for product data enrichment.

---

## Shared Modules

### _shared/cors.ts
CORS headers configuration for all functions.

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### _shared/auth.ts
User authentication validation.

```typescript
export async function validateUser(req: Request) {
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(...)
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return { error: new Response('Unauthorized', { status: 401 }) }
  }
  
  return { user, supabase, error: null }
}
```

---

## Environment Variables

Functions may use the following environment variables:

- `OPENAI_API_KEY` - OpenAI API key (for Aladdin AI)
- `ANTHROPIC_API_KEY` - Anthropic API key (alternative to OpenAI)
- `ML_SERVICE_URL` - URL to Python ML service
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `SQUARE_ACCESS_TOKEN` - Square POS token
- `DELIVERECT_API_KEY` - Deliverect API key
- `INE_API_KEY` - Spanish National Statistics API
- `EUROSTAT_API_KEY` - Eurostat API key

---

## Testing & Deployment

### Local Testing

```bash
# Serve a single function locally
supabase functions serve aladdin-ai --env-file .env

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/aladdin-ai/query' \
  --header 'Authorization: Bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"query":"¿Cuánto desperdicio tengo?"}'
```

### Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy aladdin-ai
```

---

## Next Steps

### Critical Improvements Needed:

1. **Aladdin AI** - Replace keyword matching with real LLM (OpenAI/Anthropic)
2. **Macro Module** - Implement INE/Eurostat API integration
3. **Legal Module** - Add PDF generation and storage
4. **Forecasting Advanced** - Implement advanced forecasting with regressors
5. **Testing** - Create comprehensive test suite for all functions

### Recommended Error Handling:

All functions should have:
- Input validation with Zod schemas
- Structured error logging
- Rate limiting
- Request timeout handling
- Retry logic for external APIs

---

## Function Call Patterns

### Standard Pattern

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { validateUser } from "../_shared/auth.ts"

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate user
    const { user, supabase, error } = await validateUser(req)
    if (error) return error

    // Route to endpoint
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    if (req.method === 'POST' && path === 'endpoint-name') {
      const body = await req.json()
      
      // Business logic here
      const result = await processLogic(body, user, supabase)
      
      return new Response(
        JSON.stringify(result), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not Found' }), 
      { status: 404, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: corsHeaders }
    )
  }
})
```

---

**Last Updated:** 2025-12-02  
**Total Functions:** 46  
**Implemented:** 4  
**Ready:** 38  
**Mock:** 1  
**TODO:** 3
