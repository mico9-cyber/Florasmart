import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppContext } from './context/AppData';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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

const noSidebarRoutes = ['/', '/login', '/register'];

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
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/florist-dashboard" element={<ProtectedRoute allowedRoles={["florist"]}><FloristDashboard /></ProtectedRoute>} />
            <Route path="/gardener-dashboard" element={<ProtectedRoute allowedRoles={["gardener"]}><GardenerDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

            <Route path="/recommendations" element={<PlantRecommendationPage />} />
            <Route path="/vase-matching" element={<VaseMatchingPage />} />
            <Route path="/garden-planner" element={<GardenPlannerPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />

            <Route path="/catalog" element={<ProductCatalogPage />} />
            <Route path="/catalog/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<ShoppingCartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-tracking" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />

            <Route path="/inventory" element={<ProtectedRoute allowedRoles={["florist", "admin"]}><InventoryPage /></ProtectedRoute>} />
            <Route path="/delivery" element={<ProtectedRoute allowedRoles={["florist", "admin"]}><DeliveryPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={["florist", "admin"]}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute allowedRoles={["admin"]}><SecurityPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
