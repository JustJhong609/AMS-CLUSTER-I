-- Add new Last Grade / Level Completed values to the existing enum in Supabase.
-- This is safe to run multiple times and only applies if the enum exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'grade_level_enum'
  ) THEN
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'Kindergarten';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G1';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G2';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G3';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G4';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G5';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G6';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'Grade 6 Graduate';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G7/1st Year High School';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G8/2nd Year High School';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G9/3rd Year High School';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G10/4th Year High School';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G10 Completer';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G11';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'G12';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'SHS Graduate';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS '1st Year College';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS '2nd Year College';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS '3rd Year College';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS '4th Year College';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS '5th Year College';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'College Graduate';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'Vocational Course Graduate (ex. TESDA etc.)';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'Master''s Degree';
    ALTER TYPE public.grade_level_enum ADD VALUE IF NOT EXISTS 'Doctoral Degree';
  END IF;
END $$;