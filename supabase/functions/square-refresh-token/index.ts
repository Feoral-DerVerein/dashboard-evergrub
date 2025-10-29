import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔵 Starting Square token refresh...');

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get Square connection
    const { data: connection, error: connectionError } = await supabase
      .from('square_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      throw new Error('No Square connection found');
    }

    // Check if token needs refresh
    const now = new Date();
    const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at) : null;
    
    // Refresh if token expires in less than 24 hours or has no expiry date
    const shouldRefresh = !expiresAt || (expiresAt.getTime() - now.getTime()) < (24 * 60 * 60 * 1000);

    if (!shouldRefresh) {
      console.log('✅ Token is still valid, no refresh needed');
      return new Response(
        JSON.stringify({
          success: true,
          refreshed: false,
          message: 'Token is still valid',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (!connection.refresh_token) {
      throw new Error('No refresh token available');
    }

    // Get Square credentials
    const squareApplicationId = Deno.env.get('SQUARE_APPLICATION_ID');
    const squareApplicationSecret = Deno.env.get('SQUARE_APPLICATION_SECRET');
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox';

    if (!squareApplicationId || !squareApplicationSecret) {
      throw new Error('Square credentials not configured');
    }

    // Refresh the token
    const tokenUrl = squareEnvironment === 'production'
      ? 'https://connect.squareup.com/oauth2/token'
      : 'https://connect.squareupsandbox.com/oauth2/token';

    console.log('🔵 Refreshing access token...');
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2024-12-18',
      },
      body: JSON.stringify({
        client_id: squareApplicationId,
        client_secret: squareApplicationSecret,
        refresh_token: connection.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token refresh failed:', errorData);
      
      // If refresh token is invalid, mark connection as error
      await supabase
        .from('square_connections')
        .update({ connection_status: 'error' })
        .eq('id', connection.id);
      
      throw new Error(`Token refresh failed: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_at } = tokenData;

    console.log('✅ New access token obtained');

    // Update connection with new tokens
    const updateData: any = {
      access_token,
      last_tested_at: new Date().toISOString(),
      connection_status: 'connected',
    };

    if (refresh_token) {
      updateData.refresh_token = refresh_token;
    }
    if (expires_at) {
      updateData.token_expires_at = expires_at;
    }

    const { error: updateError } = await supabase
      .from('square_connections')
      .update(updateData)
      .eq('id', connection.id);

    if (updateError) {
      console.error('❌ Failed to update connection:', updateError);
      throw updateError;
    }

    console.log('✅ Connection updated with new token');

    return new Response(
      JSON.stringify({
        success: true,
        refreshed: true,
        message: 'Token refreshed successfully',
        expires_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
