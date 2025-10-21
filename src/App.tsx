import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Groups from "./pages/Groups";
import Travels from "./pages/Travels";
import Drivers from "./pages/Drivers";
import Debts from "./pages/Debts";
import Lands from "./pages/Lands";
import Plates from "./pages/Plates";
import Destinations from "./pages/Destinations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/employees" element={<DashboardLayout><Employees /></DashboardLayout>} />
          <Route path="/groups" element={<DashboardLayout><Groups /></DashboardLayout>} />
          <Route path="/travels" element={<DashboardLayout><Travels /></DashboardLayout>} />
          <Route path="/drivers" element={<DashboardLayout><Drivers /></DashboardLayout>} />
          <Route path="/debts" element={<DashboardLayout><Debts /></DashboardLayout>} />
          <Route path="/lands" element={<DashboardLayout><Lands /></DashboardLayout>} />
          <Route path="/plates" element={<DashboardLayout><Plates /></DashboardLayout>} />
          <Route path="/destinations" element={<DashboardLayout><Destinations /></DashboardLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
