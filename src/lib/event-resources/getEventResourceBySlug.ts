import "server-only";

import { cache } from "react";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { EventResource } from "@/types/event-resources";

const EVENT_RESOURCE_PUBLIC_COLUMNS =
  "id,slug,title,description,resource_type,file_url,file_name,event_name,topic,language,is_active,requires_form,download_button_label,created_at,updated_at,metadata";

export const getActiveEventResourceBySlug = cache(async (slug: string) => {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    console.error("[event-resources] Supabase admin configuration is missing");
    return null;
  }

  const { data, error } = await supabase
    .from("event_resources")
    .select(EVENT_RESOURCE_PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[event-resources] Unable to load active resource", {
      slug,
      message: error.message,
    });
    return null;
  }

  return data as EventResource | null;
});
