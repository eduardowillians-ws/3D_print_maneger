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
  Loader2,
  Package,
  AlertCircle,
  History as HistoryIcon,
  Archive,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { quotesApi } from '../services/api/quotes';
import { quoteItemsApi } from '../services/api/quoteItems';
import { clientsApi } from '../services/api/clients';
import { productsApi } from '../services/api/products';
import { transactionsApi } from '../services/api/transactions';

interface QuoteItemForm {
  tempId: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function OrcamentosView() {
  const { currencySymbol } = useSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showArchive, setShowArchive] = useState(false);
  
  const [client, setClient] = useState('');
  const [shipping, setShipping] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [totalFinal, setTotalFinal] = useState(0);

  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [productsList, setProductsList] = useState<any[]>([]);

  const [formItems, setFormItems] = useState<QuoteItemForm[]>([]);

  useEffect(() => {
    loadQuotes();
    loadClients();
    loadProducts();
  }, []);

  const loadClients = async () => {
    const { data } = await clientsApi.getAll();
    if (data) {
      setClientsList(data);
    }
  };

  const loadProducts = async () => {
    const { data } = await productsApi.getAll();
    if (data) {
      setProductsList(data);
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
      const mappedData = await Promise.all(data.map(async q => {
        const parts = q.description.split('-');
        const { data: items } = await quoteItemsApi.getByQuoteId(q.id);
        return {
          id: q.id,
          reference_code: q.reference_code,
          client: parts[0]?.trim() || 'Cliente',
          date: new Date(q.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          total: Number(q.total_value),
          status: q.status,
          shipping: '0',
          expiryDate: q.expiry_date || '',
          clientId: q.client_id,
          items: (items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id || '',
            description: item.description,
            quantity: item.quantity,
            unit_price: Number(item.unit_price)
          }))
        };
      }));
      setOrcamentos(mappedData);
    }
    setIsLoading(false);
  };

  const handleArchive = async (id: string) => {
    const { error } = await quotesApi.updateStatus(id, 'ARQUIVADO');
    if (error) {
      alert('Erro ao arquivar orçamento: ' + error.message);
      return;
    }
    setOrcamentos(prev => prev.map(item => item.id === id ? { ...item, status: 'ARQUIVADO' } : item));
    setActiveMenu(null);
  };

  const handleRestore = async (id: string) => {
    const { error } = await quotesApi.updateStatus(id, 'PENDENTE');
    if (error) {
      alert('Erro ao restaurar orçamento: ' + error.message);
      return;
    }
    setOrcamentos(prev => prev.map(item => item.id === id ? { ...item, status: 'PENDENTE' } : item));
  };

  const activeOrcamentos = orcamentos.filter(o => o.status !== 'ARQUIVADO');
  const archivedOrcamentos = orcamentos.filter(o => o.status === 'ARQUIVADO');

  const pendentesCount = activeOrcamentos.filter(o => o.status === 'PENDENTE').length;
  const receitaEstimada = activeOrcamentos.reduce((acc, curr) => acc + curr.total, 0);
  const taxaConversao = activeOrcamentos.length > 0 
    ? Math.round((activeOrcamentos.filter(o => o.status === 'APROVADO' || o.status === 'PAGO').length / activeOrcamentos.length) * 100)
    : 0;

  useEffect(() => {
    const itemsTotal = formItems.reduce((acc, item) => {
      return acc + (item.quantity * item.unit_price);
    }, 0);
    const s = parseFloat(shipping.toString().replace(',', '.')) || 0;
    setTotalFinal(itemsTotal + s);
  }, [formItems, shipping]);

  const addFormItem = () => {
    setFormItems(prev => [...prev, {
      tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      product_id: '',
      description: '',
      quantity: 1,
      unit_price: 0
    }]);
  };

  const removeFormItem = (tempId: string) => {
    setFormItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const updateFormItem = (tempId: string, field: keyof QuoteItemForm, value: any) => {
    setFormItems(prev => prev.map(item => {
      if (item.tempId !== tempId) return item;
      const updated = { ...item, [field]: value };
      if (field === 'product_id') {
        const product = productsList.find(p => p.id === value);
        if (product) {
          updated.description = product.name;
          updated.unit_price = product.suggested_price || (product as any).price || 0;
        }
      }
      return updated;
    }));
  };

  const handleSave = async () => {
    if (!client.trim()) { alert('Por favor, informe o nome do cliente.'); return; }
    if (formItems.length === 0) { alert('Por favor, adicione pelo menos um item ao orçamento.'); return; }

    const quoteData = {
      description: `${client.trim()} - Orçamento`,
      total_value: totalFinal,
      status: 'PENDENTE' as const,
      expiry_date: expiryDate || null,
      client_id: selectedClientId || null
    };

    if (editingItem) {
      const { error } = await quotesApi.update(editingItem.id, quoteData);
      if (error) {
        alert('Erro ao atualizar orçamento: ' + error.message);
        return;
      }

      await quoteItemsApi.deleteByQuoteId(editingItem.id);

      const itemsToCreate = formItems.map(item => ({
        quote_id: editingItem.id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));
      const { error: itemsError } = await quoteItemsApi.createMany(itemsToCreate);
      if (itemsError) {
        alert('Erro ao salvar itens: ' + itemsError.message);
        return;
      }

      setOrcamentos(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, client: client.trim(), shipping, total: totalFinal, items: formItems.map(fi => ({
              productId: fi.product_id,
              description: fi.description,
              quantity: fi.quantity,
              unit_price: fi.unit_price
            }))}
          : item
      ));
    } else {
      const { data, error } = await quotesApi.create(quoteData);
      if (error) {
        alert('Erro ao criar orçamento: ' + error.message);
        return;
      }
      if (data) {
        const itemsToCreate = formItems.map(item => ({
          quote_id: data.id,
          product_id: item.product_id || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));
        const { error: itemsError } = await quoteItemsApi.createMany(itemsToCreate);
        if (itemsError) {
          alert('Erro ao salvar itens: ' + itemsError.message);
          return;
        }

        const newQuote = {
          id: data.id,
          client: client.trim(),
          date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'PENDENTE',
          shipping: shipping,
          total: totalFinal,
          expiryDate: expiryDate,
          items: formItems.map(fi => ({
            productId: fi.product_id,
            description: fi.description,
            quantity: fi.quantity,
            unit_price: fi.unit_price
          }))
        };
        setOrcamentos(prev => [newQuote, ...prev]);
      }
    }
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setClient(item.client);
    setShipping(item.shipping);
    setSelectedClientId(item.clientId || '');
    setExpiryDate(item.expiryDate || '');

    const loadedItems: QuoteItemForm[] = (item.items || []).map((qi: any, idx: number) => ({
      tempId: `edit_${idx}_${Date.now()}`,
      product_id: qi.productId || '',
      description: qi.description || '',
      quantity: qi.quantity || 1,
      unit_price: qi.unit_price || 0
    }));
    setFormItems(loadedItems.length > 0 ? loadedItems : []);

    setShowAddModal(true);
    setActiveMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      await quoteItemsApi.deleteByQuoteId(id);
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
    const orcamento = orcamentos.find(o => o.id === id);
    if (!orcamento) return;

    const { error } = await quotesApi.updateStatus(id, 'APROVADO');
    if (error) {
      alert('Erro ao aprovar orçamento: ' + error.message);
      return;
    }

    setOrcamentos(prev => prev.map(item => item.id === id ? { ...item, status: 'APROVADO' } : item));
    setActiveMenu(null);

    const shouldCreateTransaction = confirm('Orçamento aprovado! Deseja registrar esta receita no financeiro?');
    if (shouldCreateTransaction) {
      const clientInfo = clientsList.find(c => c.id === orcamento.clientId);
      const clientName = clientInfo?.name || 'Cliente Avulso';
      const itemCount = orcamento.items?.length || 0;
      const itemSummary = itemCount === 1 ? orcamento.items[0].description : `${itemCount} itens`;
      
      const transactionData = {
        description: `Orçamento aprovado: ${itemSummary} - ${clientName}`,
        type: 'INCOME' as const,
        category: 'Vendas',
        value: orcamento.total,
        status: 'PENDENTE' as const,
        date: new Date().toISOString().split('T')[0]
      };

      const { error: txError } = await transactionsApi.create(transactionData);
      if (txError) {
        alert('Orçamento aprovado, mas erro ao criar transação: ' + txError.message);
      } else {
        alert('Receita registrada no financeiro com sucesso!');
      }
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await quotesApi.updateStatus(id, 'REJEITADO');
    if (error) {
      alert('Erro ao rejeitar orçamento: ' + error.message);
      return;
    }
    setOrcamentos(prev => prev.map(item => item.id === id ? { ...item, status: 'REJEITADO' } : item));
    setActiveMenu(null);
  };

  const handleShowPreview = async (item: any) => {
    const itemsWithNames = (item.items || []).map((qi: any) => {
      let productName = qi.description || 'Serviço de Manufatura 3D';
      if (qi.productId) {
        const product = productsList.find(p => p.id === qi.productId);
        if (product) productName = product.name;
      }
      return { ...qi, productName };
    });
    setPreviewData({ ...item, items: itemsWithNames });
    setShowPreview(true);
    setActiveMenu(null);
  };

  const resetForm = () => {
    setClient(''); setShipping('0');
    setExpiryDate(''); setEditingItem(null); setShowAddModal(false);
    setSelectedClientId('');
    setFormItems([]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Gerenciamento de Orçamentos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie estimativas de clientes e propostas de preços.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-primary" 
            style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', fontSize: '15px' }}
            onClick={() => setShowArchive(!showArchive)}
          >
            <HistoryIcon size={18} /> {showArchive ? 'Voltar aos Ativos' : 'Histórico'}
          </button>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={() => { setFormItems([]); setShowAddModal(true); }}>
            <Plus size={20} /> Criar Novo Orçamento
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '48px' }}>
        <StatCard label="APROVAÇÕES PENDENTES" value={pendentesCount.toString()} icon={Clock} color="#F59E0B" />
        <StatCard label="TAXA DE CONVERSÃO" value={`${taxaConversao}%`} subValue={`${orcamentos.length} total`} icon={TrendingUp} color="var(--secondary)" />
        <StatCard label="RECEITA ESTIMADA" value={`${currencySymbol} ${receitaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} subValue="Fila" icon={DollarSign} color="var(--primary)" />
      </div>

      {!showArchive ? (
        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>ID</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Cliente</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Emitido</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Itens</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Total Final</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
                      Carregando orçamentos...
                    </td>
                  </tr>
                ) : activeOrcamentos.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p>Nenhum orçamento ativo encontrado</p>
                    </td>
                  </tr>
                ) : (
                  activeOrcamentos.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--primary)' }}>{item.reference_code || item.id.substring(0, 8)}</td>
                    <td style={{ padding: '16px 24px' }}>{item.client}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-dim)' }}>{item.date}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-dim)' }}>
                      {item.items?.length || 0} {item.items?.length === 1 ? 'item' : 'itens'}
                    </td>
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
                            <div style={{ ...dropdownItemStyle, color: 'var(--error)' }} onClick={() => handleReject(item.id)}><XCircle size={14} /> Rejeitar</div>
                            <div style={dropdownItemStyle} onClick={() => handleArchive(item.id)}><Archive size={14} /> Arquivar</div>
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
      ) : (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <Archive size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Orçamentos Arquivados</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {archivedOrcamentos.map(item => (
              <div 
                key={item.id} 
                className="glass-panel" 
                style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{item.client}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Emitido em: {item.date} • Total: {currencySymbol} {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleRestore(item.id)} 
                      style={{ background: 'var(--primary-glow)', border: '1px solid var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Restaurar
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {archivedOrcamentos.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                <Archive size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <p>Nenhum orçamento arquivado.</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                    value={selectedClientId} 
                    onChange={e => {
                      const selectedId = e.target.value;
                      setSelectedClientId(selectedId);
                      const selectedClient = clientsList.find(c => c.id === selectedId);
                      setClient(selectedClient?.name || '');
                    }} 
                    style={{ ...iconInputStyle, cursor: 'pointer' }}
                  >
                    <option value="" style={{ color: '#888' }}>Selecione um cliente...</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id} style={{ color: '#fff' }}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Itens do orçamento */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Itens do Orçamento</label>
                  <button 
                    type="button" 
                    onClick={addFormItem}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(138, 43, 226, 0.15)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    <Plus size={14} /> Adicionar Item
                  </button>
                </div>

                {formItems.length === 0 && (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-glass)' }}>
                    <Package size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                    <p style={{ fontSize: '13px' }}>Nenhum item adicionado. Clique em "Adicionar Item" para começar.</p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formItems.map((item, index) => (
                    <div key={item.tempId} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Item {index + 1}
                        </span>
                        {formItems.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeFormItem(item.tempId)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="input-group">
                          <label style={{ fontSize: '11px' }}>Produto</label>
                          <div style={{ position: 'relative' }}>
                            <Package size={14} style={iconOverlayStyleSmall} />
                            <select 
                              value={item.product_id} 
                              onChange={e => updateFormItem(item.tempId, 'product_id', e.target.value)} 
                              style={{ ...iconInputStyleSmall, cursor: 'pointer' }}
                            >
                              <option value="" style={{ color: '#888' }}>Selecione um produto...</option>
                              {productsList.map(p => {
                                const price = p.suggested_price || (p as any).price || 0;
                                return (
                                  <option key={p.id} value={p.id} style={{ color: '#fff' }}>{p.name} - R$ {Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        <div className="input-group">
                          <label style={{ fontSize: '11px' }}>Descrição</label>
                          <input 
                            type="text" 
                            value={item.description} 
                            onChange={e => updateFormItem(item.tempId, 'description', e.target.value)} 
                            placeholder="Descrição do item..."
                            style={inputStyleSmall} 
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="input-group">
                            <label style={{ fontSize: '11px' }}>Quantidade</label>
                            <div style={{ position: 'relative' }}>
                              <Hash size={14} style={iconOverlayStyleSmall} />
                              <input 
                                type="number" 
                                min="1"
                                value={item.quantity} 
                                onChange={e => updateFormItem(item.tempId, 'quantity', parseInt(e.target.value) || 1)} 
                                style={iconInputStyleSmall} 
                              />
                            </div>
                          </div>
                          <div className="input-group">
                            <label style={{ fontSize: '11px' }}>Valor Unitário ({currencySymbol})</label>
                            <div style={{ position: 'relative' }}>
                              <div style={iconOverlayStyleSmall}>{currencySymbol}</div>
                              <input 
                                type="text" 
                                placeholder="0,00" 
                                value={item.unit_price > 0 ? item.unit_price.toString().replace('.', ',') : ''} 
                                onChange={e => updateFormItem(item.tempId, 'unit_price', parseFloat(e.target.value.replace(',', '.')) || 0)} 
                                style={{ ...iconInputStyleSmall, paddingLeft: '32px' }} 
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-dim)' }}>
                          Subtotal: <strong style={{ color: 'var(--secondary)' }}>
                            {currencySymbol} {(item.quantity * item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

  const items = data.items || [];
  const subtotalVal = items.reduce((acc: number, item: any) => {
    const qty = parseInt(item.quantity) || 1;
    const price = parseFloat(item.unit_price?.toString().replace(',', '.')) || 0;
    return acc + (qty * price);
  }, 0);
  const shippingVal = parseFloat(data.shipping?.toString().replace(',', '.')) || 0;

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

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      >
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
                <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Proposta Comercial — {data.reference_code || data.id.substring(0, 8)}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#888', fontWeight: 700, lineHeight: '1.8' }}>
              <div>EMISSÃO: {data.date}</div>
              <div>VALIDADE: {data.expiryDate ? new Date(data.expiryDate).toLocaleDateString('pt-BR') : '15 DIAS'}</div>
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
              {items.map((item: any, index: number) => {
                const qty = parseInt(item.quantity) || 1;
                const price = parseFloat(item.unit_price?.toString().replace(',', '.')) || 0;
                const itemSubtotal = qty * price;
                return (
                  <div key={index} style={{ display: 'flex', padding: '16px 20px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#333' }}>
                    <span style={{ flex: 3 }}>{item.productName || item.description || 'Serviço de Manufatura 3D'}</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>{qty}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>{currencySymbol} {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>{currencySymbol} {itemSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                );
              })}
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
const modalContentStyle: any = { width: '100%', maxWidth: '620px', maxHeight: '90vh', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px', overflowY: 'auto' };
const inputStyle: any = { width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
const iconInputStyle: any = { ...inputStyle, paddingLeft: '44px' };
const iconOverlayStyle: any = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' };
const inputStyleSmall: any = { width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' };
const iconInputStyleSmall: any = { ...inputStyleSmall, paddingLeft: '36px' };
const iconOverlayStyleSmall: any = { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '12px' };
const actionTriggerStyle: any = { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' };
const dropdownStyle: any = { position: 'absolute', right: '0', top: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, minWidth: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' };
const dropdownItemStyle: any = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-main)' };
