import { useState, useRef } from 'react';
import { 
  User, 
  Building2, 
  Globe, 
  Key, 
  Clock, 
  Moon, 
  Sun, 
  MapPin, 
  Plus,
  CheckCircle,
  Trash2,
  Copy,
  Layout,
  Coins,
  X,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string;
}

export default function SettingsView() {
  const { theme, setTheme, currency, setCurrency, measureSystem, setMeasureSystem, user, setUser, saveSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // States Locais para Novos inputs
  const [showNewRoleInput, setShowNewRoleInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roles, setRoles] = useState(['Administrador do Laboratório', 'Operador Senior', 'Técnico de Manutenção']);
  
  // API Keys (Mock)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Sincronização de ERP de Produção', key: 'sk_live_51M...9x10', lastUsed: '2 min atrás' }
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveSettings();
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  // LÓGICA DE COMPRESSÃO DE IMAGEM (PARA SUPABASE PERFORMANCE)
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Comprime para 70% de qualidade
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setUser({ ...user, photo: compressedBase64 });
      };
    };
  };

  const handleAddRole = () => {
    if (!newRoleName) return;
    const formatted = newRoleName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    if (!roles.includes(formatted)) setRoles([...roles, formatted]);
    setUser({ ...user, role: formatted });
    setNewRoleName('');
    setShowNewRoleInput(false);
  };

  const handleGenerateKey = () => {
    const newKey: ApiKey = {
      id: Math.random().toString(36).substr(2, 5),
      name: 'Integração Webhook ' + (apiKeys.length + 1),
      key: `sk_test_${Math.random().toString(36).substr(2, 8)}...`,
      lastUsed: 'Nunca usada'
    };
    setApiKeys([...apiKeys, newKey]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Configurações do Laboratório</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Ajuste parâmetros globais de identidade, medidas e segurança.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={cancelButtonStyle} onClick={() => window.location.reload()}>Descartar</button>
          <button className="btn-primary" style={{ minWidth: '160px', height: '42px', borderRadius: '10px' }} onClick={handleSave} disabled={isSaving}>
            {isSaving ? <div className="spinning" style={{ width: '16px', height: '16px' }}></div> : showSuccess ? <CheckCircle size={18} /> : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }} className="grid-responsive">
        {/* Perfil & Organização */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <section className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={iconBoxStyle}><User size={18} color="var(--primary)" /></div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Perfil de Usuário</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }} className="grid-responsive">
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 12px' }}>
                   <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', padding: '3px' }}>
                      <img src={user.photo} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--bg-main)', objectFit: 'cover' }} />
                   </div>
                   <button onClick={() => fileInputRef.current?.click()} style={photoBadgeStyle}><Plus size={14} /></button>
                </div>
                <button onClick={() => fileInputRef.current?.click()} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>TROCAR IMAGEM</button>
              </div>
              
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Nome</label>
                  <input type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} style={inputStyle} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Sobrenome</label>
                  <input type="text" value={user.lastName} onChange={e => setUser({...user, lastName: e.target.value})} style={inputStyle} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label>Endereço de E-mail</label>
                  <input type="email" value={user.email} onChange={e => setUser({...user, email: e.target.value})} style={inputStyle} />
                </div>
                
                {/* CADASTRO DE FUNÇÃO COM BOTÃO "+" */}
                <div className="input-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label>Função no Laboratório</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     {showNewRoleInput ? (
                        <input 
                           type="text" 
                           autoFocus 
                           placeholder="Nova função..." 
                           value={newRoleName} 
                           onChange={e => setNewRoleName(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleAddRole()}
                           onBlur={handleAddRole}
                           style={inputStyle} 
                        />
                     ) : (
                        <select value={user.role} onChange={e => setUser({...user, role: e.target.value})} style={inputStyle}>
                           {roles.map(r => <option key={r} value={r} style={{ background: '#111' }}>{r}</option>)}
                        </select>
                     )}
                     <button onClick={() => setShowNewRoleInput(!showNewRoleInput)} style={{ ...iconAddButtonStyle, background: showNewRoleInput ? 'var(--error)' : 'rgba(255,255,255,0.03)' }}>
                        {showNewRoleInput ? <X size={18} /> : <Plus size={18} />}
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={iconBoxStyle}><Building2 size={18} color="var(--primary)" /></div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Unidade Industrial</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Nome da Empresa</label>
                <input type="text" defaultValue="Nexus Advanced Manufacturing" style={inputStyle} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Localização (Filial)</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color="var(--text-muted)" style={iconOverlayStyle} />
                  <input type="text" defaultValue="São José Hub - Pavilhão 4" style={{ ...inputStyle, paddingLeft: '44px' }} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Preferências & Segurança */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <section className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={iconBoxStyle}><Globe size={18} color="var(--primary)" /></div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Parametrização</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700 }}>Tema Visual</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{theme === 'dark' ? 'Modern Dark' : 'Crystal Light'}</p>
                </div>
                <div style={{ background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', border: '1px solid var(--border-glass)' }}>
                  <button onClick={() => setTheme('light')} style={{ ...themeToggleStyle, background: theme === 'light' ? 'rgba(255,255,255,0.1)' : 'transparent', color: theme === 'light' ? 'white' : 'var(--text-dim)' }}><Sun size={14} /></button>
                  <button onClick={() => setTheme('dark')} style={{ ...themeToggleStyle, background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent', color: theme === 'dark' ? 'white' : 'var(--text-dim)' }}><Moon size={14} /></button>
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                   <Layout size={12} color="var(--primary)" />
                   <label style={{ margin: 0 }}>Medidas</label>
                </div>
                <select value={measureSystem} onChange={e => setMeasureSystem(e.target.value)} style={inputStyle}>
                   <option>Métrico (mm, kg, °C)</option>
                   <option>Imperial (in, lbs, °F)</option>
                </select>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                   <Coins size={12} color="var(--primary)" />
                   <label style={{ margin: 0 }}>Moeda</label>
                </div>
                <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle}>
                   <option>BRL (R$) - Real Brasileiro</option>
                   <option>USD ($) - Dólar Americano</option>
                   <option>EUR (€) - Euro</option>
                </select>
              </div>
            </div>
          </section>

          <section className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={iconBoxStyle}><ShieldCheck size={18} color="var(--primary)" /></div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>API e Tokens</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <AnimatePresence>
                {apiKeys.map(key => (
                  <motion.div key={key.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} style={apiKeyCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{key.name}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => alert('Copiado!')} style={actionIconStyle}><Copy size={12} /></button>
                        <button onClick={() => setApiKeys(apiKeys.filter(k => k.id !== key.id))} style={{ ...actionIconStyle, color: 'var(--error)' }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <code style={codeBlockStyle}>{key.key}</code>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button onClick={handleGenerateKey} style={generateButtonStyle}><Plus size={14} /> Novo Token</button>
          </section>
        </div>
      </div>
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={toastStyle}>
             <CheckCircle size={18} color="var(--secondary)" /> Configurações salvas e comprimidas!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Estilos
const inputStyle: any = { width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
const cancelButtonStyle: any = { height: '42px', padding: '0 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' };
const iconBoxStyle: any = { width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const themeToggleStyle: any = { width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const photoBadgeStyle: any = { position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' };
const iconOverlayStyle: any = { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
const apiKeyCardStyle: any = { padding: '16px', background: 'black', borderRadius: '14px', border: '1px solid var(--border-glass)' };
const codeBlockStyle: any = { display: 'block', padding: '10px', background: '#0a0a0c', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' };
const actionIconStyle: any = { background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' };
const generateButtonStyle: any = { width: '100%', padding: '14px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const toastStyle: any = { position: 'fixed', bottom: '32px', right: '32px', background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-glass)', color: 'white', padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 5000 };
const iconAddButtonStyle: any = { width: '42px', height: '42px', borderRadius: '12px', border: '1px solid var(--border-glass)', color: 'white', cursor: 'pointer', flexShrink: 0 };
