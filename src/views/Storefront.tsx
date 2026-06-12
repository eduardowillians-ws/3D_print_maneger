import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Store,
  Loader2,
  Image as ImageIcon,
  X,
  ShoppingCart,
  Package,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StoreProduct, StoreConfig } from '../types/database';

interface CartItem {
  product: StoreProduct;
  quantity: number;
}

interface CustomerData {
  name: string;
  phone: string;
  address: string;
}

export default function Storefront() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    phone: '',
    address: ''
  });

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})/, '($1) $2');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const updateCustomer = (field: keyof CustomerData, value: string) => {
    if (field === 'phone') {
      setCustomer(prev => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setCustomer(prev => ({ ...prev, [field]: value }));
    }
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const uid = pathParts[pathParts.length - 1];
    if (uid) {
      setUserId(uid);
      loadStoreData(uid);
    }
  }, []);

  const loadStoreData = async (uid: string) => {
    setIsLoading(true);

    const [productsResult, configResult] = await Promise.all([
      supabase
        .from('store_products')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('store_config')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .single()
    ]);

    if (productsResult.data) setProducts(productsResult.data as StoreProduct[]);
    if (configResult.data) setConfig(configResult.data as StoreConfig);

    setIsLoading(false);
  };

  const addToCart = (product: StoreProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock && product.stock > 0) {
          alert('Estoque insuficiente!');
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowCart(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (!item) return prev;

      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        return prev.filter(i => i.product.id !== productId);
      }

      if (newQty > item.product.stock && item.product.stock > 0) {
        alert('Estoque insuficiente!');
        return prev;
      }

      return prev.map(i =>
        i.product.id === productId ? { ...i, quantity: newQty } : i
      );
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const findOrCreateCustomer = async (): Promise<{ name: string; phone: string; address: string } | null> => {
    const phoneClean = customer.phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      alert('Por favor, informe um telefone válido com DDD.');
      return null;
    }

    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', customer.phone)
      .single();

    if (existingClient) {
      return {
        name: existingClient.name,
        phone: existingClient.phone,
        address: existingClient.address || customer.address
      };
    }

    if (!customer.name.trim()) {
      alert('Por favor, informe seu nome.');
      return null;
    }

    const { error } = await supabase
      .from('clients')
      .insert({
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim() || null,
        type: 'Loja Virtual',
        tags: ['Loja Online']
      } as never);

    if (error) {
      console.error('Erro ao cadastrar cliente:', error.message);
    }

    return {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim()
    };
  };

  const sendWhatsAppOrder = async () => {
    if (cart.length === 0) {
      alert('Adicione itens ao carrinho primeiro!');
      return;
    }

    if (!config?.whatsapp_number) {
      alert('WhatsApp não configurado. Entre em contato com a loja.');
      return;
    }

    if (!customer.name.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }

    if (!customer.phone.trim()) {
      alert('Por favor, informe seu telefone.');
      return;
    }

    setIsProcessing(true);

    const customerData = await findOrCreateCustomer();

    if (!customerData) {
      setIsProcessing(false);
      return;
    }

    const itemsList = cart.map(item =>
      `• ${item.product.name} (x${item.quantity}) - R$ ${(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ).join('\n');

    const total = getCartTotal();
    const storeName = config.store_name || 'Loja 3D';

    let message = `🛒 *Pedido - ${storeName}*\n\n`;
    message += `${itemsList}\n\n`;
    message += `💰 *Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    message += `👤 *Cliente:* ${customerData.name}\n`;
    message += `📞 *Tel:* ${customerData.phone}\n`;
    if (customerData.address) {
      message += `📍 *End:* ${customerData.address}\n`;
    }
    message += `\nAguardo confirmação!`;

    const whatsappNumber = config.whatsapp_number.replace(/\D/g, '');
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');

    setCart([]);
    setCustomer({ name: '', phone: '', address: '' });
    setShowCart(false);
    setShowCustomerForm(false);
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#8A2BE2' }} />
      </div>
    );
  }

  if (!config) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#888' }}>
        <Store size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Loja não encontrada</h1>
        <p style={{ fontSize: '14px' }}>Esta loja não está disponível ou foi desativada.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
      {/* Header */}
      <header style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #8A2BE2, #5B1ED6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{config.store_name}</h1>
              {config.store_description && (
                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{config.store_description}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowCart(true)}
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <ShoppingCart size={22} />
            {getCartItemCount() > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#8A2BE2',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {getCartItemCount()}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Products Grid */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
            <ImageIcon size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Nenhum produto disponível</h2>
            <p style={{ fontSize: '14px' }}>Volte em breve para ver as novidades!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {products.map(product => (
              <div
                key={product.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={48} style={{ opacity: 0.15 }} />
                  </div>
                )}

                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{product.name}</h3>
                  {product.description && (
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', lineHeight: '1.5' }}>
                      {product.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <Package size={14} color={product.stock > 0 ? '#4AE176' : '#F59E0B'} />
                    <span style={{ fontSize: '12px', color: product.stock > 0 ? '#4AE176' : '#F59E0B' }}>
                      {product.stock > 0 ? `${product.stock} em estoque` : 'Sob encomenda'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: '#8A2BE2' }}>
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>

                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        background: 'linear-gradient(135deg, #8A2BE2, #5B1ED6)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', justifyContent: 'flex-end' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => { setShowCart(false); setShowCustomerForm(false); }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
              background: '#111118',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              zIndex: 1
            }}
          >
            {/* Cart Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={20} color="#8A2BE2" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Meu Pedido</h2>
              </div>
              <button
                onClick={() => { setShowCart(false); setShowCustomerForm(false); }}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {!showCustomerForm ? (
                <>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                      <ShoppingBag size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                      <p style={{ fontSize: '14px' }}>Seu carrinho está vazio</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {cart.map(item => (
                        <div key={item.product.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                          {item.product.image_url ? (
                            <img src={item.product.image_url} alt={item.product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                          ) : (
                            <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon size={20} style={{ opacity: 0.3 }} />
                            </div>
                          )}

                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>{item.product.name}</h4>
                            <p style={{ fontSize: '12px', color: '#8A2BE2', margin: '4px 0 0' }}>
                              R$ {item.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, -1); }}
                                style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Minus size={14} />
                              </button>
                              <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, 1); }}
                                style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Plus size={14} />
                              </button>

                              <button
                                onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.id); }}
                                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#FF4D4D', cursor: 'pointer', padding: '4px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>Seus Dados</h3>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                      Preencha para finalizar o pedido
                    </p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                      type="text"
                      placeholder="Nome completo *"
                      value={customer.name}
                      onChange={e => updateCustomer('name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 14px 14px 40px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                      type="tel"
                      placeholder="Telefone (WhatsApp) *"
                      value={customer.phone}
                      onChange={e => updateCustomer('phone', e.target.value)}
                      maxLength={15}
                      style={{
                        width: '100%',
                        padding: '14px 14px 14px 40px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                      type="text"
                      placeholder="Endereço (opcional)"
                      value={customer.address}
                      onChange={e => updateCustomer('address', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 14px 14px 40px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '11px', color: '#666', textAlign: 'center', margin: '4px 0' }}>
                    Seus dados serão utilizados apenas para esta compra
                  </p>
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#888' }}>Total:</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#8A2BE2' }}>
                    R$ {getCartTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {!showCustomerForm ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCustomerForm(true); }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #8A2BE2, #5B1ED6)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      fontSize: '16px',
                      fontWeight: 700
                    }}
                  >
                    <MessageCircle size={22} /> Finalizar Pedido
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); sendWhatsAppOrder(); }}
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: isProcessing ? '#666' : '#25D366',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      fontSize: '16px',
                      fontWeight: 700
                    }}
                  >
                    {isProcessing ? (
                      <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <MessageCircle size={22} />
                    )}
                    {isProcessing ? 'Processando...' : 'Enviar via WhatsApp'}
                  </button>
                )}

                {showCustomerForm && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCustomerForm(false); }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginTop: '8px'
                    }}
                  >
                    Voltar ao carrinho
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
