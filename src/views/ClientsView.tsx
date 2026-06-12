import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  User, 
  Mail, 
  Phone, 
  CheckCircle,
  History,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  ExternalLink,
  Layers,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientsApi } from '../services/api/clients';
import { validationUtils } from '../utils/validation';
import { useSettings } from '../contexts/SettingsContext';
import { quotesApi } from '../services/api/quotes';
import { productionApi } from '../services/api/production';
import { transactionsApi } from '../services/api/transactions';

interface Client {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  address: string;
  orders: number;
  ltv: number;
  status: 'ATIVO' | 'INATIVO' | 'SUSPENSO';
  color: string;
  since: string;
  type: string;
}

interface OrderItem {
  id: string;
  product: string;
  date: string;
  status: string;
  value: number;
  type: 'quote' | 'production' | 'transaction';
}

export default function ClientsView() {
  const { currencySymbol } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para o formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO' | 'SUSPENSO'>('ATIVO');
  const [clientType, setClientType] = useState('B2B');
  const clientTypes = ['B2B', 'Prototipagem', 'Hobbyista', 'Educação', 'Outro'];

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})/, '($1) $2');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, quotesRes, transactionsRes] = await Promise.all([
        clientsApi.getAll(),
        quotesApi.getAll(),
        transactionsApi.getAll()
      ]);

      if (clientsRes.data) {
        const mappedData: Client[] = clientsRes.data.map((c: any) => {
          const clientQuotes = quotesRes.data?.filter((q: any) => q.client_id === c.id) || [];
          const clientTransactions = transactionsRes.data?.filter((t: any) => 
            t.description?.toLowerCase().includes(c.name.toLowerCase())
          ) || [];

          const ltv = clientQuotes
            .filter((q: any) => q.status === 'PAGO' || q.status === 'APROVADO')
            .reduce((acc: number, q: any) => acc + (q.total_value || 0), 0);

          const totalOrders = clientQuotes.length + clientTransactions.filter((t: any) => t.type === 'INCOME').length;

          return {
            id: c.id,
            name: c.name,
            initials: c.name.substring(0, 2).toUpperCase(),
            email: c.email || '',
            phone: c.phone || '',
            address: c.address || '',
            orders: totalOrders,
            ltv,
            status: 'ATIVO' as const,
            color: '#8A2BE2',
            since: new Date(c.created_at).toLocaleDateString('pt-BR'),
            type: c.type || 'Outro'
          };
        });
        setClients(mappedData);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
    setIsLoading(false);
  };

  const handleSaveClient = async () => {
    const sanitizedName = validationUtils.sanitizeString(name);
    const sanitizedEmail = validationUtils.sanitizeEmail(email);
    const sanitizedPhone = validationUtils.sanitizePhone(phone);

    if (!sanitizedName) {
      alert('Nome é obrigatório!');
      return;
    }

    if (sanitizedEmail && !validationUtils.validateEmail(sanitizedEmail)) {
      alert('E-mail inválido!');
      return;
    }

    if (sanitizedPhone && !validationUtils.validatePhone(sanitizedPhone)) {
      alert('Telefone inválido!');
      return;
    }

    const clientData = {
      name: sanitizedName,
      email: sanitizedEmail || null,
      phone: sanitizedPhone || null,
      address: address.trim() || null,
      tags: null,
      type: clientType
    };

    if (editingClient) {
      const { error } = await clientsApi.update(editingClient.id, clientData);
      if (error) {
        alert('Erro ao atualizar cliente: ' + error.message);
        return;
      }
      setClients(prev => prev.map(c => c.id === editingClient.id ? { 
        ...c, name, email, phone, address, status, type: clientType, initials: name.substring(0, 2).toUpperCase() 
      } : c));
      alert('Dados do cliente atualizados!');
    } else {
      const { data, error } = await clientsApi.create(clientData);
      if (error) {
        alert('Erro ao criar cliente: ' + error.message);
        return;
      }
      if (data) {
        const newClient: Client = {
          id: data.id,
          name: data.name,
          initials: data.name.substring(0, 2).toUpperCase(),
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          orders: 0,
          ltv: 0,
          status: 'ATIVO',
          color: '#8A2BE2',
          since: new Date().toLocaleDateString('pt-BR'),
          type: clientType
        };
        setClients([newClient, ...clients]);
      }
      alert('Novo cliente cadastrado!');
    }
    closeModal();
  };

  const handleViewHistory = (client: Client) => {
    setSelectedClient(client);
    setShowHistory(true);
    setActiveMenu(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setAddress(client.address || '');
    setStatus(client.status);
    setClientType(client.type || 'B2B');
    setShowModal(true);
    setActiveMenu(null);
  };

const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      const { error } = await clientsApi.delete(id);
      if (error) {
        alert('Erro ao excluir cliente: ' + error.message);
        return;
      }
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowHistory(false);
    setEditingClient(null);
    setSelectedClient(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setStatus('ATIVO');
    setClientType('B2B');
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Gestão de Clientes</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Base estratégica de clientes e parceiros operacionais.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowModal(true)}
          style={{ height: '54px', padding: '0 24px' }}
        >
          <Plus size={20} /> Adicionar Cliente
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Pesquisar por nome ou e-mail..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={searchInputStyle} />
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th style={thStyle}>CLIENTE</th>
                    <th style={thStyle}>CONTATO</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PEDIDOS</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>LTV ({currencySymbol})</th>
                    <th style={thStyle}>STATUS</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '60px' }}>
                        <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
                        Carregando clientes...
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>Nenhum cliente encontrado</p>
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map(client => (
                    <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: client.color + '20', color: client.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{client.initials}</div>
                          <span style={{ fontWeight: 600 }}>{client.name}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{client.email}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{client.phone}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{client.orders}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>{currencySymbol} {client.ltv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td style={tdStyle}><StatusBadge status={client.status} /></td>
                      <td style={{ ...tdStyle, textAlign: 'right', position: 'relative' }}>
                        <button onClick={() => setActiveMenu(activeMenu === client.id ? null : client.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                          <MoreHorizontal size={20} />
                        </button>
                        <AnimatePresence>
                          {activeMenu === client.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} style={dropdownStyle}>
                              <div style={dropdownItemStyle} onClick={() => handleEdit(client)}><Edit2 size={14} /> Editar</div>
                              <div style={dropdownItemStyle} onClick={() => handleViewHistory(client)}><History size={14} /> Histórico</div>
                              <div style={{ ...dropdownItemStyle, color: 'var(--error)' }} onClick={() => handleDelete(client.id)}><Trash2 size={14} /> Excluir Cliente</div>
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

      <AnimatePresence>
        {showModal && (
          <Modal title={editingClient ? "Editar Cliente" : "Novo Cliente"} onClose={closeModal}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <label>Nome da Empresa / Cliente</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={iconOverlayStyle} />
                    <input type="text" style={iconInputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Aero Dynamics inc." />
                  </div>
                </div>
                <div className="input-group">
                  <label>E-mail de Contato</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={iconOverlayStyle} />
                    <input type="email" style={iconInputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@email.com" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Telefone / WhatsApp</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={iconOverlayStyle} />
                    <input type="text" style={iconInputStyle} value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Endereço</label>
                  <input type="text" style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" />
                </div>
                <div className="input-group">
                  <label>Tipo de Cliente</label>
                  <select style={inputStyle} value={clientType} onChange={e => setClientType(e.target.value)}>
                    {clientTypes.map(t => (
                      <option key={t} value={t} style={{ background: '#0a0a0a' }}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Status da Conta</label>
                  <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="ATIVO" style={{ background: '#0a0a0a' }}>ATIVO</option>
                    <option value="INATIVO" style={{ background: '#0a0a0a' }}>INATIVO</option>
                    <option value="SUSPENSO" style={{ background: '#0a0a0a' }}>SUSPENSO</option>
                  </select>
                </div>
                <button className="btn-primary" style={{ height: '54px', marginTop: '10px' }} onClick={handleSaveClient}>
                  {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
             </div>
          </Modal>
        )}

        {showHistory && selectedClient && (
          <HistoryDrawer client={selectedClient} onClose={closeModal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HistoryDrawer({ client, onClose }: { client: Client, onClose: () => void }) {
  const { currencySymbol } = useSettings();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLTV, setTotalLTV] = useState(0);

  useEffect(() => {
    loadClientHistory();
  }, [client.id]);

  const loadClientHistory = async () => {
    setIsLoading(true);
    try {
      const [quotesRes, productionRes, transactionsRes] = await Promise.all([
        quotesApi.getAll(),
        productionApi.getAll(),
        transactionsApi.getAll()
      ]);

      const allOrders: OrderItem[] = [];
      let ltvTotal = 0;

      // Quotes do cliente
      if (quotesRes.data) {
        const clientQuotes = quotesRes.data.filter((q: any) => q.client_id === client.id);
        clientQuotes.forEach((q: any) => {
          const date = new Date(q.created_at).toLocaleDateString('pt-BR');
          const statusMap: any = { 'PENDENTE': 'PENDENTE', 'APROVADO': 'APROVADO', 'REJEITADO': 'REJEITADO', 'PAGO': 'PAGO' };
          allOrders.push({
            id: q.id.substring(0, 8).toUpperCase(),
            product: q.description || 'Orçamento sem descrição',
            date,
            status: statusMap[q.status] || q.status,
            value: q.total_value || 0,
            type: 'quote'
          });
          if (q.status === 'PAGO' || q.status === 'APROVADO') {
            ltvTotal += q.total_value || 0;
          }
        });
      }

      // Transações do cliente (vendas)
      if (transactionsRes.data) {
        const clientTransactions = transactionsRes.data.filter((t: any) => 
          t.description?.toLowerCase().includes(client.name.toLowerCase()) ||
          t.category === 'Vendas'
        );
        clientTransactions.forEach((t: any) => {
          const date = new Date(t.date).toLocaleDateString('pt-BR');
          const statusMap: any = { 'PENDENTE': 'PENDENTE', 'CONCLUÍDO': 'CONCLUÍDO', 'ESTORNADO': 'ESTORNADO' };
          allOrders.push({
            id: t.id.substring(0, 8).toUpperCase(),
            product: t.description || 'Transação',
            date,
            status: statusMap[t.status] || t.status,
            value: t.value || 0,
            type: 'transaction'
          });
          if (t.type === 'INCOME' && t.status === 'CONCLUÍDO') {
            ltvTotal += t.value || 0;
          }
        });
      }

      // Ordenar por data mais recente
      allOrders.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      });

      setOrders(allOrders.slice(0, 20)); // Limitar a 20 itens
      setTotalLTV(ltvTotal);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'CONCLUÍDO': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
      'PAGO': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
      'APROVADO': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
      'PENDENTE': { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
      'REJEITADO': { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
      'ESTORNADO': { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }
    };
    return colors[status] || { bg: 'rgba(255,255,255,0.05)', color: '#888' };
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        style={modalOverlayStyle} 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={drawerStyle}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>HISTÓRICO OPERACIONAL</span>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{client.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
           <div style={metricBoxStyle}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>LTV TOTAL</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)' }}>{currencySymbol} {totalLTV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
           </div>
           <div style={metricBoxStyle}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>PEDIDOS</span>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{orders.length} registros</div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>Últimos Pedidos</h3>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
              <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>Carregando histórico...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <History size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Nenhum registro encontrado</p>
            </div>
          ) : (
            orders.map(order => {
              const statusStyle = getStatusColor(order.status);
              return (
                <div key={`${order.type}-${order.id}`} style={orderCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>#{order.id}</span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: statusStyle.bg, color: statusStyle.color, fontWeight: 800 }}>{order.status}</span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{order.product}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                    <span>{order.date}</span>
                    <span style={{ fontWeight: 700, color: 'white' }}>{currencySymbol} {order.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button className="btn-primary" style={{ width: '100%', height: '54px', marginTop: '24px' }} onClick={() => alert('Novo orçamento para este cliente...')}>
          <Plus size={18} /> Novo Orçamento
        </button>
      </motion.div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = { 
    'ATIVO': { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' }, 
    'INATIVO': { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' }, 
    'SUSPENSO': { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' } 
  };
  const current = styles[status];
  return <span style={{ fontSize: '10px', fontWeight: 800, color: current.color, background: current.bg, padding: '4px 8px', borderRadius: '4px' }}>{status}</span>;
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

const thStyle: any = { padding: '16px 24px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' };
const tdStyle: any = { padding: '16px 24px', fontSize: '13px' };
const inputStyle: any = { width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '14px' };
const iconInputStyle: any = { ...inputStyle, paddingLeft: '44px' };
const iconOverlayStyle: any = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' };
const searchInputStyle: any = { ...inputStyle, paddingLeft: '48px', paddingRight: '16px', height: '48px', background: 'rgba(255,255,255,0.02)' };
const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle: any = { width: '100%', maxWidth: '500px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px' };
const dropdownStyle: any = { position: 'absolute', right: '0', top: '40px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, minWidth: '180px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' };
const dropdownItemStyle: any = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'white', transition: '0.2s', textAlign: 'left' };

const drawerStyle: any = { position: 'fixed', right: 0, top: 0, height: '100vh', width: '100%', maxWidth: '400px', background: 'var(--bg-main)', borderLeft: '1px solid var(--border-glass)', padding: '40px 32px', zIndex: 1100, boxShadow: '-20px 0 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
const metricBoxStyle: any = { padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' };
const orderCardStyle: any = { padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '12px', transition: '0.2s' };
