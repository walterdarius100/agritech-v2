import { createClient } from "@supabase/supabase-js";

import { env, hasSupabasePublicConfig } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicConfig) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
