-- Sachin Enterprises: event / multiple-vehicle billing migration
-- Run this in Supabase SQL Editor after confirming the existing documents table is present.
alter table public.documents
  add column if not exists booking_type text,
  add column if not exists event_name text,
  add column if not exists event_contact_person text,
  add column if not exists event_start_date date,
  add column if not exists event_end_date date,
  add column if not exists common_schedule jsonb not null default '{}'::jsonb,
  add column if not exists vehicle_allocations jsonb not null default '[]'::jsonb;

-- These columns are additional metadata. Existing invoice / quotation rows are preserved.
