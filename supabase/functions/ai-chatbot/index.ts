import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log('Received messages:', messages);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // System prompt for the chatbot
    const systemPrompt = `Eres un asistente inteligente de Negentropy, una plataforma que ayuda a reducir el desperdicio de alimentos.

Tus capacidades incluyen:
- Analizar productos próximos a vencer
- Proporcionar recomendaciones para reducir desperdicios
- Ayudar con la gestión de inventario
- Sugerir estrategias de ventas
- Analizar métricas del negocio
- Sugerir acciones concretas cuando sea relevante

Responde de manera amigable, profesional y concisa. Usa emojis ocasionalmente para hacer la conversación más amena.`;

    // Define tools for action detection
    const tools = [
      {
        type: "function",
        function: {
          name: "suggest_actions",
          description: "Sugiere acciones concretas que el usuario puede realizar. Solo úsalo cuando la respuesta incluya recomendaciones accionables.",
          parameters: {
            type: "object",
            properties: {
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { 
                      type: "string",
                      description: "Texto del botón de acción (máx 30 caracteres)"
                    },
                    type: {
                      type: "string",
                      enum: ["donate", "create_bag", "discount", "inventory", "report", "marketplace", "view_products"],
                      description: "Tipo de acción a realizar"
                    },
                    description: {
                      type: "string",
                      description: "Descripción breve de qué hará la acción"
                    }
                  },
                  required: ["label", "type", "description"]
                }
              }
            },
            required: ["actions"]
          }
        }
      }
    ];

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        tools: tools,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            response: 'Lo siento, estoy recibiendo demasiadas solicitudes. Por favor, intenta de nuevo en unos momentos.' 
          }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Payment required',
            response: 'El servicio de IA necesita créditos adicionales. Por favor, contacta al administrador.' 
          }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const aiResponse = data.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
    
    // Extract actions from tool calls if available
    let suggestedActions = [];
    const toolCalls = data.choices[0]?.message?.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'suggest_actions') {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            suggestedActions = args.actions || [];
            console.log('Extracted actions:', suggestedActions);
          } catch (e) {
            console.error('Error parsing tool call arguments:', e);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        output: aiResponse, // Para mantener compatibilidad con formato anterior
        actions: suggestedActions // Acciones sugeridas
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-chatbot function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
