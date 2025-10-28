import { useState, useEffect } from "react";
import { FormsDashboard } from "@/components/forms/FormsDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/types/forms";
import { useToast } from "@/hooks/use-toast";

const Forms = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadForms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    } else {
      setForms(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadForms();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <FormsDashboard forms={forms} onRefresh={loadForms} />;
};

export default Forms;
