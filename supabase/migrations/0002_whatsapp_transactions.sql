-- Rafli Life Tracker — WhatsApp-originated transactions
-- =============================================================
-- Additive only. Adds columns needed to distinguish transactions
-- created via the WhatsApp webhook from manually-entered ones, and
-- to make webhook inserts idempotent against Meta's at-least-once
-- delivery retries.

alter table public.transactions
  add column if not exists source text not null default 'manual';

alter table public.transactions
  add column if not exists raw_message text;

alter table public.transactions
  add column if not exists wa_message_id text;

create unique index if not exists tx_wa_message_id_idx
  on public.transactions(wa_message_id)
  where wa_message_id is not null;
