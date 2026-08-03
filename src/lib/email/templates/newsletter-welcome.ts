import "server-only";

import { env } from "@/lib/env";
import { baseEmailTemplate } from "@/lib/email/templates/base-email-template";

export function newsletterWelcomeEmailTemplate(replyToEmail?: string) {
  const siteUrl = env.siteUrl.replace(/\/$/, "");
  const subject = "Bienvenue dans la newsletter Agri-tech";
  const html = baseEmailTemplate({
    title: subject,
    previewText: "Merci pour votre inscription à la newsletter Agri-tech.",
    replyTo: replyToEmail,
    contentHtml: `
      <p style="margin:0 0 16px;">Bonjour,</p>
      <p style="margin:0 0 16px;">Merci pour votre inscription à la newsletter Agri-tech.</p>
      <p style="margin:0 0 16px;">Vous recevrez désormais nos contenus, conseils pratiques, actualités agricoles, informations sur nos formations et ressources utiles pour mieux comprendre et développer les projets agricoles en Haïti.</p>
      <p style="margin:0 0 20px;">Notre objectif est de vous partager des informations claires, utiles et adaptées aux réalités du terrain.</p>
      <p style="margin:0 0 24px;"><a href="${siteUrl}" style="display:inline-block;border-radius:10px;background:#1f4d2b;padding:12px 18px;color:#ffffff;text-decoration:none;font-weight:700;">Découvrir Agri-tech</a></p>
      <p style="margin:0;">À bientôt,<br />L’équipe Agri-tech</p>
    `,
  });
  const text = [
    "Bonjour,",
    "",
    "Merci pour votre inscription à la newsletter Agri-tech.",
    "",
    "Vous recevrez désormais nos contenus, conseils pratiques, actualités agricoles, informations sur nos formations et ressources utiles pour mieux comprendre et développer les projets agricoles en Haïti.",
    "",
    "Notre objectif est de vous partager des informations claires, utiles et adaptées aux réalités du terrain.",
    "",
    `Découvrir Agri-tech : ${siteUrl}`,
    "",
    "À bientôt,",
    "L’équipe Agri-tech",
  ].join("\n");

  return { subject, html, text };
}
