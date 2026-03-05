import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createClient<Database>(url, serviceRoleKey || publicKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
