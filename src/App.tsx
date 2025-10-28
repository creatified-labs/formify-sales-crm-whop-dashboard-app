import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { DataProvider, useData } from "@/contexts/DataContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import CallTracker from "./pages/CallTracker";
import Goals from "./pages/Goals";
import Forms from "./pages/Forms";
import PublicForm from "./pages/PublicForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  console.log('AppRoutes rendering...');
  try {
    const { revenueEntries, goals } = useData();
    console.log('AppRoutes data:', { revenueEntries: revenueEntries?.length, goals: goals?.length });
    
    return (
      <>
        <Routes>
          {/* Public form route without Layout */}
          <Route path="/f/:slug" element={<PublicForm />} />
          
          {/* Main app routes with Layout */}
          <Route path="/*" element={
            <Layout revenueEntries={revenueEntries} goals={goals}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/call-tracker" element={<CallTracker />} />
                <Route path="/analytics" element={<Analytics revenueEntries={revenueEntries} goals={goals} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </>
    );
  } catch (error) {
    console.error('AppRoutes error:', error);
    return <div>Error loading app: {error.message}</div>;
  }
}

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="formify-crm-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
