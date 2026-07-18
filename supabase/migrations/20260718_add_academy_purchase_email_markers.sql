alter table public.academy_payments
  add column if not exists student_purchase_email_sent_at timestamptz,
  add column if not exists internal_purchase_email_sent_at timestamptz;

create index if not exists academy_payments_student_purchase_email_pending_idx
  on public.academy_payments(id)
  where status = 'paid' and student_purchase_email_sent_at is null;

create index if not exists academy_payments_internal_purchase_email_pending_idx
  on public.academy_payments(id)
  where status = 'paid' and internal_purchase_email_sent_at is null;
