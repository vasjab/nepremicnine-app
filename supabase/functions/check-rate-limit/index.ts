import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  identifier: string;
  action: 'signup' | 'login' | 'create_listing';
}

// Rate limit configurations per action
const RATE_LIMITS = {
  signup: { maxAttempts: 5, windowMinutes: 60 }, // 5 signups per hour
  login: { maxAttempts: 10, windowMinutes: 15 }, // 10 login attempts per 15 minutes
  create_listing: { maxAttempts: 5, windowMinutes: 60 }, // 5 listings per hour
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use service role client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { identifier, action }: RateLimitRequest = await req.json();

    if (!identifier || !action) {
      console.error('Missing required fields:', { identifier: !!identifier, action: !!action });
      return new Response(
        JSON.stringify({ error: 'Missing identifier or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = RATE_LIMITS[action];
    if (!config) {
      console.error('Invalid action:', action);
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking rate limit for ${action} - identifier: ${identifier.substring(0, 8)}...`);

    // Call the rate limit check function
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max_attempts: config.maxAttempts,
      p_window_minutes: config.windowMinutes,
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // On error, allow the request to proceed (fail open for availability)
      return new Response(
        JSON.stringify({ allowed: true, error: 'Rate limit check failed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allowed = data === true;
    console.log(`Rate limit result for ${action}: ${allowed ? 'ALLOWED' : 'BLOCKED'}`);

    return new Response(
      JSON.stringify({ 
        allowed,
        message: allowed ? 'Request allowed' : `Too many ${action} attempts. Please try again later.`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in rate limit check:', error);
    // Fail open to prevent blocking legitimate users
    return new Response(
      JSON.stringify({ allowed: true, error: 'Internal server error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
