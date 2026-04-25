import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Efeito para trocar o tema no body
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.remove('light-mode');
      body.style.backgroundColor = '#0a0a0c'; // Cor do --bg-deep
    } else {
      body.classList.add('light-mode');
      body.style.backgroundColor = '#f1f3f6'; // Cor do --bg-deep light
    }
  }, [isDarkMode]);

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
    <div className="app-container">
      {!session ? (
        <Login />
      ) : (
        <Dashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      )}
    </div>
  );
}

export default App;
