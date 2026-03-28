import React, { useState } from 'react';
import CustomerPortal from './components/pages/CustomerPortal';
import SalesManagement from './components/pages/SalesManagement';
import SalesTeam from './components/pages/SalesTeam';
import Analytics from './components/pages/Analytics';
import SalesTeamPerformance from './components/pages/SalesTeamPerformance';
import SalesPersonDetails from './components/pages/SalesPersonDetails';
import SalesDashboard from './components/pages/SalesDashboard';
import CRMDashboard from './components/pages/CRMDashboard';
import SuperAdminDashboard from './components/pages/SuperAdminDashboard';
import Login from './components/pages/Login';
import AdminSignup from './components/pages/AdminSignup';
import FormBuilder from './components/pages/FormBuilder';
import Navigation from './components/layout/Navigation';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfessionalToaster } from './components/ui/Toast';

// Route guard: redirects to /login if not authenticated, or /login if wrong role
const Protected = ({ roles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // SUPER_ADMIN bypasses all role checks
  if (roles && user.role !== 'SUPER_ADMIN' && !roles.includes(user.role)) {
    // Redirect to their correct dashboard instead of showing error
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return children;
};

// Helper: get default route for a given role
function getDefaultRoute(role) {
  if (role === 'SUPER_ADMIN') return '/super-admin';
  if (role === 'CRM_ADMIN') return '/crm-dashboard';
  if (role === 'SALES') return '/sales-dashboard';
  return '/';
}

// Layout: shows sidebar only when authenticated and not on public routes
const AppLayout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const publicRoutes = ['/', '/customer', '/login', '/signup/super-admin'];
  const isPublicRoute = publicRoutes.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));

  if (isPublicRoute || !isAuthenticated()) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      <Navigation collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <main className={`flex-1 px-4 py-6 md:p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-72'
        }`}>
        {children}
      </main>
    </div>
  );
};

// Smart redirect: if already logged in, go to dashboard
const LoginRoute = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated()) return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<CustomerPortal />} />
            <Route path="/customer" element={<CustomerPortal />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/signup/super-admin" element={<AdminSignup />} />

            {/* SUPER_ADMIN routes */}
            <Route path="/super-admin" element={
              <Protected roles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </Protected>
            } />

            {/* CRM_ADMIN routes */}
            <Route path="/crm-dashboard" element={
              <Protected roles={['CRM_ADMIN']}>
                <CRMDashboard />
              </Protected>
            } />
            <Route path="/sales" element={
              <Protected roles={['CRM_ADMIN']}>
                <SalesManagement />
              </Protected>
            } />
            <Route path="/team" element={
              <Protected roles={['CRM_ADMIN']}>
                <SalesTeam />
              </Protected>
            } />
            <Route path="/analytics" element={
              <Protected roles={['CRM_ADMIN']}>
                <Analytics />
              </Protected>
            } />
            <Route path="/form-builder" element={
              <Protected roles={['CRM_ADMIN']}>
                <FormBuilder />
              </Protected>
            } />
            <Route path="/sales-team-performance" element={
              <Protected roles={['CRM_ADMIN']}>
                <SalesTeamPerformance />
              </Protected>
            } />
            <Route path="/sales-person-details/:salesPersonName" element={
              <Protected roles={['CRM_ADMIN']}>
                <SalesPersonDetails />
              </Protected>
            } />

            {/* SALES routes */}
            <Route path="/sales-dashboard" element={
              <Protected roles={['SALES']}>
                <SalesDashboard />
              </Protected>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
        <ProfessionalToaster />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
