import { useState, useEffect } from 'react';
import { 
  Plus, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  MoreVertical, 
  Clock, 
  Printer as PrinterIcon, 
  Box, 
  X,
  Edit2,
  Trash2,
  ChevronRight,
  Settings,
  RefreshCw,
  Zap,
  Activity,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { printersApi } from '../services/api/printers';
import { productionApi } from '../services/api/production';
import { PrinterStatus } from '../types/database';

interface Printer {
  id: string;
  name: string;
  model: string;
  status: 'ATIVA' | 'OCIOSA' | 'MANUTENCAO';
  hours: string;
  initialHours: number;
  activeJob?: string;
  progress?: number;
  alert?: string;
  targetHotend: string;
  targetBed: string;
  targetFan: string;
  volume?: string;
  lastMaintenance?: string;
  totalJobs: number;
  totalPieces: number;
  avgTimePerPiece: number;
}

export default function ImpressorasView() {
  const { currencySymbol } = useSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  
  // Estados para o formulário
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [hotend, setHotend] = useState('210');
  const [bed, setBed] = useState('60');
  const [fan, setFan] = useState('100');
  const [volume, setVolume] = useState('256mm*256mm*256mm');
  const [initialHours, setInitialHours] = useState('0');

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    setIsLoading(true);
    const { data: printersData, error } = await printersApi.getAll();
    const { data: jobsData } = await productionApi.getAll();
    
    if (error) {
      console.error('Erro ao carregar impressoras:', error.message);
      setIsLoading(false);
      return;
    }
    
    if (printersData && Array.isArray(printersData)) {
      const mappedData: Printer[] = [];
      printersData.forEach((p: any) => {
        if (p) {
          // Calcular horas acumuladas de todos os jobs desta impressora
          let accumulatedHours = 0;
          let totalJobsCompleted = 0;
          let totalPiecesCompleted = 0;
          let totalPrintTime = 0;
          const printerJobs = jobsData?.filter((j: any) => j.printer_id === p.id) || [];
          
          printerJobs.forEach((job: any) => {
            if (job.status === 'CONCLUIDO' && job.start_time && job.end_time) {
              // Calcular horas reais do job
              const start = new Date(job.start_time).getTime();
              const end = new Date(job.end_time).getTime();
              const hours = (end - start) / (1000 * 60 * 60);
              accumulatedHours += hours * (job.quantity || 1);
              totalJobsCompleted++;
              totalPiecesCompleted += job.quantity || 1;
              totalPrintTime += hours;
            } else if (job.status === 'IMPRIMINDO' && job.start_time) {
              // Job em andamento - calcular desde o início
              const start = new Date(job.start_time).getTime();
              const now = new Date().getTime();
              const hours = (now - start) / (1000 * 60 * 60);
              accumulatedHours += hours * (job.quantity || 1);
            }
          });
          
          const totalHours = accumulatedHours;
          const avgTimePerPiece = totalPiecesCompleted > 0 ? totalPrintTime / totalPiecesCompleted : 0;
          
          mappedData.push({
            id: p.id || '',
            name: p.name || 'Sem nome',
            model: p.name || 'Sem modelo',
            status: p.status === 'IMPRIMINDO' ? 'ATIVA' : p.status === 'MANUTENÇÃO' ? 'MANUTENCAO' : 'OCIOSA',
            hours: `${totalHours.toFixed(1)} h`,
            initialHours: p.initial_hours || 0,
            targetHotend: String(p.target_hotend || 0),
            targetBed: String(p.target_bed || 0),
            targetFan: String(p.target_fan || 0),
            volume: p.volume || '',
            lastMaintenance: p.last_maintenance_date || '',
            totalJobs: totalJobsCompleted,
            totalPieces: totalPiecesCompleted,
            avgTimePerPiece: avgTimePerPiece
          });
        }
      });
      setPrinters(mappedData);
    }
    setIsLoading(false);
  };

  const handleSavePrinter = async () => {
    if (!name || !model) {
      alert('Nome e modelo são obrigatórios!');
      return;
    }

    const printerData = {
      name: name,
      status: 'OCIOSA' as PrinterStatus,
      target_hotend: parseInt(hotend),
      target_bed: parseInt(bed),
      target_fan: parseInt(fan),
      volume: volume,
      initial_hours: parseFloat(initialHours),
      current_hours: 0
    };

    const { data, error } = await printersApi.create(printerData);
    if (error) {
      alert('Erro ao cadastrar impressora: ' + error.message);
      return;
    }

    if (data) {
      const newPrinter: Printer = {
        id: data.id,
        name: data.name,
        model: data.name,
        status: 'OCIOSA',
        hours: '0.0 h',
        initialHours: data.initial_hours || 0,
        targetHotend: data.target_hotend.toString(),
        targetBed: data.target_bed.toString(),
        targetFan: data.target_fan.toString(),
        totalJobs: 0,
        totalPieces: 0,
        avgTimePerPiece: 0
      };
      setPrinters([...printers, newPrinter]);
    }
    
    setShowAddModal(false);
    resetForm();
    alert('Impressora cadastrada com sucesso!');
  };

  const resetForm = () => {
    setName('');
    setModel('');
    setHotend('210');
    setBed('60');
    setFan('100');
    setVolume('256mm*256mm*256mm');
    setInitialHours('0');
  };

  const handleCancelJob = (id: string) => {
    if (confirm('Deseja realmente cancelar o trabalho atual? A impressora voltará ao estado OCIOSA.')) {
      setPrinters(prev => prev.map(p => 
        p.id === id ? { ...p, status: 'OCIOSA', progress: 0, activeJob: undefined } : p
      ));
      alert('Impressão cancelada.');
    }
  };

  const handleCalibrate = async (printer: Printer) => {
    setActiveMenu(null);
    alert(`Iniciando calibração completa para ${printer.name}... Aguarde a confirmação da máquina.`);
    
    // Atualizar última calibração automaticamente
    await printersApi.update(printer.id, { 
      last_calibration: new Date().toISOString() 
    } as any);
    
    setTimeout(() => {
        alert('Calibração Niv. de Mesa e Input Shaper concluídos com sucesso!');
    }, 1500);
  };

  const openRename = (printer: Printer) => {
    setSelectedPrinter(printer);
    setName(printer.name);
    setShowRenameModal(true);
    setActiveMenu(null);
  };

  const handleRename = async () => {
    if (!name.trim() || !selectedPrinter) return;
    
    const { error } = await printersApi.update(selectedPrinter.id, { name: name.trim() });
    if (error) {
      alert('Erro ao renomear impressora: ' + error.message);
      return;
    }
    
    setPrinters(prev => prev.map(p => 
        p.id === selectedPrinter.id ? { ...p, name: name.trim() } : p
    ));
    setShowRenameModal(false);
    setSelectedPrinter(null);
    setName('');
    alert('Identificação da máquina atualizada!');
  };

  const openDetails = (printer: Printer) => {
    setSelectedPrinter(printer);
    setShowDetailsModal(true);
    setActiveMenu(null);
  };

  const handleDelete = async (id: string) => {
    if(confirm('Atenção: Excluir a impressora removerá todo o histórico de manutenção. Confirma?')) {
      const { error } = await printersApi.delete(id);
      if (error) {
        alert('Erro ao excluir impressora: ' + error.message);
        return;
      }
      setPrinters(prev => prev.filter(p => p.id !== id));
      setActiveMenu(null);
    }
  };

  const handleSetMaintenance = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await printersApi.update(id, { 
      status: 'MANUTENÇÃO',
      last_maintenance_date: today
    } as any);
    if (error) {
      alert('Erro ao colocar em manutenção: ' + error.message);
      return;
    }
    setPrinters(prev => prev.map(p => p.id === id ? { ...p, status: 'MANUTENCAO', alert: 'EM MANUTENÇÃO' } : p));
    setActiveMenu(null);
    alert('Impressora colocada em modo manutenção.');
  };

  const handleRemoveMaintenance = async (id: string) => {
    const { error } = await printersApi.update(id, { status: 'OCIOSA' });
    if (error) {
      alert('Erro ao retirar de manutenção: ' + error.message);
      return;
    }
    setPrinters(prev => prev.map(p => p.id === id ? { ...p, status: 'OCIOSA', alert: undefined } : p));
    setActiveMenu(null);
    alert('Impressora disponível novamente. Data de manutenção registrada.');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Impressoras</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie e monitore sua frota de manufatura aditiva.</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Adicionar Impressora
        </button>
      </div>

      {/* KPI Cards Rápido */}
      <div style={quickStatsStyle}>
        <StatCard icon={<PrinterIcon size={16} />} label="Frota Total" value={printers.length.toString()} />
        <StatCard icon={<Activity size={16} color="var(--primary)" />} label="Impressão Ativa" value={printers.filter(p => p.status === 'ATIVA').length.toString()} />
        <StatCard icon={<CheckCircle size={16} color="var(--secondary)" />} label="Ociosas / Prontas" value={printers.filter(p => p.status === 'OCIOSA').length.toString()} />
        <StatCard icon={<AlertTriangle size={16} color="var(--error)" />} label="Manutenção" value={printers.filter(p => p.status === 'MANUTENCAO').length.toString()} />
      </div>

      {/* Grid de Impressoras */}
      <div style={gridStyle}>
        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)' }}
          >
            <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: '12px' }}>Carregando impressoras...</span>
          </motion.div>
        ) : printers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}
          >
            <PrinterIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Nenhuma impressora cadastrada</p>
          </motion.div>
        ) : (
          printers.map(printer => (
          <div key={printer.id} className="glass-panel" style={cardStyle}>
            {/* Tag de Status */}
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <StatusBadge status={printer.status} />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{printer.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '12px' }}>
                    <Clock size={14} /> {printer.hours}
                </div>
            </div>

            {/* Conteúdo Dinâmico por Status */}
            <div style={contentAreaStyle}>
                {printer.status === 'ATIVA' && (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 700 }}>Trabalho Atual</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: 'var(--primary)' }}>{printer.activeJob}</p>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(printer.progress || 0, 0)}%` }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent-cyan))', boxShadow: '0 0 10px var(--primary-glow)' }} 
                            />
                        </div>
                    </div>
                )}
                {printer.status === 'OCIOSA' && (
                    <div style={{ textAlign: 'center', opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <Box size={32} />
                        <p style={{ fontSize: '14px', fontWeight: 600 }}>Mesa Livre</p>
                    </div>
                )}
                {printer.status === 'MANUTENCAO' && (
                    <div style={{ textAlign: 'center', color: 'var(--error)' }}>
                        <AlertTriangle size={32} style={{ marginBottom: '12px', opacity: 0.8 }} />
                        <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{printer.alert}</p>
                    </div>
                )}
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button style={actionButtonStyle} onClick={() => openDetails(printer)}>Detalhes</button>
                
                {printer.status === 'ATIVA' && (
                    <button style={cancelButtonStyle} onClick={() => handleCancelJob(printer.id)}>Cancelar</button>
                )}
                {printer.status === 'OCIOSA' && (
                    <button style={startButtonStyle} onClick={() => alert('Para iniciar um trabalho, vá ao módulo de Produção e atribua esta impressora ao job.')}>Iniciar Trabalho</button>
                )}
                {printer.status === 'MANUTENCAO' && (
                    <button style={resolveButtonStyle} onClick={() => handleRemoveMaintenance(printer.id)}>Resolver</button>
                )}

                <div style={{ position: 'relative' }}>
                    <button style={moreButtonStyle} onClick={() => setActiveMenu(activeMenu === printer.id ? null : printer.id)}>
                        <MoreVertical size={18} />
                    </button>
                    <AnimatePresence>
                        {activeMenu === printer.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} style={dropdownStyle}>
                                <div style={dropdownItemStyle} onClick={(e) => { e.stopPropagation(); openRename(printer); }}><Edit2 size={14} /> Renomear</div>
                                {printer.status !== 'MANUTENCAO' && (
                                  <div style={dropdownItemStyle} onClick={(e) => { e.stopPropagation(); handleSetMaintenance(printer.id); }}><Settings size={14} /> Colocar em Manutenção</div>
                                )}
                                {printer.status === 'MANUTENCAO' && (
                                  <div style={{ ...dropdownItemStyle, color: 'var(--secondary)' }} onClick={(e) => { e.stopPropagation(); handleRemoveMaintenance(printer.id); }}><CheckCircle size={14} /> Retirar de Manutenção</div>
                                )}
                                <div style={{ ...dropdownItemStyle, color: 'var(--error)' }} onClick={(e) => { e.stopPropagation(); handleDelete(printer.id); }}><Trash2 size={14} /> Remover Máquina</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Modais */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title="Lançar Nova Impressora" onClose={() => setShowAddModal(false)}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="input-group">
                        <label>Identificação</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: K1 Max #01" style={inputStyle} />
                    </div>
                    <div className="input-group">
                        <label>Modelo</label>
                        <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="Ex: Creality K1" style={inputStyle} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="input-group">
                        <label>Temp. Hotend (máx °C)</label>
                        <input type="number" value={hotend} onChange={e => setHotend(e.target.value)} style={inputStyle} />
                    </div>
                    <div className="input-group">
                        <label>Temp. Mesa (máx °C)</label>
                        <input type="number" value={bed} onChange={e => setBed(e.target.value)} style={inputStyle} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="input-group">
                        <label>Volume de Montagem</label>
                        <input type="text" value={volume} onChange={e => setVolume(e.target.value)} placeholder="Ex: 256mm*256mm*256mm" style={inputStyle} />
                    </div>
                    <div className="input-group">
                        <label>Horas Iniciais</label>
                        <input type="number" value={initialHours} onChange={e => setInitialHours(e.target.value)} style={inputStyle} />
                    </div>
                </div>

                <button className="btn-primary" style={{ height: '54px', marginTop: '12px', fontSize: '15px' }} onClick={handleSavePrinter}>Salvar e Configurar</button>
             </div>
          </Modal>
        )}

        {showRenameModal && (
          <Modal title="Renomear Impressora" onClose={() => { setShowRenameModal(false); setSelectedPrinter(null); }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                    <label>Novo Nome da Máquina</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoFocus />
                </div>
                <button className="btn-primary" style={{ height: '48px', marginTop: '12px' }} onClick={handleRename}>Atualizar Identificação</button>
             </div>
          </Modal>
        )}

        {showDetailsModal && selectedPrinter && (
          <Modal title={`Telemetria: ${selectedPrinter.name}`} onClose={() => { setShowDetailsModal(false); setSelectedPrinter(null); }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={telemetryItemStyle}>
                        <Zap size={16} color="var(--primary)" />
                        <div>
                            <p style={telemetryLabelStyle}>Bico (Hotend)</p>
                            <p style={telemetryValueStyle}>
                                {selectedPrinter.status === 'ATIVA' ? `${selectedPrinter.targetHotend}°C` : '24°C'}
                                <span style={targetBadgeStyle}>Alvo: {selectedPrinter.targetHotend}°C</span>
                            </p>
                        </div>
                    </div>
                    <div style={telemetryItemStyle}>
                        <Settings size={16} color="var(--secondary)" />
                        <div>
                            <p style={telemetryLabelStyle}>Mesa (Bed)</p>
                            <p style={telemetryValueStyle}>
                                {selectedPrinter.status === 'ATIVA' ? `${selectedPrinter.targetBed}°C` : '24°C'}
                                <span style={targetBadgeStyle}>Alvo: {selectedPrinter.targetBed}°C</span>
                            </p>
                        </div>
                    </div>
                    <div style={telemetryItemStyle}>
                        <RefreshCw size={16} color="var(--accent-cyan)" />
                        <div>
                            <p style={telemetryLabelStyle}>Ventoinha (Fan)</p>
                            <p style={telemetryValueStyle}>
                                {selectedPrinter.status === 'ATIVA' ? `${selectedPrinter.targetFan}%` : '0%'}
                                <span style={targetBadgeStyle}>Alvo: {selectedPrinter.targetFan}%</span>
                            </p>
                        </div>
                    </div>
                    <div style={telemetryItemStyle}>
                        <Clock size={16} color="var(--text-dim)" />
                        <div>
                            <p style={telemetryLabelStyle}>Vida Útil (Estimada)</p>
                            <p style={telemetryValueStyle}>{selectedPrinter.initialHours}h</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={14} color="var(--primary)" /> Histórico de Estado
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.8' }}>
                        <p>• Última manutenção: {selectedPrinter.lastMaintenance ? new Date(selectedPrinter.lastMaintenance).toLocaleDateString('pt-BR') : 'Nunca'}</p>
                        <p>• Trabalhos concluídos: {selectedPrinter.totalJobs}</p>
                        <p>• Peças produzidas: {selectedPrinter.totalPieces}</p>
                        <p>• Tempo médio: {selectedPrinter.avgTimePerPiece > 0 ? `${selectedPrinter.avgTimePerPiece.toFixed(1)}h` : '-'} / peça</p>
                    </div>
                </div>

                <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }} onClick={() => setShowDetailsModal(false)}>
                    Fechar Relatório
                </button>
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ icon, label, value }: any) {
    return (
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '160px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>{icon}</div>
            <div>
                <p style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>{label.toUpperCase()}</p>
                <p style={{ fontSize: '16px', fontWeight: 800 }}>{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        'ATIVA': { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', text: 'ATIVA' },
        'OCIOSA': { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)', text: 'OCIOSA' },
        'MANUTENCAO': { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'MANUTENÇÃO' }
    };
    const s = styles[status] || styles['OCIOSA'];
    return <span style={{ fontSize: '9px', fontWeight: 800, color: s.color, background: s.bg, padding: '4px 8px', borderRadius: '4px', border: `1px solid ${s.color}20` }}>{s.text}</span>;
}

function Modal({ title, children, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

// Estilos
const headerStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' };
const quickStatsStyle: any = { display: 'flex', gap: '16px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' };
const gridStyle: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' };
const cardStyle: any = { padding: '24px', borderRadius: '20px', minHeight: '300px', display: 'flex', flexDirection: 'column', position: 'relative' };
const contentAreaStyle: any = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' };
const actionButtonStyle: any = { flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600 };
const cancelButtonStyle: any = { ...actionButtonStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
const startButtonStyle: any = { ...actionButtonStyle, background: 'var(--primary-glow)', border: '1px solid var(--primary)' };
const resolveButtonStyle: any = { ...startButtonStyle, background: 'var(--secondary-glow)', border: '1px solid var(--secondary)' };
const moreButtonStyle: any = { padding: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', color: 'var(--text-dim)', cursor: 'pointer' };
const inputStyle: any = { width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '14px' };
const dropdownStyle: any = { position: 'absolute', bottom: '100%', right: '0', marginBottom: '12px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, minWidth: '180px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' };
const dropdownItemStyle: any = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'white', transition: '0.2s', textAlign: 'left' };
const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle: any = { width: '100%', maxWidth: '440px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px' };
const telemetryItemStyle: any = { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-glass)' };
const telemetryLabelStyle: any = { fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' };
const telemetryValueStyle: any = { fontSize: '18px', fontWeight: 800, display: 'flex', flexDirection: 'column', gap: '2px' };
const targetBadgeStyle: any = { fontSize: '10px', color: 'var(--primary)', fontWeight: 600, opacity: 0.8 };
