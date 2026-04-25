import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, Loader2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Chave de acesso ou e-mail inválidos.' : error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="auth-logo">
            <Cpu size={32} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>PrintPulse 3D</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', fontWeight: 500 }}>Laboratório de Precisão OS</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>E-mail Corporativo</label>
            <div style={{ position: 'relative' }}>
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder="nome@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ marginBottom: 0 }}>Chave de Acesso</label>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Esqueceu?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ 
                color: 'var(--error)', 
                fontSize: '12px', 
                marginBottom: '20px', 
                textAlign: 'center',
                padding: '10px',
                background: 'rgba(255, 77, 77, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 77, 77, 0.1)'
              }}
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', height: '52px', marginTop: '10px', fontSize: '15px' }}
          >
            {loading ? <Loader2 className="spin" size={20} /> : 'ACESSAR TERMINAL'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Shield size={12} /> Protegido por Criptografia Militar de Ponta a Ponta.
          </p>
        </div>
      </div>
    </div>
  );
}
