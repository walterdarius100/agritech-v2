import { createSign } from "crypto";
import { NextResponse } from "next/server";

import { getCurrentStudentUser } from "@/lib/academy/auth";
import { enrollmentGrantsAccess } from "@/lib/academy/enrollments";
import { extractCloudflareStreamUid, getCloudflareEmbedUrl } from "@/lib/academy/video";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyEnrollment, AcademyLesson } from "@/types/academy";

const TOKEN_TTL_SECONDS = 60 * 20;

function getUnsafeFallbackEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_UNSECURE_VIDEO_FALLBACK === "true" || process.env.NODE_ENV !== "production";
}

function getPrivateKey(secret: string) {
  const normalized = secret.includes("BEGIN PRIVATE KEY")
    ? secret.replace(/\\n/g, "\n")
    : Buffer.from(secret, "base64").toString("utf8");
  return normalized;
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getSignedCloudflareEmbedUrl(videoUid: string) {
  const keyId = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;
  const keySecret = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_SECRET;
  const customerCode = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE;

  if (!keyId || !keySecret) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", kid: keyId }));
  const payload = base64Url(JSON.stringify({ sub: videoUid, kid: keyId, nbf: now - 10, exp: now + TOKEN_TTL_SECONDS, downloadable: false }));
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(getPrivateKey(keySecret));
  const token = `${unsignedToken}.${base64Url(signature)}`;

  return customerCode
    ? `https://${customerCode}.cloudflarestream.com/${token}/iframe`
    : `https://iframe.videodelivery.net/${token}`;
}

export async function GET(request: Request) {
  const user = await getCurrentStudentUser();
  if (!user) return NextResponse.json({ ok: false, message: "Authentification requise." }, { status: 401 });

  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ ok: false, message: "Leçon requise." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: false, message: "Configuration Supabase manquante." }, { status: 500 });

  const { data: lesson } = await supabase.from("academy_lessons").select("*").eq("id", lessonId).maybeSingle();
  if (!lesson) return NextResponse.json({ ok: false, message: "Leçon introuvable." }, { status: 404 });

  const typedLesson = lesson as AcademyLesson;
  const { data: enrollment } = await supabase
    .from("academy_enrollments")
    .select("*")
    .eq("student_id", user.id)
    .eq("course_id", typedLesson.course_id)
    .maybeSingle();

  if (!enrollment || !enrollmentGrantsAccess(enrollment as AcademyEnrollment)) {
    return NextResponse.json({ ok: false, message: "Accès non autorisé." }, { status: 403 });
  }

  const videoUid = typedLesson.video_uid ?? extractCloudflareStreamUid(typedLesson.video_embed_url ?? typedLesson.video_url);
  if (!videoUid) return NextResponse.json({ ok: false, message: "Vidéo Cloudflare introuvable." }, { status: 404 });

  const signedEmbedUrl = await getSignedCloudflareEmbedUrl(videoUid).catch((error: unknown) => {
    console.error("Unable to sign Cloudflare Stream URL", error);
    return null;
  });

  if (signedEmbedUrl) return NextResponse.json({ ok: true, embedUrl: signedEmbedUrl, signed: true });

  if (!getUnsafeFallbackEnabled()) {
    return NextResponse.json({ ok: false, message: "Lecture sécurisée non configurée." }, { status: 503 });
  }

  const fallbackUrl = typedLesson.video_embed_url ?? typedLesson.video_url ?? getCloudflareEmbedUrl(videoUid, process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE);
  return NextResponse.json({ ok: true, embedUrl: fallbackUrl, signed: false });
}
