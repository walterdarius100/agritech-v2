import { NextResponse } from "next/server";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const bucketName = "article-images";
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxSize = 4 * 1024 * 1024;

function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function safeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function currentStorageFolder() {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}/${month}`;
}

export async function POST(request: Request) {
  await requireAuthorizedAdmin();

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Configuration Supabase admin manquante." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image manquante." }, { status: 400 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Format invalide. Utilisez JPG, PNG ou WebP." },
      { status: 400 },
    );
  }

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "Image trop lourde. Taille maximale : 4 Mo." },
      { status: 400 },
    );
  }

  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeName(file.name) || "image"}.${extensionForType(file.type)}`;
  const path = `covers/${currentStorageFolder()}/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      {
        error:
          "Impossible d’uploader l’image. Vérifiez le bucket article-images.",
      },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl });
}
