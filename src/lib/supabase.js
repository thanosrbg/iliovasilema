// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Make sure the URL is clean - NO trailing slashes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, '') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing');
}

// Create client with explicit auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Debug: Log the configuration
console.log('🔧 Supabase Client initialized with:');
console.log('  URL:', supabaseUrl);
console.log('  Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');

// Test function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection error:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase connected successfully!');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return { success: false, error: err };
  }
};