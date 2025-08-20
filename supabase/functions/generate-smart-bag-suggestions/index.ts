import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { category, userId } = await req.json();

    console.log('Generating smart bag suggestions for:', { category, userId });

    // Get AI product suggestions from database function
    const { data: suggestions, error: dbError } = await supabaseClient.rpc(
      'get_ai_product_suggestions',
      { p_user_id: userId, p_category: category, p_max_suggestions: 8 }
    );

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to get product suggestions');
    }

    console.log('Database suggestions:', suggestions);

    // Enhance suggestions with AI analysis
    const promptData = {
      category,
      products: suggestions || [],
      categoryEmojis: {
        'Vegetariana': '🥗',
        'Desayuno': '☕',
        'Cena Rápida': '🍝',
        'Dulce/Postres': '🍰',
        'Lunch Office': '🥪'
      }
    };

    const enhancementPrompt = `
Analyze these products for a smart bag in category "${category}":
${JSON.stringify(promptData.products, null, 2)}

For each product, enhance the description with:
1. An appropriate emoji based on the product type
2. A compelling reason why it should be in the bag
3. Urgency indicators (expiring soon, high demand, etc.)
4. Suggested bag combinations (which products work well together)

Return a JSON object with:
{
  "enhancedProducts": [
    {
      "id": product_id,
      "emoji": "🥤",
      "enhancedReason": "Enhanced compelling reason",
      "urgencyLevel": "high|medium|low",
      "recommendationScore": 1-10
    }
  ],
  "suggestedCombinations": [
    {
      "name": "Morning Energy Pack",
      "productIds": [1, 2, 3],
      "totalValue": 25.50,
      "suggestedPrice": 12.99,
      "reason": "Perfect combination for busy mornings"
    }
  ],
  "categoryInsights": "Insights about this category and current demand"
}`;

    // Call OpenAI for enhanced suggestions
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI expert in food retail and waste reduction. Analyze products and suggest optimal smart bag combinations.'
          },
          {
            role: 'user',
            content: enhancementPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      throw new Error('Failed to get AI enhancements');
    }

    const aiData = await openAIResponse.json();
    let enhancedSuggestions;

    try {
      enhancedSuggestions = JSON.parse(aiData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiData.choices[0].message.content);
      // Fallback to basic suggestions
      enhancedSuggestions = {
        enhancedProducts: (suggestions || []).map((product: any, index: number) => ({
          id: product.id,
          emoji: '📦',
          enhancedReason: product.suggestion_reason || 'Great for smart bag',
          urgencyLevel: product.priority || 'medium',
          recommendationScore: Math.max(1, 10 - index)
        })),
        suggestedCombinations: [],
        categoryInsights: `Smart suggestions for ${category} category based on current inventory.`
      };
    }

    // Merge database suggestions with AI enhancements
    const finalSuggestions = {
      products: suggestions || [],
      enhanced: enhancedSuggestions,
      category,
      categoryEmoji: promptData.categoryEmojis[category] || '📦',
      timestamp: new Date().toISOString()
    };

    console.log('Final suggestions generated:', finalSuggestions);

    return new Response(JSON.stringify(finalSuggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-smart-bag-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});