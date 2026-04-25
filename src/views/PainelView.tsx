import { useState } from 'react';
import { Wallet, TrendingUp, Printer, FileText, ChevronDown, Filter, AlertTriangle, Settings, Clock, XCircle, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PainelView() {
  const [selectedMonth, setSelectedMonth] = useState('Março');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const years = ['2023', '2024', '2025'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Centro de Controle</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Visão geral do desempenho e métricas operacionais.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
          {/* Dropdown Mês */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowMonthMenu(!showMonthMenu)}
              style={filterSelectStyle}
            >
              {selectedMonth} <ChevronDown size={14} style={{ transform: showMonthMenu ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>
            <AnimatePresence>
              {showMonthMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  style={dropdownMenuStyle}
                >
                  {months.map(m => (
                    <div key={m} onClick={() => { setSelectedMonth(m); setShowMonthMenu(false); }} className="dropdown-item" style={dropdownItemStyle}>{m}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown Ano */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowYearMenu(!showYearMenu)}
              style={filterSelectStyle}
            >
              {selectedYear} <ChevronDown size={14} style={{ transform: showYearMenu ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>
            <AnimatePresence>
              {showYearMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  style={dropdownMenuStyle}
                >
                  {years.map(y => (
                    <div key={y} onClick={() => { setSelectedYear(y); setShowYearMenu(false); }} className="dropdown-item" style={dropdownItemStyle}>{y}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => alert('Filtros Avançados: Em desenvolvimento para integração com o banco de dados.')} 
            style={filterIconButtonStyle}
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <KPICard 
          title="Receita Total" 
          value={selectedMonth === 'Março' ? "$12,450" : "$9,820"} 
          change="+8.2% vs mês passado" 
          icon={<Wallet size={20} color="var(--primary)" />} 
          bgColor="rgba(138, 43, 226, 0.05)"
          accentColor="var(--primary)"
        />
        <KPICard 
          title="Lucro Mensal" 
          value={selectedMonth === 'Março' ? "$3,200" : "$2,150"} 
          change="+4.1% vs mês passado" 
          icon={<TrendingUp size={20} color="var(--secondary)" />} 
          bgColor="rgba(74, 225, 118, 0.05)"
          accentColor="var(--secondary)"
        />
        <KPICard 
          title="Impressões Ativas" 
          value="8" 
          change="82% de utilização" 
          icon={<Printer size={20} color="var(--accent-cyan)" />} 
          bgColor="rgba(34, 211, 238, 0.05)"
          accentColor="var(--accent-cyan)"
        />
        <KPICard 
          title="Orçamentos Pendentes" 
          value="15" 
          change="Necessita revisão" 
          icon={<FileText size={20} color="#F59E0B" />} 
          bgColor="rgba(245, 158, 11, 0.05)"
          accentColor="#F59E0B"
        />
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Receita vs Lucro</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-dim)' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div> Receita ($)</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></div> Lucro ($)</span>
            </div>
          </div>
          <div style={{ height: '240px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px' }}>
             <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <path d="M0,180 L100,160 L200,170 L300,140 L400,130 L500,110 L600,100" fill="none" stroke="var(--primary)" strokeWidth="2" />
                <path d="M0,230 L100,225 L200,232 L300,210 L400,215 L500,205 L600,195" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeDasharray="4 2" />
             </svg>
             <div style={chartAxisLabel}>Jan</div>
             <div style={chartAxisLabel}>Fev</div>
             <div style={chartAxisLabel}>Mar</div>
             <div style={chartAxisLabel}>Abr</div>
             <div style={chartAxisLabel}>Mai</div>
             <div style={chartAxisLabel}>Jun</div>
             <div style={chartAxisLabel}>Jul</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '32px' }}>Distribuição de Clientes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '25px solid var(--primary)', borderRightColor: 'var(--accent-cyan)', borderBottomColor: 'var(--secondary)', borderLeftColor: '#F59E0B', position: 'relative' }}>
               <div style={{ position: 'absolute', inset: '-2px', borderRadius: '50%', border: '4px solid var(--bg-main)', transition: '0.3s' }}></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
              <LegendItem color="var(--primary)" label="B2B (Empresas)" />
              <LegendItem color="var(--accent-cyan)" label="Prototipagem" />
              <LegendItem color="#F59E0B" label="Hobbyistas" />
              <LegendItem color="var(--secondary)" label="Educação" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Críticos Section (Sample) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '32px' }}>Volume de Produção (Semanal)</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
             {[120, 155, 140, 180].map((h, i) => (
               <div key={i} style={{ textAlign: 'center', width: '25%' }}>
                 <div style={{ height: `${(h/180)*160}px`, background: 'var(--accent-cyan)', borderRadius: '4px 4px 0 0', margin: '0 auto', width: '60px', opacity: 0.8 }}></div>
                 <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>Sem {i+1}</p>
               </div>
             ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
               <AlertTriangle size={18} color="var(--error)" /> Alertas Críticos
            </h3>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 600 }}>Ver Todos</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AlertItem icon={<AlertTriangle size={14} />} color="#FF4D4D" title="Estoque Baixo: PETG Fibra de Carbono" desc="Abaixo de 1kg. Necessário para Pedido #6842." time="Há 2h" />
            <AlertItem icon={<Settings size={14} />} color="#F59E0B" title="Manutenção Pendente: Prusa XL #02" desc="Troca de nozzle recomendada (500h de uso)." time="Há 5h" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function KPICard({ title, value, change, icon, bgColor, accentColor }: any) {
  return (
    <div className="glass-panel" style={{ 
      padding: '24px', 
      borderRadius: '16px', 
      background: bgColor, 
      border: `1px solid ${accentColor}20`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px', color: accentColor, opacity: 0.6 }}>
        {icon}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>{title}</p>
      <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{value}</h2>
      <p style={{ fontSize: '11px', color: accentColor, fontWeight: 600 }}>{change}</p>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }}></div>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function AlertItem({ icon, color, title, desc, time }: any) {
  return (
    <div style={{ 
      padding: '12px', 
      background: 'rgba(0,0,0,0.15)', 
      borderRadius: '10px', 
      border: `1px solid ${color}15`,
      display: 'flex',
      gap: '12px'
    }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600 }}>{title}</h4>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{time}</span>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>{desc}</p>
      </div>
    </div>
  );
}

const filterSelectStyle: any = {
  background: 'rgba(255,255,255,0.03)',
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.05)',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  minWidth: '100px',
  justifyContent: 'space-between'
};

const filterIconButtonStyle: any = {
  width: '36px',
  height: '36px',
  background: 'var(--primary)',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const chartAxisLabel: any = {
  fontSize: '10px',
  color: 'var(--text-muted)',
  width: '14%'
};

const dropdownMenuStyle: any = {
  position: 'absolute',
  top: '100%',
  left: 0,
  width: '100%',
  maxHeight: '200px',
  overflowY: 'auto',
  background: 'var(--bg-card)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  border: '1px solid var(--border-glass)',
  marginTop: '4px',
  zIndex: 100,
  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
};

const dropdownItemStyle: any = {
  padding: '8px 16px',
  fontSize: '12px',
  color: 'var(--text-main)',
  cursor: 'pointer',
  transition: '0.2s'
};
