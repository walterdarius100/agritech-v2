import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export type SupabaseDiagnosticsResult = {
  supabaseUrlPresent: boolean;
  supabaseAnonKeyPresent: boolean;
  siteUrlPresent: boolean;
  supabaseUrlValid: boolean;
  supabaseAnonKeyLength: number;
  supabaseAnonKeyPrefix: string;
  clientCreated: boolean;
  articlesQuerySucceeded: boolean;
  publishedArticlesCount: number | null;
  errorMessage: string | null;
};

function isValidSupabaseUrl(value: string) {
  if (!value) return false;

  try {
    const url = new URL(value);

    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Erreur inconnue pendant le diagnostic Supabase.";
}

export async function runSupabaseDiagnostics(): Promise<SupabaseDiagnosticsResult> {
  const supabaseAnonKeyPrefix = env.supabaseAnonKey.slice(0, 8);
  const result: SupabaseDiagnosticsResult = {
    supabaseUrlPresent: Boolean(env.supabaseUrl),
    supabaseAnonKeyPresent: Boolean(env.supabaseAnonKey),
    siteUrlPresent: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    supabaseUrlValid: isValidSupabaseUrl(env.supabaseUrl),
    supabaseAnonKeyLength: env.supabaseAnonKey.length,
    supabaseAnonKeyPrefix,
    clientCreated: false,
    articlesQuerySucceeded: false,
    publishedArticlesCount: null,
    errorMessage: null,
  };

  try {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
      result.errorMessage =
        "Client Supabase non créé. Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.";
      return result;
    }

    result.clientCreated = true;

    const { count, error } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");

    if (error) {
      result.errorMessage = error.message;
      return result;
    }

    result.articlesQuerySucceeded = true;
    result.publishedArticlesCount = count ?? 0;

    return result;
  } catch (error) {
    result.errorMessage = getErrorMessage(error);
    return result;
  }
}
