import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  CRM_ADMIN: 'CRM Admin',
  SALES: 'Sales',
};

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const user = await login({ username: form.username.trim(), password: form.password });
      // Immediate redirect based on role
      if (user.role === 'SUPER_ADMIN') navigate('/super-admin', { replace: true });
      else if (user.role === 'CRM_ADMIN') navigate('/crm-dashboard', { replace: true });
      else if (user.role === 'SALES') navigate('/sales-dashboard', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
      
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center px-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', transform: 'translate(50%, 50%)' }} />
        
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" fill="white" fillOpacity="0.9"/>
              <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 12V16M10 14H14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4" style={{ letterSpacing: '-1px' }}>
            Enquiry <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CRM</span>
          </h1>
          <p className="text-lg mb-12" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Professional Real Estate Lead Management
          </p>

          {/* Feature badges */}
          {[
            { icon: '🎯', text: 'Smart Lead Assignment' },
            { icon: '📊', text: 'Real-Time Analytics' },
            { icon: '👥', text: 'Multi-Role Access Control' },
          ].map((f, i) => (
            <div key={i} className="flex items-center space-x-3 mb-4 px-6 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
              <span className="text-2xl">{f.icon}</span>
              <span className="text-white font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Enquiry CRM</h1>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Sign in to access your dashboard</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl flex items-center space-x-3" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-sm font-medium" style={{ color: '#fca5a5' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-opacity-40 outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'white',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(96,165,250,0.7)'; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'white',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(96,165,250,0.7)'; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPass ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200 mt-2 flex items-center justify-center space-x-2"
                style={{
                  background: isLoading
                    ? 'rgba(99,102,241,0.5)'
                    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  border: 'none',
                  boxShadow: isLoading ? 'none' : '0 4px 24px rgba(99,102,241,0.4)',
                }}
                onMouseEnter={e => { if (!isLoading) e.target.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Role hints */}
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs text-center mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Sign in redirects automatically to your dashboard</p>
              <div className="flex justify-center space-x-3">
                {['Super Admin', 'CRM Admin', 'Sales'].map(role => (
                  <span key={role} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Signup link */}
          <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Need a Super Admin account?{' '}
            <Link to="/signup/super-admin" className="font-semibold transition-colors" style={{ color: '#60a5fa' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
