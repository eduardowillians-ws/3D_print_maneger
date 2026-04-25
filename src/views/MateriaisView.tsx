import { useState } from 'react';
import { 
  Plus, 
  ShoppingCart, 
  ChevronDown, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Droplet,
  Package,
  X,
  Database,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MateriaisView() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [filterType, setFilterType] = useState('Todos os Tipos');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para os campos do novo material
  const [newMatName, setNewMatName] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newCost, setNewCost] = useState('');

  const [materials, setMaterials] = useState([
    { name: 'Bambu Basic', type: 'PLA', color: 'Roxo', colorHex: '#8A2BE2', weight: 850, cost: 0.024, status: 'SAUDÁVEL' },
    { name: 'eSun Tough', type: 'PETG', color: 'Branco', colorHex: '#FFFFFF', weight: 1320, cost: 0.028, status: 'SAUDÁVEL' },
    { name: 'Hatchbox', type: 'ABS', color: 'Preto', colorHex: '#000000', weight: 45, cost: 0.031, status: 'CRÍTICO' },
    { name: 'Prusament', type: 'PLA', color: 'Laranja', colorHex: '#FF8C00', weight: 210, cost: 0.035, status: 'BAIXO ESTOQUE' },
    { name: 'Overture Matte', type: 'PLA', color: 'Cinza', colorHex: '#808080', weight: 1000, cost: 0.022, status: 'SAUDÁVEL' },
  ]);

  const handleConfirmPurchase = () => {
    if (!newMatName) return;

    const newEntry = {
      name: newMatName,
      type: 'PLA', // Mock para o exemplo, mas pegaria do select
      color: 'Personalizada',
      colorHex: '#8A2BE2',
      weight: Number(newQty) * 1000, // Supõe rolos de 1kg
      cost: Number(newCost) / 1000,
      status: 'SAUDÁVEL'
    };

    setMaterials([newEntry, ...materials]);
    setShowBuyModal(false);
    setNewMatName('');
    setNewVendor('');
    setNewQty('');
    setNewCost('');
    alert('Entrada de material registrada com sucesso!');
  };

  // Lógica de Filtro
  const filteredMaterials = filterType === 'Todos os Tipos' 
    ? materials 
    : materials.filter(m => m.type === filterType);

  const types = ['Todos os Tipos', 'PLA', 'PETG', 'ABS', 'TPU', 'Nylon', 'Resina'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Materiais</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerenciar estoque de filamentos e monitorar unidades AMS ativas.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-primary" 
            style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', fontSize: '15px' }}
            onClick={() => setShowBuyModal(true)}
          >
            <ShoppingCart size={18} /> Registrar Compra
          </button>
          <button 
            className="btn-primary" 
            style={{ padding: '12px 24px', fontSize: '15px' }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} /> Adicionar Material
          </button>
        </div>
      </div>

      {/* Unidades AMS Ativas */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={18} color="var(--primary)" /> Unidades AMS Ativas
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '48px' }}>
        <AMSSlot slot="1" type="PLA Basic" color="Roxo Primário" weight="850g" colorHex="#8A2BE2" active />
        <AMSSlot slot="2" type="PETG" color="Branco Sólido" weight="220g" colorHex="#FFFFFF" />
        <AMSSlot slot="3" type="ABS" color="Preto Fosco" weight="45g" colorHex="#333" warning />
        <AMSSlot slot="4" empty />
      </div>

      {/* Armazém Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} color="var(--primary)" /> Estoque do Armazém
        </h3>
        
        <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={filterSelectStyle}
            >
              {filterType} <ChevronDown size={14} style={{ transform: showFilterDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  style={dropdownMenuStyle}
                >
                  {types.map(t => (
                    <div key={t} onClick={() => { setFilterType(t); setShowFilterDropdown(false); }} className="dropdown-item" style={dropdownItemStyle}>{t}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="btn-primary" style={{ width: '36px', height: '36px', borderRadius: '8px', padding: 0 }}>
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Nome do Material</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Tipo</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Cor</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Peso (g)</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Custo/g</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode='popLayout'>
            {filteredMaterials.map((mat, i) => (
              <motion.tr 
                key={mat.name} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ borderBottom: '1px solid var(--border-glass)' }} 
                className="table-hover"
              >
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{mat.name}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-dim)' }}>{mat.type}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: mat.colorHex }}></div>
                    {mat.color}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>{mat.weight.toLocaleString()}</td>
                <td style={{ padding: '16px 24px' }}>${mat.cost.toFixed(3)}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px',
                    background: mat.status === 'SAUDÁVEL' ? 'rgba(74, 225, 118, 0.1)' : 
                               mat.status === 'CRÍTICO' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: mat.status === 'SAUDÁVEL' ? 'var(--secondary)' : 
                          mat.status === 'CRÍTICO' ? 'var(--error)' : '#F59E0B'
                  }}>{mat.status}</span>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mostrando {filteredMaterials.length} materiais</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={paginationButtonStyle}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              style={paginationButtonStyle}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Registrar Compra */}
      <AnimatePresence>
        {showBuyModal && (
          <Modal title="Registrar Compra" onClose={() => setShowBuyModal(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div className="input-group">
                 <label>Material / Nome do Produto</label>
                 <input 
                  type="text" 
                  placeholder="Ex: PLA Wood Premium" 
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                 />
               </div>
               <div className="input-group">
                 <label>Fornecedor</label>
                 <input 
                  type="text" 
                  placeholder="Ex: Loja 3D Brasil" 
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                 />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div className="input-group">
                   <label>Quantidade (Rolos)</label>
                   <input 
                    type="number" 
                    placeholder="1" 
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                   />
                 </div>
                 <div className="input-group">
                   <label>Custo Unitário</label>
                   <input 
                    type="text" 
                    placeholder="R$ 120,00" 
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                   />
                 </div>
               </div>
               <button 
                className="btn-primary" 
                style={{ width: '100%', height: '54px', fontSize: '16px' }} 
                onClick={handleConfirmPurchase}
               >Confirmar Entrada</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal: Adicionar Novo Tipo */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title="Cadastrar Novo Material" onClose={() => setShowAddModal(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div className="input-group">
                 <label>Nome Comercial</label>
                 <input type="text" placeholder="Ex: PLA Wood Premium" />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label>Tipo de Filamento</label>
                    <select style={selectStyle}>
                      <option>PLA</option>
                      <option>PETG</option>
                      <option>ABS</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Cor / Pigmento</label>
                    <input type="text" placeholder="Ex: Madeira Natural" />
                  </div>
               </div>
               <button className="btn-primary" style={{ width: '100%', height: '54px', fontSize: '16px' }} onClick={() => setShowAddModal(false)}>Salvar Material</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AMSSlot({ slot, type, color, weight, colorHex, active, warning, empty }: any) {
  if (empty) {
    return (
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, borderStyle: 'dashed' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>Slot {slot}</p>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>Slot Vazio</span>
        <button style={{ marginTop: '12px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>Carregar</button>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: active ? '1px solid var(--primary)40' : warning ? '1px solid var(--error)40' : '1px solid var(--border-glass)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontSize: '14px' }}>{type}</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{color}</p>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Slot {slot}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: colorHex, border: '2px solid rgba(255,255,255,0.1)' }}></div>
        <span style={{ fontSize: '14px', fontWeight: 700 }}>{weight}</span>
      </div>

      <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: weight.replace('g', '') / 10 + '%', height: '100%', background: warning ? 'var(--error)' : active ? 'var(--secondary)' : 'var(--text-dim)' }}></div>
      </div>
      
      <p style={{ fontSize: '10px', marginTop: '8px', color: warning ? 'var(--error)' : active ? 'var(--secondary)' : 'var(--text-dim)', fontWeight: 600 }}>
        {active ? '• Ativo (Imprimindo)' : '• Em Espera'}
      </p>
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const filterSelectStyle: any = {
  background: 'rgba(255,255,255,0.03)',
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.05)',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  minWidth: '130px',
  justifyContent: 'space-between'
};

const dropdownMenuStyle: any = {
  position: 'absolute',
  top: '100%',
  right: 0,
  width: '100%',
  maxHeight: '220px',
  overflowY: 'auto',
  background: 'var(--bg-card)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  border: '1px solid var(--border-glass)',
  marginTop: '4px',
  zIndex: 100,
  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
};

const dropdownItemStyle: any = {
  padding: '8px 16px',
  fontSize: '12px',
  color: 'var(--text-main)',
  cursor: 'pointer',
  transition: '0.2s'
};

const paginationButtonStyle: any = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-glass)',
  borderRadius: '6px',
  padding: '4px',
  cursor: 'pointer',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const selectStyle: any = {
  width: '100%',
  padding: '12px',
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid var(--border-glass)',
  borderRadius: '10px',
  color: 'white',
  fontSize: '14px',
  outline: 'none'
};
