export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://agritech509ht.com",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
};

export const hasSupabasePublicConfig = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);

export const hasSupabaseAdminConfig = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey,
);
