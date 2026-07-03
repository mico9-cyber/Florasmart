import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppContext } from './context/AppData';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CustomerDashboard from './pages/CustomerDashboard';
import FloristDashboard from './pages/FloristDashboard';
import GardenerDashboard from './pages/GardenerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlantRecommendationPage from './pages/PlantRecommendationPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import VaseMatchingPage from './pages/VaseMatchingPage';
import ShoppingCartPage from './pages/ShoppingCartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ChatbotPage from './pages/ChatbotPage';
import GardenPlannerPage from './pages/GardenPlannerPage';
import InventoryPage from './pages/InventoryPage';
import DeliveryPage from './pages/DeliveryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import LoyaltyPage from './pages/LoyaltyPage';
import SecurityPage from './pages/SecurityPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';

const dashboardPathByRole = {
  customer: '/customer-dashboard',
  florist: '/florist-dashboard',
  gardener: '/gardener-dashboard',
  admin: '/admin-dashboard',
};

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useContext(AppContext);
  const location = useLocation();

  if (!user.loggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathByRole[user.role] || '/'} replace />;
  }

  return children;
}

const noSidebarRoutes = ['/', '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];

function AppLayout() {
  const { user, theme } = useContext(AppContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const isNoSidebar = noSidebarRoutes.includes(location.pathname) || (location.pathname.startsWith('/catalog') && !user.loggedIn);
  const showSidebar = user.loggedIn && !isNoSidebar;

  return (
    <div className="app-container">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className={`app-body ${showSidebar ? 'app-body--with-sidebar' : ''}`}>
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className="main-content">
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/florist-dashboard" element={<ProtectedRoute allowedRoles={["florist"]}><FloristDashboard /></ProtectedRoute>} />
            <Route path="/gardener-dashboard" element={<ProtectedRoute allowedRoles={["gardener"]}><GardenerDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

            <Route path="/recommendations" element={<ProtectedRoute allowedRoles={["customer", "gardener", "admin"]}><PlantRecommendationPage /></ProtectedRoute>} />
            <Route path="/vase-matching" element={<ProtectedRoute allowedRoles={["customer", "florist", "admin"]}><VaseMatchingPage /></ProtectedRoute>} />
            <Route path="/garden-planner" element={<ProtectedRoute allowedRoles={["customer", "gardener", "admin"]}><GardenPlannerPage /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute allowedRoles={["customer", "gardener", "admin"]}><ChatbotPage /></ProtectedRoute>} />

            <Route path="/catalog" element={<ProductCatalogPage />} />
            <Route path="/catalog/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<ProtectedRoute allowedRoles={["customer"]}><ShoppingCartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute allowedRoles={["customer"]}><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-tracking" element={<ProtectedRoute allowedRoles={["customer", "florist", "admin"]}><OrderTrackingPage /></ProtectedRoute>} />

            <Route path="/inventory" element={<ProtectedRoute allowedRoles={["florist", "admin"]}><InventoryPage /></ProtectedRoute>} />
            <Route path="/delivery" element={<ProtectedRoute allowedRoles={["florist", "admin"]}><DeliveryPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={["florist", "admin"]}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin", "florist"]}><ReportsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/loyalty" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><LoyaltyPage /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute allowedRoles={["admin"]}><SecurityPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
