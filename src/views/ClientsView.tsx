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
import { useSettings } from '../contexts/SettingsContext';
import { clientsApi } from '../services/api/clients';

interface Client {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  orders: number;
  ltv: number;
  status: 'ATIVO' | 'INATIVO' | 'SUSPENSO';
  color: string;
  since: string;
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
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO' | 'SUSPENSO'>('ATIVO');

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    const { data, error } = await clientsApi.getAll();
    if (error) {
      console.error('Erro ao carregar clientes:', error.message);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      const mappedData: Client[] = data.map(c => ({
        id: c.id,
        name: c.name,
        initials: c.name.substring(0, 2).toUpperCase(),
        email: c.email || '',
        phone: c.phone || '',
        orders: 0,
        ltv: 0,
        status: 'ATIVO' as const,
        color: '#8A2BE2',
        since: new Date(c.created_at).toLocaleDateString('pt-BR')
      }));
      setClients(mappedData);
    }
    setIsLoading(false);
  };

  const handleSaveClient = async () => {
    if (!name || !email) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const clientData = {
      name,
      email,
      phone: phone || null,
      address: null,
      tags: null
    };

    if (editingClient) {
      const { error } = await clientsApi.update(editingClient.id, clientData);
      if (error) {
        alert('Erro ao atualizar cliente: ' + error.message);
        return;
      }
      setClients(prev => prev.map(c => c.id === editingClient.id ? { 
        ...c, name, email, phone, status, initials: name.substring(0, 2).toUpperCase() 
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
          orders: 0,
          ltv: 0,
          status: 'ATIVO',
          color: '#8A2BE2',
          since: new Date().toLocaleDateString('pt-BR')
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
    setStatus(client.status);
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
    setStatus('ATIVO');
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
                    <input type="text" style={iconInputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                  </div>
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
  
  // Mock de histórico de pedidos
  const orders = [
    { id: 'ORD-4392', product: 'Engrenagens Helicoidais (12x)', date: '10/04/2024', status: 'CONCLUÍDO', val: 450.00 },
    { id: 'ORD-4210', product: 'Prototipagem Case Eletrônica', date: '28/03/2024', status: 'CONCLUÍDO', val: 1200.00 },
    { id: 'ORD-4105', product: 'Suportes Industriais TPU', date: '05/03/2024', status: 'CONCLUÍDO', val: 850.50 },
    { id: 'ORD-3988', product: 'Lote Conectores Nylon CF', date: '12/02/2024', status: 'CONCLUÍDO', val: 2300.00 },
  ];

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
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)' }}>{currencySymbol} {client.ltv.toLocaleString('pt-BR')}</div>
           </div>
           <div style={metricBoxStyle}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>PEDIDOS</span>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{client.orders} unidades</div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>Últimos Pedidos</h3>
          {orders.map(order => (
            <div key={order.id} style={orderCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>#{order.id}</span>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', fontWeight: 800 }}>{order.status}</span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{order.product}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                <span>{order.date}</span>
                <span style={{ fontWeight: 700, color: 'white' }}>{currencySymbol} {order.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ width: '100%', height: '54px', marginTop: 'auto' }} onClick={() => alert('Novo orçamento para este cliente...')}>
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
