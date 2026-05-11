import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Printer, FileText, ChevronDown, Filter, AlertTriangle, Settings, Clock, Layers, RefreshCw, MoreVertical, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import dashboardApi from '../services/api/dashboard';

export default function PainelView() {
  const { currencySymbol } = useSettings();
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleString('pt-BR', { month: 'long' });
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1));
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth, selectedYear]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const data = await dashboardApi.getStats(selectedMonth, selectedYear);
    setStats(data);
    setIsLoading(false);
  };

  const getDaysInMonth = (monthName: string, year: string) => {
    const monthIndex = months.indexOf(monthName);
    return new Date(parseInt(year), monthIndex + 1, 0).getDate();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const data = stats ? {
    receita: stats.receita,
    lucro: stats.lucro,
    impressoes: stats.impressoesAtivas,
    orcamentos: stats.orcamentosPendentes,
    productionData: stats.productionData,
    chartData: stats.chartData,
    pieData: stats.pieData,
    alerts: stats.alerts
  } : {
    receita: '0',
    lucro: '0',
    impressoes: 0,
    orcamentos: 0,
    productionData: [],
    chartData: [65, 45, 85, 55, 95, 75, 40, 60, 70, 50, 80, 45],
    pieData: [
      { label: 'B2B', val: 40, color: 'var(--primary)' },
      { label: 'Prototipagem', val: 25, color: 'var(--accent-cyan)' },
      { label: 'Hobbyistas', val: 20, color: '#F59E0B' },
      { label: 'Educação', val: 15, color: 'var(--secondary)' }
    ],
    alerts: []
  };

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: '40px' }}>
      <div style={headerContainerStyle}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Centro de Controle</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Visão geral do desempenho e métricas operacionais.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <CustomSelect 
            label={selectedMonth} 
            options={months} 
            isOpen={openDropdown === 'month'} 
            onToggle={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')} 
            onSelect={(m: string) => { setSelectedMonth(m); setOpenDropdown(null); handleRefresh(); }} 
          />
          <CustomSelect 
            label={selectedYear} 
            options={years} 
            isOpen={openDropdown === 'year'} 
            onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')} 
            onSelect={(y: string) => { setSelectedYear(y); setOpenDropdown(null); handleRefresh(); }} 
          />
          {selectedMonth !== currentMonthName && (
            <button onClick={() => { setSelectedMonth(currentMonthName); setOpenDropdown(null); handleRefresh(); }} style={filterIconButtonStyle} title="Limpar Filtro">
              <X size={16} />
            </button>
          )}
          <button onClick={handleRefresh} style={filterIconButtonStyle} title="Sincronizar Dados">
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={kpiGridStyle}>
        {isLoading ? (
          <KPICard title="Carregando..." value="..." change="" icon={<Loader2 size={20} className="animate-spin" />} bgColor="rgba(138, 43, 226, 0.05)" accentColor="var(--primary)" isRefreshing={true} />
        ) : (
          <>
            <KPICard title="Receita Total" value={`${currencySymbol} ${stats ? formatCurrency(stats.receita) : '0'}`} change={`${stats?.changeReceita || '0'}% vs mês anterior`} icon={<Wallet size={20} color="var(--primary)" />} bgColor="rgba(138, 43, 226, 0.05)" accentColor="var(--primary)" isRefreshing={isRefreshing} />
            <KPICard title="Lucro Mensal" value={`${currencySymbol} ${stats ? formatCurrency(stats.lucro) : '0'}`} change={`${stats?.changeLucro || '0'}% vs mês anterior`} icon={<TrendingUp size={20} color="var(--secondary)" />} bgColor="rgba(74, 225, 118, 0.05)" accentColor="var(--secondary)" isRefreshing={isRefreshing} />
            <KPICard title="Impressões Ativas" value={stats?.impressoesAtivas?.toString() || '0'} change={`${stats?.utilization || 0}% de utilização`} icon={<Printer size={20} color="var(--accent-cyan)" />} bgColor="rgba(34, 211, 238, 0.05)" accentColor="var(--accent-cyan)" isRefreshing={isRefreshing} />
            <KPICard title="Orçamentos Pendentes" value={stats?.orcamentosPendentes?.toString() || '0'} change="Necessita revisão" icon={<FileText size={20} color="#F59E0B" />} bgColor="rgba(245, 158, 11, 0.05)" accentColor="#F59E0B" isRefreshing={isRefreshing} />
          </>
        )}
      </div>

      <div style={mainGridStyle}>
        {/* Gráfico de Linha Reativo */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Receita vs Lucro ({selectedYear})</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div> Receita</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></div> Lucro</span>
            </div>
          </div>
          <div style={{ height: '200px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px' }}>
             <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <motion.path 
                  key={`receita-${selectedMonth}-${selectedYear}`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                  d={`M0,${180 - data.chartData[0]} L100,${180 - data.chartData[1]} L200,${180 - data.chartData[2]} L300,${180 - data.chartData[3]} L400,${180 - data.chartData[4]} L500,${180 - data.chartData[5]} L600,${180 - data.chartData[6]}`} 
                  fill="none" stroke="var(--primary)" strokeWidth="2" 
                />
                <motion.path 
                  key={`lucro-${selectedMonth}-${selectedYear}`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2 }}
                  d={`M0,230 L100,225 L200,232 L300,210 L400,215 L500,205 L600,195`} 
                  fill="none" stroke="var(--secondary)" strokeWidth="2" strokeDasharray="4 2" 
                />
             </svg>
             {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'].map(m => <div key={m} style={chartAxisLabel}>{m}</div>)}
          </div>
        </div>

        {/* Gráfico de Rosca Reativo */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '24px' }}>Distribuição de Clientes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <svg viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                    {data.pieData.map((slice: any, idx: number) => {
                        const total = data.pieData.reduce((a: number, b: any) => a + b.val, 0);
                        const offset = data.pieData.slice(0, idx).reduce((a: number, b: any) => a + (b.val / total) * 100, 0);
                        return (
                            <motion.circle 
                                key={`${slice.label}-${selectedMonth}`}
                                initial={{ strokeDasharray: '0 100' }}
                                animate={{ strokeDasharray: `${(slice.val / total) * 100} 100` }}
                                cx="21" cy="21" r="15.915" 
                                fill="transparent" stroke={slice.color} strokeWidth="5" 
                                strokeDashoffset={-offset}
                            />
                        );
                    })}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800 }}>{data.pieData.reduce((a: number, b: any) => a + b.val, 0)}</span>
                    <span style={{ fontSize: '8px', color: 'var(--text-dim)' }}>TOTAL</span>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', width: '100%' }}>
              {data.pieData.map((slice: any) => (
                <LegendItem key={slice.label} color={slice.color} label={slice.label} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Volume de Produção e Alertas (Imagens 2) */}
      <div style={{ ...mainGridStyle, marginTop: '24px', gridTemplateColumns: '1.2fr 1fr' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Volume de Produção (Diário - {selectedMonth})</h3>
                <MoreVertical size={14} color="var(--text-dim)" cursor="pointer" />
            </div>
            <div style={{ overflowX: 'auto', paddingBottom: '12px', cursor: 'grab' }} className="custom-scrollbar">
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '8px', minWidth: `${data.productionData.length * 36}px`, padding: '0 4px' }}>
                    {data.productionData.map((day: any, i: number) => {
                        const maxValue = 40; 
                        const heightPercent = (day.val / maxValue) * 100;

                        return (
                            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '28px' }}>
                                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                                    <motion.div 
                                        key={`${selectedMonth}-${selectedYear}-${i}`}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.02 }}
                                        style={{ 
                                            width: '100%', 
                                            background: 'linear-gradient(to top, var(--primary) 0%, rgba(138, 43, 226, 0.4) 100%)', 
                                            borderRadius: '6px 6px 2px 2px', 
                                            boxShadow: '0 0 15px rgba(138, 43, 226, 0.2)', 
                                            position: 'relative',
                                            border: '1px solid rgba(138, 43, 226, 0.3)'
                                        }} 
                                        title={`Dia ${day.label}: ${day.val} peças`}
                                    >
                                        <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', fontWeight: 800, color: 'var(--primary)' }}>
                                            {day.val}
                                        </div>
                                    </motion.div>
                                </div>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{day.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="var(--error)" /> Alertas Críticos
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Ver Todos</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               {data.alerts && data.alerts.length > 0 ? (
                 data.alerts.map((alert: any, idx: number) => (
                   <AlertItem key={idx} color={alert.color} title={alert.title} desc={alert.desc} time={alert.time} />
                 ))
               ) : (
                 <AlertItem color="var(--secondary)" title="Tudo OK" desc="Nenhum alerta crítico no momento." time="Agora" />
               )}
            </div>
        </div>
      </div>
    </motion.div>
  );
}

function KPICard({ title, value, change, icon, bgColor, accentColor, isRefreshing }: any) {
  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: bgColor, border: `1px solid ${accentColor}20`, position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence>
        {isRefreshing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)', zIndex: 1 }} />
        )}
      </AnimatePresence>
      <div style={{ position: 'absolute', top: '16px', right: '16px', color: accentColor, opacity: 0.6 }}>{icon}</div>
      <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>{title.toUpperCase()}</p>
      <motion.h2 key={value} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{value}</motion.h2>
      <p style={{ fontSize: '10px', color: accentColor, fontWeight: 700 }}>{change}</p>
    </div>
  );
}

