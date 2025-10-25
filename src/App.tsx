import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Groups from "./pages/Groups";
import Drivers from "./pages/Drivers";
import Debts from "./pages/Debts";
import Lands from "./pages/Lands";
import Plates from "./pages/Plates";
import Destinations from "./pages/Destinations";
import Summaries from "./pages/Summaries";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
            <Route path="/auth" element={
              <AuthRedirect>
                <Auth />
              </AuthRedirect>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout><Dashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <DashboardLayout><Employees /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute>
                <DashboardLayout><Groups /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/drivers" element={
              <ProtectedRoute>
                <DashboardLayout><Drivers /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/debts" element={
              <ProtectedRoute>
                <DashboardLayout><Debts /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/lands" element={
              <ProtectedRoute>
                <DashboardLayout><Lands /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/plates" element={
              <ProtectedRoute>
                <DashboardLayout><Plates /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/destinations" element={
              <ProtectedRoute>
                <DashboardLayout><Destinations /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/summaries" element={
              <ProtectedRoute>
                <DashboardLayout><Summaries /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout><Settings /></DashboardLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </DataProvider>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
