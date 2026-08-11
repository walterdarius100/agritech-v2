import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  EventResource,
  EventResourceLanguage,
  EventResourceLead,
  EventResourceType,
} from "@/types/event-resources";

export type EventResourceAdminRow = EventResource & { lead_count: number };
export type EventResourceFormState = { error?: string };

const resourceTypes: EventResourceType[] = [
  "document",
  "plan",
  "guide",
  "fiche_technique",
  "presentation",
  "autre",
];
const resourceLanguages: EventResourceLanguage[] = ["fr", "en", "es", "ht"];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const resourceColumns =
  "id,slug,title,description,resource_type,file_url,file_name,event_name,topic,language,is_active,requires_form,download_button_label,created_at,updated_at,metadata";
const leadColumns =
  "id,resource_id,full_name,phone,email,organization,interest_area,consent_newsletter,consent_contact,source,event_name,page_path,created_at,metadata";

function getAdminClientOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Configuration Supabase admin manquante.");
  return supabase;
}

function text(formData: FormData, name: string, maxLength: number) {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, maxLength);
}

function nullable(value: string) {
  return value || null;
}

function isSafeFileUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function parseResourceForm(formData: FormData) {
  const resourceType = text(formData, "resource_type", 40) as EventResourceType;
  const language = text(formData, "language", 5) as EventResourceLanguage;
  const rawMetadata = text(formData, "metadata", 10_000) || "{}";
  let metadata: Record<string, unknown>;

  try {
    const parsed = JSON.parse(rawMetadata) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: "Les métadonnées doivent être un objet JSON." };
    }
    metadata = parsed as Record<string, unknown>;
  } catch {
    return { error: "Les métadonnées JSON sont invalides." };
  }

  const payload = {
    title: text(formData, "title", 180),
    slug: text(formData, "slug", 160).toLowerCase(),
    description: nullable(text(formData, "description", 2_000)),
    resource_type: resourceType,
    file_url: text(formData, "file_url", 2_000),
    file_name: nullable(text(formData, "file_name", 255)),
    event_name: nullable(text(formData, "event_name", 255)),
    topic: nullable(text(formData, "topic", 255)),
    language,
    is_active: formData.get("is_active") === "on",
    download_button_label: text(formData, "download_button_label", 120),
    metadata,
  };

  if (!payload.title) return { error: "Le titre est obligatoire." };
  if (!slugPattern.test(payload.slug)) {
    return {
      error:
        "Le slug doit contenir uniquement des minuscules, chiffres et tirets.",
    };
  }
  if (!resourceTypes.includes(resourceType))
    return { error: "Type de ressource invalide." };
  if (!resourceLanguages.includes(language))
    return { error: "Langue invalide." };
  if (!payload.file_url || !isSafeFileUrl(payload.file_url)) {
    return {
      error:
        "L’URL du fichier doit être une URL HTTP(S) ou un chemin local valide.",
    };
  }
  if (!payload.download_button_label)
    return { error: "Le libellé du bouton est obligatoire." };

  return { payload };
}