function CustomSelect({ label, options, isOpen, onToggle, onSelect }: any) {
  return (
    <div style={{ position: 'relative', minWidth: '110px' }}>
      <div 
        onClick={onToggle}
        style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}
      >
        <span style={{ fontWeight: 600 }}>{label}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 5 }} style={dropdownMenuStyle}>
            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '6px' }}>
              {options.map((opt: string) => (
                <div 
                    key={opt} 
                    onClick={() => onSelect(opt)} 
                    style={{ ...dropdownItemStyle, background: label === opt ? 'rgba(138, 43, 226, 0.1)' : 'transparent', color: label === opt ? 'var(--primary)' : 'white' }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }}></div>
      <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function AlertItem({ color, title, desc, time }: any) {
  return (
    <div style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: `1px solid ${color}15`, display: 'flex', gap: '12px', position: 'relative' }}>
        <div style={{ width: '4px', height: '60%', background: color, borderRadius: '4px', position: 'absolute', left: '0', top: '20%' }} />
        <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700 }}>{title}</h4>
                <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{time}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.4' }}>{desc}</p>
        </div>
    </div>
  );
}

// Estilos Responsivos
const headerContainerStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' };
const kpiGridStyle: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' };
const mainGridStyle: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' };
const filterIconButtonStyle: any = { width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' };
const chartAxisLabel: any = { fontSize: '10px', color: 'var(--text-muted)', width: '14%', textAlign: 'center' };
const dropdownMenuStyle: any = { position: 'absolute', top: '48px', left: 0, width: '140px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', zIndex: 110, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' };
const dropdownItemStyle: any = { padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderRadius: '8px', transition: '0.2s' };
