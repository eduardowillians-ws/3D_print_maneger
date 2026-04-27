import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Download, 
  Filter, 
  Package, 
  Clock, 
  Layers, 
  DollarSign,
  X,
  UploadCloud,
  Percent,
  Trash2,
  Loader2,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { productsApi } from '../services/api/products';
import { materialsApi } from '../services/api/materials';

export default function ProdutosView() {
  const { currency, measureSystem } = useSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Símbolos dinâmicos
  const currencySymbol = currency.includes('BRL') ? 'R$' : currency.includes('USD') ? '$' : '€';
  const weightUnit = measureSystem.includes('Métrico') ? 'g' : 'oz';

  // Estados dos formulários
  const [name, setName] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [weight, setWeight] = useState('');
  const [cost, setCost] = useState('');
  const [margin, setMargin] = useState('100');
  const [suggestedPrice, setSuggestedPrice] = useState('0.00');

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  
  // Estado para materiais do produto (até 4 slots)
  const [productMaterials, setProductMaterials] = useState<{ materialId: string; weight: number }[]>([
    { materialId: '', weight: 0 },
    { materialId: '', weight: 0 },
    { materialId: '', weight: 0 },
    { materialId: '', weight: 0 }
  ]);

  useEffect(() => {
    loadProducts();
    loadMaterials();
  }, []);

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

  const loadProducts = async () => {
    setIsLoading(true);
    const { data, error } = await productsApi.getAll();
    if (error) {
      console.error('Erro ao carregar produtos:', error.message);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      const mappedData = data.map(p => ({
        id: p.id,
        name: p.name,
        version: p.version,
        time: `${p.print_time_hours}h ${p.print_time_minutes}m`,
        weight: p.material_weight_g.toString(),
        cost: (p.material_weight_g * 0.05).toFixed(2).replace('.', ','),
        price: Number(p.suggested_price).toFixed(2).replace('.', ',')
      }));
      setProducts(mappedData);
    }
    setIsLoading(false);
  };

  // Cálculo automático do preço sugerido
  useEffect(() => {
    const costValue = parseFloat(cost.replace(',', '.')) || 0;
    const marginValue = parseFloat(margin) || 0;
    const price = costValue * (1 + marginValue / 100);
    setSuggestedPrice(price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }, [cost, margin]);

  const handleSave = async () => {
    if (!name.trim()) return alert('Por favor, informe o nome do produto.');

    const costValue = parseFloat(cost.replace(',', '.')) || 0;
    const marginValue = parseFloat(margin) || 100;
    const priceValue = costValue * (1 + marginValue / 100);

    const productData = {
      name: name.trim(),
      version: editingProduct ? editingProduct.version : 'v1.0',
      print_time_hours: parseInt(hours),
      print_time_minutes: parseInt(minutes),
      material_weight_g: parseInt(weight) || 0,
      margin_percent: marginValue,
      suggested_price: priceValue
    };

    let productId = editingProduct?.id;
    
    if (editingProduct) {
      const { error } = await productsApi.update(editingProduct.id, productData);
      if (error) {
        alert('Erro ao atualizar produto: ' + error.message);
        return;
      }
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: name.trim(),
        time: `${hours}h ${minutes}m`,
        weight: weight,
        cost: cost.replace('.', ','),
        price: suggestedPrice
      } : p));
    } else {
      const { data, error } = await productsApi.create(productData);
      if (error) {
        alert('Erro ao criar produto: ' + error.message);
        return;
      }
      if (data) {
        productId = data.id;
        const newProduct = {
          id: data.id,
          name: data.name,
          version: data.version,
          time: `${data.print_time_hours}h ${data.print_time_minutes}m`,
          weight: data.material_weight_g.toString(),
          cost: (data.material_weight_g * 0.05).toFixed(2).replace('.', ','),
          price: Number(data.suggested_price).toFixed(2).replace('.', ',')
        };
        setProducts(prev => [newProduct, ...prev]);
      }
    }

    // Salvar materiais do produto
    if (productId) {
      // Primeiro deleta materiais existentes (para editar)
      const { data: existingMaterials } = await productsApi.getMaterialsByProduct(productId);
      if (existingMaterials && existingMaterials.length > 0) {
        for (const m of existingMaterials) {
          await productsApi.deleteMaterial(m.id);
        }
      }
      
      // Adiciona novos materiais
      const materialsToAdd = productMaterials
        .filter(m => m.materialId)
        .map((m, idx) => {
          const material = materialsList.find(mat => mat.id === m.materialId);
          return {
            product_id: productId,
            material_id: m.materialId,
            material_name: material?.name || '',
            color: material?.color || null,
            weight_g: m.weight,
            slot_position: idx + 1
          };
        });
      
      for (const m of materialsToAdd) {
        await productsApi.addMaterial(m);
      }
    }

    resetForm();
    alert(editingProduct ? 'Produto atualizado!' : 'Produto cadastrado!');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este produto do catálogo?')) {
      const { error } = await productsApi.delete(id);
      if (error) {
        alert('Erro ao excluir produto: ' + error.message);
        return;
      }
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    setName('');
    setHours('0');
    setMinutes('0');
    setWeight('');
    setCost('');
    setMargin('100');
    setShowAddModal(false);
    setEditingProduct(null);
    setProductMaterials([
      { materialId: '', weight: 0 },
      { materialId: '', weight: 0 },
      { materialId: '', weight: 0 },
      { materialId: '', weight: 0 }
    ]);
  };

  const startEdit = async (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    const h = p.time.split('h')[0] || '0';
    const m = p.time.includes('m') ? (p.time.split('h ')[1] || '').replace('m', '') : '0';
    setHours(h.trim());
    setMinutes(m.trim());
    setWeight(p.weight);
    setCost(p.cost.replace(',', '.'));
    setShowAddModal(true);
    
    // Carregar materiais do produto
    const { data: prodMaterials } = await productsApi.getMaterialsByProduct(p.id);
    if (prodMaterials && prodMaterials.length > 0) {
      const newSlots = [
        { materialId: '', weight: 0 },
        { materialId: '', weight: 0 },
        { materialId: '', weight: 0 },
        { materialId: '', weight: 0 }
      ];
      prodMaterials.forEach((pm: any, idx: number) => {
        if (idx < 4) {
          newSlots[idx] = { materialId: pm.material_id, weight: pm.weight_g };
        }
      });
      setProductMaterials(newSlots);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Catálogo de Produtos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie peças imprimíveis e sua precificação global.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', fontSize: '15px' }}>
            <Filter size={18} /> Filtrar
          </button>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Adicionar Produto
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <Search className="input-icon" size={20} style={{ left: '16px' }} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou versão..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <AnimatePresence mode='popLayout'>
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)' }}
            >
              <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ marginLeft: '12px' }}>Carregando produtos...</span>
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}
            >
              <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Nenhum produto encontrado</p>
            </motion.div>
          ) : (
            <>
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onEdit={() => startEdit(product)} 
                  onDelete={() => handleDelete(product.id)}
                  currencySymbol={currencySymbol} 
                  weightUnit={weightUnit} 
                />
              ))}
              <QuickAddCard onClick={() => setShowAddModal(true)} />
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <Modal title={editingProduct ? "Editar Produto" : "Novo Produto"} onClose={resetForm}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <label>Nome do Produto / Peça</label>
                  <input type="text" placeholder="Ex: Engrenagem Heloidal" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div className="input-group">
                      <label>Tempo Estimado</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <select value={hours} onChange={e => setHours(e.target.value)} style={inputStyle}>
                            {Array.from({length: 48}, (_, i) => i).map(h => <option key={h} value={h} style={{background: '#111'}}>{h}h</option>)}
                         </select>
                         <select value={minutes} onChange={e => setMinutes(e.target.value)} style={inputStyle}>
                            {Array.from({length: 60}, (_, i) => i).map(m => <option key={m} value={m} style={{background: '#111'}}>{m}m</option>)}
                         </select>
                      </div>
                   </div>
                   <div className="input-group">
                      <label>Peso ({weightUnit})</label>
                      <div style={{ position: 'relative' }}>
                         <Layers size={16} style={iconOverlayStyle} />
                         <input type="number" placeholder="250" value={weight} onChange={(e) => setWeight(e.target.value)} style={iconInputStyle} />
                      </div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                   <div className="input-group">
                      <label>Custo ({currencySymbol})</label>
                      <div style={{ position: 'relative' }}>
                         <DollarSign size={16} style={iconOverlayStyle} />
                         <input type="text" value={cost} onChange={(e) => setCost(e.target.value)} style={iconInputStyle} />
                      </div>
                   </div>
                   <div className="input-group">
                      <label>Margem (%)</label>
                      <div style={{ position: 'relative' }}>
                         <Percent size={16} style={iconOverlayStyle} />
                         <input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} style={iconInputStyle} />
                      </div>
                   </div>
                   <div className="input-group">
                      <label>Preço Sugerido</label>
                      <div style={{ position: 'relative' }}>
                         <div style={{ ...iconOverlayStyle, color: 'var(--secondary)', fontWeight: 700 }}>{currencySymbol}</div>
                         <input type="text" value={`${suggestedPrice}`} readOnly style={{ ...iconInputStyle, color: 'var(--secondary)', fontWeight: 700, background: 'rgba(74, 225, 118, 0.03)', border: '1px solid rgba(74, 225, 118, 0.2)' }} />
                      </div>
