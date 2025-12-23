import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Profile from "@/pages/Profile";
import AddProduct from "@/pages/AddProduct";
import Sales from "@/pages/Sales";
import Orders from "@/pages/Orders";
import Notifications from "@/pages/Notifications";
import KPI from "@/pages/KPI";
import Ads from "@/pages/Ads";
import CreateAd from "@/pages/CreateAd";
import DonationsPage from "@/pages/DonationsPage";
import Users from "@/pages/Users";
import PaymentPortal from "@/pages/PaymentPortal";
import Pricing from "@/pages/Pricing";
import Index from "@/pages/Index";

import Login from "@/pages/Login";
import Apple from "@/pages/Apple";
import NotFound from "@/pages/NotFound";
import AuthRoute from "@/components/auth/AuthRoutes";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import AppLayout from "@/components/layout/AppLayout";
import ImportProducts from "@/pages/ImportProducts";
import ProductSync from "@/pages/ProductSync";
import InventoryProducts from "@/pages/InventoryProducts";
import SquareCallback from "@/pages/SquareCallback";
import SquareDashboard from "@/pages/SquareDashboard";
import SquareSettings from "@/pages/SquareSettings";

import Integrations from "@/pages/Integrations";
import Documentation from "@/pages/Documentation";
import Notes from "@/pages/Notes";
import PredictiveAnalytics from "@/pages/PredictiveAnalytics";
import Wishlist from "@/pages/Wishlist";
import Autopilot from "@/pages/Autopilot";
import TestDataInjector from "@/pages/TestDataInjector";

import InventoryEnterprise from "@/pages/InventoryEnterprise";
import ForecastingEnterprise from "@/pages/ForecastingEnterprise";
import LegalCompliance from "@/pages/LegalCompliance";
import NegentropyAI from "@/pages/NegentropyAI";
import ComplianceHub from "@/pages/ComplianceHub";
import OnboardingWizard from "@/pages/OnboardingWizard";

const MainRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth routes - only accessible when not logged in */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/apple" element={<AuthRoute><Apple /></AuthRoute>} />


      {/* Pricing route */}
      <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />

      {/* Onboarding route - full screen without sidebar */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />

      {/* Protected routes - only accessible when logged in */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<KPI />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/kpi" element={<KPI />} />
        <Route path="/ads" element={<Ads />} />
        <Route path="/ads/create" element={<CreateAd />} />
        <Route path="/donate" element={<ComplianceHub />} />
        <Route path="/donations" element={<Navigate to="/donate?tab=donations" replace />} />
        <Route path="/users" element={<Users />} />
        <Route path="/payment" element={<PaymentPortal />} />

        <Route path="/import" element={<ImportProducts />} />
        <Route path="/sync" element={<ProductSync />} />
        <Route path="/inventory-products" element={<InventoryProducts />} />

        <Route path="/square-callback" element={<SquareCallback />} />
        <Route path="/square-dashboard" element={<SquareDashboard />} />
        <Route path="/square-settings" element={<SquareSettings />} />


        <Route path="/integrations" element={<Integrations />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/autopilot" element={<Autopilot />} />
        <Route path="/test-data" element={<TestDataInjector />} />
        <Route path="/inventory-enterprise" element={<InventoryEnterprise />} />
        <Route path="/forecasting" element={<ForecastingEnterprise />} />
        <Route path="/legal" element={<ComplianceHub />} />
        {/* Redirect /negentropy to main dashboard - AI is now integrated there */}
        <Route path="/negentropy" element={<NegentropyAI />} />

      </Route>

      {/* Default redirects */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;
