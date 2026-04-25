import { Users, Plus, Search, Filter, Download, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientsView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Clientes</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie contas de clientes, visualize o LTV e acompanhe os históricos de pedidos.</p>
        </div>
        <button className="btn-primary" style={{ height: '40px', padding: '0 16px', borderRadius: '8px' }}>
          <Plus size={18} /> Adicionar Cliente
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, e-mail ou ID..." 
            style={{ 
              width: '100%', 
              padding: '12px 16px 12px 44px', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '8px', 
              color: 'white',
              fontSize: '13px',
              outline: 'none'
            }} 
          />
        </div>
        <button style={outlineButtonStyle}><Filter size={16} /> Filtrar</button>
        <button style={outlineButtonStyle}><Download size={16} /> Exportar</button>
      </div>

      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={thStyle}>NOME</th>
              <th style={thStyle}>E-MAIL / CONTATO</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>TOTAL DE PEDIDOS</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>VALOR NO CICLO DE VIDA (LTV)</th>
              <th style={thStyle}>STATUS</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <ClientRow 
              name="Componentes Aeroespaciais Inc." 
              initials="CA" 
              email="compras@aeroespacial.io" 
              orders={142} 
              ltv="R$ 124.500,00" 
              status="ATIVO" 
              color="var(--primary)" 
            />
            <ClientRow 
              name="Dispositivos MedTech LLC" 
              initials="DM" 
              email="suprimentos@medtech.com" 
              orders={84} 
              ltv="R$ 89.240,50" 
              status="ATIVO" 
              color="#22D3EE" 
            />
            <ClientRow 
              name="Design de Prototipagem Rápida" 
              initials="DP" 
              email="j.silva@dpr.net" 
              orders={12} 
              ltv="R$ 4.120,00" 
              status="INATIVO" 
              color="var(--text-muted)" 
            />
            <ClientRow 
              name="Vanguarda Logística" 
              initials="VL" 
              email="faturamento@vanguarda.co" 
              orders={3} 
              ltv="R$ 850,00" 
              status="SUSPENSO" 
              color="#FF4D4D" 
            />
            <ClientRow 
              name="Engenharia Nexus" 
              initials="EN" 
              email="contato@nexus.io" 
              orders={56} 
              ltv="R$ 62.100,00" 
              status="ATIVO" 
              color="#8A2BE2" 
            />
          </tbody>
        </table>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mostrando de 1 a 5 de 124 registros</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ChevronLeft size={16} color="var(--text-muted)" cursor="pointer" />
            <div style={pageNumberActive}>1</div>
            <div style={pageNumber}>2</div>
            <div style={pageNumber}>3</div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>...</span>
            <ChevronRight size={16} color="var(--text-muted)" cursor="pointer" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ClientRow({ name, initials, email, orders, ltv, status, color }: any) {
  const statusConfig: any = {
    'ATIVO': { bg: 'rgba(74, 225, 118, 0.1)', text: 'var(--secondary)' },
    'INATIVO': { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-muted)' },
    'SUSPENSO': { bg: 'rgba(255, 77, 77, 0.1)', text: 'var(--error)' }
  };

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-hover">
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: color + '20', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, border: `1px solid ${color}30` }}>
            {initials}
          </div>
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      </td>
      <td style={{ ...tdStyle, color: 'var(--text-dim)' }}>{email}</td>
      <td style={{ ...tdStyle, textAlign: 'center' }}>{orders}</td>
      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: status === 'ATIVO' ? 'var(--secondary)' : 'white' }}>{ltv}</td>
      <td style={tdStyle}>
        <span style={{ 
          fontSize: '9px', 
          fontWeight: 800, 
          padding: '4px 8px', 
          borderRadius: '4px', 
          background: statusConfig[status].bg, 
          color: statusConfig[status].text,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: statusConfig[status].text }}></div>
          {status}
        </span>
      </td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>
        <MoreVertical size={16} color="var(--text-muted)" cursor="pointer" />
      </td>
    </tr>
  );
}

const thStyle: any = { padding: '16px 24px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' };
const tdStyle: any = { padding: '16px 24px', fontSize: '13px' };

const outlineButtonStyle: any = {
  height: '42px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '0 16px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer'
};

const pageNumber: any = {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  fontSize: '13px',
  color: 'var(--text-muted)',
  cursor: 'pointer'
};

const pageNumberActive: any = {
  ...pageNumber,
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  fontWeight: 700
};
