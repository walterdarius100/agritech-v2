import "server-only";

import { hasBrevoApiKey, sendBrevoTransactionalEmail } from "@/lib/email/brevo";
import type {
  EmailRecipient,
  SendTransactionalEmailInput,
  SendTransactionalEmailResult,
} from "@/lib/email/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeRecipient(recipient: EmailRecipient): EmailRecipient | null {
  const email = recipient.email.trim().toLowerCase();
  if (!emailPattern.test(email)) return null;

  const name = recipient.name?.trim();
  return name ? { email, name } : { email };
}

function normalizeRecipients(to: SendTransactionalEmailInput["to"]) {
  const recipients = Array.isArray(to) ? to : [to];
  const normalized = recipients
    .map((recipient) => normalizeRecipient(recipient))
    .filter((recipient): recipient is EmailRecipient => Boolean(recipient));

  return normalized.length === recipients.length ? normalized : null;
}

function getEmailConfiguration() {
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "Agri-tech";
  const fromAddress = process.env.EMAIL_FROM_ADDRESS?.trim();
  const defaultReplyTo = process.env.EMAIL_REPLY_TO?.trim();

  if (!fromAddress || !emailPattern.test(fromAddress)) {
    return null;
  }

  return {
    sender: { email: fromAddress, name: fromName },
    replyTo:
      defaultReplyTo && emailPattern.test(defaultReplyTo)
        ? { email: defaultReplyTo, name: fromName }
        : undefined,
  };
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendTransactionalEmailInput): Promise<SendTransactionalEmailResult> {
  const recipients = normalizeRecipients(to);
  if (!recipients) {
    return {
      ok: false,
      reason: "invalid_recipient",
      message: "At least one email recipient is invalid.",
    };
  }

  const configuration = getEmailConfiguration();
  if (!configuration) {
    console.info("[Email] Transactional email skipped: sender configuration is missing.", {
      recipientCount: recipients.length,
      subject,
    });

    return {
      ok: false,
      skipped: true,
      reason: "missing_configuration",
      message: "Email sender configuration is missing.",
    };
  }

  if (!hasBrevoApiKey()) {
    console.info("[Email] Transactional email skipped: BREVO_API_KEY is not configured.", {
      recipientCount: recipients.length,
      subject,
    });

    return {
      ok: false,
      skipped: true,
      reason: "missing_configuration",
      message: "Brevo API key is missing.",
    };
  }

  try {
    const explicitReplyTo = replyTo ? normalizeRecipient(replyTo) : null;
    const result = await sendBrevoTransactionalEmail({
      sender: configuration.sender,
      to: recipients,
      subject,
      htmlContent: html,
      textContent: text,
      replyTo: explicitReplyTo ?? configuration.replyTo,
    });

    return {
      ok: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("[Email] Brevo transactional email failed", {
      recipientCount: recipients.length,
      subject,
      message: error instanceof Error ? error.message : "Unknown email error",
    });

    return {
      ok: false,
      reason: "brevo_error",
      message: "Brevo transactional email failed.",
    };
  }
}
