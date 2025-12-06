# 🚀 Deployment Guide: Aladdin AI

This guide will help you deploy the Aladdin AI Edge Function with LLM integration.

## Prerequisites

- ✅ Supabase CLI installed and logged in
- ✅ LLM API key (Gemini/OpenAI/Anthropic)

## Step 1: Get API Key (Choose One)

### Option A: Google Gemini (RECOMMENDED - FREE TIER!)

**Why Gemini?**
- ✅ **Cheapest**: ~$2.50/month for 100 queries/day
- ✅ **Free tier**: 1,500 requests/day
- ✅ **Fast**: Excellent response time
- ✅ **Quality**: Comparable to GPT-4o-mini

**Get API Key:**
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Get API Key" → "Create API Key"
3. Copy the key (starts with `AIzaSy...`)

### Option B: OpenAI

1. Visit: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy (starts with `sk-...`)
4. ⚠️ Requires credit card

### Option C: Anthropic

1. Visit: https://console.anthropic.com/
2. Settings → API Keys
3. Create key
4. ⚠️ $5 minimum credit required

---

## Step 2: Set Supabase Secrets

### Using Gemini (Recommended):

```bash
# Navigate to project directory
cd /Users/felipeortegaalcantar/.gemini/antigravity/scratch

# Set secrets
supabase secrets set GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE
supabase secrets set LLM_PROVIDER=gemini
supabase secrets set LLM_MODEL=gemini-2.0-flash
```

### Using OpenAI:

```bash
supabase secrets set OPENAI_API_KEY=sk-YOUR_KEY_HERE
supabase secrets set LLM_PROVIDER=openai
supabase secrets set LLM_MODEL=gpt-4o-mini
```

### Using Anthropic:

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
supabase secrets set LLM_PROVIDER=anthropic
supabase secrets set LLM_MODEL=claude-3-5-sonnet-20241022
```

### Verify Secrets:

```bash
supabase secrets list
```

---

## Step 3: Deploy Edge Function

```bash
# Deploy aladdin-ai function
supabase functions deploy aladdin-ai

# Verify deployment
supabase functions list
```

**Expected output:**
```
┌─────────────┬────────────┬─────────────┬──────────────┐
│ NAME        │ VERSION    │ STATUS      │ CREATED AT   │
├─────────────┼────────────┼─────────────┼──────────────┤
│ aladdin-ai  │ v1         │ ACTIVE      │ 2 mins ago   │
└─────────────┴────────────┴─────────────┴──────────────┘
```

---

## Step 4: Test the Integration

### A. Test from Command Line

```bash
# Get your Supabase anon key
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZWhqYmJkZXluZ3NsZnBnZm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDQxNzAsImV4cCI6MjA1NjMyMDE3MH0.s2152q-oy3qBMsJmVQ8-L9whBQDjebEQSo6GVYhXtlg"

# Get auth token (login first via app)
# Then extract from localStorage: supabase.auth.token

# Test query
curl -X POST \
  https://jiehjbbdeyngslfpgfnt.supabase.co/functions/v1/aladdin-ai/query \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Cuánto desperdicio tengo actualmente?"
  }'
```

### B. Test from Browser

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:5173/login

3. Login with your credentials

4. Navigate to: http://localhost:5173/aladdin

5. Test queries:
   - "¿Cuánto desperdicio tengo actualmente?"
   - "¿Qué debo donar hoy?"
   - "Genera el plan de prevención de diciembre"

6. Verify:
   - ✅ Response is intelligent and context-aware
   - ✅ Metadata shows model, tokens, cost
   - ✅ Context summary displays inventory count
   - ✅ No fallback warning appears

---

## Step 5: Monitor Logs

```bash
# Stream logs in real-time
supabase functions logs aladdin-ai --tail

