import { FileText, Plus, Search, Filter, Download, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EstimatesView() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Gerenciamento de Orçamentos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie estimativas de clientes e propostas de preços.</p>
        </div>
        <button className="btn-primary" style={{ height: '40px', padding: '0 16px', borderRadius: '8px' }}>
          <Plus size={18} /> Criar Novo Orçamento
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <KPISmall title="APROVAÇÕES PENDENTES" value="12" subValue="$4,250" />
        <KPISmall title="TAXA DE CONVERSÃO" value="68%" subValue="+5%" />
        <KPISmall title="RECEITA TOTAL (MÊS ATUAL)" value="$24,800" subValue="24 fechados" />
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={thStyle}>ID Orçamento</th>
              <th style={thStyle}>Nome do Cliente</th>
              <th style={thStyle}>Data de Emissão</th>
              <th style={thStyle}>Valor Total</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            <TableRow id="Q-2048" client="Aerospace Dynamics Inc." date="24 Out, 2023" value="$1,250.00" status="PENDENTE" />
            <TableRow id="Q-2047" client="Medical Prothetics LLC" date="22 Out, 2023" value="$3,400.00" status="APROVADO" />
            <TableRow id="Q-2046" client="Robotics Core" date="20 Out, 2023" value="$850.50" status="ENVIADO" />
            <TableRow id="Q-2045" client="Local Hobbyist Group" date="18 Out, 2023" value="$120.00" status="REJEITADO" />
          </tbody>
        </table>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Mostrando 1-4 de 128</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={pageButtonStyle}><ChevronLeft size={16} /></button>
            <button style={pageButtonStyle}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </>
  );
}

function KPISmall({ title, value, subValue }: any) {
  return (
    <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px' }}>{title}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{value}</h3>
        <span style={{ fontSize: '12px', color: subValue.startsWith('+') ? 'var(--secondary)' : 'var(--primary)' }}>{subValue}</span>
      </div>
    </div>
  );
}

function TableRow({ id, client, date, value, status }: any) {
  const statusColors: any = {
    'PENDENTE': 'rgba(255,255,255,0.1)',
    'APROVADO': 'rgba(74, 225, 118, 0.1)',
    'ENVIADO': 'rgba(103, 58, 183, 0.1)',
    'REJEITADO': 'rgba(255, 77, 77, 0.1)'
  };
  const textColors: any = {
    'PENDENTE': 'var(--text-dim)',
    'APROVADO': 'var(--secondary)',
    'ENVIADO': 'var(--primary)',
    'REJEITADO': 'var(--error)'
  };

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <td style={tdStyle}>{id}</td>
      <td style={tdStyle}>{client}</td>
      <td style={tdStyle}>{date}</td>
      <td style={{ ...tdStyle, fontWeight: 600 }}>{value}</td>
      <td style={tdStyle}>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          padding: '4px 10px', 
          borderRadius: '4px', 
          background: statusColors[status], 
          color: textColors[status] 
        }}>
          {status}
        </span>
      </td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}

const thStyle: any = { padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' };
const tdStyle: any = { padding: '16px 24px', fontSize: '13px' };
const pageButtonStyle: any = { 
  width: '32px', 
  height: '32px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  background: 'rgba(255,255,255,0.03)', 
  border: '1px solid rgba(255,255,255,0.05)', 
  borderRadius: '6px',
  color: 'white',
  cursor: 'pointer'
};
