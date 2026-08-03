import { NextResponse } from "next/server";

import { subscribeToNewsletter } from "@/lib/newsletter/subscribeToNewsletter";

const maxPayloadBytes = 4_096;
const serverErrorMessage = "Une erreur est survenue. Veuillez réessayer plus tard.";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxPayloadBytes) {
    return NextResponse.json(
      { ok: false, message: serverErrorMessage },
      { status: 413 },
    );
  }

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > maxPayloadBytes) {
      return NextResponse.json(
        { ok: false, message: serverErrorMessage },
        { status: 413 },
      );
    }
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid payload");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, message: serverErrorMessage },
      { status: 400 },
    );
  }

  const result = await subscribeToNewsletter({
    email: body.email,
    website: body.website,
    locale: body.locale,
    pagePath: body.pagePath,
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.invalid ? 400 : 500,
  });
}
