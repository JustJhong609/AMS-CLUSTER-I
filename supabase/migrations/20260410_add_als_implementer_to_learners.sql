-- Add ALS implementer field for learner records
ALTER TABLE IF EXISTS public.learners
ADD COLUMN IF NOT EXISTS als_implementer TEXT;

COMMENT ON COLUMN public.learners.als_implementer IS 'Name of ALS implementer associated with learner mapping.';
