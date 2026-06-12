import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  Store,
  Trash2,
  Edit2,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  Save,
  Eye,
  EyeOff,
  Link,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { storeProductsApi } from '../services/api/storeProducts';
import { storeConfigApi } from '../services/api/storeConfig';
import { StoreProduct, StoreConfig } from '../types/database';

export default function StoreView() {
  const { currencySymbol } = useSettings();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState('0');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [configName, setConfigName] = useState('');
  const [configWhatsapp, setConfigWhatsapp] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveConfigTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (config) {
      setConfigName(config.store_name || '');
      setConfigWhatsapp(config.whatsapp_number || '');
      setConfigDescription(config.store_description || '');
    }
  }, [config]);

  const loadData = async () => {
    setIsLoading(true);
    const [productsResult, configResult] = await Promise.all([
      storeProductsApi.getAll(),
      storeConfigApi.get()
    ]);
    if (productsResult.data) setProducts(productsResult.data);
    if (configResult.data) setConfig(configResult.data);
    setIsLoading(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await storeProductsApi.imageToBase64(file);
      setFormImage(base64);
    } catch (error) {
      alert('Erro ao processar imagem.');
    }
    setIsUploading(false);
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormStock('0');
    setFormIsActive(true);
    setFormSortOrder('0');
    setFormImage(null);
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleEdit = (product: StoreProduct) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || '');
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormIsActive(product.is_active);
    setFormSortOrder(product.sort_order.toString());
    setFormImage(product.image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }

    setIsSaving(true);

    const productData: Partial<StoreProduct> = {
      name: formName.trim(),
      description: formDescription.trim() || null,
      price: parseFloat(formPrice) || 0,
      stock: parseInt(formStock) || 0,
      is_active: formIsActive,
      sort_order: parseInt(formSortOrder) || 0,
      image_url: formImage
    };

    if (editingProduct) {
      const { error } = await storeProductsApi.update(editingProduct.id, productData);
      if (error) {
        alert('Erro ao atualizar produto: ' + error.message);
        setIsSaving(false);
        return;
      }
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } as StoreProduct : p));
    } else {
      const { data, error } = await storeProductsApi.create(productData);
      if (error) {
        alert('Erro ao criar produto: ' + error.message);
        setIsSaving(false);
        return;
      }
      if (data) setProducts(prev => [...prev, data]);
    }

    resetForm();
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto da loja?')) return;

    const { error } = await storeProductsApi.delete(id);
    if (error) {
      alert('Erro ao excluir produto: ' + error.message);
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = async (product: StoreProduct) => {
    const { error } = await storeProductsApi.update(product.id, { is_active: !product.is_active });
    if (error) {
      alert('Erro ao atualizar produto: ' + error.message);
      return;
    }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
  };

  const saveConfig = useCallback(async (field: keyof StoreConfig, value: string) => {
    if (!config) return;
    const { data, error } = await storeConfigApi.update({ [field]: value });
    if (error) {
      console.error('Erro ao salvar configuração:', error.message);
      return;
    }
    if (data) setConfig(data);
  }, [config]);

  const handleConfigBlur = useCallback(() => {
    if (saveConfigTimeoutRef.current) {
      clearTimeout(saveConfigTimeoutRef.current);
    }
    saveConfigTimeoutRef.current = setTimeout(() => {
      saveConfig('store_name', configName);
      saveConfig('whatsapp_number', configWhatsapp);
      saveConfig('store_description', configDescription);
    }, 500);
  }, [configName, configWhatsapp, configDescription, saveConfig]);

  const handleConfigChange = (field: 'name' | 'whatsapp' | 'description', value: string) => {
    if (field === 'name') setConfigName(value);
    else if (field === 'whatsapp') setConfigWhatsapp(value);
    else setConfigDescription(value);
  };

  const getStoreLink = () => {
    const userId = config?.user_id;
    if (!userId) return '';
    return `${window.location.origin}/loja/${userId}`;
  };

  const copyStoreLink = () => {
    const link = getStoreLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openWhatsAppWithMessage = () => {
    const link = getStoreLink();
    const message = encodeURIComponent(`Confira nossa loja 3D: ${link}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-muted)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Minha Loja</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie os produtos e configurações da sua loja virtual.</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={() => setShowModal(true)}>
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {/* Configurações da Loja */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Store size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Configurações da Loja</h3>
          {isSavingConfig && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-dim)' }} />}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="input-group">
            <label>Nome da Loja</label>
            <input
              type="text"
              value={configName}
              onChange={e => handleConfigChange('name', e.target.value)}
              onBlur={handleConfigBlur}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div className="input-group">
            <label>WhatsApp da Loja (com código do país)</label>
            <input
              type="text"
              placeholder="5511999999999"
              value={configWhatsapp}
              onChange={e => handleConfigChange('whatsapp', e.target.value)}
              onBlur={handleConfigBlur}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Descrição da Loja</label>
            <textarea
              value={configDescription}
              onChange={e => handleConfigChange('description', e.target.value)}
              onBlur={handleConfigBlur}
              rows={2}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Link da Loja */}
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(138, 43, 226, 0.1)', borderRadius: '12px', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Link size={16} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Link da sua Loja</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={getStoreLink()}
              readOnly
              style={{ flex: 1, padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '12px', outline: 'none' }}
            />
            <button
              onClick={copyStoreLink}
              style={{ padding: '10px 16px', background: copied ? 'var(--secondary)' : 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={openWhatsAppWithMessage}
              style={{ padding: '10px 16px', background: '#25D366', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}
            >
              <MessageCircle size={14} /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Produtos da Loja</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{products.length} produto(s)</span>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Store size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Nenhum produto cadastrado na loja</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Clique em "Novo Produto" para começar</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--border-glass)' }}>
            {products.map(product => (
              <div key={product.id} style={{ background: 'var(--bg-main)', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={24} style={{ opacity: 0.3 }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{product.name}</h4>
                      <button
                        onClick={() => toggleActive(product)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: product.is_active ? 'var(--secondary)' : 'var(--text-muted)' }}
                        title={product.is_active ? 'Visível na loja' : 'Oculto da loja'}
                      >
                        {product.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                    {product.description && (
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '4px 0 0', lineHeight: '1.4' }}>
                        {product.description.substring(0, 60)}{product.description.length > 60 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary)' }}>
                      {currencySymbol} {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                      Estoque: {product.stock}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{ padding: '8px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', color: 'var(--error)', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Produto */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => resetForm()}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Upload de Imagem */}
                <div className="input-group">
                  <label>Imagem do Produto</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      height: '150px',
                      border: '2px dashed var(--border-glass)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: formImage ? `url(${formImage}) center/cover` : 'rgba(255,255,255,0.02)',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {!formImage && (
                      <>
                        {isUploading ? (
                          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
                        ) : (
                          <>
                            <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Clique para enviar imagem</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>JPG, PNG (será comprimida automaticamente)</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  {formImage && (
                    <button
                      onClick={() => setFormImage(null)}
                      style={{ marginTop: '8px', padding: '6px 12px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', color: 'var(--error)', cursor: 'pointer', fontSize: '11px' }}
                    >
                      Remover imagem
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <label>Nome do Produto *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Nome do produto"
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div className="input-group">
                  <label>Descrição</label>
                  <textarea
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Descrição do produto (opcional)"
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label>Preço ({currencySymbol})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      placeholder="0,00"
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div className="input-group">
                    <label>Estoque</label>
                    <input
                      type="number"
                      min="0"
                      value={formStock}
                      onChange={e => setFormStock(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label>Ordem de Exibição</label>
                    <input
                      type="number"
                      min="0"
                      value={formSortOrder}
                      onChange={e => setFormSortOrder(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div className="input-group">
                    <label>Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={e => setFormIsActive(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontSize: '14px', color: formIsActive ? 'var(--secondary)' : 'var(--text-dim)' }}>
                        {formIsActive ? 'Visível na loja' : 'Oculto'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', height: '50px', fontSize: '15px', marginTop: '8px' }}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                  {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
