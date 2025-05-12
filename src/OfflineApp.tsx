
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OfflineAppContextProvider } from "./context/OfflineAppContext";
import Layout from "./components/Layout";
import AllocationTable from "./pages/AllocationTable";
import OfflineProjectsTable from "./pages/OfflineProjectsTable";
import AllocationPercentage from "./pages/AllocationPercentage";
import MonthlyOverview from "./pages/MonthlyOverview";
import OfflineSettings from "./pages/OfflineSettings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { useEffect } from "react";

const queryClient = new QueryClient();

const OfflineApp = () => {
  // Check if running in Electron and log for debugging
  useEffect(() => {
    const isElectron = window && window.electronAPI !== undefined;
    console.log("Running in Electron mode:", isElectron);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OfflineAppContextProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<AllocationTable />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/projects" element={<OfflineProjectsTable />} />
                <Route path="/allocation" element={<AllocationPercentage />} />
                <Route path="/monthly" element={<MonthlyOverview />} />
                <Route path="/settings" element={<OfflineSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </OfflineAppContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default OfflineApp;
