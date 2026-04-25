import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  History,
  X,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

interface Transaction {
  id: string;
  description: string;
  category: string;
  date: string;
  status: 'CONCLUÍDO' | 'PENDENTE' | 'ESTORNADO';
  type: 'INCOME' | 'EXPENSE';
  value: number;
}

export default function FinancialView() {
  const { currencySymbol } = useSettings();
  const [filterMonth, setFilterMonth] = useState('Abril');
  const [filterYear, setFilterYear] = useState('2024');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeActions, setActiveActions] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Estados para o formulário
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Vendas');
  const [value, setValue] = useState('0');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados para dropdowns customizados
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Dados mockados reativos
  const getFinancialData = (month: string, year: string) => {
    const seed = (month.length * 100) + (parseInt(year) % 10);
    return {
      receita: (12918 + seed).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      custos: (4459 + (seed / 4)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      lucro: (8359 + (seed / 2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      ticket: (1191 + (seed / 10)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      chartValues: [65 + (seed % 10), 45 + (seed % 5), 85 - (seed % 10), 55 + (seed % 15), 95 - (seed % 5), 75 + (seed % 10), 40, 80, 60, 90, 70, 85]
    };
  };

  const currentData = getFinancialData(filterMonth, filterYear);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TRX-9901', description: 'Venda de Chassi de Drone v2', category: 'Vendas', date: '25/04/2024', status: 'CONCLUÍDO', type: 'INCOME', value: 450.00 },
    { id: 'TRX-9902', description: 'Compra de Filamento PLA Esun', category: 'Insumos', date: '24/04/2024', status: 'CONCLUÍDO', type: 'EXPENSE', value: 120.00 },
    { id: 'TRX-9903', description: 'Serviço de Prototipagem Aerospace', category: 'Serviços', date: '22/04/2024', status: 'PENDENTE', type: 'INCOME', value: 3200.00 },
    { id: 'TRX-9904', description: 'Manutenção Prusa XL #02', category: 'Manutenção', date: '20/04/2024', status: 'CONCLUÍDO', type: 'EXPENSE', value: 85.50 },
    { id: 'TRX-9905', description: 'Venda Engrenagens Robótica', category: 'Vendas', date: '18/04/2024', status: 'CONCLUÍDO', type: 'INCOME', value: 1250.00 },
  ]);

  const handleRefresh = () => {
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 800);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Deseja realmente excluir este registro financeiro? Esta ação é irreversível.')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      setActiveActions(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    setActiveActions(null);
  };

  const startEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setDescription(t.description);
    setCategory(t.category);
    setValue(t.value.toString());
    setType(t.type);
    // Para a data, vamos assumir o formato para o input type="date"
    const parts = t.date.split('/');
    if (parts.length === 3) {
      setDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    setShowAddModal(true);
    setActiveActions(null);
  };

  const handleSave = () => {
    if (!description.trim()) {
      alert('Informe uma descrição!');
      return;
    }

    const val = parseFloat(value.replace(',', '.')) || 0;
    const formattedDate = date.split('-').reverse().join('/');

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? {
        ...t,
        description,
        category,
        value: val,
        type,
        date: formattedDate
      } : t));
      alert('Transação atualizada!');
    } else {
      const newTrx: Transaction = {
        id: `TRX-${Math.floor(Math.random() * 9000) + 1000}`,
        description,
        category,
        date: formattedDate,
        status: 'CONCLUÍDO',
        type,
        value: val
      };
      setTransactions(prev => [newTrx, ...prev]);
      alert('Nova transação lançada!');
    }
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setCategory('Vendas');
    setValue('0');
    setType('INCOME');
    setEditingTransaction(null);
    setShowAddModal(false);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Módulo Financeiro</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gestão de fluxo de caixa, DRE e métricas de lucro.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', fontSize: '15px' }}>
            <Download size={18} /> Exportar
          </button>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={() => setShowAddModal(true)}>
             <Plus size={20} /> Nova Transação
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
         <KPICard title="RECEITA TOTAL" value={`${currencySymbol} ${currentData.receita}`} change="+12.5%" icon={<TrendingUp size={18} />} bgColor="rgba(74, 225, 118, 0.05)" accentColor="var(--secondary)" />
         <KPICard title="CUSTOS TOTAIS" value={`${currencySymbol} ${currentData.custos}`} change="+8.2%" icon={<TrendingDown size={18} />} bgColor="rgba(255, 77, 77, 0.05)" accentColor="var(--error)" />
         <KPICard title="LUCRO LÍQUIDO" value={`${currencySymbol} ${currentData.lucro}`} change="+18.4%" icon={<TrendingUp size={18} />} bgColor="rgba(138, 43, 226, 0.05)" accentColor="var(--primary)" />
         <KPICard title="TICKET MÉDIO" value={`${currencySymbol} ${currentData.ticket}`} change="+5.1%" icon={<TrendingUp size={18} />} bgColor="rgba(22, 189, 202, 0.05)" accentColor="var(--accent-cyan)" />
      </div>

      <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', marginBottom: '32px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={18} color="var(--primary)" /> Fluxo de Caixa Mensal
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Custom Dropdowns */}
            <CustomSelect label={filterMonth} options={['Abril', 'Março', 'Fevereiro']} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} onSelect={(val: string) => { setFilterMonth(val); setOpenDropdown(null); }} />
            <CustomSelect label={filterYear} options={['2024', '2023']} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} onSelect={(val: string) => { setFilterYear(val); setOpenDropdown(null); }} />
            <CustomSelect label={filterCategory} options={['Todas', 'Vendas', 'Insumos', 'Manutenção']} isOpen={openDropdown === 'category'} onToggle={() => toggleDropdown('category')} onSelect={(val: string) => { setFilterCategory(val); setOpenDropdown(null); }} />
            
            <button onClick={handleRefresh} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <RefreshCw size={16} className={isFiltering ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {currentData.chartValues.map((h, i) => (
            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              <motion.div 
                key={`${filterMonth}-${filterYear}-${i}`}
                initial={{ height: 0 }} 
                animate={{ height: isFiltering ? 0 : `${h}%` }} 
                style={{ 
                  width: '100%',
                  background: i === 11 ? 'var(--primary-glow)' : 'rgba(138, 43, 226, 0.2)', 
                  borderRadius: '6px 6px 0 0',
                  border: i === 11 ? '1px solid var(--primary)' : '1px solid rgba(138, 43, 226, 0.3)',
                  boxShadow: i === 11 ? '0 0 20px rgba(138, 43, 226, 0.4)' : 'none'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Cofre de Transações</h3>
          <div style={{ position: 'relative' }}>
             <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
             <input type="text" placeholder="Buscar transação..." style={{ padding: '10px 16px 10px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }} />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>ID</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>DESCRIÇÃO / CLIENTE</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>CATEGORIA</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>DATA</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>STATUS</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500, textAlign: 'right' }}>VALOR</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '11px' }}>#{t.id}</td>
                <td style={{ padding: '16px 24px', fontWeight: 700 }}>{t.description}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(138, 43, 226, 0.1)', color: 'var(--primary)', fontSize: '11px', fontWeight: 600 }}>{t.category}</span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-dim)' }}>{t.date}</td>
                <td style={{ padding: '16px 24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.status === 'CONCLUÍDO' ? 'var(--secondary)' : 'var(--warning)' }}></div>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{t.status}</span>
                   </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 800, color: t.type === 'INCOME' ? 'var(--secondary)' : 'white' }}>
                  {t.type === 'INCOME' ? '+' : '-'} {currencySymbol} {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                       <button onClick={(e) => { e.stopPropagation(); setSelectedTransaction(t); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--text-dim)' }}>
                         <Search size={16} />
                       </button>
                       <div style={{ position: 'relative' }}>
                          <button onClick={(e) => { e.stopPropagation(); setActiveActions(activeActions === t.id ? null : t.id); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--text-dim)' }}>
                            <MoreVertical size={16} />
                          </button>
                          <AnimatePresence>
                            {activeActions === t.id && (
                              <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} style={actionsDropdownStyle}>
                                 <div style={dropdownItemStyle} onClick={() => startEdit(t)}><Edit2 size={14} /> Editar</div>
                                 <div style={dropdownItemStyle} onClick={() => handleStatusChange(t.id, 'ESTORNADO')}><RotateCcw size={14} /> Estornar</div>
                                 <div style={{ ...dropdownItemStyle, color: 'var(--error)' }} onClick={() => handleDeleteTransaction(t.id)}><Trash2 size={14} /> Excluir</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </div>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <Modal title={editingTransaction ? "Editar Transação" : "Lançar Transação"} onClose={resetForm}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                   <label>Descrição / Origem</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Venda Peça Drone" style={inputStyle} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div className="input-group">
                      <label>Tipo</label>
                      <select value={type} onChange={e => setType(e.target.value as any)} style={inputStyle}>
                         <option value="INCOME">Receita (+)</option>
                         <option value="EXPENSE">Despesa (-)</option>
                      </select>
                   </div>
                   <div className="input-group">
                      <label>Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                         <option value="Vendas">Vendas</option>
                         <option value="Insumos">Insumos</option>
                         <option value="Serviços">Serviços</option>
                         <option value="Manutenção">Manutenção</option>
                         <option value="Outros">Outros</option>
                      </select>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div className="input-group">
                      <label>Data</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                   </div>
                   <div className="input-group">
                      <label>Valor ({currencySymbol})</label>
                      <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" style={inputStyle} />
                   </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', height: '54px', fontSize: '16px', marginTop: '12px' }} onClick={handleSave}>
                  {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
             </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTransaction && (
          <Modal title="Detalhes da Transação" onClose={() => setSelectedTransaction(null)}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                   <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(74, 225, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedTransaction.type === 'INCOME' ? <TrendingUp size={32} color="var(--secondary)" /> : <TrendingDown size={32} color="var(--error)" />}
                   </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                   <div>
                     <p style={detailLabelStyle}>DESCRIÇÃO</p>
                     <p style={detailValueStyle}>{selectedTransaction.description}</p>
                   </div>
                   <div>
                     <p style={detailLabelStyle}>VALOR</p>
                     <p style={{ ...detailValueStyle, color: selectedTransaction.type === 'INCOME' ? 'var(--secondary)' : 'var(--error)', fontSize: '20px' }}>
                       {currencySymbol} {selectedTransaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </p>
                   </div>
                   <div>
                     <p style={detailLabelStyle}>CATEGORIA</p>
                     <p style={detailValueStyle}>{selectedTransaction.category}</p>
                   </div>
                   <div>
                     <p style={detailLabelStyle}>DATA</p>
                     <p style={detailValueStyle}>{selectedTransaction.date}</p>
                   </div>
                </div>
                <div style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>ID da Auditoria</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{selectedTransaction.id}</span>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Recibo</button>
                   <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Auditoria</button>
                </div>
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function KPICard({ title, value, change, icon, bgColor, accentColor }: any) {
  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', borderLeft: `4px solid ${accentColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{title}</span>
        <div style={{ padding: '8px', borderRadius: '10px', background: bgColor, color: accentColor }}>{icon}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{value}</h2>
        <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 700 }}>{change}</span>
      </div>
    </div>
  );
}

function CustomSelect({ label, options, isOpen, onToggle, onSelect }: any) {
  return (
    <div style={{ position: 'relative', minWidth: '130px' }}>
      <div 
        onClick={onToggle}
        style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={dropdownStyle}>
            {options.map((opt: string) => (
              <div key={opt} onClick={() => onSelect(opt)} style={dropdownItemStyle}>
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle: any = { width: '100%', maxWidth: '500px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '32px', padding: '40px' };
const dropdownStyle: any = { position: 'absolute', left: '0', top: '50px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' };
const actionsDropdownStyle: any = { position: 'absolute', right: '0', top: '40px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, minWidth: '150px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' };
const dropdownItemStyle: any = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'white', transition: '0.2s', textAlign: 'left' };
const detailLabelStyle: any = { fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' };
const detailValueStyle: any = { fontSize: '15px', fontWeight: 700 };
const inputStyle: any = { width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
