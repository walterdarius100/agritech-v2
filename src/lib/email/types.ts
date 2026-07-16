import "server-only";

export type EmailRecipient = {
  email: string;
  name?: string | null;
};

export type SendTransactionalEmailInput = {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: EmailRecipient | null;
};

export type SendTransactionalEmailResult =
  | {
      ok: true;
      messageId?: string;
      skipped?: false;
    }
  | {
      ok: false;
      skipped?: boolean;
      reason:
        | "missing_configuration"
        | "invalid_recipient"
        | "brevo_error"
        | "unexpected_error";
      message: string;
      status?: number;
      code?: string;
    };

export type BrevoSendEmailPayload = {
  sender: EmailRecipient;
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: EmailRecipient;
};
