// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean the URL (remove any /rest/v1 or trailing slashes)
const cleanUrl = supabaseUrl
  .replace(/\/rest\/v1.*$/, '')  // Remove /rest/v1 and anything after
  .replace(/\/+$/, '');          // Remove trailing slashes

console.log('🔧 Environment check:');
console.log('  VITE_SUPABASE_URL:', supabaseUrl);
console.log('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present' : '❌ Missing');
console.log('  Clean URL:', cleanUrl);

// Validate environment variables
if (!cleanUrl || !supabaseAnonKey) {
  console.error('❌ Missing or invalid Supabase environment variables!');
  console.error('  URL:', cleanUrl);
  console.error('  Key:', supabaseAnonKey ? 'Present' : 'Missing');
  
  // Show a user-friendly error
  if (typeof window !== 'undefined') {
    // Don't show alert in production, just log
    if (import.meta.env.DEV) {
      alert('⚠️ Supabase environment variables are missing. Please check your .env.local file.');
    }
  }
}

// Create the Supabase client
export const supabase = createClient(cleanUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

console.log('✅ Supabase Client initialized with:');
console.log('  URL:', cleanUrl);
console.log('  Environment:', import.meta.env.MODE);

// Test function
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection error:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase connected successfully!');
    console.log('  Data:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return { success: false, error: err };
  }
};

// Export a function to check environment status
export const checkEnvironment = () => {
  return {
    url: cleanUrl,
    hasKey: !!supabaseAnonKey,
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    supabaseUrl: supabaseUrl,
  };
};