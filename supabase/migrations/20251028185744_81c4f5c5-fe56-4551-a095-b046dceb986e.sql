-- Create forms table
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  deposit_required BOOLEAN NOT NULL DEFAULT false,
  deposit_amount NUMERIC(10,2),
  checkout_url TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_fields table
CREATE TABLE public.form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  placeholder TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  options JSONB,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  converted BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Users can view their own forms"
  ON public.forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms"
  ON public.forms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms"
  ON public.forms FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active forms by slug"
  ON public.forms FOR SELECT
  USING (is_active = true);

-- Form fields policies
CREATE POLICY "Users can view fields for their forms"
  ON public.form_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_fields.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create fields for their forms"
  ON public.form_fields FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_fields.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can update fields for their forms"
  ON public.form_fields FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_fields.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete fields for their forms"
  ON public.form_fields FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_fields.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Public can view fields for active forms"
  ON public.form_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_fields.form_id
    AND forms.is_active = true
  ));

-- Form submissions policies
CREATE POLICY "Users can view submissions for their forms"
  ON public.form_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_submissions.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Public can create submissions"
  ON public.form_submissions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_submissions.form_id
    AND forms.is_active = true
  ));

CREATE POLICY "Users can update submissions for their forms"
  ON public.form_submissions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_submissions.form_id
    AND forms.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_forms_slug ON public.forms(slug);
CREATE INDEX idx_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_form_submissions_status ON public.form_submissions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger for forms updated_at
CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();