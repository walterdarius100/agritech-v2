"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  STUDENT_ACCESS_TOKEN_COOKIE,
  STUDENT_REFRESH_TOKEN_COOKIE,
  type AcademyAuthState,
} from "@/lib/academy/auth";
import { env } from "@/lib/env";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};


function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "").trim();
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/academy/dashboard";
  try {
    const parsed = new URL(next, env.siteUrl);
    const site = new URL(env.siteUrl);
    if (parsed.origin !== site.origin) return "/academy/dashboard";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/academy/dashboard";
  }
}

function getStudentAuthErrorMessage(message?: string) {
  const normalized = (message ?? "").toLowerCase();
  if (normalized.includes("email not confirmed") || normalized.includes("not confirmed")) {
    return "Votre adresse email doit être confirmée avant la connexion. Vérifiez votre boîte mail.";
  }
  return "Email ou mot de passe incorrect.";
}

async function setSessionCookies(session: { access_token: string; refresh_token: string; expires_in: number }) {
  const store = await cookies();
  store.set(STUDENT_ACCESS_TOKEN_COOKIE, session.access_token, {
    ...cookieOptions,
    maxAge: session.expires_in,
  });
  store.set(STUDENT_REFRESH_TOKEN_COOKIE, session.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function upsertStudentProfile(userId: string, fullName?: string, phone?: string, organization?: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName || null,
      phone: phone || null,
      organization: organization || null,
      role: "student",
    },
    { onConflict: "id" },
  );
}

export async function loginStudent(_state: AcademyAuthState, formData: FormData): Promise<AcademyAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { error: "Configuration Supabase manquante." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    return { error: getStudentAuthErrorMessage(error?.message) };
  }

  await upsertStudentProfile(data.user.id, data.user.user_metadata?.full_name);
  await setSessionCookies(data.session);
  redirect(next);
}

export async function registerStudent(_state: AcademyAuthState, formData: FormData): Promise<AcademyAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const next = getSafeNext(formData);

  if (!email || !password || !fullName) {
    return { error: "Nom, email et mot de passe requis." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { error: "Configuration Supabase manquante." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${env.siteUrl.replace(/\/$/, "")}/academy/login?registered=1&next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Inscription impossible." };
  }

  await upsertStudentProfile(data.user.id, fullName, phone, organization);

  if (data.session) {
    await setSessionCookies(data.session);
    redirect(next);
  }

  return {
    success:
      "Compte créé. Votre adresse email doit être confirmée avant la connexion si la confirmation email est activée dans Supabase. Le lien de connexion conservera votre demande Academy.",
  };
}

export async function logoutStudent() {
  const store = await cookies();
  store.delete(STUDENT_ACCESS_TOKEN_COOKIE);
  store.delete(STUDENT_REFRESH_TOKEN_COOKIE);
  redirect("/academy/login");
}
