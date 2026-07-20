import "server-only";

import { env } from "@/lib/env";
import { recordEmailEvent } from "@/lib/email/events";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { baseEmailTemplate } from "@/lib/email/templates/base-email-template";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyPayment } from "@/lib/academy/payments";
import type { AcademyCourse } from "@/types/academy";

type AcademyPurchaseEmailInput = {
  paymentId: string;
  studentEmail?: string | null;
  studentName?: string | null;
};

type AcademyWelcomeProfile = {
  id: string;
  full_name: string | null;
  welcome_email_sent_at?: string | null;
};

type AcademyCertificateEmailRecord = {
  id: string;
  certificate_id: string;
  student_id: string | null;
  course_id: string | null;
  student_full_name: string | null;
  course_title: string | null;
  issued_at: string | null;
  verification_url: string | null;
  certificate_email_sent_at?: string | null;
  academy_courses?: Pick<AcademyCourse, "title"> | null;
  profiles?: { full_name: string | null; email?: string | null } | null;
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
    ? numericAmount.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : String(amount);
  return `${formatted} ${currency}`;
}

function getAbsoluteAcademyCertificateUrl(certificateId: string) {
  return `${env.siteUrl.replace(/\/$/, "")}/academy/certificats/${encodeURIComponent(certificateId)}`;
}

function getAbsoluteCertificateVerificationUrl(
  certificateId: string,
  storedVerificationUrl?: string | null,
) {
  if (storedVerificationUrl?.trim()) return storedVerificationUrl.trim();
  return `${env.siteUrl.replace(/\/$/, "")}/certificats/verifier/${encodeURIComponent(certificateId)}`;
}

