import { Settings, User, Building2, Globe, Key, Clock, Moon, Sun, ChevronDown, MapPin, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Configurações</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie as preferências e configurações do seu laboratório de precisão.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={cancelButtonStyle}>Cancelar</button>
          <button className="btn-primary" style={{ height: '40px', padding: '0 20px', borderRadius: '8px' }}>
            Salvar Alterações
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Perfil de Usuário */}
          <section className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <User size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Perfil de Usuário</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--accent-cyan))', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(255,255,255,0.05)' }}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" style={{ width: '100%', borderRadius: '50%' }} />
                </div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Atualizar Foto</button>
              </div>
              
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Nome</label>
                  <input type="text" defaultValue="Alex" style={inputStyle} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Sobrenome</label>
                  <input type="text" defaultValue="Chen" style={inputStyle} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label>Endereço de E-mail</label>
                  <div style={{ position: 'relative' }}>
                    <input type="email" defaultValue="alex.chen@forgeos.lab" style={inputStyle} />
                  </div>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label>Função</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type="text" defaultValue="Administrador do Laboratório" readOnly style={{ ...inputStyle, paddingRight: '40px' }} />
                    <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '16px' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detalhes da Empresa */}
          <section className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Building2 size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Detalhes da Empresa</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Nome da Empresa</label>
                <input type="text" defaultValue="Nexus Advanced Manufacturing" style={inputStyle} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Localização das Instalações</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input type="text" defaultValue="San Jose Hub" style={{ ...inputStyle, paddingRight: '40px' }} />
                  <MapPin size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '16px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>CNPJ / Imposto</label>
                  <input type="text" defaultValue="US-987654321" style={inputStyle} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>E-mail de Faturamento</label>
                  <input type="email" defaultValue="billing@nexus-am.com" style={inputStyle} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Preferências */}
          <section className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Globe size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Preferências</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600 }}>Tema da Interface</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Alternar tema claro/escuro</p>
                </div>
                <div style={{ background: 'var(--bg-main)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                  <button style={{ ...themeToggleStyle, background: 'transparent', color: 'var(--text-dim)' }}><Sun size={14} /></button>
                  <button style={{ ...themeToggleStyle, background: 'rgba(255,255,255,0.05)', color: 'white' }}><Moon size={14} /></button>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Sistema de Medidas</label>
                <div style={selectStyle}>
                   Métrico (mm, kg, °C)
                   <ChevronDown size={14} />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Moeda Padrão</label>
                <div style={selectStyle}>
                   USD ($) - Dólar Americano
                   <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </section>

          {/* Chaves de API */}
          <section className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Key size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Chaves de API</h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '24px' }}>
              Gerencie tokens de acesso para softwares de fatiamento externos e integrações de ERP.
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Sincronização de ERP de Produção</span>
                  </div>
                  <MoreHorizontal size={16} color="var(--text-dim)" />
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                 sk_live_51M...9x10
                 <Clock size={12} style={{ marginLeft: 'auto' }} />
               </div>
               <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', textAlign: 'right' }}>Último uso: 2 min atrás</p>
            </div>

            <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Plus size={14} /> Gerar Nova Chave
            </button>
          </section>

        </div>
      </div>
    </motion.div>
  );
}

const inputStyle: any = {
  width: '100%',
  padding: '10px 16px',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '13px',
  marginTop: '8px',
  outline: 'none'
};

const selectStyle: any = {
  width: '100%',
  padding: '10px 16px',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '13px',
  marginTop: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer'
};

const cancelButtonStyle: any = {
  height: '40px',
  padding: '0 20px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const themeToggleStyle: any = {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

function Plus({ size, color }: any) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}

function MoreHorizontal({ size, color }: any) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
}
