import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import { BusinessIcons, ActionIcons, UIIcons, StatusIcons } from '../ui/Icons';

const SalesLogin = () => {
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
          navigate('/');
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
        username: 'sales1', 
        password: 'sales123'
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
          navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
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
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <BusinessIcons.target size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sales Representative</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to manage your leads and close deals</p>
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
                Sales Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={isLoading}
              icon={isLoading ? <ActionIcons.loading size={20} className="animate-spin" /> : <BusinessIcons.target size={20} />}
            >
              {isLoading ? 'Signing in...' : 'Sign In to Sales'}
            </Button>
          </form>

          {/* Quick Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Development Access</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleQuickLogin}
              disabled={isLoading}
            >
              Demo Sales Rep Login
            </Button>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need a sales account?{' '}
              <Link
                to="/signup/sales"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start">
            <BusinessIcons.trending size={20} className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-1">Sales Dashboard Features</h4>
              <p className="text-xs text-green-700">
                Personal lead management, activity tracking, deal pipeline, and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesLogin;
