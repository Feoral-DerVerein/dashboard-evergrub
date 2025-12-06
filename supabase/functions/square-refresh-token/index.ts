import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SquareProvider, SquareConfig } from '../_shared/pos/square.ts';

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
    const config: SquareConfig = {
      applicationId: Deno.env.get('SQUARE_APPLICATION_ID') || '',
      applicationSecret: Deno.env.get('SQUARE_APPLICATION_SECRET') || '',
      environment: (Deno.env.get('SQUARE_ENVIRONMENT') as 'sandbox' | 'production') || 'sandbox'
    };

    if (!config.applicationId || !config.applicationSecret) {
      throw new Error('Square credentials not configured');
    }

    // Initialize Provider
    const provider = new SquareProvider(config);

    console.log('🔵 Refreshing access token via Provider...');

    let authResult;
    try {
      authResult = await provider.refreshToken(connection.refresh_token);
    } catch (e: any) {
      console.error('❌ Token refresh failed:', e);
      // If refresh token is invalid, mark connection as error
      await supabase
        .from('square_connections')
        .update({ connection_status: 'error' })
        .eq('id', connection.id);
      throw e;
    }

    console.log('✅ New access token obtained');

    // Update connection with new tokens
    const updateData: any = {
      access_token: authResult.accessToken,
      last_tested_at: new Date().toISOString(),
      connection_status: 'connected',
    };

    if (authResult.refreshToken) {
      updateData.refresh_token = authResult.refreshToken;
    }
    if (authResult.expiresAt) {
      updateData.token_expires_at = authResult.expiresAt.toISOString();
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
        expires_at: authResult.expiresAt,
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
