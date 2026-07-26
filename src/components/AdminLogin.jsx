// src/components/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { supabase, checkEnvironment } from '../lib/supabase';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [envStatus, setEnvStatus] = useState(null);

  useEffect(() => {
    // Check environment on mount
    const env = checkEnvironment();
    setEnvStatus(env);
    console.log('🔧 AdminLogin - Environment:', env);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('📧 Attempting login for:', email);
      
      // Double-check environment
      if (!envStatus?.hasKey || !envStatus?.url) {
        throw new Error('Supabase is not configured properly');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Auth error:', error);
        throw error;
      }

      console.log('✅ Login successful:', data);
      
      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      let errorMessage = err.message || 'Failed to login. Please try again.';
      
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before logging in. Check your inbox.';
      } else if (err.message?.includes('Invalid path specified')) {
        errorMessage = 'Configuration error. Please check your Supabase URL in environment variables.';
      } else if (err.message?.includes('Supabase is not configured')) {
        errorMessage = '⚠️ Supabase is not configured. Please check your environment variables.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('📧 Attempting signup for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/admin',
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      console.log('✅ Signup successful:', data);

      if (data.user) {
        alert('✅ Account created! Please check your email to confirm your account.');
        setIsSignUp(false);
        setPassword('');
        setError(null);
      }
    } catch (err) {
      console.error('❌ Signup error:', err);
      
      let errorMessage = err.message || 'Failed to create account. Please try again.';
      
      if (err.message?.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (err.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password must be at least 6 characters long.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-2">
            {isSignUp ? 'Create an account' : 'Sign in to manage settings'}
          </p>
        </div>

        {envStatus && !envStatus.hasKey && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
            ⚠️ Supabase is not configured. Please check environment variables.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition"
              placeholder="admin@example.com"
              disabled={loading || !envStatus?.hasKey}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition"
              placeholder="••••••••"
              disabled={loading || !envStatus?.hasKey}
              minLength={6}
            />
            <p className="text-xs text-gray-400 mt-1">
              {isSignUp ? 'Password must be at least 6 characters' : ''}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !envStatus?.hasKey}
            className={`w-full py-3 rounded-xl text-white font-medium transition ${
              loading || !envStatus?.hasKey
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-sm text-blue-900 hover:text-blue-700 transition"
            disabled={loading || !envStatus?.hasKey}
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Debug Info */}
        <details className="mt-6 pt-6 border-t border-gray-200">
          <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
            <p>URL: {envStatus?.url || 'Not set'}</p>
            <p>Key: {envStatus?.hasKey ? '✅ Present' : '❌ Missing'}</p>
            <p>Mode: {envStatus?.mode || 'Unknown'}</p>
            <p>Environment: {envStatus?.isProd ? 'Production' : envStatus?.isDev ? 'Development' : 'Unknown'}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AdminLogin;