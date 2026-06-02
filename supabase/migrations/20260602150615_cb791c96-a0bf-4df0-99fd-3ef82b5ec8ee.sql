CREATE TABLE public.answer_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id TEXT,
  unit_title TEXT,
  tariff INTEGER NOT NULL,
  command TEXT,
  question TEXT NOT NULL,
  plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.answer_plans TO authenticated;
GRANT ALL ON public.answer_plans TO service_role;

ALTER TABLE public.answer_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own answer plans all"
ON public.answer_plans
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER answer_plans_touch
BEFORE UPDATE ON public.answer_plans
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();