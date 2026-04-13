-- Add new Reason for Not Attending values to the existing enum in Supabase.
-- Safe to run multiple times and only applies if the enum exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'reason_not_attending_enum'
  ) THEN
    ALTER TYPE public.reason_not_attending_enum ADD VALUE IF NOT EXISTS 'JHS Completer';
    ALTER TYPE public.reason_not_attending_enum ADD VALUE IF NOT EXISTS 'SHS Graduate';
    ALTER TYPE public.reason_not_attending_enum ADD VALUE IF NOT EXISTS 'College Graduate';
  END IF;
END $$;