function formatCertificateIssuedDate(value?: string | null) {
  if (!value) return "Non renseignée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non renseignée";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getAbsoluteAcademyCoursesUrl() {
  return `${env.siteUrl.replace(/\/$/, "")}/academy/mes-cours`;
}

function getAbsoluteAcademyDashboardUrl() {
  return `${env.siteUrl.replace(/\/$/, "")}/academy/dashboard`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#52614f;font-size:14px;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#1f2a1f;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(value)}</td>
  </tr>`;
}

function actionButton(href: string, label: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0;">
    <tr>
      <td style="border-radius:12px;background:#1f4d2b;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 18px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function buildAcademyCertificateEmail(params: {
  studentName: string;
  courseTitle: string;
  certificateId: string;
  issuedDate: string;
  certificateUrl: string;
  verificationUrl: string | null;
}) {
  const {
    studentName,
    courseTitle,
    certificateId,
    issuedDate,
    certificateUrl,
    verificationUrl,
  } = params;
  const verificationHtml = verificationUrl
    ? `<p style="margin:0 0 16px;color:#52614f;font-size:14px;">Lien de vérification publique : <a href="${escapeHtml(verificationUrl)}" style="color:#1f4d2b;font-weight:700;">${escapeHtml(verificationUrl)}</a></p>`
    : "";
  const verificationText = verificationUrl
    ? `\nLien de vérification publique : ${verificationUrl}\n`
    : "";

  const html = baseEmailTemplate({
    title: "Votre certificat est disponible — Agri-tech Academy",
    previewText: `Votre certificat pour la formation « ${courseTitle} » est maintenant disponible.`,
    replyTo: getAcademyReplyToEmail(),
    contentHtml: `
      <p style="margin:0 0 16px;">Bonjour ${escapeHtml(studentName)},</p>
      <p style="margin:0 0 16px;">Votre certificat pour la formation « <strong>${escapeHtml(courseTitle)}</strong> » est maintenant disponible.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #e2e8d8;border-bottom:1px solid #e2e8d8;">
        ${detailRow("Numéro du certificat", certificateId)}
        ${detailRow("Date de délivrance", issuedDate)}
        ${detailRow("Formation", courseTitle)}
      </table>
      <p style="margin:0 0 16px;">Vous pouvez le consulter et l’enregistrer en PDF depuis votre espace étudiant.</p>
      ${actionButton(certificateUrl, "Voir mon certificat")}
      ${verificationHtml}
      <p style="margin:0;">Cordialement,<br />L’équipe Agri-tech Academy</p>
    `,
  });

  return {
    subject: "Votre certificat est disponible — Agri-tech Academy",
    text: `Bonjour ${studentName},\n\nVotre certificat pour la formation « ${courseTitle} » est maintenant disponible.\n\nNuméro du certificat : ${certificateId}\nDate de délivrance : ${issuedDate}\n\nVous pouvez le consulter et l’enregistrer en PDF depuis votre espace étudiant.\n\nVoir mon certificat :\n${certificateUrl}\n${verificationText}\nCordialement,\nL’équipe Agri-tech Academy`,
    html,
  };
}

async function markCertificateEmailSent(certificateRowId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("academy_certificates")
    .update({ certificate_email_sent_at: new Date().toISOString() })
    .eq("id", certificateRowId)
    .is("certificate_email_sent_at", null);

  const success = !error;
  console.info("[academy-certificate-email] marker update success/failure", {
    success,
    error: error?.message,
  });
  return success;
}

export async function sendAcademyCertificateEmail(certificateId: string) {
  console.info("[academy-certificate-email] started", { certificateId });

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[academy-certificate-email] Supabase admin client missing", {
      certificateId,
    });
    return;
  }

  const { data, error } = await supabase
    .from("academy_certificates")
    .select(
      "id, certificate_id, student_id, course_id, student_full_name, course_title, issued_at, verification_url, certificate_email_sent_at, academy_courses(title)",
    )
    .eq("certificate_id", certificateId)
    .maybeSingle();

  console.info("[academy-certificate-email] certificate found true/false", {
    found: Boolean(data),
    error: error?.message,
  });
  if (error || !data) return;

  const certificate = data as unknown as AcademyCertificateEmailRecord;
  const emailAlreadySent = Boolean(certificate.certificate_email_sent_at);
  console.info(
    "[academy-certificate-email] certificate email already sent true/false",
    { sent: emailAlreadySent },
  );
  if (emailAlreadySent) {
    await recordEmailEvent({
      eventType: "certificate_available",
      relatedEntityType: "academy_certificate",
      relatedEntityId: certificate.id,
      recipientEmail: "unknown@invalid.local",
      recipientName: certificate.student_full_name,
      subject: "Votre certificat est disponible — Agri-tech Academy",
      status: "skipped",
      errorMessage: "certificate_email_sent_at already present",
      metadata: {
        module: "academy",
        certificate_id: certificate.certificate_id,
        course_title: certificate.course_title,
      },
    });
    return;
  }

  console.info("[academy-certificate-email] student found true/false", {
    found: Boolean(certificate.student_id),
  });
  if (!certificate.student_id) {
    await recordEmailEvent({
      eventType: "certificate_available",
      relatedEntityType: "academy_certificate",
      relatedEntityId: certificate.id,
      recipientEmail: "unknown@invalid.local",
      recipientName: certificate.student_full_name,
      subject: "Votre certificat est disponible — Agri-tech Academy",
      status: "skipped",
      errorMessage: "student_id missing",
      metadata: {
        module: "academy",
        certificate_id: certificate.certificate_id,
        course_title: certificate.course_title,
      },
    });
    return;
  }

  const [{ data: profileData }, { data: userData, error: userError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", certificate.student_id)
        .maybeSingle(),
      supabase.auth.admin.getUserById(certificate.student_id),
    ]);

  const studentEmail = userData.user?.email?.trim().toLowerCase() || null;
  const studentName =
    certificate.student_full_name?.trim() ||
    (profileData?.full_name as string | null | undefined)?.trim() ||
    userData.user?.user_metadata?.full_name?.trim() ||
    "Étudiant";
  const courseTitle =
    certificate.course_title?.trim() ||
    certificate.academy_courses?.title?.trim() ||
    "Formation Academy";
  const issuedDate = formatCertificateIssuedDate(certificate.issued_at);
  const replyToEmail = getAcademyReplyToEmail();
  const certificateUrl = getAbsoluteAcademyCertificateUrl(
    certificate.certificate_id,
  );
  const verificationUrl = getAbsoluteCertificateVerificationUrl(
    certificate.certificate_id,
    certificate.verification_url,
  );

  console.info("[academy-certificate-email] student found true/false", {
    found: Boolean(userData.user),
    userError: userError?.message,
  });
  console.info("[academy-certificate-email] student email present true/false", {
    present: isValidEmail(studentEmail),
  });
  console.info("[academy-certificate-email] course title present true/false", {
    present: Boolean(courseTitle),
  });
  console.info("[academy-certificate-email] reply-to used", { replyToEmail });
  console.info(
    "[academy-certificate-email] certificate URL generated true/false",
    { generated: Boolean(certificateUrl) },
  );
  console.info(
    "[academy-certificate-email] verification URL generated true/false",
    { generated: Boolean(verificationUrl) },
  );

  if (!userData.user || !isValidEmail(studentEmail)) {
    await recordEmailEvent({
      eventType: "certificate_available",
      relatedEntityType: "academy_certificate",
      relatedEntityId: certificate.id,
      recipientEmail: studentEmail || "unknown@invalid.local",
      recipientName: studentName,
      subject: "Votre certificat est disponible — Agri-tech Academy",
      status: "skipped",
      errorMessage: "student user or email missing",
      metadata: {
        module: "academy",
        certificate_id: certificate.certificate_id,
        course_title: courseTitle,
      },
    });
    return;
  }

  console.info("[academy-certificate-email] sending certificate email", {
    certificateId: certificate.certificate_id,
  });
  const email = buildAcademyCertificateEmail({
    studentName,
    courseTitle,
    certificateId: certificate.certificate_id,
    issuedDate,
    certificateUrl,
    verificationUrl,
  });
  const result = await sendTransactionalEmail({
    to: { email: studentEmail!, name: studentName },
    subject: email.subject,
    html: email.html,
    text: email.text,
    replyTo: { email: replyToEmail, name: "Agri-tech Academy" },
    emailEvent: {
      eventType: "certificate_available",
      relatedEntityType: "academy_certificate",
      relatedEntityId: certificate.id,
      recipientName: studentName,
      metadata: {
        module: "academy",
        certificate_id: certificate.certificate_id,
        course_title: courseTitle,
      },
    },
  });

  if (result.ok) {
    console.info("[academy-certificate-email] Brevo success/messageId", {
      messageId: result.messageId,
    });
    await markCertificateEmailSent(certificate.id);
  } else {
    console.error(
      "[academy-certificate-email] Brevo error status/code/message",
      {
        reason: result.reason,
        status: result.status,
        code: result.code,
        message: result.message,
      },
    );
  }
}

function buildAcademyWelcomeEmail(studentName: string) {
  const dashboardUrl = getAbsoluteAcademyDashboardUrl();
  const html = baseEmailTemplate({
    title: "Bienvenue sur Agri-tech Academy",
    previewText: "Votre compte étudiant Agri-tech Academy est prêt.",
    replyTo: getAcademyReplyToEmail(),
    contentHtml: `
      <p style="margin:0 0 16px;">Bonjour ${escapeHtml(studentName)},</p>
      <p style="margin:0 0 16px;">Votre compte Agri-tech Academy a été créé. Si une vérification par email est requise, veuillez confirmer votre adresse afin d’accéder pleinement à votre espace étudiant.</p>
      <p style="margin:0 0 16px;">Vous pouvez maintenant accéder à votre espace étudiant, consulter les formations disponibles et choisir celles qui correspondent à vos objectifs.</p>
      ${actionButton(dashboardUrl, "Accéder à mon espace Academy")}
      <p style="margin:0;">Cordialement,<br />L’équipe Agri-tech Academy</p>
    `,
  });

  return {
    subject: "Bienvenue sur Agri-tech Academy",
    text: `Bonjour ${studentName},\n\nVotre compte Agri-tech Academy a été créé. Si une vérification par email est requise, veuillez confirmer votre adresse afin d’accéder pleinement à votre espace étudiant.\n\nVous pouvez maintenant accéder à votre espace étudiant, consulter les formations disponibles et choisir celles qui correspondent à vos objectifs.\n\nAccéder à mon espace Academy :\n${dashboardUrl}\n\nCordialement,\nL’équipe Agri-tech Academy`,
    html,
  };
}

async function markWelcomeEmailSent(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", userId)
    .is("welcome_email_sent_at", null);

  const success = !error;
  console.info("[academy-welcome-email] marker update success/failure", {
    success,
    error: error?.message,
  });
  return success;
}

export async function sendAcademyWelcomeEmail(userId: string) {
  console.info("[academy-welcome-email] started", { userId });

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[academy-welcome-email] Supabase admin client missing", {
      userId,
    });
    return;
  }

  const [
    { data: profileData, error: profileError },
    { data: userData, error: userError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, welcome_email_sent_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase.auth.admin.getUserById(userId),
  ]);

  const profile = profileData as AcademyWelcomeProfile | null;
  const studentEmail = userData.user?.email?.trim().toLowerCase() || null;
  const studentName =
    profile?.full_name?.trim() ||
    userData.user?.user_metadata?.full_name?.trim() ||
    "Étudiant";
  const welcomeEmailAlreadySent = Boolean(profile?.welcome_email_sent_at);
  const replyToEmail = getAcademyReplyToEmail();

  console.info("[academy-welcome-email] user/profile found true/false", {
    userFound: Boolean(userData.user),
    profileFound: Boolean(profile),
    profileError: profileError?.message,
    userError: userError?.message,
  });
  console.info("[academy-welcome-email] student email present true/false", {
    present: isValidEmail(studentEmail),
  });
  console.info(
    "[academy-welcome-email] welcome_email_sent_at present true/false",
    { present: welcomeEmailAlreadySent },
  );
  console.info("[academy-welcome-email] reply-to used", { replyToEmail });

  if (
    !profile ||
    !userData.user ||
    !isValidEmail(studentEmail) ||
    welcomeEmailAlreadySent
  ) {
    await recordEmailEvent({
      eventType: "academy_welcome",
      relatedEntityType: "profile",
      relatedEntityId: userId,
      recipientEmail: studentEmail || "unknown@invalid.local",
      recipientName: studentName,
      subject: "Bienvenue sur Agri-tech Academy",
      status: "skipped",
      errorMessage: welcomeEmailAlreadySent
        ? "welcome_email_sent_at already present"
        : "student profile/user/email missing",
      metadata: { module: "academy" },
    });
    return;
  }

  console.info("[academy-welcome-email] sending welcome email", { userId });
  const email = buildAcademyWelcomeEmail(studentName);
  const result = await sendTransactionalEmail({
    to: { email: studentEmail!, name: studentName },
    subject: email.subject,
    html: email.html,
    text: email.text,
    replyTo: { email: replyToEmail, name: "Agri-tech Academy" },
    emailEvent: {
      eventType: "academy_welcome",
      relatedEntityType: "profile",
      relatedEntityId: userId,
      recipientName: studentName,
      metadata: { module: "academy" },
    },
  });

  if (result.ok) {
    console.info("[academy-welcome-email] Brevo success/messageId", {
      messageId: result.messageId,
    });
    await markWelcomeEmailSent(userId);
  } else {
    console.error("[academy-welcome-email] Brevo error status/code/message", {
      reason: result.reason,
      status: result.status,
      code: result.code,
      message: result.message,
    });
  }
}

function buildStudentPurchaseEmail(
  payment: AcademyPurchasePayment,
  studentName: string,
  courseTitle: string,
) {
  const amount = formatAmount(payment.amount, payment.currency);
  const myCoursesUrl = getAbsoluteAcademyCoursesUrl();
  const html = baseEmailTemplate({
    title: `Confirmation de votre inscription à la formation « ${courseTitle} »`,
    previewText: `Votre accès à la formation « ${courseTitle} » est activé.`,
    replyTo: getAcademyReplyToEmail(),
    contentHtml: `
      <p style="margin:0 0 16px;">Bonjour ${escapeHtml(studentName)},</p>
      <p style="margin:0 0 16px;">Nous confirmons votre inscription à la formation « <strong>${escapeHtml(courseTitle)}</strong> » sur Agri-tech Academy.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #e2e8d8;border-bottom:1px solid #e2e8d8;">
        ${detailRow("Formation", courseTitle)}
        ${detailRow("Montant", amount)}
        ${detailRow("Statut", "Paiement confirmé")}
      </table>
      <p style="margin:0 0 16px;">Votre accès à la formation est maintenant activé. Vous pouvez retrouver votre cours depuis votre espace étudiant.</p>
      ${actionButton(myCoursesUrl, "Voir mes cours")}
      <p style="margin:0;">Cordialement,<br />L’équipe Agri-tech Academy</p>
    `,
  });

  return {
    subject: `Confirmation de votre inscription à la formation « ${courseTitle} »`,
    text: `Bonjour ${studentName},\n\nNous confirmons votre inscription à la formation « ${courseTitle} » sur Agri-tech Academy.\n\nMontant : ${amount}\nStatut : Paiement confirmé\n\nVotre accès à la formation est maintenant activé. Vous pouvez retrouver votre cours depuis votre espace étudiant.\n\nVoir mes cours :\n${myCoursesUrl}\n\nCordialement,\nL’équipe Agri-tech Academy`,
    html,
  };
}

function buildInternalPurchaseEmail(
  payment: AcademyPurchasePayment,
  studentName: string,
  studentEmail: string,
  courseTitle: string,
) {
  const amount = formatAmount(payment.amount, payment.currency);
  const adminUrl = `${env.siteUrl.replace(/\/$/, "")}/admin/academy/payments`;
  const paidAt = payment.paid_at
    ? new Date(payment.paid_at).toLocaleString("fr-FR")
    : "Non renseignée";
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

  const html = baseEmailTemplate({
    title: `Nouvelle inscription Academy — ${courseTitle}`,
    previewText: `Inscription payée par ${studentName}.`,
    replyTo: getAcademyReplyToEmail(),
    contentHtml: `
      <p style="margin:0 0 16px;">Une nouvelle inscription à une formation Academy a été enregistrée.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #e2e8d8;border-bottom:1px solid #e2e8d8;">
        ${detailRow("Étudiant", studentName)}
        ${detailRow("Email", studentEmail)}
        ${detailRow("Formation", courseTitle)}
        ${detailRow("Montant", amount)}
        ${detailRow("Statut", "Paiement confirmé")}
        ${detailRow("Identifiant paiement", payment.id)}
        ${detailRow("Date de paiement", paidAt)}
        ${detailRow("Mode de paiement", payment.provider)}
      </table>
      <p style="margin:0;"><a href="${escapeHtml(adminUrl)}" style="color:#1f4d2b;font-weight:700;">Voir les paiements Academy</a></p>
    `,
  });

  return {
    subject: `Nouvelle inscription Academy — ${courseTitle}`,
    text: lines.join("\n"),
    html,
  };
}

async function markEmailSent(
  paymentId: string,
  marker: "student_purchase_email_sent_at" | "internal_purchase_email_sent_at",
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("academy_payments")
    .update({ [marker]: new Date().toISOString() })
    .eq("id", paymentId)
    .is(marker, null);

  const success = !error;
  console.info("[academy-email] marker update success/failure", {
    marker,
    success,
    error: error?.message,
  });
  return success;
}

export async function sendAcademyPurchaseEmails({
  paymentId,
  studentEmail,
  studentName,
}: AcademyPurchaseEmailInput) {
  console.info("[academy-email] sendAcademyPurchaseEmails started", {
    paymentId,
  });
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[academy-email] Supabase admin client missing", {
      paymentId,
    });
    return;
  }

  const { data, error } = await supabase
    .from("academy_payments")
    .select("*, academy_courses(title, slug)")
    .eq("id", paymentId)
    .maybeSingle();

  if (error || !data) {
    console.error("[academy-email] payment lookup failed", {
      paymentId,
      error: error?.message,
    });
    return;
  }

  const payment = data as AcademyPurchasePayment;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", payment.student_id)
    .maybeSingle();

  const resolvedStudentEmail =
    studentEmail?.trim().toLowerCase() ||
    payment.profiles?.email?.trim().toLowerCase() ||
    null;
  const resolvedStudentName =
    studentName?.trim() ||
    (profile?.full_name as string | null | undefined)?.trim() ||
    "Étudiant";
  const courseTitle =
    payment.academy_courses?.title?.trim() || "Formation Academy";
  const notificationEmail = getAcademyNotificationEmail();
  const replyToEmail = getAcademyReplyToEmail();
  const shouldSendStudentEmail =
    payment.status === "paid" &&
    !payment.student_purchase_email_sent_at &&
    isValidEmail(resolvedStudentEmail);
  const shouldSendInternalEmail =
    payment.status === "paid" && !payment.internal_purchase_email_sent_at;

  console.info("[academy-email] student email present true/false", {
    present: isValidEmail(resolvedStudentEmail),
  });
  console.info("[academy-email] course title present true/false", {
    present: Boolean(payment.academy_courses?.title),
  });
  console.info("[academy-email] payment status", { status: payment.status });
  console.info("[academy-email] should send student email true/false", {
    shouldSendStudentEmail,
  });
  console.info("[academy-email] should send internal email true/false", {
    shouldSendInternalEmail,
  });
  console.info("[academy-email] notification email used", {
    notificationEmail,
  });
  console.info("[academy-email] reply-to used", { replyToEmail });

  if (!shouldSendStudentEmail) {
    await recordEmailEvent({
      eventType: "academy_purchase_confirmation",
      relatedEntityType: "academy_payment",
      relatedEntityId: paymentId,
      recipientEmail: resolvedStudentEmail || "unknown@invalid.local",
      recipientName: resolvedStudentName,
      subject: `Confirmation de votre inscription à la formation « ${courseTitle} »`,
      status: "skipped",
      errorMessage: payment.student_purchase_email_sent_at
        ? "student_purchase_email_sent_at already present"
        : "payment not paid or student email missing",
      metadata: { module: "academy", course_title: courseTitle },
    });
  }

  if (shouldSendStudentEmail && resolvedStudentEmail) {
    console.info("[academy-email] sending student email", { paymentId });
    const email = buildStudentPurchaseEmail(
      payment,
      resolvedStudentName,
      courseTitle,
    );
    const result = await sendTransactionalEmail({
      to: { email: resolvedStudentEmail, name: resolvedStudentName },
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: { email: replyToEmail, name: "Agri-tech Academy" },
      emailEvent: {
        eventType: "academy_purchase_confirmation",
        relatedEntityType: "academy_payment",
        relatedEntityId: paymentId,
        recipientName: resolvedStudentName,
        metadata: { module: "academy", course_title: courseTitle },
      },
    });

    if (result.ok) {
      console.info("[academy-email] student email Brevo success/messageId", {
        messageId: result.messageId,
      });
      await markEmailSent(paymentId, "student_purchase_email_sent_at");
    } else {
      console.error("[academy-email] student email Brevo error", {
        reason: result.reason,
        status: result.status,
        code: result.code,
        message: result.message,
      });
    }
  }

  if (!shouldSendInternalEmail) {
    await recordEmailEvent({
      eventType: "academy_internal_purchase_notification",
      relatedEntityType: "academy_payment",
      relatedEntityId: paymentId,
      recipientEmail: notificationEmail,
      recipientName: "Agri-tech Academy",
      subject: `Nouvelle inscription Academy — ${courseTitle}`,
      status: "skipped",
      errorMessage: payment.internal_purchase_email_sent_at
        ? "internal_purchase_email_sent_at already present"
        : "payment not paid",
      metadata: { module: "academy", course_title: courseTitle },
    });
  }

  if (shouldSendInternalEmail) {
    console.info("[academy-email] sending internal email", { paymentId });
    const email = buildInternalPurchaseEmail(
      payment,
      resolvedStudentName,
      resolvedStudentEmail || "Email étudiant non disponible",
      courseTitle,
    );
    const result = await sendTransactionalEmail({
      to: { email: notificationEmail, name: "Agri-tech Academy" },
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: { email: replyToEmail, name: "Agri-tech Academy" },
      emailEvent: {
        eventType: "academy_internal_purchase_notification",
        relatedEntityType: "academy_payment",
        relatedEntityId: paymentId,
        recipientName: "Agri-tech Academy",
        metadata: { module: "academy", course_title: courseTitle },
      },
    });

    if (result.ok) {
      console.info("[academy-email] internal email Brevo success/messageId", {
        messageId: result.messageId,
      });
      await markEmailSent(paymentId, "internal_purchase_email_sent_at");
    } else {
      console.error("[academy-email] internal email Brevo error", {
        reason: result.reason,
        status: result.status,
        code: result.code,
        message: result.message,
      });
    }
  }
}
