import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import { BusinessIcons, ActionIcons, UIIcons, StatusIcons } from '../ui/Icons';

const Login = () => {
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
      
      // Use the returned user object for navigation with a small delay
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
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <BusinessIcons.briefcase size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to CRM Suite</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in with your assigned credentials</p>
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
                Username
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
              className="w-full"
              disabled={isLoading}
              icon={isLoading ? <ActionIcons.loading size={20} className="animate-spin" /> : <ActionIcons.check size={20} />}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Super Admin Signup Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need to create a Super Admin account?{' '}
              <Link
                to="/signup/super-admin"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign Up Here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Professional CRM Suite v3.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
