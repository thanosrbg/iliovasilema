// Admin.jsx
import React, { useState, useEffect } from "react";
import { supabase, testSupabaseConnection } from "../lib/supabase";

const Admin = () => {
  const [nightPrice, setNightPrice] = useState(120);
  const [minNights, setMinNights] = useState(2);
  const [maxAdults, setMaxAdults] = useState(3);
  const [maxChildren, setMaxChildren] = useState(2);
  const [maxInfants, setMaxInfants] = useState(5);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    fetchSettings();
  }, []);

  // Direct fetch function as fallback
  const fetchSettingsDirect = async () => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/settings?select=*&id=eq.1`;
      console.log('🌐 Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Direct fetch data:', data);
      return data;
    } catch (err) {
      console.error('❌ Direct fetch error:', err);
      throw err;
    }
  };

  const updateSettingsDirect = async (updateData) => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/settings?id=eq.1`;
      console.log('🌐 Updating at URL:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Update successful:', data);
      return data;
    } catch (err) {
      console.error('❌ Direct update error:', err);
      throw err;
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📖 Attempting to fetch settings...');
      
      // Try Supabase client first
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (!error && data) {
          console.log('✅ Settings fetched with client:', data);
          updateStateWithData(data);
          setLoading(false);
          return;
        }
        console.log('⚠️ Client fetch failed, trying direct fetch...');
      } catch (clientErr) {
        console.log('⚠️ Client error:', clientErr.message);
      }

      // Fallback to direct fetch
      try {
        const data = await fetchSettingsDirect();
        if (data && data.length > 0) {
          console.log('✅ Settings fetched directly:', data[0]);
          updateStateWithData(data[0]);
        } else {
          console.log('⚠️ No data found, using defaults');
        }
      } catch (directErr) {
        console.error('❌ Both fetch methods failed:', directErr);
        setError(`Failed to load settings: ${directErr.message}`);
      }
    } catch (err) {
      console.error('❌ Error in fetchSettings:', err);
      setError(`Failed to load settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStateWithData = (data) => {
    setNightPrice(data.night_price || 120);
    setMinNights(data.min_nights || 2);
    setMaxAdults(data.max_adults || 3);
    setMaxChildren(data.max_children || 2);
    setMaxInfants(data.max_infants || 5);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const updateData = {
        night_price: nightPrice,
        min_nights: minNights,
        max_adults: maxAdults,
        max_children: maxChildren,
        max_infants: maxInfants,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Saving with data:', updateData);

      // Try Supabase client first
      try {
        const { data, error } = await supabase
          .from('settings')
          .update(updateData)
          .eq('id', 1)
          .select();

        if (!error && data) {
          console.log('✅ Saved with client:', data);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          setIsSaving(false);
          return;
        }
        console.log('⚠️ Client save failed, trying direct update...');
      } catch (clientErr) {
        console.log('⚠️ Client save error:', clientErr.message);
      }

      // Fallback to direct update
      await updateSettingsDirect(updateData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('❌ Error saving:', err);
      setError(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Page will refresh and show login screen
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-gray-900">
            Admin Panel
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-800 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Night Price (€)
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={nightPrice}
              onChange={(e) => setNightPrice(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Nights Stay
            </label>
            <input
              type="number"
              min="1"
              value={minNights}
              onChange={(e) => setMinNights(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Adults
              </label>
              <input
                type="number"
                min="1"
                value={maxAdults}
                onChange={(e) => setMaxAdults(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Children
              </label>
              <input
                type="number"
                min="0"
                value={maxChildren}
                onChange={(e) => setMaxChildren(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Infants
              </label>
              <input
                type="number"
                min="0"
                value={maxInfants}
                onChange={(e) => setMaxInfants(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">Current nightly price:</p>
            <p className="text-2xl font-medium text-blue-900 mt-1">
              €{nightPrice}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Minimum stay: {minNights} nights
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-3 rounded-xl text-white font-medium transition ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          {saved && (
            <p className="text-sm text-green-600 text-center animate-pulse">
              ✓ Settings updated successfully!
            </p>
          )}
        </form>

        <button
          onClick={fetchSettings}
          className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          ↻ Refresh
        </button>

      </div>
    </div>
  );
};

export default Admin;