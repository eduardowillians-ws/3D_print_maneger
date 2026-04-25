import { useState } from 'react';
import { 
  Plus, 
  Play, 
  CheckCircle, 
  Archive, 
  MoreVertical, 
  Clock, 
  Printer as PrinterIcon, 
  Box, 
  X,
  Edit2,
  Trash2,
  ChevronRight,
  History as HistoryIcon,
  Layers,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

type JobStatus = 'PENDENTE' | 'IMPRIMINDO' | 'CONCLUIDO' | 'ARQUIVADO';

interface ProductionJob {
  id: string;
  name: string;
  printer: string;
  material: string;
  timeRemaining: string;
  progress: number;
  status: JobStatus;
  customer: string;
}

export default function ProducaoView() {
  const { currencySymbol } = useSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<ProductionJob | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  
  // Estados para o formulário
  const [name, setName] = useState('');
  const [printer, setPrinter] = useState('');
  const [customer, setCustomer] = useState('');
  
  const [jobs, setJobs] = useState<ProductionJob[]>([
    { id: 'JOB-401', name: 'Suporte de Parede Gopro', printer: 'Prusa XL #01', material: 'PLA Black', timeRemaining: '4h 12m', progress: 45, status: 'IMPRIMINDO', customer: 'João Silva' },
    { id: 'JOB-402', name: 'Engrenagem Bi-Helicoidal', printer: 'Prusa XL #02', material: 'PETG Grey', timeRemaining: '8h 00m', progress: 0, status: 'PENDENTE', customer: 'Tech Robotics' },
    { id: 'JOB-403', name: 'Miniatura Dragão Articulado', printer: 'Prusa MK4 #01', material: 'Silk Rainbow', timeRemaining: '0h 00m', progress: 100, status: 'CONCLUIDO', customer: 'Loja Geek 3D' },
  ]);

  const handleCreateJob = () => {
    if (!name.trim()) {
      alert('Por favor, informe o nome da peça.');
      return;
    }
    
    if (editingJob) {
      setJobs(prev => prev.map(job => job.id === editingJob.id ? { 
        ...job, name, printer, customer 
      } : job));
      alert('Trabalho atualizado!');
    } else {
      const newJob: ProductionJob = {
        id: `JOB-${Math.floor(Math.random() * 900) + 100}`,
        name,
        printer: printer || 'Prusa XL #01',
        material: 'PLA Standard',
        timeRemaining: 'Pendente',
        progress: 0,
        status: 'PENDENTE',
        customer: customer || 'Cliente Avulso'
      };
      setJobs(prev => [newJob, ...prev]);
      alert('Trabalho adicionado à fila!');
    }
    
    setShowAddModal(false);
    resetForm();
  };

  const moveJob = (id: string, newStatus: JobStatus) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { 
        ...job, 
        status: newStatus, 
        progress: newStatus === 'CONCLUIDO' ? 100 : (newStatus === 'IMPRIMINDO' ? 5 : job.progress),
        timeRemaining: newStatus === 'CONCLUIDO' ? '0h 00m' : job.timeRemaining
      } : job
    ));
  };

  const deleteJob = (id: string) => {
    if (confirm('Deseja excluir este trabalho de produção?')) {
      setJobs(prev => prev.filter(job => job.id !== id));
    }
  };

  const startEdit = (job: ProductionJob) => {
    setEditingJob(job);
    setName(job.name);
    setPrinter(job.printer);
    setCustomer(job.customer);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setName('');
    setPrinter('');
    setCustomer('');
    setEditingJob(null);
  };

  const renderColumn = (status: JobStatus, title: string, icon: any) => {
    const list = jobs.filter(j => j.status === status);
    return (
      <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--text-dim)' }}>{icon}</span>
            <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</h3>
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.08)', padding: '2px 10px', borderRadius: '20px', color: 'var(--primary)' }}>{list.length}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '500px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', padding: '8px', border: '1px dashed rgba(255,255,255,0.05)' }}>
          <AnimatePresence mode="popLayout">
            {list.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onMove={(status) => moveJob(job.id, status)} 
                  onDelete={() => deleteJob(job.id)} 
                  onEdit={() => startEdit(job)}
                />
            ))}
          </AnimatePresence>
          {list.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px', opacity: 0.5 }}>
               Vazio
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Fluxo de Produção</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie o status de impressão de todas as máquinas em tempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button 
             className="btn-primary" 
             style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', fontSize: '15px' }}
             onClick={() => setShowArchive(!showArchive)}
           >
             <HistoryIcon size={18} /> {showArchive ? 'Voltar ao Quadro' : 'Histórico'}
           </button>
           <button 
             className="btn-primary" 
             style={{ padding: '12px 24px', fontSize: '15px' }}
             onClick={() => setShowAddModal(true)}
           >
             <Plus size={20} /> Novo Trabalho
           </button>
        </div>
      </div>

      {!showArchive ? (
        <div style={{ display: 'flex', gap: '32px', overflowX: 'auto', paddingBottom: '32px', minHeight: 'calc(100vh - 250px)' }}>
          {renderColumn('PENDENTE', 'Na Fila', <Clock size={18} />)}
          {renderColumn('IMPRIMINDO', 'Em Produção', <Play size={18} color="var(--primary)" />)}
          {renderColumn('CONCLUIDO', 'Finalizado', <CheckCircle size={18} color="var(--secondary)" />)}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <Archive size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Histórico de Produção (Arquivados)</h3>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
             {jobs.filter(j => j.status === 'ARQUIVADO').map(job => (
               <div key={job.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '14px' }}>{job.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{job.customer} • {job.printer}</p>
                    </div>
                    <button onClick={() => moveJob(job.id, 'CONCLUIDO')} style={{ background: 'var(--primary-glow)', border: '1px solid var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}>Restaurar</button>
                  </div>
               </div>
             ))}
             {jobs.filter(j => j.status === 'ARQUIVADO').length === 0 && (
               <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                  <Archive size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p>Nenhum item arquivado.</p>
               </div>
             )}
           </div>
        </div>
      )}

      {/* Modal: Novo Trabalho */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title={editingJob ? "Editar Trabalho" : "Lançar Trabalho de Produção"} onClose={resetForm}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <label>Peça / Produto</label>
                  <div style={{ position: 'relative' }}>
                    <Layers size={16} style={iconOverlayStyle} />
                    <input type="text" placeholder="Ex: Chassi v2" value={name} onChange={e => setName(e.target.value)} style={iconInputStyle} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Cliente Associado</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={iconOverlayStyle} />
                    <input type="text" placeholder="Nome do cliente..." value={customer} onChange={e => setCustomer(e.target.value)} style={iconInputStyle} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Impressora</label>
                  <div style={{ position: 'relative' }}>
                    <PrinterIcon size={16} style={iconOverlayStyle} />
                    <select value={printer} onChange={e => setPrinter(e.target.value)} style={{ ...iconInputStyle, appearance: 'none' }}>
                      <option value="">Selecione uma impressora livre...</option>
                      <option value="Prusa XL #01">Prusa XL #01 (Livre)</option>
                      <option value="Prusa XL #02">Prusa XL #02 (Livre)</option>
                      <option value="Bambu X1">Bambu Lab X1 Carbon</option>
                    </select>
                    <ChevronRight size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                  </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', height: '54px', fontSize: '16px' }} onClick={handleCreateJob}>
                   {editingJob ? 'Salvar Alterações' : 'Lançar na Fila de Produção'}
                </button>
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function JobCard({ job, onMove, onDelete, onEdit }: { job: ProductionJob, onMove: (s: JobStatus) => void, onDelete: () => void, onEdit: () => void }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="glass-panel" 
      style={{ padding: '20px', borderRadius: '16px', position: 'relative', border: '1px solid var(--border-glass)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>{job.name}</h4>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>ID: #{job.id} • {job.customer}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
           <button onClick={onEdit} style={actionIconStyle} className="btn-hover-effect"><Edit2 size={12} /></button>
           <button onClick={onDelete} style={{ ...actionIconStyle, color: 'var(--error)' }} className="btn-hover-effect"><Trash2 size={12} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <PrinterIcon size={14} color="var(--primary)" />
           <span style={{ fontSize: '11px', fontWeight: 600 }}>{job.printer}</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
           <Clock size={14} color="var(--text-dim)" />
           <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{job.timeRemaining}</span>
         </div>
      </div>

      {job.status === 'IMPRIMINDO' && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
             <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Progresso Atual</span>
             <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800 }}>{job.progress}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${job.progress}%` }}
               style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent-cyan))', boxShadow: '0 0 10px var(--primary-glow)' }} 
             />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
         {job.status === 'PENDENTE' && (
           <button className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 700 }} onClick={() => onMove('IMPRIMINDO')}>
             Iniciar Impressão <ChevronRight size={16} />
           </button>
         )}
         {job.status === 'IMPRIMINDO' && (
           <button className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 700, background: 'var(--secondary)' }} onClick={() => onMove('CONCLUIDO')}>
             Concluir Peça <CheckCircle size={16} />
           </button>
         )}
         {job.status === 'CONCLUIDO' && (
           <button className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 700, background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', border: '1px solid var(--border-glass)' }} onClick={() => onMove('ARQUIVADO')}>
             <Archive size={16} /> Arquivar Trabalho
           </button>
         )}
      </div>
    </motion.div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle: any = { width: '100%', maxWidth: '500px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px' };
const inputStyle: any = { width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
const iconInputStyle: any = { ...inputStyle, paddingLeft: '44px' };
const iconOverlayStyle: any = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' };
const actionIconStyle: any = { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--text-dim)', transition: '0.2s' };
