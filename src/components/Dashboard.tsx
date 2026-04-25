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
  Monitor
} from 'lucide-react';

import PainelView from '../views/PainelView';
import ImpressorasView from '../views/ImpressorasView';
import MateriaisView from '../views/MateriaisView';
import ProdutosView from '../views/ProdutosView';
import EstimatesView from '../views/EstimatesView';
import ProducaoView from '../views/ProducaoView';
import ClientsView from '../views/ClientsView';
import FinancialView from '../views/FinancialView';
import SettingsView from '../views/SettingsView';

export default function Dashboard({ isDarkMode, setIsDarkMode }: any) {
  const [activeTab, setActiveTab] = useState('Painel');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px 32px' }}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px' }}>
            <Monitor size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', lineHeight: 1 }}>3D Print</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Manager</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Painel" active={activeTab === 'Painel'} onClick={() => setActiveTab('Painel')} />
          <NavItem icon={<Printer size={20} />} label="Impressoras" active={activeTab === 'Impressoras'} onClick={() => setActiveTab('Impressoras')} />
          <NavItem icon={<Layers size={20} />} label="Materiais" active={activeTab === 'Materiais'} onClick={() => setActiveTab('Materiais')} />
          <NavItem icon={<Package size={20} />} label="Produtos" active={activeTab === 'Produtos'} onClick={() => setActiveTab('Produtos')} />
          <NavItem icon={<FileText size={20} />} label="Orçamentos" active={activeTab === 'Orçamentos'} onClick={() => setActiveTab('Orçamentos')} />
          <NavItem icon={<Workflow size={20} />} label="Produção" active={activeTab === 'Produção'} onClick={() => setActiveTab('Produção')} />
          <NavItem icon={<Users size={20} />} label="Clientes" active={activeTab === 'Clientes'} onClick={() => setActiveTab('Clientes')} />
          <NavItem icon={<Wallet size={20} />} label="Financeiro" active={activeTab === 'Financeiro'} onClick={() => setActiveTab('Financeiro')} />
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem icon={<Settings size={20} />} label="Configurações" active={activeTab === 'Configurações'} onClick={() => setActiveTab('Configurações')} />
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
              transition: 'background 0.2s',
              background: 'rgba(255,255,255,0.02)' 
            }}
            className="sidebar-user-logout"
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--accent-cyan))' }}></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>Usuário Admin</p>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Clique para sair</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header style={{ 
          height: '64px', 
          borderBottom: '1px solid rgba(255,255,255,0.05)', 
          padding: '0 32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'var(--bg-deep)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-main)', padding: '8px 16px', borderRadius: '8px', width: '400px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder={`Pesquisar em ${activeTab.toLowerCase()}...`} 
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Bell size={20} color="var(--text-dim)" cursor="pointer" />
            <div className="theme-toggle-btn" 
              onClick={() => {
                console.log('Toggling theme, currently dark:', isDarkMode);
                setIsDarkMode(!isDarkMode);
              }} 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s'
              }}
            >
               {isDarkMode ? <Sun size={18} color="var(--text-dim)" /> : <Moon size={18} color="var(--text-dim)" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>
              <HelpCircle size={20} />
              <span>Suporte</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {activeTab === 'Painel' && <PainelView />}
          {activeTab === 'Impressoras' && <ImpressorasView />}
          {activeTab === 'Materiais' && <MateriaisView />}
          {activeTab === 'Produtos' && <ProdutosView />}
          {activeTab === 'Orçamentos' && <EstimatesView />}
          {activeTab === 'Produção' && <ProducaoView />}
          {activeTab === 'Clientes' && <ClientsView />}
          {activeTab === 'Financeiro' && <FinancialView />}
          {activeTab === 'Configurações' && <SettingsView />}
        </div>
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
