import "server-only";

import type { EmailRecipient } from "@/lib/email/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string | undefined) {
  const email = value?.trim().toLowerCase();
  return email && emailPattern.test(email) ? email : null;
}

export function getConsultationReplyTo(): EmailRecipient | null {
  const email = normalizeEmail(
    process.env.CONSULTATION_REPLY_TO_EMAIL || process.env.EMAIL_REPLY_TO,
  );

  return email ? { email, name: "Agri-tech" } : null;
}

export function getConsultationNotificationRecipient(): EmailRecipient | null {
  const email = normalizeEmail(process.env.CONSULTATION_NOTIFICATION_EMAIL);

  return email ? { email, name: "Agri-tech consultations" } : null;
}
