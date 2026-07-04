import { NextResponse } from "next/server";
export async function POST() {
  // TODO: validate the official moncash webhook signature and payload after Agri-tech receives the merchant documentation and credentials.
  // This placeholder intentionally does not activate course access without verified provider data.
  return NextResponse.json({ error: "Provider webhook not configured." }, { status: 501 });
}
