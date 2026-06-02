CREATE TABLE public.notebook_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notebook_versions_user_unit_idx
  ON public.notebook_versions (user_id, unit_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notebook_versions TO authenticated;
GRANT ALL ON public.notebook_versions TO service_role;

ALTER TABLE public.notebook_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own notebook versions all"
ON public.notebook_versions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);