import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer, 
  Droplet,
  Box,
  DollarSign,
  Info,
  X,
  Palette,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { materialsApi } from '../services/api/materials';
import { MaterialType } from '../types/database';

interface MaterialUI {
  id: string;
  type: string;
  brand: string;
  color: string;
  stock: number;
  minStock: number;
  temp: string;
  price: string;
  status: string;
}

export default function MateriaisView() {
  const { currency, measureSystem } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialUI | null>(null);

  // Estados para o formulário
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');

  // Símbolos dinâmicos
  const currencySymbol = currency.includes('BRL') ? 'R$' : currency.includes('USD') ? '$' : '€';
  const weightUnit = measureSystem.includes('Métrico') ? 'kg' : 'lb';

  const [materials, setMaterials] = useState<MaterialUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setIsLoading(true);
    const { data, error } = await materialsApi.getAll();
    if (error) {
      console.error('Erro ao carregar materiais:', error.message);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      const mappedData: MaterialUI[] = data.map(m => ({
        id: m.id,
        type: m.name,
        brand: m.supplier || 'Sem marca',
        color: m.color || 'Sem cor',
        stock: m.weight_g / 1000,
        minStock: 0.5,
        temp: `${m.type === 'PLA' ? 200 : m.type === 'PETG' ? 230 : 250}°C`,
        price: m.price_per_kg.toFixed(2).replace('.', ','),
        status: m.weight_g > 1000 ? 'Em Estoque' : m.weight_g > 0 ? 'Baixo Estoque' : 'Esgotado'
      }));
      setMaterials(mappedData);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!type || !brand || !color) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const stockValue = parseFloat(stock) || 0;
    const materialData = {
      name: type,
      type: (type.toUpperCase().includes('PLA') ? 'PLA' : type.toUpperCase().includes('PETG') ? 'PETG' : type.toUpperCase().includes('ABS') ? 'ABS' : 'TPU') as MaterialType,
      color: color,
      supplier: brand,
      weight_g: Math.round(stockValue * 1000),
      price_per_kg: parseFloat(price.replace(',', '.')) || 0
    };

    if (editingMaterial) {
      const { error } = await materialsApi.update(editingMaterial.id, materialData);
      if (error) {
        alert('Erro ao atualizar material: ' + error.message);
        return;
      }
      setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? {
        ...m, type, brand, color, stock: stockValue, price
      } : m));
    } else {
      const { data, error } = await materialsApi.create(materialData);
      if (error) {
        alert('Erro ao criar material: ' + error.message);
        return;
      }
      if (data) {
        const newMaterial: MaterialUI = {
          id: data.id,
          type: data.name,
          brand: data.supplier || 'Sem marca',
          color: data.color || 'Sem cor',
          stock: data.weight_g / 1000,
          minStock: 0.5,
          temp: `${data.type === 'PLA' ? 200 : data.type === 'PETG' ? 230 : 250}°C`,
          price: data.price_per_kg.toFixed(2).replace('.', ','),
          status: data.weight_g > 1000 ? 'Em Estoque' : data.weight_g > 0 ? 'Baixo Estoque' : 'Esgotado'
        };
        setMaterials([newMaterial, ...materials]);
      }
    }
    
    closeModal();
    alert('Informações salvas com sucesso!');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este material do estoque?')) {
      const { error } = await materialsApi.delete(id);
      if (error) {
        alert('Erro ao excluir material: ' + error.message);
        return;
      }
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleEdit = (m: MaterialUI) => {
    setEditingMaterial(m);
    setType(m.type);
    setBrand(m.brand);
    setColor(m.color);
    setStock(m.stock.toString());
    setPrice(m.price);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingMaterial(null);
    setType('');
    setBrand('');
    setColor('');
    setStock('');
    setPrice('');
  };

  const filteredMaterials = materials.filter(m => 
    m.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Gestão de Insumos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Controle de estoque, temperaturas e custos de filamentos.</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Novo Material
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Filtrar por tipo, marca ou cor..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        <AnimatePresence>
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)' }}
            >
              <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ marginLeft: '12px' }}>Carregando materiais...</span>
            </motion.div>
          ) : filteredMaterials.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}
            >
              <Layers size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Nenhum material encontrado</p>
            </motion.div>
          ) : (
            filteredMaterials.map(material => (
              <MaterialCard 
                key={material.id} 
                material={material} 
                currencySymbol={currencySymbol} 
                weightUnit={weightUnit} 
                onDelete={() => handleDelete(material.id)}
                onEdit={() => handleEdit(material)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Cadastro/Edição */}
      <AnimatePresence>
        {showAddModal && (
          <div style={modalOverlayStyle} onClick={closeModal}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel" 
              style={modalContentStyle} 
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{editingMaterial ? 'Editar Material' : 'Cadastrar Material'}</h2>
                <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label>Tipo de Filamento</label>
                  <input type="text" placeholder="Ex: PLA Premium, PETG..." value={type} onChange={e => setType(e.target.value)} style={inputStyle} />
                </div>
                <div className="input-group">
                  <label>Marca / Fabricante</label>
                  <input type="text" placeholder="Ex: Esun, 3DPrime..." value={brand} onChange={e => setBrand(e.target.value)} style={inputStyle} />
                </div>
                <div className="input-group">
                  <label>Cor</label>
                  <input type="text" placeholder="Ex: Preto Carbono..." value={color} onChange={e => setColor(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label>Estoque ({weightUnit})</label>
                    <input type="number" placeholder="0.0" value={stock} onChange={e => setStock(e.target.value)} style={inputStyle} />
                  </div>
                  <div className="input-group">
                    <label>Preço por {weightUnit}</label>
                    <input type="text" placeholder="0,00" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <button className="btn-primary" style={{ height: '52px', marginTop: '12px' }} onClick={handleSave}>
                  Salvar Material
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MaterialCard({ material, currencySymbol, weightUnit, onDelete, onEdit }: any) {
  const getStatusColor = (status: string) => {
    if (status === 'Em Estoque') return 'var(--secondary)';
    if (status === 'Baixo Estoque') return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: `1px solid ${getStatusColor(material.status)}22` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: material.color.toLowerCase().includes('branco') ? 'white' : material.color.toLowerCase().includes('azul') ? '#22d3ee' : material.color.toLowerCase().includes('preto') ? '#111' : 'var(--primary)', border: '1px solid rgba(255,255,255,0.1)' }}></div>
           <span style={{ fontSize: '15px', fontWeight: 700 }}>{material.type}</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: `${getStatusColor(material.status)}11`, color: getStatusColor(material.status) }}>
          {material.status.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
        <div><p style={labelStyle}>Marca</p><p style={valueStyle}>{material.brand}</p></div>
        <div><p style={labelStyle}>Preço /{weightUnit}</p><p style={valueStyle}>{currencySymbol} {material.price}</p></div>
        <div><p style={labelStyle}>Estoque</p><p style={{ ...valueStyle, color: material.stock <= material.minStock ? 'var(--warning)' : 'white' }}>{material.stock} {weightUnit}</p></div>
        <div><p style={labelStyle}>Temp. Bico</p><p style={valueStyle}><Thermometer size={12} color="var(--primary)" /> {material.temp}</p></div>
      </div>

      <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '24px', overflow: 'hidden' }}>
         <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((material.stock / 5) * 100, 100)}%` }} style={{ height: '100%', background: getStatusColor(material.status), boxShadow: `0 0 10px ${getStatusColor(material.status)}44` }}></motion.div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onEdit} style={actionButtonStyle} className="btn-hover-effect"><Edit2 size={16} /></button>
        <button onClick={onDelete} style={{ ...actionButtonStyle, color: 'var(--error)' }} className="btn-hover-effect"><Trash2 size={16} /></button>
      </div>
    </motion.div>
  );
}

const labelStyle: any = { fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, letterSpacing: '0.05em' };
const valueStyle: any = { fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' };
const actionButtonStyle: any = { flex: 1, height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' };
const searchInputStyle: any = { width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '14px' };
const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle: any = { width: '100%', maxWidth: '450px', padding: '32px', borderRadius: '24px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)' };
const inputStyle: any = { width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', outline: 'none' };
