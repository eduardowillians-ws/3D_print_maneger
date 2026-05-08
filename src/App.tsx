import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
