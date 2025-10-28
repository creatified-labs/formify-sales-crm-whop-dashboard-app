export interface Form {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string | null;
  deposit_required: boolean;
  deposit_amount?: number | null;
  checkout_url?: string | null;
  branding?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  form_id: string;
  label: string;
  field_type: string;
  placeholder?: string | null;
  required: boolean;
  options?: any;
  order_index: number;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  submission_data: any;
  submitted_at: string;
  status: string;
  notes?: string | null;
  converted: boolean;
}
