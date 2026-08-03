import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const newsletterStatuses = [
  "active",
  "unsubscribed",
  "bounced",
  "complained",
] as const;

export type NewsletterStatus = (typeof newsletterStatuses)[number];

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: NewsletterStatus;
  source: string;
  page_path: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  updated_at: string;
};

export type NewsletterAdminFilters = {
  query?: string;
  status?: NewsletterStatus | "all";
};

const subscriberColumns =
  "id,email,status,source,page_path,subscribed_at,unsubscribed_at,updated_at";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getAdminClientOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Configuration Supabase admin manquante.");
  return supabase;
}

export function normalizeNewsletterFilters(
  filters: Record<string, string | string[] | undefined>,
): NewsletterAdminFilters {
  const rawQuery = Array.isArray(filters.q) ? filters.q[0] : filters.q;
  const rawStatus = Array.isArray(filters.status)
    ? filters.status[0]
    : filters.status;

  return {
    query: rawQuery?.trim().slice(0, 254) || undefined,
    status: newsletterStatuses.includes(rawStatus as NewsletterStatus)
      ? (rawStatus as NewsletterStatus)
      : "all",
  };
}

export async function getNewsletterAdminData(filters: NewsletterAdminFilters) {
  await requireAuthorizedAdmin();
  const supabase = getAdminClientOrThrow();
  let subscribersQuery = supabase
    .from("newsletter_subscribers")
    .select(subscriberColumns)
    .order("subscribed_at", { ascending: false })
    .limit(500);

  if (filters.status && filters.status !== "all") {
    subscribersQuery = subscribersQuery.eq("status", filters.status);
  }
  if (filters.query) {
    subscribersQuery = subscribersQuery.ilike("email", `%${filters.query}%`);
  }

  const countQueries = newsletterStatuses.map((status) =>
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", status),
  );
  const [subscribersResult, totalResult, ...statusResults] = await Promise.all([
    subscribersQuery,
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true }),
    ...countQueries,
  ]);

  const firstError =
    subscribersResult.error ??
    totalResult.error ??
    statusResults.find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  return {
    subscribers: (subscribersResult.data ?? []) as NewsletterSubscriber[],
    stats: {
      total: totalResult.count ?? 0,
      active: statusResults[0]?.count ?? 0,
      unsubscribed: statusResults[1]?.count ?? 0,
      bounced: statusResults[2]?.count ?? 0,
      complained: statusResults[3]?.count ?? 0,
    },
  };
}

export async function updateNewsletterSubscriberStatus(formData: FormData) {
  "use server";

  await requireAuthorizedAdmin();
  const id = String(formData.get("id") ?? "");
  const currentStatus = String(formData.get("currentStatus") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "");

  if (
    !uuidPattern.test(id) ||
    !["active", "unsubscribed"].includes(currentStatus) ||
    !["active", "unsubscribed"].includes(nextStatus) ||
    currentStatus === nextStatus
  ) {
    redirect("/admin/newsletter?error=action-invalide");
  }

  const now = new Date().toISOString();
  const payload =
    nextStatus === "unsubscribed"
      ? { status: "unsubscribed", unsubscribed_at: now, updated_at: now }
      : { status: "active", unsubscribed_at: null, updated_at: now };
  const supabase = getAdminClientOrThrow();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .update(payload)
    .eq("id", id)
    .eq("status", currentStatus)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirect("/admin/newsletter?error=mise-a-jour-impossible");
  }

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?success=statut-mis-a-jour");
}
