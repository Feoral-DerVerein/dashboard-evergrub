import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SquareTokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  merchant_id: string;
  refresh_token?: string;
}

interface SquareMerchant {
  merchant: {
    id: string;
    business_name: string;
    country: string;
    language_code: string;
    currency: string;
  };
}

interface SquareLocation {
  id: string;
  name: string;
  status: string;
  address?: {
    address_line_1?: string;
    locality?: string;
    administrative_district_level_1?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { code, error: oauthError } = await req.json();

    if (oauthError) {
      console.error('OAuth error:', oauthError);
      return new Response(
        JSON.stringify({ error: 'OAuth authorization failed', details: oauthError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Exchanging authorization code for access token...');

    // Get environment variables
    const squareAppId = Deno.env.get('SQUARE_APPLICATION_ID');
    const squareAppSecret = Deno.env.get('SQUARE_APPLICATION_SECRET');
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox';

    if (!squareAppId || !squareAppSecret) {
      throw new Error('Square credentials not configured');
    }

    const tokenUrl =
      squareEnvironment === 'production'
        ? 'https://connect.squareup.com/oauth2/token'
        : 'https://connect.squareupsandbox.com/oauth2/token';

    const apiBaseUrl =
      squareEnvironment === 'production'
        ? 'https://connect.squareup.com'
        : 'https://connect.squareupsandbox.com';

    // Exchange authorization code for access token
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        client_id: squareAppId,
        client_secret: squareAppSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://negentropyfood.cloud/square-callback',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokenData: SquareTokenResponse = await tokenResponse.json();
    console.log('Access token obtained successfully');

    // Get merchant profile
    console.log('Fetching merchant profile...');
    const merchantResponse = await fetch(
      `${apiBaseUrl}/v2/merchants/${tokenData.merchant_id}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Square-Version': '2024-01-18',
        },
      }
    );

    if (!merchantResponse.ok) {
      console.error('Failed to fetch merchant profile');
      throw new Error('Failed to fetch merchant profile');
    }

    const merchantData: SquareMerchant = await merchantResponse.json();
    console.log('Merchant profile fetched:', merchantData.merchant.business_name);

    // Get locations
    console.log('Fetching merchant locations...');
    const locationsResponse = await fetch(`${apiBaseUrl}/v2/locations`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Square-Version': '2024-01-18',
      },
    });

    if (!locationsResponse.ok) {
      console.error('Failed to fetch locations');
      throw new Error('Failed to fetch locations');
    }

    const locationsData = await locationsResponse.json();
    const activeLocation: SquareLocation = locationsData.locations?.find(
      (loc: SquareLocation) => loc.status === 'ACTIVE'
    );

    if (!activeLocation) {
      throw new Error('No active location found');
    }

    console.log('Active location found:', activeLocation.name);

    // Save to database with 'connected' status since we already validated everything
    console.log('Saving connection to database...');
    const { data: connectionData, error: dbError } = await supabaseClient
      .from('pos_connections')
      .insert({
        user_id: user.id,
        pos_type: 'square',
        business_name: merchantData.merchant.business_name,
        api_credentials: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          location_id: activeLocation.id,
          merchant_id: tokenData.merchant_id,
          expires_at: tokenData.expires_at,
        },
        connection_status: 'connected', // Already validated successfully
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save connection: ${dbError.message}`);
    }

    console.log('Connection saved with ID:', connectionData.id);

    // Notify n8n about successful connection (informational only, not for validation)
    fetch('https://n8n.srv1024074.hstgr.cloud/webhook/pos-connected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connection_id: connectionData.id,
        user_id: user.id,
        pos_type: 'square',
        business_name: merchantData.merchant.business_name,
        merchant_id: tokenData.merchant_id,
        location_id: activeLocation.id,
        environment: squareEnvironment,
        connected_at: new Date().toISOString(),
      }),
    }).catch((err) => console.error('n8n notification error:', err));

    console.log('Square OAuth flow completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Square connected successfully',
        connectionId: connectionData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in square-oauth-callback:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
