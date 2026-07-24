import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ursrbmvgrpjhuogfimal.supabase.co';
const rawKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseServiceKey = (rawKey && rawKey !== 'your_service_key_here' && rawKey.trim() !== '') 
  ? rawKey 
  : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_tPbGnhGMinGYFI5tc4KbvA_7Gu2Ketw');

let serverClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServer() {
  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverClient;
}

export function createSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
