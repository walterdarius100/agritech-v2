import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseAdminConfig, hasSupabasePublicConfig } from "@/lib/env";

export function createSupabaseServerClient() {
  if (!hasSupabasePublicConfig) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function createSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
}
