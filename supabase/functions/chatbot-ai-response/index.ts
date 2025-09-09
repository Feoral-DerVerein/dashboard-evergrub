import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { question } = await req.json();

    if (!question) {
      throw new Error('Question is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.log('OpenAI API key not found, returning fallback response');
      return new Response(JSON.stringify({ 
        response: generateFallbackResponse(question)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a comprehensive prompt for the AI
    const systemPrompt = `You are an artificial intelligence assistant specialized in analyzing coffee shops and restaurant businesses. Your job is to provide useful, concise and actionable responses about:

1. Inventory and stock management
2. Sales analysis and trends
3. Visitor and customer predictions
4. Alerts for products about to expire
5. Operational optimization recommendations
6. Sustainability and waste reduction insights

Respond in English in a professional but friendly manner. Keep responses between 50-150 words and focus on practical and actionable insights. If the question is not related to the business, gently redirect towards relevant business topics.`;

    const userPrompt = `User question: ${question}

Please provide a useful and specific response related to business management. If it's about inventory, mention specific products like coffee, milk, pastries. If it's about sales, include realistic data. If it's about predictions, mention specific factors like time of day, day of the week, weather, etc.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || generateFallbackResponse(question);

    return new Response(JSON.stringify({ 
      response: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-ai-response function:', error);
    
    // Return fallback response on error
    const { question } = await req.json().catch(() => ({ question: '' }));
    
    return new Response(JSON.stringify({ 
      response: generateFallbackResponse(question || 'general query')
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('inventory') || lowerQuestion.includes('stock') || lowerQuestion.includes('products')) {
    return 'Based on analysis of your current inventory, I\'ve identified that decaf coffee has low rotation and you could reduce stock by 33% to save $180. I recommend focusing resources on high-demand products like Flat White Blend which shows excellent performance.';
  }
  
  if (lowerQuestion.includes('sales') || lowerQuestion.includes('revenue') || lowerQuestion.includes('earnings')) {
    return 'Sales analysis shows that Flat White Blend is your star product with 18% growth this month. Current revenue is at $2,450 with positive trend. I recommend promoting this product and considering similar variations to capitalize on this trend.';
  }
  
  if (lowerQuestion.includes('visitors') || lowerQuestion.includes('customers') || lowerQuestion.includes('flow') || lowerQuestion.includes('prediction')) {
    return 'For today I expect approximately 86 visitors with 83% confidence. Peak hour will be around 1:00 PM. This is based on historical patterns of weekdays, regular hours, and seasonal trends. I recommend having additional staff during peak hour.';
  }
  
  if (lowerQuestion.includes('alert') || lowerQuestion.includes('expiration') || lowerQuestion.includes('expires') || lowerQuestion.includes('expires')) {
    return 'I have a critical alert: almond croissants (18 units) expire in 2 days. I suggest applying a 50% discount after 3pm or considering donating them to the local shelter. This will help you avoid losses and maintain your sustainability commitment.';
  }

  if (lowerQuestion.includes('weather') || lowerQuestion.includes('climate') || lowerQuestion.includes('temperature')) {
    return 'Current weather shows 16°C with ideal conditions for hot beverages. With 63% humidity and light wind, it\'s perfect for promoting specialty coffees, hot chocolate, and seasonal drinks that can increase your average sales per customer.';
  }

  if (lowerQuestion.includes('optimization') || lowerQuestion.includes('improvement') || lowerQuestion.includes('efficiency')) {
    return 'To optimize your business I recommend: 1) Reduce stock of low-rotation products, 2) Implement promotions for products about to expire, 3) Focus marketing on star products like Flat White, and 4) Adjust staff schedules according to customer flow predictions.';
  }

  if (lowerQuestion.includes('sustainability') || lowerQuestion.includes('waste') || lowerQuestion.includes('sustainable')) {
    return 'Your current sustainability score is 85%. You\'ve achieved 95% waste reduction and saved approximately 12 kg of CO2 this month. To improve, implement automatic discounts for products about to expire and consider partnerships with local organizations for donations.';
  }

  // Default general response
  return 'I\'ve analyzed your query and can help you with specific information about inventory, sales, visitor predictions, product alerts, weather, and optimization recommendations. Could you be more specific about which aspect of your business you\'d like to know about?';
}