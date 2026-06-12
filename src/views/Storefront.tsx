import { useState, useEffect, useRef } from 'react';
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
  MapPin,
  Truck,
  Zap,
  Shield,
  RefreshCw,
  Home,
  Grid3X3,
  Info,
  Mail,
  Instagram,
  Send
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

const socialIcons: Record<string, { icon: typeof Instagram; label: string; color: string }> = {
  facebook: { icon: Send, label: 'Facebook', color: '#1877F2' },
  instagram: { icon: Instagram, label: 'Instagram', color: '#E1306C' },
  tiktok: { icon: Send, label: 'TikTok', color: '#000000' },
  youtube: { icon: Send, label: 'YouTube', color: '#FF0000' },
  twitter: { icon: Send, label: 'X (Twitter)', color: '#1DA1F2' },
  linkedin: { icon: Send, label: 'LinkedIn', color: '#0A66C2' },
  pinterest: { icon: Send, label: 'Pinterest', color: '#BD081C' },
  email: { icon: Mail, label: 'E-mail', color: '#8A2BE2' }
};

export default function Storefront() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navbarRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    if (configResult.data) {
      const cfg = configResult.data as StoreConfig;
      if (cfg.social_links && typeof cfg.social_links === 'string') {
        try { cfg.social_links = JSON.parse(cfg.social_links as unknown as string); } catch { cfg.social_links = {}; }
      }
      setConfig(cfg);
    }

    setIsLoading(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
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

  const navLinks = [
    { label: 'Início', id: 'hero', icon: Home },
    { label: 'Produtos', id: 'products-section', icon: Grid3X3 },
    { label: 'Sobre', id: 'about-section', icon: Info },
    { label: 'Contato', id: 'footer-section', icon: Mail }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      {/* Background Glow Effects */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(138,43,226,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(91,30,214,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '30%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(138,43,226,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
      </div>

      {/* Navbar */}
      <nav
        ref={navbarRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? '12px 24px' : '16px 24px',
          background: scrolled ? 'rgba(10,10,15,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(138,43,226,0.1)' : '1px solid transparent',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8A2BE2, #5B1ED6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(138,43,226,0.3)'
            }}>
              <Store size={20} color="white" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              {config.store_name}
            </span>
          </div>

          {/* Desktop Links */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(138,43,226,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#aaa';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <link.icon size={16} />
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowCart(true)}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(138,43,226,0.15)';
                e.currentTarget.style.borderColor = 'rgba(138,43,226,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <ShoppingCart size={20} />
              {getCartItemCount() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'linear-gradient(135deg, #8A2BE2, #5B1ED6)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(138,43,226,0.4)'
                }}>
                  {getCartItemCount()}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="nav-mobile-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="nav-mobile-menu" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(10,10,15,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(138,43,226,0.1)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <link.icon size={18} />
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 24px 80px',
        background: 'linear-gradient(180deg, rgba(26,16,37,0.5) 0%, rgba(10,10,15,0) 100%)'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(138,43,226,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(91,30,214,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        {/* Hero Content */}
        <div className="hero-content" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '60px',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Left: Text Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(138,43,226,0.1)',
              border: '1px solid rgba(138,43,226,0.2)',
              borderRadius: '100px',
              marginBottom: '24px',
              fontSize: '13px',
              color: '#8A2BE2',
              fontWeight: 500
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4AE176' }} />
              Loja Online
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              margin: '0 0 16px',
              lineHeight: 1.1,
              letterSpacing: '-1px'
            }}>
              {config.store_name}
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 2vw, 18px)',
              color: '#888',
              margin: '0 0 12px',
              lineHeight: 1.6
            }}>
              {config.store_description || 'Impressão 3D profissional'}
            </p>
            <p style={{
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              color: '#666',
              margin: '0 0 40px',
              lineHeight: 1.5
            }}>
              Peças personalizadas e fabricação sob demanda
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => scrollToSection('products-section')}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #8A2BE2, #5B1ED6)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 20px rgba(138,43,226,0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 30px rgba(138,43,226,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(138,43,226,0.4)';
                }}
              >
                <Package size={20} />
                Ver Produtos
              </button>

              <button
                onClick={() => setShowCart(true)}
                style={{
                  padding: '16px 32px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(138,43,226,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(138,43,226,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <ShoppingCart size={20} />
                Carrinho
                {getCartItemCount() > 0 && (
                  <span style={{
                    background: '#8A2BE2',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right: Cover Image */}
          <div className="hero-image" style={{
            flex: '0 0 400px',
            height: '360px',
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(138,43,226,0.15), rgba(91,30,214,0.08))',
            border: '1px solid rgba(138,43,226,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {config.banner_url ? (
              <img
                src={config.banner_url}
                alt={config.store_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, rgba(138,43,226,0.3), rgba(91,30,214,0.2))',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={40} color="#8A2BE2" />
                </div>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Sua loja 3D</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(138,43,226,0.2), transparent)' }} />
      </div>

      {/* Benefits Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: Truck, title: 'Envio para todo Brasil', desc: 'Entregamos em todo o território nacional' },
            { icon: Zap, title: 'Produção rápida', desc: 'Processo ágil do pedido à entrega' },
            { icon: Shield, title: 'Qualidade garantida', desc: 'Materiais de alta qualidade e precisão' },
            { icon: RefreshCw, title: 'Produtos sob demanda', desc: 'Personalizações e projetos exclusivos' }
          ].map((benefit, index) => (
            <div
              key={index}
              className="benefit-card"
              style={{
                padding: '24px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(91,30,214,0.1))',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <benefit.icon size={22} color="#8A2BE2" />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 6px', color: '#fff' }}>
                {benefit.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: 1.5 }}>
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(138,43,226,0.2), transparent)' }} />
      </div>

      {/* Products Section */}
      <section id="products-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', scrollMarginTop: '80px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(138,43,226,0.1)',
            border: '1px solid rgba(138,43,226,0.15)',
            borderRadius: '100px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#8A2BE2',
            fontWeight: 500
          }}>
            <Package size={14} />
            Catálogo
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 700,
            margin: '0 0 8px',
            letterSpacing: '-0.5px'
          }}>
            Nossos Produtos
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            Confira os itens disponíveis em nossa loja
          </p>
        </div>

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
                className="product-card"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
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
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', lineHeight: '1.5', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
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
                      className="add-to-cart-btn"
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
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
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
      </section>

      {/* Section Divider */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(138,43,226,0.2), transparent)' }} />
      </div>

      {/* About Section */}
      {config.about_text && (
        <section id="about-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', scrollMarginTop: '80px' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(138,43,226,0.1)',
              border: '1px solid rgba(138,43,226,0.15)',
              borderRadius: '100px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#8A2BE2',
              fontWeight: 500
            }}>
              <Info size={14} />
              Sobre a Loja
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 700,
              margin: '0 0 24px',
              letterSpacing: '-0.5px'
            }}>
              Sobre Nós
            </h2>
            <div style={{
              fontSize: '16px',
              color: '#888',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {config.about_text}
            </div>
          </div>
        </section>
      )}

      {/* Section Divider */}
      {config.about_text && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(138,43,226,0.2), transparent)' }} />
        </div>
      )}

      {/* Footer */}
      <footer id="footer-section" style={{
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(138,43,226,0.1)',
        padding: '60px 24px 24px',
        marginTop: '40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8A2BE2, #5B1ED6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Store size={20} color="white" />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>{config.store_name}</span>
              </div>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                {config.store_description || 'Peças personalizadas produzidas com qualidade e atenção aos detalhes.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 16px', color: '#fff' }}>Links Rápidos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textAlign: 'left',
                      padding: 0,
                      transition: 'color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#8A2BE2'}
                    onMouseLeave={e => e.currentTarget.style.color = '#666'}
                  >
                    <link.icon size={14} />
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact & Social */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 16px', color: '#fff' }}>Contato</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {config.whatsapp_number && (
                  <a
                    href={`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#666', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#25D366'}
                    onMouseLeave={e => e.currentTarget.style.color = '#666'}
                  >
                    <Send size={14} />
                    WhatsApp
                  </a>
                )}
                {config.social_links && Object.entries(config.social_links).map(([network, data]) => {
                  if (!data.enabled || !data.url) return null;
                  const socialConfig = socialIcons[network];
                  if (!socialConfig) return null;
                  const Icon = socialConfig.icon;
                  const href = network === 'email' ? `mailto:${data.url}` : (data.url.startsWith('http') ? data.url : `https://${data.url}`);
                  return (
                    <a
                      key={network}
                      href={href}
                      target={network === 'email' ? undefined : '_blank'}
                      rel={network === 'email' ? undefined : 'noopener noreferrer'}
                      style={{ color: '#666', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = socialConfig.color}
                      onMouseLeave={e => e.currentTarget.style.color = '#666'}
                    >
                      <Icon size={14} />
                      {socialConfig.label}
                    </a>
                  );
                })}
                {(!config.whatsapp_number || !(config.social_links && Object.values(config.social_links).some(d => d.enabled && d.url))) && (
                  <p style={{ color: '#444', fontSize: '13px', margin: 0 }}>Nenhuma informação de contato cadastrada.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>
              © {new Date().getFullYear()} - {config.store_name}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

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
        .product-card:hover {
          transform: translateY(-4px);
          border-color: rgba(138,43,226,0.3) !important;
          box-shadow: 0 8px 32px rgba(138,43,226,0.15);
        }
        .product-card:hover .add-to-cart-btn {
          transform: scale(1.05);
        }
        .benefit-card:hover {
          background: rgba(138,43,226,0.08) !important;
          border-color: rgba(138,43,226,0.2) !important;
          transform: translateY(-2px);
        }
        .benefit-card:hover > div:first-child {
          background: linear-gradient(135deg, rgba(138,43,226,0.35), rgba(91,30,214,0.25)) !important;
        }
        @media (max-width: 900px) {
          .hero-content {
            flex-direction: column !important;
            text-align: center;
          }
          .hero-content > div:first-child {
            order: 1;
          }
          .hero-image {
            flex: 0 0 auto !important;
            width: 100% !important;
            max-width: 320px !important;
            height: 240px !important;
            margin: 0 auto;
          }
          .nav-desktop {
            display: none !important;
          }
          .nav-mobile-btn {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .nav-mobile-btn {
            display: none !important;
          }
          .nav-mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
