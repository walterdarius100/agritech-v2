import { formations } from "@/data/formations";
import { services } from "@/data/services";
import type { ContactRequest } from "@/types/contact";

const requestTypeLabels: Record<ContactRequest["request_type"], string> = {
  general: "Générale",
  service: "Service",
  formation: "Formation",
  academy_access: "Accès formation Academy",
  partnership: "Partenariat",
  other: "Autre",
};

export function getServiceLabel(slug: string | null | undefined) {
  if (!slug) return null;
  return services.find((service) => service.slug === slug)?.title ?? slug;
}

export function getFormationLabel(slug: string | null | undefined) {
  if (!slug) return null;
  return formations.find((formation) => formation.slug === slug)?.title ?? slug;
}

export function getContactRequestTypeLabel(type: ContactRequest["request_type"]) {
  return requestTypeLabels[type] ?? type;
}

export function getContactRequestContext(request: Pick<ContactRequest, "request_type" | "service_slug" | "formation_slug" | "course_slug" | "course_title">) {
  if (request.request_type === "service") {
    const label = getServiceLabel(request.service_slug);
    return {
      typeLabel: "Service",
      itemLabel: label,
      itemPrefix: "Service concerné",
      summary: label ? `Service — ${label}` : "Service",
    };
  }

  if (request.request_type === "academy_access") {
    const label = request.course_title || request.course_slug || "Formation sélectionnée non précisée";
    return {
      typeLabel: "Accès formation Academy",
      itemLabel: label,
      itemPrefix: "Formation Academy demandée",
      summary: `Academy — ${label}`,
    };
  }

  if (request.request_type === "formation") {
    const label = getFormationLabel(request.formation_slug);
    return {
      typeLabel: "Formation",
      itemLabel: label,
      itemPrefix: "Formation concernée",
      summary: label ? `Formation — ${label}` : "Formation",
    };
  }

  const typeLabel = getContactRequestTypeLabel(request.request_type);
  return {
    typeLabel,
    itemLabel: null,
    itemPrefix: null,
    summary: typeLabel,
  };
}
