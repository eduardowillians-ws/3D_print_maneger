import { useState, useEffect } from 'react';
import { 
  Download, 
  Zap, 
  TrendingUp, 
  ChevronDown, 
  RefreshCw, 
  Clock,
  Users,
  Target,
  Package,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import dashboardApi from '../services/api/dashboard';
import { productionApi } from '../services/api/production';

const months = ['Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

export default function ReportsView() {
  const { currencySymbol } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [isGenerating, setIsGenerating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [materialMonth, setMaterialMonth] = useState<string>('Todos');
  const [materialYear, setMaterialYear] = useState<string>(String(currentYear));

  const showMaterialClear = materialMonth !== 'Todos' || materialYear !== String(currentYear);

  useEffect(() => {
    loadReportData();
  }, [selectedMonth, selectedYear, materialMonth, materialYear]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const dashboardData = await dashboardApi.getStats(selectedMonth, selectedYear);

      if (!dashboardData) {
        setIsLoading(false);
        return;
      }

      const monthListForAPI = ['Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const monthIndexForAPI = materialMonth === 'Todos' ? -1 : monthListForAPI.indexOf(materialMonth) - 1;
      const matMonthIndex = materialMonth === 'Todos' ? undefined : monthIndexForAPI;
      const matYear = materialYear;

      const [materialsData, topClients, topProducts, jobsWithTime] = await Promise.all([
        productionApi.getAggregatedMaterials(matMonthIndex, matYear),
        productionApi.getTopClients(matMonthIndex, matYear, 5),
        productionApi.getTopProducts(matMonthIndex, matYear, 5),
        productionApi.getJobsWithEstimatedTime(selectedMonth === 'Todos' ? undefined : monthListForAPI.indexOf(selectedMonth) - 1, selectedYear)
      ]);

      const totalWeight = materialsData.reduce((acc: number, m: any) => acc + m.total_weight, 0);

      const materialMix = materialsData.map((m: any) => ({
        type: m.material_name,
        qty: (m.total_weight / 1000).toFixed(2) + 'kg',
        weight: m.total_weight,
        pct: totalWeight > 0 ? Math.round((m.total_weight / totalWeight) * 100) : 0
      }));

      const totalPieces = dashboardData.productionData?.reduce((acc: number, d: any) => acc + d.val, 0) || 0;
      
      const hoursPrinted = jobsWithTime.reduce((acc: number, job: any) => acc + job.estimatedHours, 0);
      const hoursPrintedFormatted = hoursPrinted.toFixed(1);

      setReportData({
        revenue: dashboardData.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        profit: dashboardData.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        energyCost: (dashboardData.custos * 0.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        maintenanceCost: (dashboardData.custos * 0.35).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        otherCosts: (dashboardData.custos * 0.40).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        hoursPrinted: hoursPrinted,
        hoursPrintedFormatted: hoursPrintedFormatted,
        topClient: topClients.length > 0 ? topClients[0].name : 'Sem dados',
        topProduct: topProducts.length > 0 ? topProducts[0].name : 'Sem dados',
        totalPieces: totalPieces,
        materialMix,
        topClients,
        topProducts
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const handleGeneratePDF = () => {
    if (!reportData || isLoading) {
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 1500);
  };

  const clearMaterialFilter = () => {
    setMaterialMonth('Todos');
    setMaterialYear(String(currentYear));
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 128px)', padding: '0 0 40px 0' }}>
      <div style={headerContainerStyle}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Relatórios Estratégicos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Análise completa de resultados operacionais e financeiros.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <CustomSelect label={selectedMonth} options={months} isOpen={openDropdown === 'month'} onToggle={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')} onSelect={(m: string) => { setSelectedMonth(m); setOpenDropdown(null); }} />
            <CustomSelect label={selectedYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')} onSelect={(y: string) => { setSelectedYear(y); setOpenDropdown(null); }} />
          </div>
          
          <button className="btn-primary" onClick={handleGeneratePDF} disabled={isGenerating} style={{ height: '54px', padding: '0 24px', minWidth: '180px', position: 'relative', overflow: 'hidden' }}>
            {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
            <span style={{ marginLeft: '10px' }}>{isGenerating ? 'Gerando...' : 'Gerar PDF'}</span>
          </button>
        </div>
      </div>

      <div style={kpiGridStyle}>
        {isLoading ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>Carregando...</p>
          </div>
        ) : reportData ? (
          <>
            <KPICard title="Receita Total" value={`${currencySymbol} ${reportData.revenue}`} icon={<TrendingUp size={20} color="#22C55E" />} color="#22C55E" desc="Faturamento bruto" />
            <KPICard title="Lucro Mensal" value={`${currencySymbol} ${reportData.profit}`} icon={<Zap size={20} color="var(--primary)" />} color="var(--primary)" desc="Resultado líquido" />
            <KPICard title="Peças Produzidas" value={`${reportData.totalPieces} un`} icon={<Package size={20} color="var(--accent-cyan)" />} color="var(--accent-cyan)" desc="Total no período" />
            <KPICard title="Horas de Impressão" value={`${reportData.hoursPrintedFormatted}h`} icon={<Clock size={20} color="#F59E0B" />} color="#F59E0B" desc="Tempo total" />
          </>
        ) : null}
      </div>

      {!isLoading && reportData && (
        <>
          <div style={gridStyle}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="var(--primary)" /> TOP 5 Clientes
              </h3>
              {reportData.topClients.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>Nenhum cliente</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reportData.topClients.map((client: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(138, 43, 226, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{client.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--secondary)' }}>{currencySymbol} {client.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={18} color="var(--accent-cyan)" /> TOP 5 Produtos
              </h3>
              {reportData.topProducts.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>Nenhum produto</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reportData.topProducts.map((product: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(22, 189, 202, 0.2)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{product.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{product.totalQuantity} un</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="var(--secondary)" /> Mix de Materiais
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CustomSelect label={materialMonth} options={months} isOpen={openDropdown === 'materialMonth'} onToggle={() => setOpenDropdown(openDropdown === 'materialMonth' ? null : 'materialMonth')} onSelect={(m: string) => { setMaterialMonth(m); setOpenDropdown(null); }} />
                <CustomSelect label={materialYear} options={years} isOpen={openDropdown === 'materialYear'} onToggle={() => setOpenDropdown(openDropdown === 'materialYear' ? null : 'materialYear')} onSelect={(y: string) => { setMaterialYear(y); setOpenDropdown(null); }} />
                {showMaterialClear && (
                  <button onClick={clearMaterialFilter} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <X size={14} /> Limpar
                  </button>
                )}
              </div>
            </div>
            
            {reportData.materialMix.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>Nenhum material</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reportData.materialMix.map((mat: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{mat.type}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{mat.pct}% ({mat.qty})</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(mat.pct || 0, 0)}%` }} transition={{ duration: 1, delay: 0.2 }} style={{ height: '100%', background: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--accent-cyan)' : 'var(--secondary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showPreview && reportData && (
        <ReportPreview data={reportData} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

function KPICard({ title, value, icon, color, desc }: any) {
  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{title.toUpperCase()}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{value}</h2>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  );
}

function CustomSelect({ label, options, isOpen, onToggle, onSelect }: any) {
  return (
    <div style={{ position: 'relative', minWidth: '120px' }}>
      <div onClick={onToggle} style={{ height: '48px', padding: '0 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
        <span>{label}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={dropdownStyle}>
            {options.map((opt: string) => (<div key={opt} onClick={() => onSelect(opt)} style={dropdownItemStyle}>{opt}</div>))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportPreview({ data, onClose }: any) {
  const { currencySymbol } = useSettings();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      background: 'rgba(0,0,0,0.9)', 
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '24px', 
        padding: '40px', 
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: '#1a1a1a'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h2 style={{ color: '#8A2BE2', fontSize: '20px', fontWeight: 800 }}>Relatório PDF</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px' }}>
            <h4 style={{ color: '#8A2BE2', fontSize: '12px', marginBottom: '10px' }}>RECEITA</h4>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>{currencySymbol} {data.revenue}</p>
          </div>
          <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px' }}>
            <h4 style={{ color: '#8A2BE2', fontSize: '12px', marginBottom: '10px' }}>LUCRO</h4>
            <p style={{ fontSize: '24px', fontWeight: 800 }}>{currencySymbol} {data.profit}</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px' }}>
            <h4 style={{ color: '#8A2BE2', fontSize: '12px', marginBottom: '10px' }}>PEÇAS PROD.</h4>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#16BDCA' }}>{data.totalPieces} un</p>
          </div>
          <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px' }}>
            <h4 style={{ color: '#8A2BE2', fontSize: '12px', marginBottom: '10px' }}>HORAS IMPRESSÃO</h4>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B' }}>{data.hoursPrintedFormatted}h</p>
          </div>
        </div>
        
        <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px' }}>
          <h4 style={{ color: '#8A2BE2', fontSize: '12px', marginBottom: '10px' }}>MATERIAIS</h4>
          {data.materialMix.map((m: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span>{m.type}</span>
              <span>{m.qty} ({m.pct}%)</span>
            </div>
          ))}
        </div>
        
        <button onClick={onClose} style={{ 
          marginTop: '20px', 
          width: '100%', 
          padding: '15px', 
          background: '#8A2BE2', 
          color: 'white', 
          border: 'none', 
          borderRadius: '12px',
          fontWeight: 700,
          cursor: 'pointer'
        }}>
          Fechar
        </button>
      </div>
    </div>
  );
}

const headerContainerStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' };
const kpiGridStyle: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' };
const gridStyle: any = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };
const dropdownStyle: any = { position: 'absolute', top: '55px', left: 0, width: '100%', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' };
const dropdownItemStyle: any = { padding: '12px 16px', fontSize: '13px', cursor: 'pointer', transition: '0.2s', borderBottom: '1px solid rgba(255,255,255,0.03)' };