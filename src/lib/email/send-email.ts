import "server-only";

import {
  BrevoTransactionalEmailError,
  hasBrevoApiKey,
  sendBrevoTransactionalEmail,
} from "@/lib/email/brevo";
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
  console.info("[email-config] BREVO_API_KEY present", hasBrevoApiKey());
  console.info("[email-config] EMAIL_FROM_ADDRESS used", {
    configured: Boolean(process.env.EMAIL_FROM_ADDRESS?.trim()),
  });
  console.info("[email-config] EMAIL_REPLY_TO used", {
    configured: Boolean(process.env.EMAIL_REPLY_TO?.trim()),
  });
  console.info("[email-config] CONSULTATION_REPLY_TO_EMAIL used", {
    configured: Boolean(process.env.CONSULTATION_REPLY_TO_EMAIL?.trim()),
  });
  console.info("[email-config] CONSULTATION_NOTIFICATION_EMAIL used", {
    configured: Boolean(process.env.CONSULTATION_NOTIFICATION_EMAIL?.trim()),
  });
  if (!configuration) {
    console.info(
      "[Email] Transactional email skipped: sender configuration is missing.",
      {
        recipientCount: recipients.length,
        subject,
      },
    );

    return {
      ok: false,
      skipped: true,
      reason: "missing_configuration",
      message:
        "Missing required email configuration: EMAIL_FROM_ADDRESS must be configured with a valid verified Brevo sender address.",
    };
  }

  if (!hasBrevoApiKey()) {
    console.info(
      "[Email] Transactional email skipped: BREVO_API_KEY is not configured.",
      {
        recipientCount: recipients.length,
        subject,
      },
    );

    return {
      ok: false,
      skipped: true,
      reason: "missing_configuration",
      message:
        "Missing required email configuration: BREVO_API_KEY must be configured on the server environment.",
    };
  }

  try {
    const explicitReplyTo = replyTo ? normalizeRecipient(replyTo) : null;
    console.info("[Email] calling Brevo transactional endpoint", {
      recipientCount: recipients.length,
      subject,
      hasTextContent: Boolean(text),
    });
    const result = await sendBrevoTransactionalEmail({
      sender: configuration.sender,
      to: recipients,
      subject,
      htmlContent: html,
      textContent: text,
      replyTo: explicitReplyTo ?? configuration.replyTo,
    });

    console.info("[Email] Brevo transactional endpoint accepted message", {
      recipientCount: recipients.length,
      subject,
      status: result.status,
      messageId: result.messageId,
    });

    return {
      ok: true,
      messageId: result.messageId,
      status: result.status,
    };
  } catch (error) {
    const status =
      error instanceof BrevoTransactionalEmailError ? error.status : undefined;
    const code =
      error instanceof BrevoTransactionalEmailError ? error.code : undefined;
    const message =
      error instanceof Error ? error.message : "Unknown email error";
    const stack = error instanceof Error ? error.stack : undefined;

    console.error("[Email] Brevo transactional email failed", {
      recipientCount: recipients.length,
      subject,
      status,
      code,
      message,
      stack,
    });

    return {
      ok: false,
      reason: "brevo_error",
      status,
      code,
      message,
      stack,
    };
  }
}
