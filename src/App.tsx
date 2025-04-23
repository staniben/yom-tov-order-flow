
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import AllocationTable from "./pages/AllocationTable";
import ProjectsTable from "./pages/ProjectsTable";
import AllocationPercentage from "./pages/AllocationPercentage";
import MonthlyOverview from "./pages/MonthlyOverview";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContextProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<AllocationTable />} />
              <Route path="/projects" element={<ProjectsTable />} />
              <Route path="/allocation" element={<AllocationPercentage />} />
              <Route path="/monthly" element={<MonthlyOverview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AppContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
