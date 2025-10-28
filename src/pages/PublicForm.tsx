import { useParams } from "react-router-dom";
import { FormViewer } from "@/components/forms/FormViewer";

const PublicForm = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Invalid form link</p>
      </div>
    );
  }

  return <FormViewer slug={slug} />;
};

export default PublicForm;
