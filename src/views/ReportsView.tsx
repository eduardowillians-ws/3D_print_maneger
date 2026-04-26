import { useState } from 'react';
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

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const years = ['2023', '2024', '2025'];

export default function ReportsView() {
  const { currencySymbol } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState('Abril');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Função para gerar dados reativos baseados no filtro
  const getReportsData = (month: string, year: string) => {
    const seed = month.length + (parseInt(year) - 2000); 
    const revenueBase = 5000 + (seed * 450);
    const energyBase = 400 + (seed * 42.8);
    const maintBase = 600 + (seed * 31.5);
    const others = 250 + (seed * 15);
    
    const totalCosts = energyBase + maintBase + others;
    const profit = revenueBase - totalCosts;

    return {
      revenue: revenueBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      profit: profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      energyCost: energyBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      maintenanceCost: maintBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      otherCosts: others.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      hoursPrinted: 800 + (seed * 55),
      energyConsumption: Array.from({ length: 30 }, (_, i) => 30 + Math.sin(seed + i) * 20 + (seed % 10)),
      topClient: seed % 2 === 0 ? 'Aero Dynamics inc.' : 'MedTech Solutions',
      topProduct: seed % 3 === 0 ? 'Engrenagem Industrial v2' : 'Case Protetora TPU',
      totalPieces: 120 + (seed * 8),
      materialMix: [
        { type: 'PLA Premium', pct: 65 + (seed % 10), qty: (12 + (seed % 5)).toFixed(1) + 'kg' },
        { type: 'PETG Carbon', pct: 25 - (seed % 5), qty: (4 + (seed % 3)).toFixed(1) + 'kg' },
        { type: 'TPU 95A', pct: 10 - (seed % 5), qty: (1.5 + (seed % 2)).toFixed(1) + 'kg' },
      ],
      maintenanceLog: [
        { id: `MNT-${seed}02`, machine: 'Prusa XL #01', part: 'Nozzle 0.4mm', date: `21/${(months.indexOf(month) + 1).toString().padStart(2, '0')}/${year}`, cost: 120.00 + seed },
        { id: `MNT-${seed}01`, machine: 'Voron 2.4', part: 'Correias Gates', date: `15/${(months.indexOf(month) + 1).toString().padStart(2, '0')}/${year}`, cost: 350.50 + seed },
        { id: `MNT-${seed}10`, machine: 'Bambu Lab X1-C', part: 'Limpeza e Lubrificação', date: `05/${(months.indexOf(month) + 1).toString().padStart(2, '0')}/${year}`, cost: 85.00 + seed },
      ]
    };
  };

  const data = getReportsData(selectedMonth, selectedYear);

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
        <KPICard title="Receita Total" value={`${currencySymbol} ${data.revenue}`} icon={<TrendingUp size={20} color="#22C55E" />} color="#22C55E" desc="Faturamento bruto mensal" />
        <KPICard title="Lucro Mensal" value={`${currencySymbol} ${data.profit}`} icon={<Zap size={20} color="var(--primary)" />} color="var(--primary)" desc="Resultado líquido calculado" />
        <KPICard title="Top Cliente" value={data.topClient} icon={<Users size={20} color="var(--accent-cyan)" />} color="var(--accent-cyan)" desc="Maior volume de compras" />
        <KPICard title="Produto Estrela" value={data.topProduct} icon={<Target size={20} color="#F59E0B" />} color="#F59E0B" desc="Item mais produzido" />
      </div>

      <div style={gridStyle}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Zap size={18} color="var(--primary)" /> Consumo Energético Diário (kWh)
             </h3>
             <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>MAIORES PICOS ÁS 14H - 18H</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
            {data.energyConsumption.map((val, i) => (
              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(val / 80) * 100}%` }} transition={{ duration: 1, delay: i * 0.01 }} style={{ width: '100%', background: 'linear-gradient(to top, var(--primary) 0%, rgba(138, 43, 226, 0.4) 100%)', borderRadius: '2px 2px 0 0' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={18} color="var(--secondary)" /> Mix de Materiais Usados
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {data.materialMix.map((mat, i) => (
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

      <AnimatePresence>
        {showPreview && (
          <ReportPreview month={selectedMonth} year={selectedYear} data={data} onClose={() => setShowPreview(false)} />
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
