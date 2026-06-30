import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const ADMIN_ACCESS_TOKEN_COOKIE = "agritech-admin-access-token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "agritech-admin-refresh-token";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return { user: null, isAuthorized: false };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { user: null, isAuthorized: false };
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return { user: null, isAuthorized: false };
  }

  return {
    user: data.user,
    isAuthorized: isAdminEmail(data.user.email),
  };
}

export async function requireAdmin() {
  const { user, isAuthorized } = await getCurrentAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return { user, isAuthorized };
}

export async function requireAuthorizedAdmin() {
  const { user, isAuthorized } = await requireAdmin();

  if (!isAuthorized) {
    redirect("/admin/unauthorized");
  }

  return user;
}
