import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { LibraryProvider } from "@/lib/library-context";
import LandingPage from "./pages/LandingPage";
import CatalogPage from "./pages/CatalogPage";
import BookDetailPage from "./pages/BookDetailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCatalog from "./pages/admin/AdminCatalog";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminWriteOffArchive from "./pages/admin/AdminWriteOffArchive";
import AdminLogs from "./pages/admin/AdminLogs";
import NotFound from "./pages/NotFound";
import { RequirePermission } from "./components/RequirePermission";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LibraryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/book/:id" element={<BookDetailPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="catalog" element={<RequirePermission permission="catalog.manage"><AdminCatalog /></RequirePermission>} />
                <Route path="bookings" element={<RequirePermission permission="bookings.manage"><AdminBookings /></RequirePermission>} />
                <Route path="users" element={<RequirePermission permission="users.view"><AdminUsers /></RequirePermission>} />
                <Route path="analytics" element={<RequirePermission permission="analytics.view"><AdminAnalytics /></RequirePermission>} />
                <Route path="writeoffs" element={<RequirePermission permission="users.view"><AdminWriteOffArchive /></RequirePermission>} />
                <Route path="logs" element={<RequirePermission permission="logs.view"><AdminLogs /></RequirePermission>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LibraryProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
