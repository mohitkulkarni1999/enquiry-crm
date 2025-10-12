import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import { BusinessIcons, ActionIcons, UIIcons, StatusIcons } from '../ui/Icons';

const CRMLogin = () => {
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

      if (user.role !== 'CRM_ADMIN' && user.role !== 'SUPER_ADMIN') {
        setError('This account is not a CRM Admin. Please use the correct login.');
        return;
      }

      // Navigate based on user role from backend
      setTimeout(() => {
        if (user.role === 'SUPER_ADMIN') {
          navigate('/super-admin');
        } else {
          navigate('/crm-dashboard');
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
        username: 'admin1', 
        password: 'admin123'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 flex items-center justify-center p-4">
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
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
            <BusinessIcons.briefcase size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">CRM Administrator</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to manage leads and team performance</p>
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
                CRM Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              disabled={isLoading}
              icon={isLoading ? <ActionIcons.loading size={20} className="animate-spin" /> : <BusinessIcons.briefcase size={20} />}
            >
              {isLoading ? 'Signing in...' : 'Sign In to CRM'}
            </Button>
          </form>

          {/* Quick Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Development Access</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleQuickLogin}
              disabled={isLoading}
            >
              Demo CRM Admin Login
            </Button>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need a CRM admin account?{' '}
              <Link
                to="/signup/crm-admin"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <BusinessIcons.activity size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">CRM Admin Features</h4>
              <p className="text-xs text-blue-700">
                Lead management, team performance tracking, sales analytics, and process optimization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMLogin;
