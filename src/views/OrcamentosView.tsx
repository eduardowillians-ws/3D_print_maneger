import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  User,
  Package,
  Calendar,
  X,
  Hash,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

export default function OrcamentosView() {
  const { currencySymbol } = useSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Estados para o formulário
  const [client, setClient] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitValue, setUnitValue] = useState('0');
  const [shipping, setShipping] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  
  const [subtotal, setSubtotal] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);

  const [orcamentos, setOrcamentos] = useState([
    { id: 'Q-2048', client: 'Aerospace Dynamics Inc.', date: '24 Out, 2023', total: 1250.00, status: 'PENDENTE', unitValue: '1250', quantity: '1', shipping: '0' },
    { id: 'Q-2047', client: 'Medical Prothetics LLC', date: '22 Out, 2023', total: 3400.00, status: 'APROVADO', unitValue: '1700', quantity: '2', shipping: '0' },
    { id: 'Q-2046', client: 'Robotics Core', date: '20 Out, 2023', total: 850.50, status: 'ENVIADO', unitValue: '850.5', quantity: '1', shipping: '0' },
    { id: 'Q-2045', client: 'Local Hobbyist Group', date: '18 Out, 2023', total: 120.00, status: 'REJEITADO', unitValue: '120', quantity: '1', shipping: '0' },
  ]);

  // KPIs dinâmicos
  const pendentesCount = orcamentos.filter(o => o.status === 'PENDENTE').length;
  const receitaEstimada = orcamentos.reduce((acc, curr) => acc + (typeof curr.total === 'number' ? curr.total : 0), 0);

  useEffect(() => {
    const q = parseFloat(quantity) || 0;
    const v = parseFloat(unitValue.toString().replace(',', '.')) || 0;
    const s = parseFloat(shipping.toString().replace(',', '.')) || 0;
    const sub = q * v;
    setSubtotal(sub);
    setTotalFinal(sub + s);
  }, [quantity, unitValue, shipping]);

  const handleSave = () => {
    if (!client.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    if (editingItem) {
      setOrcamentos(prev => prev.map(item => 
        item.id === editingItem.id ? { 
          ...item, 
          client: client.trim(),
          unitValue: unitValue.toString(),
          quantity: quantity.toString(),
          shipping: shipping.toString(),
          total: totalFinal 
        } : item
      ));
      alert('Orçamento atualizado!');
    } else {
      const novoOrcamento = {
        id: `Q-${Math.floor(Math.random() * 9000) + 1000}`,
        client: client.trim(),
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        status: 'PENDENTE',
        unitValue: unitValue.toString(),
        quantity: quantity.toString(),
        shipping: shipping.toString(),
        total: totalFinal
      };
      setOrcamentos(prev => [novoOrcamento, ...prev]);
      alert('Orçamento gerado!');
    }
    
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setClient(item.client);
    setQuantity(item.quantity);
    setUnitValue(item.unitValue);
    setShipping(item.shipping);
    setShowAddModal(true);
    setActiveMenu(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      setOrcamentos(prev => prev.filter(item => item.id !== id));
      setActiveMenu(null);
    }
  };

  const handleApprove = (id: string) => {
    setOrcamentos(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'APROVADO' } : item
    ));
    setActiveMenu(null);
    // Notificação persistente ou alert
    console.log(`Orçamento ${id} aprovado com sucesso.`);
  };

  const resetForm = () => {
    setClient('');
    setSelectedProduct('');
    setQuantity('1');
    setUnitValue('0');
    setShipping('0');
    setExpiryDate('');
    setEditingItem(null);
    setShowAddModal(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Gerenciamento de Orçamentos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie estimativas de clientes e propostas de preços.</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Criar Novo Orçamento
        </button>
      </div>

      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '48px' }}>
         <StatCard label="APROVAÇÕES PENDENTES" value={pendentesCount.toString()} icon={Clock} color="#F59E0B" />
         <StatCard label="TAXA DE CONVERSÃO" value="68%" subValue="+5%" icon={TrendingUp} color="var(--secondary)" />
         <StatCard label="RECEITA ESTIMADA" value={`${currencySymbol} ${receitaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} subValue="Fila" icon={DollarSign} color="var(--primary)" />
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>ID</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Cliente</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Emitido</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Total Final</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{item.id}</td>
                  <td style={{ padding: '16px 24px' }}>{item.client}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-dim)' }}>{item.date}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }}>{currencySymbol} {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '16px 24px' }}><StatusBadge status={item.status} /></td>
                  <td style={{ padding: '16px 24px', position: 'relative', textAlign: 'right' }}>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }} style={actionTriggerStyle}>
                      <MoreHorizontal size={20} />
                    </button>
                    <AnimatePresence>
                      {activeMenu === item.id && (
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} style={dropdownStyle}>
                           <div style={dropdownItemStyle} onClick={() => handleEdit(item)}><Edit2 size={14} /> Editar</div>
                           <div style={dropdownItemStyle} onClick={() => { setActiveMenu(null); alert('PDF gerado!'); }}><FileText size={14} /> Enviar PDF</div>
                           <div style={dropdownItemStyle} onClick={() => handleApprove(item.id)}><CheckCircle size={14} /> Aprovar</div>
                           <div style={{ ...dropdownItemStyle, color: 'var(--error)' }} onClick={() => handleDelete(item.id)}><Trash2 size={14} /> Excluir</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <Modal title={editingItem ? "Editar Orçamento" : "Novo Orçamento"} onClose={resetForm}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <label>Cliente</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={iconOverlayStyle} />
                    <input type="text" placeholder="Nome do cliente..." value={client} onChange={e => setClient(e.target.value)} style={iconInputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div className="input-group">
                     <label>Quantidade</label>
                     <div style={{ position: 'relative' }}>
                        <Hash size={16} style={iconOverlayStyle} />
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} style={iconInputStyle} />
                     </div>
                   </div>
                   <div className="input-group">
                     <label>Valor Unitário ({currencySymbol})</label>
                     <div style={{ position: 'relative' }}>
                        <div style={iconOverlayStyle}>{currencySymbol}</div>
                        <input type="text" placeholder="0,00" value={unitValue} onChange={e => setUnitValue(e.target.value)} style={{ ...iconInputStyle, paddingLeft: '36px' }} />
                     </div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                   <div className="input-group">
                     <label>Expiração</label>
                     <div style={{ position: 'relative' }}>
                        <Calendar size={16} style={iconOverlayStyle} />
                        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} style={{ ...iconInputStyle, colorScheme: 'dark' }} />
                     </div>
                   </div>
                   <div className="input-group">
                     <label>Frete ({currencySymbol})</label>
                     <div style={{ position: 'relative' }}>
                        <div style={iconOverlayStyle}>{currencySymbol}</div>
                        <input type="text" value={shipping} onChange={e => setShipping(e.target.value)} style={{ ...iconInputStyle, paddingLeft: '36px' }} />
                     </div>
                   </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700 }}>Total Final:</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary)' }}>
                        {currencySymbol} {totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </span>
                    </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', height: '54px', fontSize: '16px' }} onClick={handleSave}>
                   <Send size={18} /> {editingItem ? 'Salvar Alterações' : 'Salvar e Enviar Proposta'}
                </button>
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color }: any) {
  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}</p>
        <Icon size={18} color={color} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{value}</h2>
        {subValue && <span style={{ fontSize: '12px', color, fontWeight: 600 }}>{subValue}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'PENDENTE': { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
    'APROVADO': { bg: 'rgba(74, 225, 118, 0.1)', color: 'var(--secondary)' },
    'ENVIADO': { bg: 'rgba(138, 43, 226, 0.1)', color: 'var(--primary)' },
    'REJEITADO': { bg: 'rgba(255, 77, 77, 0.1)', color: 'var(--error)' },
  };
  const { bg, color } = styles[status] || styles['PENDENTE'];
  return <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: bg, color }}>{status}</span>;
}

function Modal({ title, children, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={modalOverlayStyle} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle: any = { width: '100%', maxWidth: '540px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px' };
const inputStyle: any = { width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
const iconInputStyle: any = { ...inputStyle, paddingLeft: '44px' };
const iconOverlayStyle: any = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' };
const actionTriggerStyle: any = { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' };
const dropdownStyle: any = { position: 'absolute', right: '0', top: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, minWidth: '160px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' };
const dropdownItemStyle: any = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s', color: 'var(--text-main)', textAlign: 'left' };
