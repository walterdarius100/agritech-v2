import "server-only";

import type { BrevoSendEmailPayload } from "@/lib/email/types";

const brevoTransactionalEmailUrl = "https://api.brevo.com/v3/smtp/email";

type BrevoApiResponse = {
  messageId?: string;
  code?: string;
  message?: string;
};

function parseBrevoResponse(rawBody: string): BrevoApiResponse {
  try {
    return rawBody ? (JSON.parse(rawBody) as BrevoApiResponse) : {};
  } catch {
    return { message: rawBody };
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function logRuntimeDiagnostics(functionName: string) {
  console.info("[runtime]", {
    isDeno: "Deno" in globalThis,
    isNode: typeof process !== "undefined",
    functionName,
  });
}

function logSupabaseRuntimeProject() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  let supabaseUrlHost: string | null = null;

  try {
    supabaseUrlHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;
  } catch {
    supabaseUrlHost = "invalid-url";
  }

  console.info("[supabase] Runtime project", {
    supabaseUrlHost,
  });
}

function logBrevoApiKeyDiagnostics(apiKey: string) {
  console.info("[brevo] API key diagnostics", {
    exists: Boolean(apiKey),
    length: apiKey.length,
    prefix: apiKey.slice(0, 7),
    hasLeadingWhitespace: apiKey !== apiKey.trimStart(),
    hasTrailingWhitespace: apiKey !== apiKey.trimEnd(),
    hasWrappingQuotes:
      (apiKey.startsWith('"') && apiKey.endsWith('"')) ||
      (apiKey.startsWith("'") && apiKey.endsWith("'")),
    looksLikeSmtpKey: apiKey.toLowerCase().startsWith("xsmtpsib-"),
  });
}

export class BrevoTransactionalEmailError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly rawBody?: string,
    readonly responseBody?: BrevoApiResponse,
  ) {
    super(message);
    this.name = "BrevoTransactionalEmailError";
  }
}

export function hasBrevoApiKey() {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

export async function sendBrevoTransactionalEmail(
  payload: BrevoSendEmailPayload,
) {
  logRuntimeDiagnostics("sendBrevoTransactionalEmail");
  logSupabaseRuntimeProject();

  const apiKey = getRequiredEnv("BREVO_API_KEY");
  logBrevoApiKeyDiagnostics(apiKey);

  const response = await fetch(brevoTransactionalEmailUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  const data = parseBrevoResponse(rawBody);

  if (!response.ok) {
    console.error("[brevo] Raw response", {
      status: response.status,
      statusText: response.statusText,
      body: rawBody,
    });
    throw new BrevoTransactionalEmailError(
      `Brevo API error ${response.status}: ${rawBody}`,
      response.status,
      data.code,
      rawBody,
      data,
    );
  }

  console.info("[brevo] Raw response", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    body: rawBody,
  });

  if (!data.messageId) {
    throw new BrevoTransactionalEmailError(
      `Brevo API response ${response.status} did not include messageId: ${rawBody}`,
      response.status,
      data.code,
      rawBody,
      data,
    );
  }

  return {
    messageId: data.messageId,
    status: response.status,
    rawBody,
  };
}

export async function sendBrevoDiagnosticEmail(recipient: string) {
  const senderEmail = getRequiredEnv("EMAIL_FROM_ADDRESS");
  const senderName = process.env.EMAIL_FROM_NAME?.trim() || "Agri-tech";

  return sendBrevoTransactionalEmail({
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: recipient }],
    subject: "Test de configuration Brevo",
    htmlContent: "<p>La configuration Brevo fonctionne correctement.</p>",
    textContent: "La configuration Brevo fonctionne correctement.",
  });
}
