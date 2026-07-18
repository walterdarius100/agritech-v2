import { NextResponse } from "next/server";

import { createContactRequest } from "@/lib/contact/createContactRequest";

const publicErrorMessage = "Impossible d’envoyer votre demande pour le moment.";

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: publicErrorMessage }, { status: 400 });
  }

  const result = await createContactRequest(body);

  if (result.ok) {
    return NextResponse.json({ ok: true, message: result.message });
  }

  if (result.spam) {
    return NextResponse.json({ ok: true, message: result.message });
  }

  return NextResponse.json(
    { ok: false, message: result.message || publicErrorMessage },
    { status: 400 },
  );
}
