"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  isAdminEmail,
} from "@/lib/auth/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function loginAdmin(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email et mot de passe sont requis." };
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { error: "Configuration Supabase manquante." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return { error: "Identifiants invalides." };
  }

  if (!isAdminEmail(data.user.email)) {
    return { error: "Accès non autorisé pour cet utilisateur." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, data.session.access_token, {
    ...cookieOptions,
    maxAge: data.session.expires_in,
  });
  cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/admin/articles");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE);
  redirect("/admin/login");
}
