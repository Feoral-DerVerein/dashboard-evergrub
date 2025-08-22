import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Organic emoji mapping based on product names and categories
const getProductEmoji = (name: string, category: string): string => {
  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  if (lowerName.includes('cookie') || lowerName.includes('galleta')) return '🍪';
  if (lowerName.includes('croissant') || lowerName.includes('cruasán')) return '🥐';
  if (lowerName.includes('bread') || lowerName.includes('pan')) return '🍞';
  if (lowerName.includes('cake') || lowerName.includes('torta')) return '🎂';
  if (lowerName.includes('donut') || lowerName.includes('dona')) return '🍩';
  if (lowerName.includes('muffin')) return '🧁';
  if (lowerName.includes('coffee') || lowerName.includes('café')) return '☕';
  if (lowerName.includes('milk') || lowerName.includes('leche')) return '🥛';
  if (lowerName.includes('juice') || lowerName.includes('jugo')) return '🥤';
  if (lowerName.includes('sandwich')) return '🥪';
  if (lowerName.includes('salad') || lowerName.includes('ensalada')) return '🥗';
  if (lowerName.includes('fruit') || lowerName.includes('fruta')) return '🍎';
  
  // Category-based fallbacks
  if (lowerCategory.includes('pastries') || lowerCategory.includes('dessert')) return '🥐';
  if (lowerCategory.includes('coffee') || lowerCategory.includes('beverage')) return '☕';
  if (lowerCategory.includes('breakfast')) return '🍳';
  if (lowerCategory.includes('lunch')) return '🥪';
  
  return '📦';
};

// Calculate organic recommendation score (1-10)
const calculateScore = (product: any): number => {
  let score = 5; // Base score
  
  // Expiration urgency (40% weight)
  if (product.days_to_expire <= 3) score += 2.5;
  else if (product.days_to_expire <= 7) score += 2;
  else if (product.days_to_expire <= 14) score += 1;
  
  // Wishlist demand (30% weight)
  if (product.wishlist_demand > 5) score += 2;
  else if (product.wishlist_demand > 2) score += 1.5;
  else if (product.wishlist_demand > 0) score += 1;
  
  // Stock level (20% weight)
  if (product.quantity > 50) score += 1.5;
  else if (product.quantity > 20) score += 1;
  else if (product.quantity < 5) score -= 0.5;
  
  // Category popularity (10% weight)
  if (product.category.toLowerCase().includes('coffee') || 
      product.category.toLowerCase().includes('pastries')) score += 0.5;
  
  return Math.min(Math.max(Math.round(score), 1), 10);
};

// Generate enhanced reason based on product data
const generateEnhancedReason = (product: any): string => {
  if (product.days_to_expire <= 3) {
    return `⚡ Expires in ${product.days_to_expire} day${product.days_to_expire > 1 ? 's' : ''} - urgent clearance!`;
  }
  if (product.days_to_expire <= 7) {
    return `🔥 Expires soon (${product.days_to_expire} days) - perfect for smart bag!`;
  }
  if (product.wishlist_demand > 5) {
    return `⭐ High demand - ${product.wishlist_demand} people want this!`;
  }
  if (product.quantity > 50) {
    return `📦 Bulk stock available (${product.quantity} units) - great value!`;
  }
  if (product.quantity > 20) {
    return `💰 High stock - perfect for bulk savings!`;
  }
  if (product.wishlist_demand > 0) {
    return `❤️ Popular choice - ${product.wishlist_demand} wishlists!`;
  }
  return '✨ Great addition to your smart bag!';
};

// Generate suggested combinations organically
const generateSuggestedCombinations = (products: any[]): any[] => {
  const combinations = [];
  
  // Coffee + Pastries combo
  const coffeeProducts = products.filter(p => p.category.toLowerCase().includes('coffee'));
  const pastryProducts = products.filter(p => p.category.toLowerCase().includes('pastries') || 
                                              p.name.toLowerCase().includes('cookie') ||
                                              p.name.toLowerCase().includes('croissant'));
  
  if (coffeeProducts.length > 0 && pastryProducts.length > 0) {
    const combo = [coffeeProducts[0], ...pastryProducts.slice(0, 2)];
    const totalValue = combo.reduce((sum, p) => sum + parseFloat(p.price), 0);
    combinations.push({
      name: "☕ Morning Energy Pack",
      productIds: combo.map(p => p.id),
      totalValue: totalValue,
      suggestedPrice: Math.round(totalValue * 0.7 * 100) / 100,
      reason: "Perfect combination for busy mornings - coffee with sweet treats!"
    });
  }
  
  // Breakfast combo
  const breakfastProducts = products.filter(p => 
    p.category.toLowerCase().includes('breakfast') || 
    p.name.toLowerCase().includes('bread') ||
    p.name.toLowerCase().includes('milk')
  );
  
  if (breakfastProducts.length >= 2) {
    const combo = breakfastProducts.slice(0, 3);
    const totalValue = combo.reduce((sum, p) => sum + parseFloat(p.price), 0);
    combinations.push({
      name: "🍳 Breakfast Bundle",
      productIds: combo.map(p => p.id),
      totalValue: totalValue,
      suggestedPrice: Math.round(totalValue * 0.65 * 100) / 100,
      reason: "Complete breakfast essentials in one convenient bag!"
    });
  }
  
  // High-value combo (expensive items together)
  const highValueProducts = products.filter(p => parseFloat(p.price) > 5).slice(0, 2);
  if (highValueProducts.length >= 2) {
    const totalValue = highValueProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    combinations.push({
      name: "💎 Premium Selection",
      productIds: highValueProducts.map(p => p.id),
      totalValue: totalValue,
      suggestedPrice: Math.round(totalValue * 0.6 * 100) / 100,
      reason: "Premium quality items at an unbeatable price!"
    });
  }
  
  return combinations;
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

    // Generate organic enhancements (no AI needed!)
    const enhancedProducts = (suggestions || []).map((product: any) => ({
      id: product.id,
      emoji: getProductEmoji(product.name, product.category),
      enhancedReason: generateEnhancedReason(product),
      urgencyLevel: product.priority,
      recommendationScore: calculateScore(product)
    }));

    // Generate suggested combinations organically
    const suggestedCombinations = generateSuggestedCombinations(suggestions || []);

    // Generate category insights organically
    const categoryEmojis: { [key: string]: string } = {
      'Pastries': '🥐',
      'Coffee': '☕',
      'Breakfast': '🍳',
      'Lunch': '🥪',
      'Dessert': '🍰',
      'Beverages': '🥤'
    };

    const urgentCount = (suggestions || []).filter((p: any) => p.days_to_expire <= 3).length;
    const highDemandCount = (suggestions || []).filter((p: any) => p.wishlist_demand > 3).length;
    const categoryInsights = urgentCount > 0 
      ? `${urgentCount} items expire within 3 days - perfect for urgent smart bags! ${highDemandCount > 0 ? `Plus ${highDemandCount} high-demand items.` : ''}`
      : `Great selection of ${category} items. ${highDemandCount > 0 ? `${highDemandCount} items are in high demand!` : 'Perfect for creating value bags.'}`;

    const enhancedSuggestions = {
      enhancedProducts,
      suggestedCombinations,
      categoryInsights
    };

    // Merge database suggestions with organic enhancements
    const finalSuggestions = {
      products: suggestions || [],
      enhanced: enhancedSuggestions,
      category,
      categoryEmoji: categoryEmojis[category] || '📦',
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