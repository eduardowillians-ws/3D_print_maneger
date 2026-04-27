import { useState, useEffect } from 'react';
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
  User,
  Loader2,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { productionApi } from '../services/api/production';
import { clientsApi } from '../services/api/clients';
import { printersApi } from '../services/api/printers';
import { productsApi } from '../services/api/products';
import { materialsApi } from '../services/api/materials';
import { ProductionStatus } from '../types/database';

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
  const [quantity, setQuantity] = useState('1');
  const [quantityError, setQuantityError] = useState(false);
  
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [printersList, setPrintersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Estado para materiais do job (até 4 slots) - com peso por unidade
  const [jobMaterials, setJobMaterials] = useState<{ materialId: string; weight: number; weightPerUnit: number }[]>([
    { materialId: '', weight: 0, weightPerUnit: 0 },
    { materialId: '', weight: 0, weightPerUnit: 0 },
    { materialId: '', weight: 0, weightPerUnit: 0 },
    { materialId: '', weight: 0, weightPerUnit: 0 }
  ]);

  useEffect(() => {
    loadJobs();
    loadClients();
    loadPrinters();
    loadProducts();
    loadMaterials();
  }, []);

  // Recalcular materiais quando quantidade mudar (se houver produto selecionado)
  useEffect(() => {
    if (selectedProductId && jobMaterials.some(m => m.materialId)) {
      const qty = parseInt(quantity) || 1;
      setJobMaterials(prev => prev.map(m => ({
        ...m,
        weight: m.materialId ? (m.weightPerUnit || 0) * qty : 0
      })));
    }
  }, [quantity]);

  const loadClients = async () => {
    const { data } = await clientsApi.getAll();
    if (data) {
      setClientsList(data.map(c => ({ id: c.id, name: c.name })));
    }
  };

  const loadPrinters = async () => {
    const { data } = await printersApi.getAll();
    if (data) {
      setPrintersList(data.map(p => ({ id: p.id, name: p.name })));
    }
  };

  const loadProducts = async () => {
    const { data } = await productsApi.getAll();
    if (data) {
      setProductsList(data.map(p => ({ 
        id: p.id, 
        name: p.name, 
        printTime: p.print_time_hours + (p.print_time_minutes / 60),
        materialWeight: p.material_weight_g || 0
      })));
    }
  };

  const loadMaterials = async () => {
    const { data } = await materialsApi.getAll();
    if (data) {
      setMaterialsList(data.map(m => ({ 
        id: m.id, 
        name: m.name, 
        type: m.type,
        color: m.color || '',
        weight_g: m.weight_g
      })));
    }
  };

  const calculateProgress = (startTime: string | null, estimatedHours: number): number => {
    if (!startTime || estimatedHours <= 0) return 0;
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const elapsedHours = (now - start) / (1000 * 60 * 60);
    const progress = (elapsedHours / estimatedHours) * 100;
    return Math.min(Math.round(progress), 100);
  };

  const loadJobs = async () => {
    setIsLoading(true);
    
    // Carregar impressoras primeiro para ter a lista disponível
    const { data: printersData } = await printersApi.getAll();
    const printersMap = printersData || [];
    
    const { data: jobsData, error } = await productionApi.getAll();
    const { data: productsData } = await productsApi.getAll();
    
    if (error) {
      console.error('Erro ao carregar trabalhos:', error.message);
      setIsLoading(false);
      return;
    }
    
    if (jobsData) {
      const mappedData: ProductionJob[] = jobsData.map(j => {
        const product = productsData?.find(p => p.name === j.product_name);
        const estimatedHours = product ? product.print_time_hours + (product.print_time_minutes / 60) : 8;
        const calculatedProgress = j.status === 'IMPRIMINDO' && j.start_time 
          ? calculateProgress(j.start_time, estimatedHours)
          : j.progress;
        
        const remainingHours = estimatedHours - (calculatedProgress / 100 * estimatedHours);
        
        const printerName = j.printer_id 
          ? printersMap.find((p: any) => p.id === j.printer_id)?.name || 'Não atribuída' 
          : 'Não atribuída';
        
        return {
          id: j.id,
          name: j.product_name,
          printer: printerName,
          material: 'PLA Standard',
          timeRemaining: j.status === 'IMPRIMINDO' ? `${Math.max(0, Math.floor(remainingHours))}h ${Math.round((remainingHours % 1) * 60)}m` : 'Pendente',
          progress: calculatedProgress,
          status: j.status === 'FILA' ? 'PENDENTE' : j.status === 'CONCLUIDO' ? 'CONCLUIDO' : j.status === 'ARQUIVADO' ? 'ARQUIVADO' : 'IMPRIMINDO',
          customer: 'Cliente Avulso'
        };
      });
      setJobs(mappedData);
    }
    setIsLoading(false);
  };

  const handleCreateJob = async () => {
    if (!name.trim()) {
      alert('Por favor, informe o nome da peça.');
      return;
    }

    const selectedProduct = productsList.find(p => p.id === selectedProductId);
    
    const qty = parseInt(quantity) || 1;
    
    const jobData = {
      product_name: name,
      product_id: selectedProductId || null,
      quantity: qty,
      status: 'FILA' as ProductionStatus,
      progress: 0,
      printer_id: selectedPrinterId || null,
      start_time: null
    };

    // Preparar materiais do job (apenas os que têm material selecionado)
    const materialsToAdd = jobMaterials
      .filter(m => m.materialId)
      .map((m, idx) => {
        const material = materialsList.find(mat => mat.id === m.materialId);
        return {
          material_id: m.materialId,
          material_name: material?.name || '',
          color: material?.color || null,
          weight_g: m.weight,
          slot_position: idx + 1
        };
      });

    if (editingJob) {
      const qty = parseInt(quantity) || 1;
      const { error } = await productionApi.update(editingJob.id, { 
        product_name: name, 
        product_id: selectedProductId || null,
        quantity: qty,
        printer_id: selectedPrinterId || null 
      });
      if (error) {
        alert('Erro ao atualizar trabalho: ' + error.message);
        return;
      }
      await loadJobs();
      alert('Trabalho atualizado!');
} else {
      const { data, error } = await productionApi.createWithMaterials(jobData, materialsToAdd);
      if (error) {
        alert('Erro ao criar trabalho: ' + error.message);
        return;
      }
      if (data) {
        const materialNames = materialsToAdd.map(m => m.material_name).join(', ') || 'Sem material';
        const newJob: ProductionJob = {
          id: data.id,
          name: data.product_name,
          printer: selectedPrinterId ? printersList.find(p => p.id === selectedPrinterId)?.name || 'Não atribuída' : 'Não atribuída',
          material: materialNames,
          timeRemaining: 'Pendente',
          progress: 0,
          status: 'PENDENTE',
          customer: selectedClientId ? clientsList.find(c => c.id === selectedClientId)?.name || 'Cliente Avulso' : 'Cliente Avulso'
        };
        setJobs(prev => [newJob, ...prev]);
      }
alert('Trabalho adicionado à fila!');
    }
    
    setShowAddModal(false);
    resetForm();
  };

  const moveJob = async (id: string, newStatus: JobStatus) => {
    const statusMap: Record<string, ProductionStatus> = {
      'PENDENTE': 'FILA',
      'IMPRIMINDO': 'IMPRIMINDO',
      'CONCLUIDO': 'CONCLUIDO',
      'ARQUIVADO': 'ARQUIVADO'
    };

    const progress = newStatus === 'CONCLUIDO' ? 100 : (newStatus === 'IMPRIMINDO' ? 5 : 0);
    const { error } = await productionApi.updateStatus(id, statusMap[newStatus], progress);
    if (error) {
      alert('Erro ao mover trabalho: ' + error.message);
      return;
    }

    // Atualizar status da impressora quando trabalho inicia/finaliza
    const currentJob = jobs.find(j => j.id === id);
    if (currentJob && currentJob.printer && currentJob.printer !== 'Não atribuída') {
      const printersList = await printersApi.getAll();
      const printer = printersList.data?.find(p => p.name === currentJob.printer);
      if (printer) {
        const updates: any = {};
        
        // Atualizar status
        const newPrinterStatus = newStatus === 'IMPRIMINDO' ? 'IMPRIMINDO' : (newStatus === 'CONCLUIDO' || newStatus === 'ARQUIVADO' ? 'OCIOSA' : null);
        if (newPrinterStatus) {
          updates.status = newPrinterStatus;
        }
        
        // Ao iniciar impressão, adicionar horas estimadas do produto ao current_hours
        if (newStatus === 'IMPRIMINDO') {
          const selectedProduct = productsList.find(p => p.name === currentJob.name);
          if (selectedProduct) {
            updates.current_hours = (printer.current_hours || 0) + selectedProduct.printTime;
          }
        }
        
        // Ao concluir, incrementar total_jobs
        if (newStatus === 'CONCLUIDO' || newStatus === 'ARQUIVADO') {
          updates.total_jobs = (printer.total_jobs || 0) + 1;
        }
        
        if (Object.keys(updates).length > 0) {
          await printersApi.update(printer.id, updates);
        }
      }
    }

    setJobs(prev => prev.map(job => 
      job.id === id ? { 
        ...job, 
        status: newStatus, 
        progress: progress,
        timeRemaining: newStatus === 'CONCLUIDO' ? '0h 00m' : job.timeRemaining
      } : job
    ));
  };

  const deleteJob = async (id: string) => {
    if (confirm('Deseja excluir este trabalho de produção?')) {
      const { error } = await productionApi.delete(id);
      if (error) {
        alert('Erro ao excluir trabalho: ' + error.message);
        return;
      }
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
    setShowAddModal(false);
    setName('');
    setPrinter('');
    setCustomer('');
    setQuantity('1');
    setEditingJob(null);
    setSelectedPrinterId('');
    setSelectedClientId('');
    setSelectedProductId('');
    setIsNewProduct(false);
    setJobMaterials([
      { materialId: '', weight: 0, weightPerUnit: 0 },
      { materialId: '', weight: 0, weightPerUnit: 0 },
      { materialId: '', weight: 0, weightPerUnit: 0 },
      { materialId: '', weight: 0, weightPerUnit: 0 }
    ]);
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
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', color: 'var(--text-muted)' }}
            >
              <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
              Carregando trabalhos...
            </motion.div>
          ) : (
            <>
              {renderColumn('PENDENTE', 'Na Fila', <Clock size={18} />)}
              {renderColumn('IMPRIMINDO', 'Em Produção', <Play size={18} color="var(--primary)" />)}
              {renderColumn('CONCLUIDO', 'Finalizado', <CheckCircle size={18} color="var(--secondary)" />)}
            </>
          )}
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
                    <select 
                      value={isNewProduct ? '__new__' : selectedProductId} 
                      onChange={async e => {
                        if (e.target.value === '__new__') {
                          setName('');
                          setSelectedProductId('');
                          setIsNewProduct(true);
                          setJobMaterials([
                            { materialId: '', weight: 0, weightPerUnit: 0 },
                            { materialId: '', weight: 0, weightPerUnit: 0 },
                            { materialId: '', weight: 0, weightPerUnit: 0 },
                            { materialId: '', weight: 0, weightPerUnit: 0 }
                          ]);
                        } else {
                          setIsNewProduct(false);
                          const productId = e.target.value;
                          setSelectedProductId(productId);
                          const product = productsList.find(p => p.id === productId);
                          setName(product?.name || '');
                          
                          // Carregar materiais do produto e multiplicar pela quantidade
                          const { data: prodMaterials } = await productsApi.getMaterialsByProduct(productId);
                          const qty = parseInt(quantity) || 1;
                          
                          if (prodMaterials && prodMaterials.length > 0) {
                            const newSlots = prodMaterials.map((pm: any) => ({
                              materialId: pm.material_id,
                              weight: (pm.weight_g || 0) * qty,
                              weightPerUnit: pm.weight_g || 0
                            }));
                            // Preencher slots restantes com vazio
                            while (newSlots.length < 4) {
                              newSlots.push({ materialId: '', weight: 0, weightPerUnit: 0 });
                            }
                            setJobMaterials(newSlots);
                          } else if (product?.materialWeight && product.materialWeight > 0) {
                            // Fallback para peso único
                            setJobMaterials(prev => {
                              const newMaterials = [...prev];
                              newMaterials[0] = { ...newMaterials[0], weight: product.materialWeight * qty };
                              return newMaterials;
                            });
                          }
                        }
                      }}
                      style={{ ...iconInputStyle, cursor: 'pointer', paddingLeft: '36px' }}
                    >
                      <option value="">Selecione um produto...</option>
                      <option value="__new__">+ Criar novo produto</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.printTime.toFixed(1)}h | {p.materialWeight}g)</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {isNewProduct && (
                  <div className="input-group">
                    <label>Nome da Peça (digite)</label>
                    <div style={{ position: 'relative' }}>
                      <Layers size={16} style={iconOverlayStyle} />
                      <input type="text" placeholder="Ex: Chassi v2" value={name} onChange={e => setName(e.target.value)} style={{ ...iconInputStyle, paddingLeft: '36px' }} />
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label>Cliente Associado</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={iconOverlayStyle} />
                    <select 
                      value={selectedClientId} 
                      onChange={e => {
                        setSelectedClientId(e.target.value);
                        const client = clientsList.find(c => c.id === e.target.value);
                        setCustomer(client?.name || '');
                      }}
                      style={{ ...iconInputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Selecione um cliente...</option>
                      {clientsList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Impressora</label>
                  <div style={{ position: 'relative' }}>
                    <PrinterIcon size={16} style={iconOverlayStyle} />
                    <select 
                      value={selectedPrinterId} 
                      onChange={e => {
                        setSelectedPrinterId(e.target.value);
                        const printer = printersList.find(p => p.id === e.target.value);
                        setPrinter(printer?.name || '');
                      }}
                      style={{ ...iconInputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Selecione uma impressora...</option>
                      {printersList.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Quantidade (unidades)</label>
                  <div style={{ position: 'relative' }}>
                    <Box size={16} style={iconOverlayStyle} />
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={quantity} 
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setQuantity(val);
                        setQuantityError(false);
                      }}
                      style={{ ...iconInputStyle, paddingLeft: '36px', MozAppearance: 'textfield' }}
                    />
                  </div>
                </div>
                <style>{`
                  input[type=number]::-webkit-inner-spin-button,
                  input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                  }
                  input[type=number] {
                    -moz-appearance: textfield;
                  }
                `}</style>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', display: 'block' }}>
                    Materiais (até 4 slots - AMS)
                  </label>
                  {jobMaterials.map((slot, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <select 
                        value={slot.materialId}
                        onChange={e => {
                          const newMaterials = [...jobMaterials];
                          newMaterials[idx].materialId = e.target.value;
                          setJobMaterials(newMaterials);
                        }}
                        style={{ flex: 2, padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '13px' }}
                      >
                        <option value="">Slot {idx + 1} - Vazio</option>
                        {materialsList.map(m => (
                          <option key={m.id} value={m.id}>{m.name} {m.color ? `(${m.color})` : ''}</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        placeholder="g"
                        value={slot.weight || ''}
                        onChange={e => {
                          const newMaterials = [...jobMaterials];
                          const newWeight = parseInt(e.target.value) || 0;
                          newMaterials[idx].weight = newWeight;
                          newMaterials[idx].weightPerUnit = newWeight;
                          setJobMaterials(newMaterials);
                        }}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '13px', textAlign: 'right' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', width: '20px' }}>g</span>
                    </div>
                  ))}
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
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      style={modalOverlayStyle} 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
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
