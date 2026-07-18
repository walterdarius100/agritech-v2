import "server-only";

import { baseEmailTemplate } from "@/lib/email/templates/base-email-template";
import type { CreateContactRequestInput } from "@/types/contact";

type ContactRequestEmailTemplateInput = {
  request: CreateContactRequestInput;
  requestTypeLabel: string;
  replyToEmail?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatOptional(value: string | null | undefined) {
  return value?.trim() || "Non précisé";
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#52614f;font-size:14px;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#1f2a1f;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(value)}</td>
  </tr>`;
}

export function contactVisitorAcknowledgementTemplate({
  request,
  replyToEmail,
}: ContactRequestEmailTemplateInput) {
  const html = baseEmailTemplate({
    title: "Nous avons bien reçu votre message",
    previewText: "Votre message envoyé à Agri-tech a bien été reçu.",
    replyTo: replyToEmail,
    contentHtml: `
      <p style="margin:0 0 16px;">Bonjour ${escapeHtml(request.full_name)},</p>
      <p style="margin:0 0 16px;">Nous avons bien reçu votre message envoyé à Agri-tech.</p>
      <p style="margin:0 0 16px;">Notre équipe examinera votre demande et vous répondra dans les meilleurs délais.</p>
      <p style="margin:0;">Cordialement,<br />L’équipe Agri-tech</p>
    `,
  });

  const text = [
    `Bonjour ${request.full_name},`,
    "",
    "Nous avons bien reçu votre message envoyé à Agri-tech.",
    "",
    "Notre équipe examinera votre demande et vous répondra dans les meilleurs délais.",
    "",
    "Cordialement,",
    "L’équipe Agri-tech",
  ].join("\n");

  return {
    subject: "Nous avons bien reçu votre message — Agri-tech",
    html,
    text,
  };
}

export function contactInternalNotificationTemplate({
  request,
  requestTypeLabel,
  replyToEmail,
}: ContactRequestEmailTemplateInput) {
  const html = baseEmailTemplate({
    title: "Nouveau message reçu depuis le site Agri-tech",
    previewText: `Nouveau message de ${request.full_name}.`,
    replyTo: replyToEmail,
    contentHtml: `
      <p style="margin:0 0 16px;">Un nouveau message a été envoyé depuis le formulaire de contact.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #e2e8d8;border-bottom:1px solid #e2e8d8;">
        ${detailRow("Nom", request.full_name)}
        ${detailRow("Email", formatOptional(request.email))}
        ${detailRow("Téléphone", formatOptional(request.phone))}
        ${detailRow("Organisation", formatOptional(request.organization))}
        ${detailRow("Sujet", formatOptional(request.subject))}
        ${detailRow("Type de demande", requestTypeLabel)}
        ${detailRow("Page source", formatOptional(request.source_page))}
      </table>
      <p style="margin:0 0 8px;font-weight:700;color:#1f4d2b;">Message</p>
      <p style="margin:0;white-space:pre-line;">${escapeHtml(request.message)}</p>
    `,
  });

  const text = [
    "Un nouveau message a été envoyé depuis le formulaire de contact.",
    "",
    `Nom : ${request.full_name}`,
    `Email : ${formatOptional(request.email)}`,
    `Téléphone : ${formatOptional(request.phone)}`,
    `Organisation : ${formatOptional(request.organization)}`,
    `Sujet : ${formatOptional(request.subject)}`,
    `Type de demande : ${requestTypeLabel}`,
    `Page source : ${formatOptional(request.source_page)}`,
    "",
    "Message :",
    request.message,
  ].join("\n");

  return {
    subject: "Nouveau message reçu depuis le site Agri-tech",
    html,
    text,
  };
}