# Or view in Supabase Dashboard:
# https://supabase.com/dashboard/project/jiehjbbdeyngslfpgfnt/functions/aladdin-ai/logs
```

**Look for:**
```
[LLM Client] Initialized with provider: gemini, model: gemini-1.5-flash-latest
[Aladdin AI] Context aggregated: 145 items, 12 critical
[Aladdin AI] Usage: 523 tokens, Cost: $0.0002
```

---

## 🔒 Security Best Practices

1. **Never commit API keys** to git
2. **Use `.env.local`** for local development (already in `.gitignore`)
3. **Use Supabase Secrets** for production
4. **Rotate keys regularly** (every 90 days)
5. **Monitor usage** to detect unusual activity

---

## 💰 Cost Monitoring

### View in Logs:
Each query logs the cost. Example:
```
[Aladdin AI] Usage: 523 tokens, Cost: $0.0002
```

### Expected Costs (Gemini Flash):
- Simple query: ~$0.0002 (500 tokens)
- Complex analysis: ~$0.0008 (2,000 tokens)
- Daily (100 queries): ~$0.08
- Monthly (3,000 queries): **~$2.50**

### Provider Dashboard:
- **Gemini**: https://aistudio.google.com/app/apikey (view quota)
- **OpenAI**: https://platform.openai.com/usage (view billing)
- **Anthropic**: https://console.anthropic.com/ (view usage)

---

## 🐛 Troubleshooting

### Error: "No LLM API key found"

**Solution**: Set the API key in Supabase secrets
```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...
supabase functions deploy aladdin-ai
```

### Error: "LLM API error: 401 - Unauthorized"

**Cause**: Invalid API key

**Solution**: 
1. Verify key is correct
2. For Gemini, ensure you copied the full key (starts with `AIzaSy`)
3. For OpenAI, ensure key is not expired
4. Redeploy after fixing: `supabase functions deploy aladdin-ai`

### Error: "LLM API error: 429 - Rate limit exceeded"

**Cause**: Too many requests

**Solution**:
- **Gemini free tier**: 60 req/min, 1,500 req/day
- Wait or upgrade to paid tier
- Or switch to different provider temporarily

### Response shows "fallback: true"

**Cause**: LLM failed, using keyword-based fallback

**Check**:
1. View Edge Function logs: `supabase functions logs aladdin-ai`
2. Verify API key is set correctly
3. Check provider status page

---

## 📊 Deployment Checklist

- [ ] API key obtained (Gemini/OpenAI/Anthropic)
- [ ] Secrets set in Supabase
- [ ] Edge Function deployed successfully
- [ ] Test query from browser returns intelligent response
- [ ] Metadata shows provider, model, cost
- [ ] No fallback warning appears
- [ ] Logs show successful LLM API calls
- [ ] Cost per query is reasonable (~$0.0002 with Gemini)

---

## 🎉 Success!

Once all checklist items are complete, your Aladdin AI assistant is live!

**Next Steps:**
1. Add more test data to get better context
2. Train team on how to use the assistant
3. Monitor costs and adjust based on usage
4. Consider adding conversation history persistence
5. Explore advanced features (voice input, scheduled reports, etc.)

---

## 📚 Related Documentation

- [Walkthrough](file:///Users/felipeortegaalcantar/.gemini/antigravity/brain/bad800e7-cf81-4109-921f-8812659ae34e/walkthrough.md)
- [Environment Variables Guide](file:///Users/felipeortegaalcantar/.gemini/antigravity/scratch/.env.example)
- [LLM Client Code](file:///Users/felipeortegaalcantar/.gemini/antigravity/scratch/supabase/functions/_shared/llm-client.ts)
- [Edge Function Code](file:///Users/felipeortegaalcantar/.gemini/antigravity/scratch/supabase/functions/aladdin-ai/index.ts)

---

## 🆘 Need Help?

If you encounter issues not covered here, check:
1. Supabase Edge Function logs
2. Browser console for frontend errors
3. Network tab to inspect API requests/responses
4. Provider status pages (downdetector.com)
