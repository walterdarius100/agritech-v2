import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendNewsletterWelcomeEmail } from "@/lib/newsletter/emails";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const successMessage = "Merci pour votre inscription à la newsletter Agri-tech.";
const alreadySubscribedMessage = "Merci, votre inscription est déjà prise en compte.";
const serverErrorMessage = "Une erreur est survenue. Veuillez réessayer plus tard.";

const limits = {
  email: 254,
  locale: 35,
  pagePath: 500,
  userAgent: 500,
};

type NewsletterInput = {
  email?: unknown;
  website?: unknown;
  locale?: unknown;
  pagePath?: unknown;
  userAgent?: unknown;
};

type NewsletterResult =
  | { ok: true; message: string }
  | { ok: false; message: string; invalid?: boolean };

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function nullable(value: string) {
  return value || null;
}

async function safelySendWelcomeEmail(
  subscriberId: string,
  email: string,
  pagePath: string | null,
) {
  try {
    await sendNewsletterWelcomeEmail({ subscriberId, email, pagePath });
  } catch (error) {
    // Persistence has already succeeded; an email outage must never undo signup.
    console.error("[newsletter-email] Unexpected welcome workflow error", {
      subscriberId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function subscribeToNewsletter(
  input: NewsletterInput,
): Promise<NewsletterResult> {
  // Return a normal success response to honeypot submissions without writing them.
  if (clean(input.website, 200)) {
    return { ok: true, message: successMessage };
  }

  const rawEmail = typeof input.email === "string" ? input.email.trim() : "";
  const email = rawEmail.toLowerCase();

  if (
    !email ||
    email.length > limits.email ||
    !emailPattern.test(email)
  ) {
    return {
      ok: false,
      invalid: true,
      message: "Veuillez entrer une adresse email valide.",
    };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[newsletter] Supabase admin configuration is missing");
    return { ok: false, message: serverErrorMessage };
  }

  const locale = clean(input.locale, limits.locale);
  const pagePath = clean(input.pagePath, limits.pagePath);
  const userAgent = clean(input.userAgent, limits.userAgent);
  const { data: existing, error: lookupError } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("[newsletter] Unable to look up subscriber", lookupError.message);
    return { ok: false, message: serverErrorMessage };
  }

  if (existing?.status === "active") {
    return { ok: true, message: alreadySubscribedMessage };
  }

  if (existing && existing.status !== "unsubscribed") {
    return { ok: true, message: alreadySubscribedMessage };
  }

  const now = new Date().toISOString();
  if (existing) {
    const { data: reactivated, error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "active",
        source: "footer",
        locale: nullable(locale),
        page_path: nullable(pagePath),
        user_agent: nullable(userAgent),
        subscribed_at: now,
        unsubscribed_at: null,
        updated_at: now,
      })
      .eq("id", existing.id)
      .eq("status", "unsubscribed")
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[newsletter] Unable to reactivate subscriber", error.message);
      return { ok: false, message: serverErrorMessage };
    }

    if (!reactivated) {
      return { ok: true, message: alreadySubscribedMessage };
    }

    await safelySendWelcomeEmail(
      String(reactivated.id),
      email,
      nullable(pagePath),
    );

    return { ok: true, message: successMessage };
  }

  const { data: subscriber, error } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email,
      source: "footer",
      locale: nullable(locale),
      page_path: nullable(pagePath),
      user_agent: nullable(userAgent),
    })
    .select("id")
    .single();

  // A concurrent request may have inserted the same unique email first.
  if (error?.code === "23505") {
    return { ok: true, message: alreadySubscribedMessage };
  }

  if (error) {
    console.error("[newsletter] Unable to create subscriber", error.message);
    return { ok: false, message: serverErrorMessage };
  }

  await safelySendWelcomeEmail(
    String(subscriber.id),
    email,
    nullable(pagePath),
  );

  return { ok: true, message: successMessage };
}
