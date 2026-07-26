// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { supabase, checkEnvironment } from '../lib/supabase';
import AdminLogin from './AdminLogin';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [envError, setEnvError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check environment first
        const env = checkEnvironment();
        console.log('🔧 Environment check:', env);
        
        if (!env.hasKey || !env.url) {
          setEnvError('⚠️ Supabase is not configured. Please check environment variables.');
          setLoading(false);
          return;
        }

        console.log('🔍 Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          throw error;
        }
        
        console.log('📋 Session data:', session);
        
        if (session) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Error getting session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (envError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-red-200 p-8 w-full max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Configuration Error</h2>
            <p className="text-gray-600 mb-4">{envError}</p>
            <div className="bg-gray-50 p-4 rounded-xl text-left text-xs">
              <p className="text-gray-500">Please check that your environment variables are set in Vercel:</p>
              <ul className="mt-2 list-disc list-inside text-gray-600">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLoginSuccess={setUser} />;
  }

  return children;
};

export default ProtectedRoute;