CREATE TABLE public.mock_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  unit_title TEXT,
  paper JSONB NOT NULL DEFAULT '{}'::jsonb,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  grades JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_awarded INTEGER,
  total_available INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_exams TO authenticated;
GRANT ALL ON public.mock_exams TO service_role;

ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own mock exams all"
ON public.mock_exams
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER mock_exams_touch
BEFORE UPDATE ON public.mock_exams
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_mock_exams_user_created ON public.mock_exams(user_id, created_at DESC);