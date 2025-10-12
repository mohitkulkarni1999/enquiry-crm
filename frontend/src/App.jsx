import React, { useState, useEffect } from 'react';
import CustomerPortal from './components/pages/CustomerPortal';
import SalesManagement from './components/pages/SalesManagement';
import SimpleSalesManagement from './components/pages/SimpleSalesManagement';
import SimpleCRMDashboard from './components/pages/SimpleCRMDashboard';
import SalesTeam from './components/pages/SalesTeam';
import Analytics from './components/pages/Analytics';
import SalesTeamPerformance from './components/pages/SalesTeamPerformance';
import SalesPersonDetails from './components/pages/SalesPersonDetails';
import SalesDashboard from './components/pages/SalesDashboard';
import CRMDashboard from './components/pages/CRMDashboard';
import SuperAdminDashboard from './components/pages/SuperAdminDashboard';
import Login from './components/pages/Login';
import AdminSignup from './components/pages/AdminSignup';
import Navigation from './components/layout/Navigation';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfessionalToaster } from './components/ui/Toast';

const Protected = ({ role, children }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.role !== role && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }
  
  return children;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Define all public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/customer',
    '/login',
    '/signup/super-admin'
  ];
  
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  if (isPublicRoute || !isAuthenticated()) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      <Navigation collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <main className={`flex-1 px-4 py-6 md:p-8 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-72'
      }`}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<CustomerPortal />} />
            <Route path="/customer" element={<CustomerPortal />} />
            <Route path="/login" element={<Login />} />
            
            {/* Super admin signup route */}
            <Route path="/signup/super-admin" element={<AdminSignup />} />
            
            {/* Legacy auto-login route */}
            <Route path="/login/super" element={<AutoLoginSuper />} />
            <Route
              path="/sales"
              element={
                <Protected role="CRM_ADMIN">
                  <SalesManagement />
                </Protected>
              }
            />
            <Route
              path="/sales-dashboard"
              element={
                <Protected role="SALES">
                  <SalesDashboard />
                </Protected>
              }
            />
            <Route
              path="/crm-dashboard"
              element={
                <Protected role="CRM_ADMIN">
                  <CRMDashboard />
                </Protected>
              }
            />
            <Route
              path="/super-admin"
              element={
                <Protected role="SUPER_ADMIN">
                  <SuperAdminDashboard />
                </Protected>
              }
            />
            <Route
              path="/team"
              element={
                <Protected role="CRM_ADMIN">
                  <SalesTeam />
                </Protected>
              }
            />
            <Route
              path="/analytics"
              element={
                <Protected role="CRM_ADMIN">
                  <Analytics />
                </Protected>
              }
            />
            <Route
              path="/sales-team-performance"
              element={
                <Protected role="CRM_ADMIN">
                  <SalesTeamPerformance />
                </Protected>
              }
            />
            <Route
              path="/sales-person-details/:salesPersonName"
              element={
                <Protected role="CRM_ADMIN">
                  <SalesPersonDetails />
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
        <ProfessionalToaster />
      </AppProvider>
    </AuthProvider>
  );
}

function AutoLoginSuper() {
  const { login } = useAuth();
  useEffect(() => {
    login({ username: 'super', password: 'x', role: 'SUPER_ADMIN' });
  }, [login]);
  return <Navigate to="/super-admin" replace />;
}

export default App;
