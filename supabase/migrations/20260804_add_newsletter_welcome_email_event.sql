alter table public.email_events
  drop constraint if exists email_events_type_check;

alter table public.email_events
  add constraint email_events_type_check check (event_type in (
    'consultation_client_confirmation',
    'consultation_internal_notification',
    'contact_visitor_acknowledgement',
    'contact_internal_notification',
    'academy_welcome',
    'academy_purchase_confirmation',
    'academy_internal_purchase_notification',
    'certificate_available',
    'newsletter_welcome'
  ));
