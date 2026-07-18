import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const emailsSource = readFileSync("src/lib/consultation/emails.ts", "utf8");
const checkoutSource = readFileSync("src/lib/consultation/checkout.ts", "utf8");
const brevoSource = readFileSync("src/lib/email/brevo.ts", "utf8");
const sendEmailSource = readFileSync("src/lib/email/send-email.ts", "utf8");
const migrationSource = readFileSync(
  "supabase/migrations/20260718_add_consultation_email_delivery_audit.sql",
  "utf8",
);

test("paiement confirmé: le checkout attend le workflow email après statut paid", () => {
  assert.match(checkoutSource, /payment_status:\s*confirmedPayment\.status/);
  assert.match(checkoutSource, /request_status:\s*"paid"/);
  assert.match(checkoutSource, /paid_at:\s*paidAt/);
  assert.match(
    checkoutSource,
    /await sendConsultationPaidEmails\(supabase, requestId\)/,
  );
});

test("paiement non confirmé: le workflow email s'arrête avant Brevo", () => {
  assert.match(emailsSource, /function isPaidContext/);
  assert.match(emailsSource, /request\.payment_status === "paid"/);
  assert.match(emailsSource, /request\.request_status === "paid"/);
  assert.match(emailsSource, /payment\?\.status === "paid"/);
  assert.match(emailsSource, /skipped_not_paid/);
});

test("échec interne ou client: chaque email est traité indépendamment", () => {
  const clientFailureIndex = emailsSource.indexOf("client email Brevo error");
  const internalSendIndex = emailsSource.indexOf(
    "[consultation-email] sending internal email",
  );
  assert.ok(clientFailureIndex > -1);
  assert.ok(internalSendIndex > clientFailureIndex);
  assert.match(
    emailsSource,
    /recordEmailFailure\(\{[\s\S]*emailKind: "client"/,
  );
  assert.match(
    emailsSource,
    /recordEmailFailure\(\{[\s\S]*emailKind: "internal"/,
  );
});

test("adresse client absente ou invalide: aucun marqueur de succès artificiel", () => {
  assert.match(emailsSource, /skipped_no_email/);
  assert.match(emailsSource, /skipped_invalid_email/);
  assert.doesNotMatch(
    emailsSource,
    /client_email_sent_at[\s\S]{0,120}skipped_no_email/,
  );
});

test("configuration Brevo absente: erreur explicite et pas d'appel silencieux", () => {
  assert.match(
    sendEmailSource,
    /Missing required email configuration: BREVO_API_KEY/,
  );
  assert.match(
    sendEmailSource,
    /Missing required email configuration: EMAIL_FROM_ADDRESS/,
  );
  assert.match(
    emailsSource,
    /Missing required email configuration: CONSULTATION_NOTIFICATION_EMAIL/,
  );
});

test("réponse Brevo: le succès exige HTTP ok et messageId", () => {
  assert.match(brevoSource, /if \(!response\.ok\)/);
  assert.match(brevoSource, /if \(!data\.messageId\)/);
  assert.match(sendEmailSource, /status: result\.status/);
  assert.match(sendEmailSource, /messageId: result\.messageId/);
});

test("erreurs Supabase: les requêtes critiques inspectent error", () => {
  assert.match(emailsSource, /if \(requestError\)/);
  assert.match(emailsSource, /if \(paymentError\)/);
  assert.match(emailsSource, /if \(error\)[\s\S]*Supabase email claim failed/);
  assert.match(emailsSource, /Supabase email marker update failed/);
});

test("idempotence et webhook rejoué: marqueurs sent et verrous processing empêchent les doublons", () => {
  assert.match(emailsSource, /client_email_sent_at/);
  assert.match(emailsSource, /internal_email_sent_at/);
  assert.match(emailsSource, /client_email_processing_at/);
  assert.match(emailsSource, /internal_email_processing_at/);
  assert.match(emailsSource, /skipped_already_sent/);
  assert.match(emailsSource, /skipped_locked/);
});

test("migration: audit de livraison et relance des emails échoués", () => {
  assert.match(migrationSource, /client_email_message_id/);
  assert.match(migrationSource, /internal_email_message_id/);
  assert.match(migrationSource, /email_last_error/);
  assert.match(migrationSource, /email_last_attempt_at/);
  assert.match(migrationSource, /client_email_processing_at/);
  assert.match(migrationSource, /internal_email_processing_at/);
});
