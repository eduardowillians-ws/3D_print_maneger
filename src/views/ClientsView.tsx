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
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para o formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO' | 'SUSPENSO'>('ATIVO');

  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: "Componentes Aeroespaciais Inc.", initials: "CA", email: "compras@aeroespacial.io", phone: "(11) 98888-7777", orders: 142, ltv: 124500.00, status: "ATIVO", color: "var(--primary)", since: "12/01/2023" },
    { id: '2', name: "Dispositivos MedTech LLC", initials: "DM", email: "suprimentos@medtech.com", phone: "(21) 97777-6666", orders: 84, ltv: 89240.50, status: "ATIVO", color: "#22D3EE", since: "24/03/2023" },
    { id: '3', name: "Design de Prototipagem Rápida", initials: "DP", email: "j.silva@dpr.net", phone: "(31) 96666-5555", orders: 12, ltv: 4120.00, status: "INATIVO", color: "var(--text-muted)", since: "05/06/2023" },
    { id: '4', name: "Vanguarda Logística", initials: "VL", email: "faturamento@vanguarda.co", phone: "(41) 95555-4444", orders: 3, ltv: 850.00, status: "SUSPENSO", color: "#FF4D4D", since: "18/09/2023" },
    { id: '5', name: "Engenharia Nexus", initials: "EN", email: "contato@nexus.io", phone: "(51) 94444-3333", orders: 56, ltv: 62100.00, status: "ATIVO", color: "#8A2BE2", since: "30/11/2023" },
  ]);

  const handleSaveClient = () => {
    if (!name || !email) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { 
        ...c, name, email, phone, status, initials: name.substring(0, 2).toUpperCase() 
      } : c));
      alert('Dados do cliente atualizados!');
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        status,
        initials: name.substring(0, 2).toUpperCase(),
        orders: 0,
        ltv: 0,
        color: '#8A2BE2',
        since: new Date().toLocaleDateString('pt-BR')
      };
      setClients([newClient, ...clients]);
      alert('Novo cliente cadastrado!');
    }
    closeModal();
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

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir permanentemente este cliente e seu histórico?')) {
      setClients(prev => prev.filter(c => c.id !== id));
      setActiveMenu(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
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
                  {filteredClients.map(client => (
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
                              <div style={dropdownItemStyle} onClick={() => { setActiveMenu(null); alert('Histórico do cliente aberto!'); }}><History size={14} /> Histórico</div>
                              <div style={{ ...dropdownItemStyle, color: 'var(--error)' }} onClick={() => handleDelete(client.id)}><Trash2 size={14} /> Excluir Cliente</div>
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
      </AnimatePresence>
    </motion.div>
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
