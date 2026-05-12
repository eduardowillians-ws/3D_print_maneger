import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Printer, 
  Layers, 
  Package, 
  FileText, 
  Workflow, 
  Users, 
  Wallet, 
  Settings, 
  Search, 
  Bell, 
  Moon, 
  Sun,
  HelpCircle,
  Monitor,
  Menu,
  X,
  LogOut,
  Lock
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

import PainelView from '../views/PainelView';
import ImpressorasView from '../views/ImpressorasView';
import MateriaisView from '../views/MateriaisView';
import ProdutosView from '../views/ProdutosView';
import OrcamentosView from '../views/OrcamentosView';
import ProducaoView from '../views/ProducaoView';
import ClientsView from '../views/ClientsView';
import ReportsView from '../views/ReportsView';
import FinancialView from '../views/FinancialView';
import SettingsView from '../views/SettingsView';
import ChangePasswordModal from './ChangePasswordModal';

export default function Dashboard() {
  const { theme, setTheme, user } = useSettings();
  const [activeTab, setActiveTab] = useState('Painel');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      if (confirm('Deseja realmente encerrar sua sessão?')) {
        await supabase.auth.signOut();
        // Redireciona forçado caso o listener demore
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao sair:', error);
      // Fallback: limpa tudo e recarrega
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-main)', overflow: 'hidden', position: 'relative' }}>
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-overlay visible"
            onClick={() => setIsSidebarOpen(false)} 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0,0,0,0.6)', 
              backdropFilter: 'blur(4px)', 
              zIndex: 1500 
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px 32px', position: 'relative' }}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px' }}>
            <Monitor size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', lineHeight: 1 }}>3D Print</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Manager</span>
          </div>
          <button 
            className="hamburger-btn" 
            onClick={() => setIsSidebarOpen(false)} 
            style={{ 
              marginLeft: 'auto', 
              display: 'flex',
              background: 'transparent',
              border: 'none'
            }}
          >
            <X size={20} color="var(--text-dim)" />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Painel" active={activeTab === 'Painel'} onClick={() => handleTabChange('Painel')} />
          <NavItem icon={<Printer size={20} />} label="Impressoras" active={activeTab === 'Impressoras'} onClick={() => handleTabChange('Impressoras')} />
          <NavItem icon={<Layers size={20} />} label="Materiais" active={activeTab === 'Materiais'} onClick={() => handleTabChange('Materiais')} />
          <NavItem icon={<Package size={20} />} label="Produtos" active={activeTab === 'Produtos'} onClick={() => handleTabChange('Produtos')} />
          <NavItem icon={<FileText size={20} />} label="Orçamentos" active={activeTab === 'Orçamentos'} onClick={() => handleTabChange('Orçamentos')} />
          <NavItem icon={<Workflow size={20} />} label="Produção" active={activeTab === 'Produção'} onClick={() => handleTabChange('Produção')} />
          <NavItem icon={<Users size={20} />} label="Clientes" active={activeTab === 'Clientes'} onClick={() => handleTabChange('Clientes')} />
          <NavItem icon={<FileText size={20} />} label="Relatórios" active={activeTab === 'Relatórios'} onClick={() => handleTabChange('Relatórios')} />
          <NavItem icon={<Wallet size={20} />} label="Financeiro" active={activeTab === 'Financeiro'} onClick={() => handleTabChange('Financeiro')} />
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem icon={<Settings size={20} />} label="Configurações" active={activeTab === 'Configurações'} onClick={() => handleTabChange('Configurações')} />
          <div 
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px', 
              marginTop: '12px', 
              cursor: 'pointer', 
              borderRadius: '8px', 
              transition: 'all 0.2s',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glass)'
            }}
            className="sidebar-user-logout"
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
               <img src={user.photo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 700 }}>{user.name} {user.lastName}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Sair do Sistema</p>
            </div>
            <LogOut size={14} color="var(--error)" />
          </div>

          {/* Botão Alterar Senha */}
          <div 
            onClick={() => setShowPasswordModal(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '10px 12px', 
              cursor: 'pointer', 
              borderRadius: '8px', 
              transition: 'all 0.2s',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glass)',
              marginTop: '8px'
            }}
          >
            <Lock size={16} color="var(--primary)" />
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Alterar Senha</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Bar */}
        <header style={{ 
          height: '64px', 
          borderBottom: '1px solid var(--border-glass)', 
          padding: '0 32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--bg-main)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
            <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '10px', width: '300px', border: '1px solid var(--border-glass)' }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder={`Pesquisar...`} 
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Bell size={20} color="var(--text-dim)" cursor="pointer" className="hide-mobile" />
            <div className="theme-toggle-btn" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-glass)'
              }}
            >
               {theme === 'dark' ? <Sun size={18} color="var(--text-dim)" /> : <Moon size={18} color="var(--text-dim)" />}
            </div>
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>
              <HelpCircle size={20} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content-area" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {activeTab === 'Painel' && <PainelView />}
          {activeTab === 'Impressoras' && <ImpressorasView />}
          {activeTab === 'Materiais' && <MateriaisView />}
          {activeTab === 'Produtos' && <ProdutosView />}
          {activeTab === 'Orçamentos' && <OrcamentosView />}
          {activeTab === 'Produção' && <ProducaoView />}
          {activeTab === 'Clientes' && <ClientsView />}
          {activeTab === 'Relatórios' && <ReportsView />}
          {activeTab === 'Financeiro' && <FinancialView />}
          {activeTab === 'Configurações' && <SettingsView />}
        </div>

        {/* Modal de Alterar Senha */}
        <ChangePasswordModal 
          isOpen={showPasswordModal} 
          onClose={() => setShowPasswordModal(false)} 
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
