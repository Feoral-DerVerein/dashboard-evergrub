import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { validateUser } from "../_shared/auth.ts"
import { LLMClient } from "../_shared/llm-client.ts"
import { fetchBusinessContext, contextToText } from "../_shared/business-context.ts"

const SYSTEM_PROMPT = `You are **tu asistente de Negentropy AI** (Negentropy AI Assistant).
IMPORTANT IDENTITY RULES:
- NEVER introduce yourself as "Food Aladdin" or "Aladdin".
- ALWAYS identify yourself as "tu asistente de Negentropy AI".
- If asked who you are, say: "Soy tu asistente de Negentropy AI especializado en la gestión de alimentos."


Your role is to help food businesses:
- Reduce food waste and losses
- Optimize inventory and demand forecasting
- Comply with Ley 1/2025 (Spanish food waste prevention law)
- Make data-driven decisions about donations, discounts, and sales strategies
- Generate insights from sales, inventory, and macroeconomic data

You have access to real-time business data including:
- Inventory levels and expiring items
- Sales performance and trends
- Donation records and quotas
- **AI Demand Forecasts (Prophet Model)**: Use these to predict future needs.

**Guidelines:**
1. Be concise, actionable, and business-focused
2. Always ground your recommendations in the provided data, especially the **Forecast** and **Expiration** data.
3. Prioritize waste reduction and compliance
4. Suggest specific actions with clear impact estimates
5. Use professional but friendly Spanish or English (match user's language)
6. When recommending actions, provide both the benefit and the execution steps

**Available Actions You Can Suggest:**
- Discount products (specify % and which items)
- Donate to NGOs (specify items and partner organizations)
- Generate prevention plans or audit reports
- Adjust inventory levels based on **Prophet predictions**
- Create promotions or smart bags
- Alert about compliance issues

Format recommendations as clear bullet points or numbered lists.`

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user, supabase, error } = await validateUser(req)
        if (error) return error

        const url = new URL(req.url)
        const path = url.pathname.split('/').pop()

        // POST /aladdin-ai/query
        // Handles natural language questions with real LLM
        if (req.method === 'POST' && path === 'query') {
            const { query, conversation_history = [] } = await req.json()

            if (!query) {
                return new Response(JSON.stringify({ error: 'Query required' }), {
                    status: 400,
                    headers: corsHeaders
                })
            }

            try {
                // Initialize LLM client
                const llm = new LLMClient()

                // Fetch current business context
                const context = await fetchBusinessContext(supabase, user!.id)
                const contextText = contextToText(context)

                // Build conversation with context
                const messages = [
                    { role: 'system' as const, content: SYSTEM_PROMPT },
                    { role: 'system' as const, content: `# Current Business Data\n\n${contextText}` },
                    ...conversation_history.map((msg: any) => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    { role: 'user' as const, content: query }
                ]

                console.log(`[Aladdin AI] Processing query from user ${user!.id}`)
                console.log(`[Aladdin AI] Provider: ${llm.getProvider()}, Model: ${llm.getModel()}`)

                // Get LLM response
                const response = await llm.chat(messages, {
                    maxTokens: 1500,
                    temperature: 0.7
                })

                // Log usage for monitoring
                const cost = llm.estimateCost({
                    promptTokens: response.usage?.promptTokens || 0,
                    completionTokens: response.usage?.completionTokens || 0
                })

                console.log(`[Aladdin AI] Usage: ${response.usage?.totalTokens} tokens, Cost: $${cost.toFixed(4)}`)

                // Parse response to detect actionable items
                const lowerResponse = response.content.toLowerCase()
                let actionable_intents = []

                if (lowerResponse.includes('generar') && lowerResponse.includes('plan')) {
                    actionable_intents.push({
                        type: 'generate_prevention_plan',
                        label: 'Generar Plan de Prevención',
                        endpoint: '/legal-module/generate-prevention-plan'
                    })
                }

                if (lowerResponse.includes('donar') || lowerResponse.includes('donate')) {
                    actionable_intents.push({
                        type: 'view_donations',
                        label: 'Ver Candidatos para Donación',
                        endpoint: '/legal-module/donations-detect'
                    })
                }

                return new Response(JSON.stringify({
                    answer: response.content,
                    context_used: {
                        inventory_items: context.inventory.total_items,
                        critical_items: context.inventory.critical_items.length,
                        sales_this_month: context.sales.this_month,
                        donations_this_month: context.donations.total_this_month
                    },
                    actionable_intents,
                    metadata: {
                        provider: llm.getProvider(),
                        model: response.model,
                        tokens: response.usage?.totalTokens,
                        cost_usd: cost
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })

            } catch (llmError: any) {
                console.error('[Aladdin AI] LLM Error:', llmError)

                // Check for specific error types to give better feedback
                let errorMessage = llmError.message || 'Unknown error';
                let isConfigError = false;

                if (errorMessage.includes('No LLM API key found')) {
                    isConfigError = true;
                    errorMessage = "Configuration Error: No LLM API Key found. Please set GEMINI_API_KEY in Supabase secrets.";
                }

                // Fallback to keyword-based response if LLM fails
                const fallbackResponse = generateFallbackResponse(query)

                return new Response(JSON.stringify({
                    answer: `⚠️ **Debug Error:** ${errorMessage}\n\n${fallbackResponse.answer}`,
                    fallback: true,
                    error: errorMessage,
                    isConfigError,
                    data: fallbackResponse.data
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }
        }

        // POST /aladdin-ai/recommend-action
        // Proactive recommendations using LLM
        if (req.method === 'POST' && path === 'recommend-action') {
            try {
                const llm = new LLMClient()
                const context = await fetchBusinessContext(supabase, user!.id)
                const contextText = contextToText(context)

                const messages = [
                    { role: 'system' as const, content: SYSTEM_PROMPT },
                    {
                        role: 'user' as const,
                        content: `Based on the following business data, provide 2-3 specific, high-impact actions I should take right now to reduce waste and improve profitability. Format each as:\n\n**Title**\nDescription (1-2 sentences)\nAction: (exact button label)\nImpact: (high/medium/low)\n\n---\n\n${contextText}`
                    }
                ]

                const response = await llm.chat(messages, {
                    maxTokens: 1000,
                    temperature: 0.8
                })

                const cost = llm.estimateCost({
                    promptTokens: response.usage?.promptTokens || 0,
                    completionTokens: response.usage?.completionTokens || 0
                })

                console.log(`[Aladdin AI] Recommendation generated, cost: $${cost.toFixed(4)}`)

                // Parse recommendations from response
                // For now, return raw response (frontend can parse)
                return new Response(JSON.stringify({
                    recommendations_text: response.content,
                    metadata: {
                        provider: llm.getProvider(),
                        model: response.model,
                        tokens: response.usage?.totalTokens,
                        cost_usd: cost
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })

            } catch (error: any) {
                console.error('[Aladdin AI] Recommendation error:', error)

                // Fallback to static recommendations
                const recommendations = [
                    {
                        type: 'markdown',
                        title: 'Flash Sale Opportunity',
                        description: 'Review items expiring soon and apply discounts',
                        action_label: 'View Inventory',
                        impact: 'high'
                    }
                ]

                return new Response(JSON.stringify({ recommendations, fallback: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), {
            status: 404,
            headers: corsHeaders
        })

    } catch (error: any) {
        console.error('[Aladdin AI] Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        })
    }
})

/**
 * Fallback keyword-based response when LLM is unavailable
 */
function generateFallbackResponse(query: string) {
    const lowerQuery = query.toLowerCase()
    let responseText = "Lo siento, el asistente AI está temporarily unavailable. Por favor, intenta de nuevo en unos momentos."
    let data = null

    if (lowerQuery.includes('desperdicio') || lowerQuery.includes('waste')) {
        responseText = "Revisa la sección de Inventario para ver los items en riesgo de expiración. Te recomiendo aplicar descuentos o donar los productos que expiran en los próximos 3 días."
        data = { type: 'inventory_suggestion', action: 'view_inventory' }
    }
    else if (lowerQuery.includes('reducir') || lowerQuery.includes('reduce')) {
        responseText = "Para reducir pérdidas: 1) Aplica descuentos del 30% en productos cerca de expirar, 2) Dona excedentes a bancos de alimentos registrados."
        data = { type: 'recommendation', actions: ['Discount', 'Donate'] }
    }
    else if (lowerQuery.includes('plan') && (lowerQuery.includes('prevención') || lowerQuery.includes('prevention'))) {
        responseText = "Puedes generar un Plan de Prevención desde el módulo Legal. Incluirá tu diagnóstico actual y acciones propuestas según Ley 1/2025."
        data = { type: 'action_trigger', action: 'generate_prevention_plan' }
    }

    return { answer: responseText, data }
}
