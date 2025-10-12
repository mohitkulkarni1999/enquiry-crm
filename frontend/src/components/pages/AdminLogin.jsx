import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import { BusinessIcons, ActionIcons, UIIcons, StatusIcons } from '../ui/Icons';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await login(credentials);
      
      // Navigate based on user role from backend
      setTimeout(() => {
        if (user.role === 'SUPER_ADMIN') {
          navigate('/super-admin');
        } else if (user.role === 'CRM_ADMIN') {
          navigate('/crm-dashboard');
        } else if (user.role === 'SALES') {
          navigate('/sales-dashboard');
        } else {
          navigate('/login');
        }
      }, 100);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid credentials. Please check your username and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await login({ 
        username: 'super', 
        password: 'x'
      });
      
      // Navigate based on user role from backend
      setTimeout(() => {
        if (user.role === 'SUPER_ADMIN') {
          navigate('/super-admin');
        } else if (user.role === 'CRM_ADMIN') {
          navigate('/crm-dashboard');
        } else if (user.role === 'SALES') {
          navigate('/sales-dashboard');
        } else {
          navigate('/login');
        }
      }, 100);
    } catch (error) {
      console.error('Quick login failed:', error);
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <UIIcons.arrowLeft size={16} className="mr-2" />
            Back to Role Selection
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <BusinessIcons.award size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Super Administrator</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access system administration</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <StatusIcons.alert size={20} className="text-red-500 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter admin password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              disabled={isLoading}
              icon={isLoading ? <ActionIcons.loading size={20} className="animate-spin" /> : <BusinessIcons.award size={20} />}
            >
              {isLoading ? 'Signing in...' : 'Sign In as Administrator'}
            </Button>
          </form>

          {/* Quick Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Development Access</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleQuickLogin}
              disabled={isLoading}
            >
              Demo Super Admin Login
            </Button>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need an administrator account?{' '}
              <Link
                to="/signup/super-admin"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start">
            <BusinessIcons.shield size={20} className="text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-purple-800 mb-1">Security Notice</h4>
              <p className="text-xs text-purple-700">
                Super Administrator access provides full system control. Ensure you're using secure credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
