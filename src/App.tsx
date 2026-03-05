import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InternationalizationProvider } from "@/contexts/InternationalizationContext";
import { GlobalMessageListener } from "@/components/GlobalMessageListener";
import Index from "./pages/Index";

// Lazy-loaded routes for code splitting
const Auth = lazy(() => import("./pages/Auth"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const SavedListings = lazy(() => import("./pages/SavedListings"));
const SoldRentedListings = lazy(() => import("./pages/SoldRentedListings"));
const MyListings = lazy(() => import("./pages/MyListings"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const EditListing = lazy(() => import("./pages/EditListing"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const LandlordDashboard = lazy(() => import("./pages/LandlordDashboard"));
const LandlordProfile = lazy(() => import("./pages/LandlordProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <InternationalizationProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GlobalMessageListener />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/saved" element={<SavedListings />} />
                <Route path="/sold-rented" element={<SoldRentedListings />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/edit-listing/:id" element={<EditListing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/dashboard" element={<LandlordDashboard />} />
                <Route path="/landlord/:userId" element={<LandlordProfile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </InternationalizationProvider>
  </QueryClientProvider>
);

export default App;
