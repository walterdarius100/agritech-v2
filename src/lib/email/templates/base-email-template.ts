import "server-only";

type BaseEmailTemplateInput = {
  title: string;
  previewText?: string;
  contentHtml: string;
  replyTo?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function baseEmailTemplate({
  title,
  previewText,
  contentHtml,
  replyTo,
}: BaseEmailTemplateInput) {
  const safeTitle = escapeHtml(title);
  const safePreviewText = previewText ? escapeHtml(previewText) : safeTitle;
  const safeReplyTo = replyTo ? escapeHtml(replyTo) : null;

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;background:#f6f7f4;color:#1f2a1f;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreviewText}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f4;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8d8;">
            <tr>
              <td style="background:#1f4d2b;padding:24px;color:#ffffff;">
                <div style="font-size:22px;font-weight:700;letter-spacing:0.2px;">Agri-tech</div>
                <div style="font-size:14px;margin-top:4px;color:#dbead8;">Solutions agricoles, formations et accompagnement</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;font-size:16px;line-height:1.6;">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#1f4d2b;">${safeTitle}</h1>
                ${contentHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;background:#f0f5ec;color:#52614f;font-size:13px;line-height:1.5;">
                <p style="margin:0 0 8px;">Agri-tech — communication transactionnelle.</p>
                ${safeReplyTo ? `<p style="margin:0;">Vous pouvez répondre à cet email ou contacter ${safeReplyTo}.</p>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
