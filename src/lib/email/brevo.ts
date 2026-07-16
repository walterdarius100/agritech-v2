import "server-only";

import type { BrevoSendEmailPayload } from "@/lib/email/types";

const brevoTransactionalEmailUrl = "https://api.brevo.com/v3/smtp/email";

type BrevoApiResponse = {
  messageId?: string;
  code?: string;
  message?: string;
};

export class BrevoTransactionalEmailError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "BrevoTransactionalEmailError";
  }
}

export function hasBrevoApiKey() {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

export async function sendBrevoTransactionalEmail(payload: BrevoSendEmailPayload) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured.");
  }

  const response = await fetch(brevoTransactionalEmailUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as BrevoApiResponse;

  if (!response.ok) {
    throw new BrevoTransactionalEmailError(
      data.message ||
        `Brevo transactional email request failed with status ${response.status}.`,
      response.status,
      data.code,
    );
  }

  return {
    messageId: data.messageId,
  };
}
