import "server-only";

import { env } from "@/lib/env";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyPayment } from "@/lib/academy/payments";
import type { AcademyCourse } from "@/types/academy";

type AcademyPurchaseEmailInput = {
  paymentId: string;
  studentEmail?: string | null;
  studentName?: string | null;
};

type AcademyPurchasePayment = AcademyPayment & {
  student_purchase_email_sent_at?: string | null;
  internal_purchase_email_sent_at?: string | null;
  academy_courses?: Pick<AcademyCourse, "title" | "slug"> | null;
  profiles?: { full_name: string | null; email?: string | null } | null;
};

const academyEmailFallback = "formation@agritech509ht.com";

function isValidEmail(value?: string | null) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
}

function getAcademyNotificationEmail() {
  const configured = process.env.ACADEMY_NOTIFICATION_EMAIL?.trim();
  return isValidEmail(configured) ? configured! : academyEmailFallback;
}

function getAcademyReplyToEmail() {
  const configured = process.env.ACADEMY_REPLY_TO_EMAIL?.trim();
  return isValidEmail(configured) ? configured! : academyEmailFallback;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAmount(amount: number | string, currency: string) {
  const numericAmount = Number(amount);
  const formatted = Number.isFinite(numericAmount)
    ? numericAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(amount);
  return `${formatted} ${currency}`;
}

function getAbsoluteAcademyCoursesUrl() {
  return `${env.siteUrl.replace(/\/$/, "")}/academy/mes-cours`;
}

function buildStudentPurchaseEmail(payment: AcademyPurchasePayment, studentName: string, courseTitle: string) {
  const amount = formatAmount(payment.amount, payment.currency);
  const myCoursesUrl = getAbsoluteAcademyCoursesUrl();
  const safeStudentName = escapeHtml(studentName);
  const safeCourseTitle = escapeHtml(courseTitle);
  const safeAmount = escapeHtml(amount);
  const safeMyCoursesUrl = escapeHtml(myCoursesUrl);

  return {
    subject: `Confirmation de votre inscription à la formation « ${courseTitle} »`,
    text: `Bonjour ${studentName},\n\nNous confirmons votre inscription à la formation « ${courseTitle} » sur Agri-tech Academy.\n\nMontant : ${amount}\nStatut : Paiement confirmé\n\nVotre accès à la formation est maintenant activé. Vous pouvez retrouver votre cours depuis votre espace étudiant.\n\nAccéder à mes cours :\n${myCoursesUrl}\n\nCordialement,\nL’équipe Agri-tech Academy`,
    html: `<p>Bonjour ${safeStudentName},</p><p>Nous confirmons votre inscription à la formation « <strong>${safeCourseTitle}</strong> » sur Agri-tech Academy.</p><p><strong>Montant :</strong> ${safeAmount}<br /><strong>Statut :</strong> Paiement confirmé</p><p>Votre accès à la formation est maintenant activé. Vous pouvez retrouver votre cours depuis votre espace étudiant.</p><p><a href="${safeMyCoursesUrl}">Accéder à mes cours</a></p><p>Cordialement,<br />L’équipe Agri-tech Academy</p>`,
  };
}

function buildInternalPurchaseEmail(payment: AcademyPurchasePayment, studentName: string, studentEmail: string, courseTitle: string) {
  const amount = formatAmount(payment.amount, payment.currency);
  const adminUrl = `${env.siteUrl.replace(/\/$/, "")}/admin/academy/payments`;
  const paidAt = payment.paid_at ? new Date(payment.paid_at).toLocaleString("fr-FR") : "Non renseignée";
  const lines = [
    "Une nouvelle inscription à une formation Academy a été enregistrée.",
    "",
    `Étudiant : ${studentName}`,
    `Email : ${studentEmail}`,
    `Formation : ${courseTitle}`,
    `Montant : ${amount}`,
    "Statut : Paiement confirmé",
    `Identifiant paiement : ${payment.id}`,
    `Date de paiement : ${paidAt}`,
    `Mode de paiement : ${payment.provider}`,
    `Lien admin Academy : ${adminUrl}`,
  ];

  return {
    subject: `Nouvelle inscription Academy — ${courseTitle}`,
    text: lines.join("\n"),
    html: `<p>Une nouvelle inscription à une formation Academy a été enregistrée.</p><ul><li><strong>Étudiant :</strong> ${escapeHtml(studentName)}</li><li><strong>Email :</strong> ${escapeHtml(studentEmail)}</li><li><strong>Formation :</strong> ${escapeHtml(courseTitle)}</li><li><strong>Montant :</strong> ${escapeHtml(amount)}</li><li><strong>Statut :</strong> Paiement confirmé</li><li><strong>Identifiant paiement :</strong> ${escapeHtml(payment.id)}</li><li><strong>Date de paiement :</strong> ${escapeHtml(paidAt)}</li><li><strong>Mode de paiement :</strong> ${escapeHtml(payment.provider)}</li></ul><p><a href="${escapeHtml(adminUrl)}">Voir les paiements Academy</a></p>`,
  };
}

async function markEmailSent(paymentId: string, marker: "student_purchase_email_sent_at" | "internal_purchase_email_sent_at") {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("academy_payments")
    .update({ [marker]: new Date().toISOString() })
    .eq("id", paymentId)
    .is(marker, null);

  const success = !error;
  console.info("[academy-email] marker update success/failure", { marker, success, error: error?.message });
  return success;
}

export async function sendAcademyPurchaseEmails({ paymentId, studentEmail, studentName }: AcademyPurchaseEmailInput) {
  console.info("[academy-email] sendAcademyPurchaseEmails started", { paymentId });
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[academy-email] Supabase admin client missing", { paymentId });
    return;
  }

  const { data, error } = await supabase
    .from("academy_payments")
    .select("*, academy_courses(title, slug)")
    .eq("id", paymentId)
    .maybeSingle();

  if (error || !data) {
    console.error("[academy-email] payment lookup failed", { paymentId, error: error?.message });
    return;
  }

  const payment = data as AcademyPurchasePayment;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", payment.student_id)
    .maybeSingle();

  const resolvedStudentEmail = studentEmail?.trim().toLowerCase() || payment.profiles?.email?.trim().toLowerCase() || null;
  const resolvedStudentName = studentName?.trim() || (profile?.full_name as string | null | undefined)?.trim() || "Étudiant";
  const courseTitle = payment.academy_courses?.title?.trim() || "Formation Academy";
  const notificationEmail = getAcademyNotificationEmail();
  const replyToEmail = getAcademyReplyToEmail();
  const shouldSendStudentEmail = payment.status === "paid" && !payment.student_purchase_email_sent_at && isValidEmail(resolvedStudentEmail);
  const shouldSendInternalEmail = payment.status === "paid" && !payment.internal_purchase_email_sent_at;

  console.info("[academy-email] student email present true/false", { present: isValidEmail(resolvedStudentEmail) });
  console.info("[academy-email] course title present true/false", { present: Boolean(payment.academy_courses?.title) });
  console.info("[academy-email] payment status", { status: payment.status });
  console.info("[academy-email] should send student email true/false", { shouldSendStudentEmail });
  console.info("[academy-email] should send internal email true/false", { shouldSendInternalEmail });
  console.info("[academy-email] notification email used", { notificationEmail });
  console.info("[academy-email] reply-to used", { replyToEmail });

  if (shouldSendStudentEmail && resolvedStudentEmail) {
    console.info("[academy-email] sending student email", { paymentId });
    const email = buildStudentPurchaseEmail(payment, resolvedStudentName, courseTitle);
    const result = await sendTransactionalEmail({
      to: { email: resolvedStudentEmail, name: resolvedStudentName },
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: { email: replyToEmail, name: "Agri-tech Academy" },
    });

    if (result.ok) {
      console.info("[academy-email] student email Brevo success/messageId", { messageId: result.messageId });
      await markEmailSent(paymentId, "student_purchase_email_sent_at");
    } else {
      console.error("[academy-email] student email Brevo error", { reason: result.reason, status: result.status, code: result.code, message: result.message });
    }
  }

  if (shouldSendInternalEmail) {
    console.info("[academy-email] sending internal email", { paymentId });
    const email = buildInternalPurchaseEmail(payment, resolvedStudentName, resolvedStudentEmail || "Email étudiant non disponible", courseTitle);
    const result = await sendTransactionalEmail({
      to: { email: notificationEmail, name: "Agri-tech Academy" },
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: { email: replyToEmail, name: "Agri-tech Academy" },
    });

    if (result.ok) {
      console.info("[academy-email] internal email Brevo success/messageId", { messageId: result.messageId });
      await markEmailSent(paymentId, "internal_purchase_email_sent_at");
    } else {
      console.error("[academy-email] internal email Brevo error", { reason: result.reason, status: result.status, code: result.code, message: result.message });
    }
  }
}
