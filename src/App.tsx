import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InternationalizationProvider } from "@/contexts/InternationalizationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ListingDetail from "./pages/ListingDetail";
import SavedListings from "./pages/SavedListings";
import MyListings from "./pages/MyListings";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <InternationalizationProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/saved" element={<SavedListings />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </InternationalizationProvider>
  </QueryClientProvider>
);

export default App;
