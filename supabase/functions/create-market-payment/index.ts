import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating market payment session...");
    
    const { offer, products, deliveryLocation } = await req.json();
    
    if (!offer || !products) {
      throw new Error("Offer and products data are required");
    }

    console.log("Payment request:", { offer, products, deliveryLocation });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create line items from the products in the offer
    const lineItems = products.map((product: any) => ({
      price_data: {
        currency: "aud", // Australian dollars
        product_data: {
          name: product.name,
          description: `${product.quantity}${product.unit} - ${product.category}`,
          images: product.image ? [product.image] : undefined,
        },
        unit_amount: Math.round(product.price * 100), // Convert to cents
      },
      quantity: 1,
    }));

    console.log("Line items created:", lineItems);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/market?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/market?payment=cancelled`,
      metadata: {
        offer_id: offer.id,
        seller: offer.seller,
        delivery_location: deliveryLocation || "Not specified",
        total_amount: offer.totalPrice.toString(),
      },
      shipping_address_collection: {
        allowed_countries: ['AU'], // Only Australia
      },
      billing_address_collection: 'required',
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create payment session" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});