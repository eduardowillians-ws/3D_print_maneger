import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Storefront from './views/Storefront';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isStorefront, setIsStorefront] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/loja/')) {
      setIsStorefront(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isStorefront) {
    return (
      <div className="app-container">
        <Storefront />
      </div>
    );
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <div className="app-container">
          {!session ? (
            <Login />
          ) : (
            <Dashboard />
          )}
        </div>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
