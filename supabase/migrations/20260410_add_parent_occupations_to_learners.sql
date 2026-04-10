-- Add father/mother occupation fields to learner records
ALTER TABLE IF EXISTS public.learners
ADD COLUMN IF NOT EXISTS father_occupation TEXT,
ADD COLUMN IF NOT EXISTS mother_occupation TEXT;

COMMENT ON COLUMN public.learners.father_occupation IS 'Father occupation for learner household profile.';
COMMENT ON COLUMN public.learners.mother_occupation IS 'Mother occupation for learner household profile.';