export async function getAdminEventResources() {
  await requireAuthorizedAdmin();
  const supabase = getAdminClientOrThrow();
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [resourcesResult, totalLeadsResult, todayLeadsResult] =
    await Promise.all([
      supabase
        .from("event_resources")
        .select(`${resourceColumns},event_resource_leads(count)`)
        .order("created_at", { ascending: false }),
      supabase
        .from("event_resource_leads")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("event_resource_leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfToday.toISOString()),
    ]);

  const error =
    resourcesResult.error ?? totalLeadsResult.error ?? todayLeadsResult.error;
  if (error) throw new Error(error.message);

  const resources = (resourcesResult.data ?? []).map((row) => {
    const record = row as unknown as EventResource & {
      event_resource_leads?: { count: number }[];
    };
    const { event_resource_leads: counts, ...resource } = record;
    return { ...resource, lead_count: counts?.[0]?.count ?? 0 };
  });

  return {
    resources: resources as EventResourceAdminRow[],
    stats: {
      totalResources: resources.length,
      activeResources: resources.filter((resource) => resource.is_active)
        .length,
      totalLeads: totalLeadsResult.count ?? 0,
      todayLeads: todayLeadsResult.count ?? 0,
    },
  };
}

export async function getAdminEventResourceById(id: string) {
  await requireAuthorizedAdmin();
  if (!uuidPattern.test(id)) return null;
  const supabase = getAdminClientOrThrow();
  const { data, error } = await supabase
    .from("event_resources")
    .select(resourceColumns)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as EventResource | null;
}

export async function getAdminEventResourceLeads(id: string, query?: string) {
  await requireAuthorizedAdmin();
  if (!uuidPattern.test(id)) {
    return { leads: [] as EventResourceLead[], total: 0 };
  }
  const supabase = getAdminClientOrThrow();
  let request = supabase
    .from("event_resource_leads")
    .select(leadColumns)
    .eq("resource_id", id)
    .order("created_at", { ascending: false })
    .limit(500);

  const term = query
    ?.trim()
    .slice(0, 180)
    .replaceAll("%", "")
    .replaceAll(",", " ");
  if (term) {
    request = request.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,organization.ilike.%${term}%`,
    );
  }

  const [leadsResult, countResult] = await Promise.all([
    request,
    supabase
      .from("event_resource_leads")
      .select("id", { count: "exact", head: true })
      .eq("resource_id", id),
  ]);
  const error = leadsResult.error ?? countResult.error;
  if (error) throw new Error(error.message);
  return {
    leads: (leadsResult.data ?? []) as EventResourceLead[],
    total: countResult.count ?? 0,
  };
}

export async function createEventResource(
  _state: EventResourceFormState,
  formData: FormData,
): Promise<EventResourceFormState> {
  "use server";
  await requireAuthorizedAdmin();
  const parsed = parseResourceForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { error } = await getAdminClientOrThrow()
    .from("event_resources")
    .insert(parsed.payload);
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Ce slug est déjà utilisé."
          : "La ressource n’a pas pu être créée.",
    };
  }
  revalidatePath("/admin/resources");
  redirect("/admin/resources?success=ressource-creee");
}

export async function updateEventResource(
  id: string,
  _state: EventResourceFormState,
  formData: FormData,
): Promise<EventResourceFormState> {
  "use server";
  await requireAuthorizedAdmin();
  if (!uuidPattern.test(id))
    return { error: "Identifiant de ressource invalide." };
  const parsed = parseResourceForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { error } = await getAdminClientOrThrow()
    .from("event_resources")
    .update(parsed.payload)
    .eq("id", id);
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Ce slug est déjà utilisé."
          : "La ressource n’a pas pu être modifiée.",
    };
  }
  revalidatePath("/admin/resources");
  revalidatePath(`/admin/resources/${id}`);
  revalidatePath(`/r/${parsed.payload.slug}`);
  redirect(`/admin/resources/${id}?success=ressource-modifiee`);
}

export async function toggleEventResourceStatus(formData: FormData) {
  "use server";
  await requireAuthorizedAdmin();
  const id = String(formData.get("id") ?? "");
  const nextActive = String(formData.get("next_active") ?? "");
  if (!uuidPattern.test(id) || !["true", "false"].includes(nextActive)) {
    redirect("/admin/resources?error=action-invalide");
  }
  const { error } = await getAdminClientOrThrow()
    .from("event_resources")
    .update({ is_active: nextActive === "true" })
    .eq("id", id);
  if (error) redirect("/admin/resources?error=mise-a-jour-impossible");
  revalidatePath("/admin/resources");
  redirect("/admin/resources?success=statut-modifie");
}

export function getEventResourceFormDefaults(resource?: EventResource | null) {
  return {
    title: resource?.title ?? "",
    slug: resource?.slug ?? "",
    description: resource?.description ?? "",
    resource_type: resource?.resource_type ?? ("document" as EventResourceType),
    file_url: resource?.file_url ?? "",
    file_name: resource?.file_name ?? "",
    event_name: resource?.event_name ?? "",
    topic: resource?.topic ?? "",
    language: resource?.language ?? ("fr" as EventResourceLanguage),
    is_active: resource?.is_active ?? true,
    download_button_label:
      resource?.download_button_label ?? "Télécharger la ressource",
    metadata: JSON.stringify(resource?.metadata ?? {}, null, 2),
  };
}

export { resourceLanguages, resourceTypes };
