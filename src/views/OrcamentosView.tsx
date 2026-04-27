import { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Send, 
  CheckCircle, 
  Clock,
  TrendingUp,
  DollarSign,
  User,
  Calendar,
  X,
  Hash,
  Edit2,
  Trash2,
  Download,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { quotesApi } from '../services/api/quotes';
import { clientsApi } from '../services/api/clients';

export default function OrcamentosView() {
  const { currencySymbol } = useSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  const [client, setClient] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitValue, setUnitValue] = useState('0');
  const [shipping, setShipping] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);

  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientsList, setClientsList] = useState<any[]>([]);

  useEffect(() => {
    loadQuotes();
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data } = await clientsApi.getAll();
    if (data) {
      setClientsList(data.map(c => ({ id: c.id, name: c.name })));
    }
  };

  const loadQuotes = async () => {
    setIsLoading(true);
    const { data, error } = await quotesApi.getAll();
    if (error) {
      console.error('Erro ao carregar orçamentos:', error.message);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      const mappedData = data.map(q => ({
        id: q.id,
        client: q.description.split('-')[0] || 'Cliente',
        date: new Date(q.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        total: Number(q.total_value),
        status: q.status,
        unitValue: Number(q.total_value).toString(),
        quantity: '1',
        shipping: '0',
        clientId: q.client_id
      }));
      setOrcamentos(mappedData);
    }
    setIsLoading(false);
  };

  const pendentesCount = orcamentos.filter(o => o.status === 'PENDENTE').length;
  const receitaEstimada = orcamentos.reduce((acc, curr) => acc + curr.total, 0);
  const taxaConversao = orcamentos.length > 0 
    ? Math.round((orcamentos.filter(o => o.status === 'APROVADO' || o.status === 'PAGO').length / orcamentos.length) * 100)
    : 0;

  useEffect(() => {
    const q = parseFloat(quantity) || 0;
    const v = parseFloat(unitValue.toString().replace(',', '.')) || 0;
    const s = parseFloat(shipping.toString().replace(',', '.')) || 0;
    setSubtotal(q * v);
    setTotalFinal(q * v + s);
  }, [quantity, unitValue, shipping]);

  const handleSave = async () => {
    if (!client.trim()) { alert('Por favor, informe o nome do cliente.'); return; }

    const quoteData = {
      description: `${client.trim()} - Orçamento`,
      total_value: totalFinal,
      status: 'PENDENTE' as const,
      expiry_date: expiryDate || null,
      client_id: null
    };

    if (editingItem) {
      const { error } = await quotesApi.update(editingItem.id, quoteData);
      if (error) {
        alert('Erro ao atualizar orçamento: ' + error.message);
        return;
      }
      setOrcamentos(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, client: client.trim(), unitValue, quantity, shipping, total: totalFinal } 
          : item
      ));
    } else {
      const { data, error } = await quotesApi.create(quoteData);
      if (error) {
        alert('Erro ao criar orçamento: ' + error.message);
        return;
      }
      if (data) {
        const newQuote = {
          id: data.id,
          client: client.trim(),
          date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'PENDENTE',
          unitValue: totalFinal.toString(),
          quantity: '1',
          shipping: '0',
          total: totalFinal
        };
        setOrcamentos(prev => [newQuote, ...prev]);
      }
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

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      const { error } = await quotesApi.delete(id);
      if (error) {
        alert('Erro ao excluir orçamento: ' + error.message);
        return;
      }
      setOrcamentos(prev => prev.filter(item => item.id !== id));
      setActiveMenu(null);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await quotesApi.updateStatus(id, 'APROVADO');
    if (error) {
      alert('Erro ao aprovar orçamento: ' + error.message);
      return;
    }
    setOrcamentos(prev => prev.map(item => item.id === id ? { ...item, status: 'APROVADO' } : item));
    setActiveMenu(null);
  };

  const handleShowPreview = (item: any) => {
    setPreviewData(item);
    setShowPreview(true);
    setActiveMenu(null);
  };

  const resetForm = () => {
    setClient(''); setQuantity('1'); setUnitValue('0'); setShipping('0');
    setExpiryDate(''); setEditingItem(null); setShowAddModal(false);
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '48px' }}>
        <StatCard label="APROVAÇÕES PENDENTES" value={pendentesCount.toString()} icon={Clock} color="#F59E0B" />
        <StatCard label="TAXA DE CONVERSÃO" value={`${taxaConversao}%`} subValue={`${orcamentos.length} total`} icon={TrendingUp} color="var(--secondary)" />
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
                    Carregando orçamentos...
                  </td>
                </tr>
              ) : orcamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>Nenhum orçamento encontrado</p>
                  </td>
                </tr>
              ) : (
                orcamentos.map((item) => (
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
                          <div style={dropdownItemStyle} onClick={() => handleShowPreview(item)}><FileText size={14} /> Pré-visualizar PDF</div>
                          <div style={dropdownItemStyle} onClick={() => handleApprove(item.id)}><CheckCircle size={14} /> Aprovar</div>
                          <div style={{ ...dropdownItemStyle, color: 'var(--error)' }} onClick={() => handleDelete(item.id)}><Trash2 size={14} /> Excluir</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de criação/edição */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title={editingItem ? 'Editar Orçamento' : 'Novo Orçamento'} onClose={resetForm}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label>Cliente</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={iconOverlayStyle} />
                  <select 
                    value={client} 
                    onChange={e => setClient(e.target.value)} 
                    style={{ ...iconInputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
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

      {/* Modal de pré-visualização de PDF */}
      <AnimatePresence>
        {showPreview && previewData && (
          <QuotePreview data={previewData} onClose={() => setShowPreview(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Componente QuotePreview ──────────────────────────────────────────────────
function QuotePreview({ data, onClose }: any) {
  const { currencySymbol } = useSettings();
  const handlePrint = () => window.print();
  const subtotalVal = parseFloat(data.unitValue) * parseFloat(data.quantity);
  const shippingVal = parseFloat(data.shipping) || 0;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-quote, #printable-quote * { visibility: visible; }
          #printable-quote { position: absolute; left: 0; top: 0; width: 100%; border-radius: 0 !important; box-shadow: none !important; margin: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Overlay — é o container flex que centraliza o modal */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      >
        {/* Modal — filho do overlay; stopPropagation evita fechar ao clicar dentro */}
        <motion.div
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e: any) => e.stopPropagation()}
          id="printable-quote"
          style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', background: 'white', borderRadius: '24px', padding: '40px', overflowY: 'auto', color: '#1a1a1a', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
        >
          {/* Cabeçalho */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#8A2BE2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <FileText size={22} />
              </div>
              <div>
                <h2 style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: 800, margin: 0 }}>PrintPulse 3D</h2>
                <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Proposta Comercial — {data.id}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#888', fontWeight: 700, lineHeight: '1.8' }}>
              <div>EMISSÃO: {data.date}</div>
              <div>VALIDADE: 15 DIAS</div>
            </div>
          </div>

          {/* Cliente */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#8A2BE2', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Dados do Cliente</div>
            <div style={{ border: '1px solid #eee', borderRadius: '14px', padding: '18px', background: '#fcfcfc' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#222' }}>{data.client}</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Cliente Cadastrado · PrintPulse 3D</div>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#8A2BE2', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Detalhamento do Orçamento</div>
            <div style={{ border: '1px solid #eee', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', padding: '12px 20px', background: '#f9f9f9', fontSize: '11px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ flex: 3 }}>Descrição</span>
                <span style={{ flex: 1, textAlign: 'center' }}>Qtd</span>
                <span style={{ flex: 1, textAlign: 'right' }}>V. Unitário</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Subtotal</span>
              </div>
              <div style={{ display: 'flex', padding: '16px 20px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#333' }}>
                <span style={{ flex: 3 }}>Serviço de Manufatura 3D</span>
                <span style={{ flex: 1, textAlign: 'center' }}>{data.quantity}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{currencySymbol} {parseFloat(data.unitValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{currencySymbol} {subtotalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {shippingVal > 0 && (
                <div style={{ display: 'flex', padding: '16px 20px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#333' }}>
                  <span style={{ flex: 3 }}>Frete / Logística</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>—</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>—</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>{currencySymbol} {shippingVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Totais */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '36px' }}>
            <div style={{ width: '300px', border: '1px solid #eee', borderRadius: '14px', padding: '20px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#666' }}>
                <span>Subtotal:</span>
                <span>{currencySymbol} {subtotalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', color: '#666' }}>
                <span>Frete / Taxas:</span>
                <span>{currencySymbol} {shippingVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '2px solid #ddd', fontSize: '18px', fontWeight: 800, color: '#8A2BE2' }}>
                <span>TOTAL FINAL:</span>
                <span>{currencySymbol} {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', fontSize: '11px', color: '#bbb', textAlign: 'center' }}>
            Documento gerado eletronicamente por <strong>PrintPulse 3D Management</strong>. Valores expressos na moeda local.
          </div>

          {/* Botões de ação */}
          <div style={{ marginTop: '28px', display: 'flex', gap: '14px' }} className="no-print">
            <button onClick={handlePrint} style={{ flex: 1, height: '54px', borderRadius: '12px', border: 'none', background: '#8A2BE2', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px' }}>
              <Download size={20} /> Salvar PDF / Imprimir
            </button>
            <button onClick={onClose} style={{ flex: 1, height: '54px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', color: '#666', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}>
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ─── Auxiliares ───────────────────────────────────────────────────────────────
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
    'PENDENTE':  { bg: 'rgba(245, 158, 11, 0.1)',  color: '#F59E0B' },
    'APROVADO':  { bg: 'rgba(74, 225, 118, 0.1)',  color: 'var(--secondary)' },
    'ENVIADO':   { bg: 'rgba(138, 43, 226, 0.1)',  color: 'var(--primary)' },
    'REJEITADO': { bg: 'rgba(255, 77, 77, 0.1)',   color: 'var(--error)' },
  };
  const { bg, color } = styles[status] || styles['PENDENTE'];
  return <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: bg, color }}>{status}</span>;
}

function Modal({ title, children, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={modalOverlayStyle} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={modalContentStyle} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle: any = { width: '100%', maxWidth: '540px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px' };
const inputStyle: any = { width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
const iconInputStyle: any = { ...inputStyle, paddingLeft: '44px' };
const iconOverlayStyle: any = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' };
const actionTriggerStyle: any = { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' };
const dropdownStyle: any = { position: 'absolute', right: '0', top: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, minWidth: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' };
const dropdownItemStyle: any = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-main)' };
