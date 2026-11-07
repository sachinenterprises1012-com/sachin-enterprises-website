-- Sachin Enterprises billing module upgrade (run once in Supabase SQL Editor)
-- Adds Vyapar-style document fields while preserving existing saved documents.
alter table public.documents
  add column if not exists document_date date,
  add column if not exists due_date date,
  add column if not exists customer_address text,
  add column if not exists journey_date date,
  add column if not exists vehicle text,
  add column if not exists subtotal numeric(12,2) not null default 0,
  add column if not exists discount_amount numeric(12,2) not null default 0,
  add column if not exists gst_rate numeric(5,2) not null default 0,
  add column if not exists gst_amount numeric(12,2) not null default 0,
  add column if not exists advance_amount numeric(12,2) not null default 0,
  add column if not exists balance_amount numeric(12,2) not null default 0,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists notes text;

-- Remove the old public insert permission and permit only the signed-in business admin.
drop policy if exists "Anyone can save documents" on public.documents;
drop policy if exists "Only Sachin admin can save documents" on public.documents;
create policy "Only Sachin admin can save documents"
on public.documents for insert to authenticated
with check ((auth.jwt() ->> 'email') = 'sachinenterprises1012@gmail.com');

drop policy if exists "Admin can read documents" on public.documents;
create policy "Admin can read documents"
on public.documents for select to authenticated
using ((auth.jwt() ->> 'email') = 'sachinenterprises1012@gmail.com');

drop policy if exists "Admin can update documents" on public.documents;
create policy "Admin can update documents"
on public.documents for update to authenticated
using ((auth.jwt() ->> 'email') = 'sachinenterprises1012@gmail.com')
with check ((auth.jwt() ->> 'email') = 'sachinenterprises1012@gmail.com');
