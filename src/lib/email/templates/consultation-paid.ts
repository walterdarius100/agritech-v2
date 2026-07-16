import "server-only";

import { baseEmailTemplate } from "@/lib/email/templates/base-email-template";
import type { ConsultationRequest } from "@/types/consultation";

type ConsultationPaidTemplateInput = {
  request: ConsultationRequest;
  replyToEmail?: string;
  adminUrl?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatOptional(value: string | null) {
  return value?.trim() || "Non précisé";
}

function formatAmount(amount: number, currency: string) {
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#52614f;font-size:14px;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#1f2a1f;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(value)}</td>
  </tr>`;
}

export function consultationPaidClientEmailTemplate({
  request,
  replyToEmail,
}: ConsultationPaidTemplateInput) {
  const amount = formatAmount(request.amount, request.currency);
  const html = baseEmailTemplate({
    title: "Confirmation de votre demande de consultation",
    previewText: `Votre demande ${request.request_code} est confirmée.`,
    replyTo: replyToEmail,
    contentHtml: `
      <p style="margin:0 0 16px;">Bonjour ${escapeHtml(request.full_name)},</p>
      <p style="margin:0 0 16px;">Nous confirmons la réception de votre demande de consultation auprès d’Agri-tech.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #e2e8d8;border-bottom:1px solid #e2e8d8;">
        ${detailRow("Code de demande", request.request_code)}
        ${detailRow("Domaine concerné", request.consultation_type)}
        ${detailRow("Montant payé", amount)}
        ${detailRow("Statut", "Paiement confirmé")}
      </table>
      <p style="margin:0 0 16px;">Un membre de l’équipe Agri-tech vous contactera afin d’organiser la suite de l’échange.</p>
      <p style="margin:0;">Pour toute question concernant cette demande, vous pouvez répondre directement à cet email.</p>
    `,
  });

  const text = [
    `Bonjour ${request.full_name},`,
    "",
    "Nous confirmons la réception de votre demande de consultation auprès d’Agri-tech.",
    "",
    `Code de demande : ${request.request_code}`,
    `Domaine concerné : ${request.consultation_type}`,
    `Montant payé : ${amount}`,
    "Statut : Paiement confirmé",
    "",
    "Un membre de l’équipe Agri-tech vous contactera afin d’organiser la suite de l’échange.",
    "",
    "Pour toute question concernant cette demande, vous pouvez répondre directement à cet email.",
    "",
    "Cordialement,",
    "Agri-tech",
  ].join("\n");

  return {
    subject: "Confirmation de votre demande de consultation — Agri-tech",
    html,
    text,
  };
}

export function consultationPaidInternalEmailTemplate({
  request,
  replyToEmail,
  adminUrl,
}: ConsultationPaidTemplateInput) {
  const amount = formatAmount(request.amount, request.currency);
  const html = baseEmailTemplate({
    title: `Nouvelle consultation payée — ${request.request_code}`,
    previewText: `Consultation payée par ${request.full_name}.`,
    replyTo: replyToEmail,
    contentHtml: `
      <p style="margin:0 0 16px;">Une nouvelle demande de consultation a été enregistrée et payée.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #e2e8d8;border-bottom:1px solid #e2e8d8;">
        ${detailRow("Client", request.full_name)}
        ${detailRow("Téléphone", request.phone)}
        ${detailRow("Email", formatOptional(request.email))}
        ${detailRow("Département", formatOptional(request.department))}
        ${detailRow("Commune", formatOptional(request.commune))}
        ${detailRow("Domaine", request.consultation_type)}
        ${detailRow("Mode souhaité", formatOptional(request.consultation_mode))}
        ${detailRow("Budget approximatif", formatOptional(request.estimated_budget))}
        ${detailRow("Montant", amount)}
      </table>
      <p style="margin:0 0 8px;font-weight:700;color:#1f4d2b;">Description</p>
      <p style="margin:0 0 18px;white-space:pre-line;">${escapeHtml(request.project_description)}</p>
      ${adminUrl ? `<p style="margin:0;"><a href="${escapeHtml(adminUrl)}" style="color:#1f4d2b;font-weight:700;">Ouvrir la demande dans l’admin</a></p>` : ""}
    `,
  });

  const text = [
    "Une nouvelle demande de consultation a été enregistrée et payée.",
    "",
    `Code : ${request.request_code}`,
    `Client : ${request.full_name}`,
    `Téléphone : ${request.phone}`,
    `Email : ${formatOptional(request.email)}`,
    `Département : ${formatOptional(request.department)}`,
    `Commune : ${formatOptional(request.commune)}`,
    `Domaine : ${request.consultation_type}`,
    `Mode souhaité : ${formatOptional(request.consultation_mode)}`,
    `Budget approximatif : ${formatOptional(request.estimated_budget)}`,
    `Montant : ${amount}`,
    "",
    "Description :",
    request.project_description,
    ...(adminUrl ? ["", `Admin : ${adminUrl}`] : []),
  ].join("\n");

  return {
    subject: `Nouvelle consultation payée — ${request.request_code}`,
    html,
    text,
  };
}
