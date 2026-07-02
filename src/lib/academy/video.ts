export type VideoProvider = "youtube" | "vimeo" | "cloudflare_stream" | "mp4" | "external";

export type VideoEmbed = {
  provider: VideoProvider;
  embedUrl: string | null;
  uid?: string | null;
};

function extractIframeSrc(value: string) {
  const match = value.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match?.[1]?.trim() ?? value.trim();
}

export function normalizeVideoUrl(value?: string | null) {
  if (!value) return null;
  const candidate = extractIframeSrc(value);
  try {
    return new URL(candidate).toString();
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(parsed: URL) {
  const host = parsed.hostname.replace(/^www\./, "");
  const id = host === "youtu.be"
    ? parsed.pathname.split("/").filter(Boolean)[0]
    : parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/")
      ? parsed.pathname.split("/").filter(Boolean)[1]
      : parsed.searchParams.get("v");

  return id && (host.includes("youtube.com") || host === "youtu.be")
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
    : null;
}

function getVimeoEmbedUrl(parsed: URL) {
  const host = parsed.hostname.replace(/^www\./, "");
  if (!host.includes("vimeo.com")) return null;
  const parts = parsed.pathname.split("/").filter(Boolean);
  const id = parts.find((part) => /^\d+$/.test(part));
  return id ? `https://player.vimeo.com/video/${id}` : null;
}

export function extractCloudflareStreamUid(value?: string | null) {
  const normalized = normalizeVideoUrl(value);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const isCloudflareStream = host.includes("cloudflarestream.com") || host === "iframe.videodelivery.net" || host.endsWith(".videodelivery.net");
    if (!isCloudflareStream) return null;
    return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  } catch {
    return null;
  }
}

export function getCloudflareEmbedUrl(videoUid: string, customerCode?: string | null) {
  const uid = videoUid.trim();
  if (!uid) return null;
  const customer = customerCode?.trim();
  return customer
    ? `https://${customer}.cloudflarestream.com/${encodeURIComponent(uid)}/iframe`
    : `https://iframe.videodelivery.net/${encodeURIComponent(uid)}`;
}

function getCloudflareStreamEmbedUrl(parsed: URL) {
  const uid = extractCloudflareStreamUid(parsed.toString());
  if (!uid) return null;

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "iframe.videodelivery.net" || host.endsWith(".videodelivery.net")) {
    return parsed.toString();
  }

  return `${parsed.origin}/${uid}/iframe${parsed.search}`;
}

export function getVideoEmbed(value?: string | null): VideoEmbed {
  const normalized = normalizeVideoUrl(value);
  if (!normalized) return { provider: "external", embedUrl: null };

  try {
    const parsed = new URL(normalized);
    const cloudflare = getCloudflareStreamEmbedUrl(parsed);
    if (cloudflare) return { provider: "cloudflare_stream", embedUrl: cloudflare, uid: extractCloudflareStreamUid(normalized) };

    const youtube = getYouTubeEmbedUrl(parsed);
    if (youtube) return { provider: "youtube", embedUrl: youtube };

    const vimeo = getVimeoEmbedUrl(parsed);
    if (vimeo) return { provider: "vimeo", embedUrl: vimeo };

    if (parsed.pathname.toLowerCase().endsWith(".mp4")) {
      return { provider: "mp4", embedUrl: normalized };
    }
  } catch {
    return { provider: "external", embedUrl: null };
  }

  return { provider: "external", embedUrl: null };
}

export function getVideoProvider(value?: string | null): VideoProvider {
  return getVideoEmbed(value).provider;
}
