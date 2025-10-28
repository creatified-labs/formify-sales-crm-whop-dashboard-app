import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField } from "@/types/forms";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

interface FormViewerProps {
  slug: string;
}

export const FormViewer = ({ slug }: FormViewerProps) => {
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadForm();
  }, [slug]);

  const loadForm = async () => {
    setLoading(true);
    
    const { data: formData, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (formError || !formData) {
      toast({
        title: "Error",
        description: "Form not found",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: fieldsData } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", formData.id)
      .order("order_index");

    setForm(formData);
    setFields(fieldsData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    const missingFields = fields
      .filter((f) => f.required && !formData[f.id])
      .map((f) => f.label);

    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Convert field IDs to labels for storage
      const submissionData: Record<string, string> = {};
      fields.forEach((field) => {
        if (formData[field.id]) {
          submissionData[field.label] = formData[field.id];
        }
      });

      const { error } = await supabase.from("form_submissions").insert({
        form_id: form.id,
        submission_data: submissionData,
      });

      if (error) throw error;

      if (form.deposit_required && form.checkout_url) {
        window.location.href = form.checkout_url;
      } else {
        setSubmitted(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
          <p className="text-muted-foreground">
            This form doesn't exist or has been deactivated.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
          <p className="text-muted-foreground">
            Your submission has been received. We'll get back to you soon.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{form.name}</h1>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
            {form.deposit_required && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="font-semibold">
                  Deposit Required: £{form.deposit_amount}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll be redirected to payment after submitting
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => (
              <div key={field.id}>
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.field_type === "textarea" ? (
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    required={field.required}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.field_type}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
