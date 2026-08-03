import "server-only";

import { getNewsletterReplyTo } from "@/lib/email/config";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import { newsletterWelcomeEmailTemplate } from "@/lib/email/templates/newsletter-welcome";

type SendNewsletterWelcomeEmailInput = {
  subscriberId: string;
  email: string;
  pagePath: string | null;
};

export async function sendNewsletterWelcomeEmail({
  subscriberId,
  email,
  pagePath,
}: SendNewsletterWelcomeEmailInput) {
  const replyTo = getNewsletterReplyTo();
  const template = newsletterWelcomeEmailTemplate(replyTo?.email);
  const result = await sendTransactionalEmail({
    to: { email },
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo,
    emailEvent: {
      eventType: "newsletter_welcome",
      relatedEntityType: "newsletter_subscriber",
      relatedEntityId: subscriberId,
      metadata: {
        module: "newsletter",
        source: "footer",
        page_path: pagePath,
      },
    },
  });

  if (!result.ok) {
    console.error("[newsletter-email] Welcome email was not sent", {
      subscriberId,
      reason: result.reason,
      status: result.status,
      code: result.code,
      skipped: result.skipped ?? false,
    });
  }

  return result;
}
