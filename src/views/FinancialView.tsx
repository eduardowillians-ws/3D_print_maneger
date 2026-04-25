import { Wallet, TrendingUp, TrendingDown, DollarSign, Download, Plus, ChevronDown } from 'lucide-react';

export default function FinancialView() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Painel Financeiro</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Visão geral do desempenho financeiro do seu laboratório.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={outlineButtonStyle}><Download size={18} /> Exportar CSV</button>
          <button style={outlineButtonStyle}><Download size={18} /> Exportar PDF</button>
          <button className="btn-primary" style={{ height: '40px', padding: '0 16px', borderRadius: '8px' }}>
            <Plus size={18} /> Novo Registro
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <KPICard title="RECEITA TOTAL" value="$45,231.89" change="+12.5% do mês passado" icon={<TrendingUp size={24} color="var(--secondary)" />} />
        <KPICard title="CUSTOS TOTAIS" value="$12,845.20" change="+8.2% do mês passado" icon={<TrendingDown size={24} color="var(--error)" />} />
        <KPICard title="LUCRO LÍQUIDO" value="$32,386.69" change="+18.4% do mês passado" icon={<Wallet size={24} color="var(--primary)" />} />
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px' }}>Lucro Mensal</h3>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px' }}>
            {['6M', '1A', 'Todo'].map((period, idx) => (
              <button key={period} style={{ 
                border: 'none', 
                background: idx === 0 ? 'rgba(255,255,255,0.05)' : 'transparent', 
                color: idx === 0 ? 'white' : 'var(--text-dim)', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                fontSize: '12px', 
                cursor: 'pointer' 
              }}>
                {period}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: '300px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '24px' }}>
          {[40, 60, 45, 80, 55, 90].map((h, i) => (
            <div key={i} style={{ width: '40px', height: `${h}%`, background: 'var(--primary)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', padding: '0 24px', color: 'var(--text-muted)', fontSize: '12px' }}>
          <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px' }}>Histórico de Transações</h3>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Todas as Categorias <ChevronDown size={16} />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={thStyle}>DATA</th>
              <th style={thStyle}>DESCRIÇÃO</th>
              <th style={thStyle}>CATEGORIA</th>
              <th style={thStyle}>VALOR</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <TransactionRow date="Hoje, 10:24" desc="Venda - Peça de Drone (Personalizado)" cat="Receita" value="+$1,250.00" status="Concluido" />
            <TransactionRow date="Ontem, 15:42" desc="Compra de Filamento PLA (10x Brancos)" cat="Custo" value="-$450.00" status="Concluido" />
            <TransactionRow date="24 Out, 09:15" desc="Manutenção Preventiva - Voron 2.4" cat="Manutenção" value="-$120.00" status="Pendente" />
          </tbody>
        </table>
      </div>
    </>
  );
}

function KPICard({ title, value, change, icon }: any) {
  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', position: 'relative' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        {icon}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{title}</p>
      <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{value}</h2>
      <p style={{ fontSize: '12px', color: change.includes('+') ? 'var(--secondary)' : 'var(--error)' }}>{change}</p>
    </div>
  );
}

function TransactionRow({ date, desc, cat, value, status }: any) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <td style={tdStyle}>{date}</td>
      <td style={tdStyle}>{desc}</td>
      <td style={tdStyle}><span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '11px' }}>{cat}</span></td>
      <td style={{ ...tdStyle, color: value.startsWith('+') ? 'var(--secondary)' : 'white', fontWeight: 600 }}>{value}</td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'Concluido' ? 'var(--secondary)' : 'var(--warning)' }}></div>
          {status}
        </div>
      </td>
    </tr>
  );
}

const thStyle: any = { padding: '16px 24px' };
const tdStyle: any = { padding: '16px 24px', fontSize: '13px' };
const outlineButtonStyle: any = {
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '0 16px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '13px',
  cursor: 'pointer'
};
