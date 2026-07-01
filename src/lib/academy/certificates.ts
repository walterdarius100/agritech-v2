import { randomBytes } from "crypto";
export function generateCertificateId(date = new Date()) { return `AGRITECH-CERT-${date.getUTCFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`; }
export function getCertificateVerificationUrl(certificateId: string) { const base = process.env.NEXT_PUBLIC_SITE_URL || "https://agritech509ht.com"; return `${base.replace(/\/$/, "")}/certificats/verifier/${encodeURIComponent(certificateId)}`; }