</div>
                 </div>

                 <div style={{ marginTop: '8px' }}>
                   <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', display: 'block' }}>
                     Materiais por Peça (até 4 slots - por unidade)
                   </label>
                   {productMaterials.map((slot, idx) => (
                     <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                       <select 
                         value={slot.materialId}
                         onChange={e => {
                           const newMaterials = [...productMaterials];
                           newMaterials[idx].materialId = e.target.value;
                           setProductMaterials(newMaterials);
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
                           const newMaterials = [...productMaterials];
                           newMaterials[idx].weight = parseInt(e.target.value) || 0;
                           setProductMaterials(newMaterials);
                         }}
                         style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '13px', textAlign: 'right' }}
                       />
                       <span style={{ fontSize: '11px', color: 'var(--text-dim)', width: '20px' }}>g</span>
                     </div>
                   ))}
                 </div>

                 <button className="btn-primary" style={{ width: '100%', height: '54px' }} onClick={handleSave}>Salvar Produto</button>
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProductCard({ product, onEdit, onDelete, currencySymbol, weightUnit }: any) {
    return (
      <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '24px', borderRadius: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}><Package size={20} color="var(--primary)" /></div>
          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, background: 'rgba(138, 43, 226, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{product.version}</span>
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>{product.name}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div><p style={cardLabelStyle}>Tempo</p><p style={cardValueStyle}><Clock size={12} /> {product.time}</p></div>
          <div><p style={cardLabelStyle}>Material</p><p style={cardValueStyle}><Layers size={12} /> {product.weight}{weightUnit}</p></div>
          <div><p style={cardLabelStyle}>Custo Est.</p><p style={{ ...cardValueStyle, color: 'white' }}>{currencySymbol} {product.cost}</p></div>
          <div><p style={cardLabelStyle}>Venda</p><p style={{ ...cardValueStyle, color: 'var(--secondary)' }}>{currencySymbol} {product.price}</p></div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onEdit} style={actionButtonStyle} className="btn-hover-effect"><Edit2 size={16} /></button>
          <button style={actionButtonStyle} onClick={() => alert('Download STL iniciado!')}><Download size={16} /></button>
          <button onClick={onDelete} style={{ ...actionButtonStyle, color: 'var(--error)' }} className="btn-hover-effect"><Trash2 size={16} /></button>
        </div>
      </motion.div>
    );
}

function QuickAddCard({ onClick }: any) {
  return (
    <div onClick={onClick} className="glass-panel" style={{ borderRadius: '24px', borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', cursor: 'pointer', opacity: 0.7 }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '50%', marginBottom: '12px' }}><UploadCloud size={28} /></div>
      <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Nova Peça (STL)</h4>
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={modalOverlayStyle} onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const inputStyle: any = { width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' };
const iconInputStyle: any = { ...inputStyle, paddingLeft: '40px' };
const iconOverlayStyle: any = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' };
const cardLabelStyle: any = { fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px' };
const cardValueStyle: any = { fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' };
const actionButtonStyle: any = { flex: 1, height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalContentStyle: any = { width: '90%', maxWidth: '540px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px' };
const searchInputStyle: any = { width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', outline: 'none' };
