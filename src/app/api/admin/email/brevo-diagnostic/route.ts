import { NextResponse } from "next/server";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { sendBrevoDiagnosticEmail } from "@/lib/email/brevo";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && emailPattern.test(value.trim());
}

export async function POST(request: Request) {
  await requireAuthorizedAdmin();

  const body = (await request.json().catch(() => ({}))) as {
    recipient?: unknown;
  };

  if (!isValidEmail(body.recipient)) {
    return NextResponse.json(
      { ok: false, message: "Recipient email is required." },
      { status: 400 },
    );
  }

  console.info("[brevo-test] started", {
    recipientPresent: true,
    recipientValid: true,
    processedAt: new Date().toISOString(),
  });

  try {
    const result = await sendBrevoDiagnosticEmail(body.recipient.trim());

    console.info("[brevo-test] success", {
      status: result.status,
      messageId: result.messageId,
    });

    return NextResponse.json({
      ok: true,
      status: result.status,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[brevo-test] failed", {
      message:
        error instanceof Error ? error.message : "Unknown Brevo test error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Unknown Brevo test error",
      },
      { status: 502 },
    );
  }
}
