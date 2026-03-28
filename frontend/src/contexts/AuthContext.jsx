import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { authAPI, setAuthTokenProvider } from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth:user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Wire up token provider so API calls include Authorization header
  useEffect(() => {
    const token = localStorage.getItem('auth:token');
    setAuthTokenProvider(() => localStorage.getItem('auth:token'));
  }, []);

  // Session persists via localStorage — restored by useState initializer above

  const login = async (credentials) => {
    setLoading(true);
    try {
      if (credentials && typeof credentials === 'object' && credentials.username && credentials.password) {
        // Real API login
        const response = await authAPI.login({
          username: credentials.username,
          password: credentials.password
        });
        
        if (response.success && response.user) {
          console.log('Login successful, user role:', response.user.role);
          setUser(response.user);
          localStorage.setItem('auth:user', JSON.stringify(response.user));
          if (response.token) {
            localStorage.setItem('auth:token', response.token);
            setAuthTokenProvider(() => response.token);
          }
          toast.success('Login successful!');
          return response.user;
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } else {
        throw new Error('Invalid credentials provided');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem('auth:user');
      localStorage.removeItem('auth:token');
      setAuthTokenProvider(() => null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      localStorage.removeItem('auth:user');
      localStorage.removeItem('auth:token');
      setAuthTokenProvider(() => null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      if (response.success && response.user) {
        toast.success('Registration successful!');
        return response.user;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role) => {
    if (!role) return true;
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.role === role;
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = useMemo(() => ({ 
    user, 
    login, 
    logout, 
    register, 
    hasRole, 
    isAuthenticated,
    loading 
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
