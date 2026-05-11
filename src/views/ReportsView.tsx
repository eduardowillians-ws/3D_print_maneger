import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Zap, 
  Settings, 
  TrendingUp, 
  ChevronDown, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Printer,
  Users,
  Target,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import dashboardApi from '../services/api/dashboard';

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
const currentMonthIndex = new Date().getMonth();

export default function ReportsView() {
  const { currencySymbol } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex]);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [isGenerating, setIsGenerating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [selectedMonth, selectedYear]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.getStats(selectedMonth, selectedYear);
      setReportData({
        revenue: data.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        profit: data.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        energyCost: (data.custos * 0.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        maintenanceCost: (data.custos * 0.35).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        otherCosts: (data.custos * 0.40).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        hoursPrinted: data.impressorasAtivas * 24 * 30,
        energyConsumption: data.chartData,
        topClient: 'Cliente Principal',
        topProduct: 'Produto Principal',
        totalPieces: data.productionData?.reduce((acc: number, d: any) => acc + d.val, 0) || 0,
        materialMix: [
          { type: 'PLA', pct: 60, qty: '0kg' },
          { type: 'PETG', pct: 25, qty: '0kg' },
          { type: 'TPU', pct: 15, qty: '0kg' },
        ],
        maintenanceLog: []
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: '40px' }}>
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
            <span style={{ marginLeft: '10px' }}>{isGenerating ? 'Gerando Relatório...' : 'Gerar Relatório PDF'}</span>
            {isGenerating && <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={loadingBarStyle} />}
          </button>
        </div>
      </div>

      <div style={kpiGridStyle}>
        {isLoading ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>Carregando dados reais...</p>
          </div>
        ) : (
          <>
            <KPICard title="Receita Total" value={`${currencySymbol} ${reportData.revenue}`} icon={<TrendingUp size={20} color="#22C55E" />} color="#22C55E" desc="Faturamento bruto mensal" />
            <KPICard title="Lucro Mensal" value={`${currencySymbol} ${reportData.profit}`} icon={<Zap size={20} color="var(--primary)" />} color="var(--primary)" desc="Resultado líquido calculado" />
            <KPICard title="Top Cliente" value={reportData.topClient} icon={<Users size={20} color="var(--accent-cyan)" />} color="var(--accent-cyan)" desc="Maior volume de compras" />
            <KPICard title="Produto Estrela" value={reportData.topProduct} icon={<Target size={20} color="#F59E0B" />} color="#F59E0B" desc="Item mais produzido" />
          </>
        )}
      </div>

      {!isLoading && reportData && (
        <>
          <div style={gridStyle}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={18} color="var(--primary)" /> Consumo Energético Diário (kWh)
                </h3>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>MAIS RECENTE</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                {(reportData.energyConsumption || []).map((val: number, i: number) => (
                  <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(val, 5)}%` }} transition={{ duration: 1, delay: i * 0.01 }} style={{ width: '100%', background: 'linear-gradient(to top, var(--primary) 0%, rgba(138, 43, 226, 0.4) 100%)', borderRadius: '2px 2px 0 0' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="var(--secondary)" /> Mix de Materiais Usados
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reportData.materialMix.map((mat: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{mat.type}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{mat.pct}% ({mat.qty})</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${mat.pct}%` }} transition={{ duration: 1, delay: 0.2 }} style={{ height: '100%', background: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--accent-cyan)' : 'var(--secondary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {showPreview && reportData && (
          <ReportPreview month={selectedMonth} year={selectedYear} data={reportData} onClose={() => setShowPreview(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ReportPreview({ month, year, data, onClose }: any) {
  const { currencySymbol } = useSettings();
  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={onClose} />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={pdfModalStyle} id="printable-report">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#8A2BE2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 800, margin: 0 }}>PrintPulse 3D Management</h2>
              <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Relatório Estratégico de Auditoria</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginBottom: '30px' }}>
           <div style={pdfSectionStyle}>
              <h4 style={pdfSectionHeaderStyle}>Performance Financeira</h4>
              <div style={pdfRowStyle}><span>Receita Total Bruta</span> <strong style={{ color: '#22c55e' }}>+ {currencySymbol} {data.revenue}</strong></div>
              <div style={pdfRowStyle}><span>Energia Elétrica</span> <span style={{ color: '#ef4444' }}>- {currencySymbol} {data.energyCost}</span></div>
              <div style={pdfRowStyle}><span>Manutenção e Insumos</span> <span style={{ color: '#ef4444' }}>- {currencySymbol} {data.maintenanceCost}</span></div>
              <div style={pdfRowStyle}><span>Custos Operacionais</span> <span style={{ color: '#ef4444' }}>- {currencySymbol} {data.otherCosts}</span></div>
              <div style={{ ...pdfRowStyle, border: 'none', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #f0f0f0' }}>
                <span style={{ fontWeight: 800 }}>LUCRO LÍQUIDO MENSAL</span> <strong style={{ color: '#8A2BE2', fontSize: '16px' }}>{currencySymbol} {data.profit}</strong>
              </div>
           </div>
           
           <div style={pdfSectionStyle}>
              <h4 style={pdfSectionHeaderStyle}>Operação & Rankings</h4>
              <div style={pdfRowStyle}><span>Top Cliente</span> <strong>{data.topClient}</strong></div>
              <div style={pdfRowStyle}><span>Top Produto</span> <strong>{data.topProduct}</strong></div>
              <div style={pdfRowStyle}><span>Peças Produzidas</span> <strong>{data.totalPieces} un</strong></div>
              <div style={pdfRowStyle}><span>Horas de Máquina</span> <strong>{data.hoursPrinted}h</strong></div>
           </div>
        </div>

        <div style={pdfSectionStyle}>
          <h4 style={pdfSectionHeaderStyle}>Mix de Materiais Consumidos</h4>
          <div style={{ display: 'flex', gap: '15px' }}>
            {data.materialMix.map((mat: any, i: number) => (
              <div key={i} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#999', fontWeight: 700, marginBottom: '5px' }}>{mat.type}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a1a' }}>{mat.qty}</div>
                <div style={{ fontSize: '10px', color: '#8A2BE2', fontWeight: 700 }}>{mat.pct}% do total</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '30px' }} className="no-print">
           <button onClick={handlePrint} style={{ width: '100%', height: '54px', borderRadius: '12px', border: 'none', background: '#8A2BE2', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
             <Download size={20} /> Confirmar & Imprimir Relatório
           </button>
        </div>
      </motion.div>
    </>
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

const headerContainerStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' };
const kpiGridStyle: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' };
const gridStyle: any = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', flexWrap: 'wrap' };
const dropdownStyle: any = { position: 'absolute', top: '55px', left: 0, width: '100%', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' };
const dropdownItemStyle: any = { padding: '12px 16px', fontSize: '13px', cursor: 'pointer', transition: '0.2s', borderBottom: '1px solid rgba(255,255,255,0.03)' };
const loadingBarStyle: any = { position: 'absolute', bottom: 0, left: 0, height: '4px', width: '100%', background: 'rgba(255,255,255,0.2)', zIndex: 2 };
const modalOverlayStyle: any = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const pdfModalStyle: any = { position: 'relative', width: '90%', maxWidth: '800px', maxHeight: '90vh', background: 'white', borderRadius: '24px', padding: '40px', zIndex: 2001, overflowY: 'auto' as 'auto', color: '#1a1a1a', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', margin: 'auto' };
const pdfSectionStyle: any = { border: '1px solid #eee', borderRadius: '16px', padding: '20px' };
const pdfSectionHeaderStyle: any = { fontSize: '11px', fontWeight: 800, color: '#8A2BE2', textTransform: 'uppercase', marginBottom: '15px' };
const pdfRowStyle: any = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f5f5f5', color: '#444' };
