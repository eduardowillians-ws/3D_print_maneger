import { Box, Plus, Filter, Edit2, Download, UploadCloud, Clock, Weight, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProdutosView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Catálogo de Produtos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie peças imprimíveis, variações e preços.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={outlineButtonStyle}>
            <Filter size={16} /> Filtrar
          </button>
          <button className="btn-primary" style={{ height: '40px', padding: '0 16px', borderRadius: '8px' }}>
            <Plus size={18} /> Adicionar Produto
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <ProductCard 
          title="Chassi de Drone Articulado v2" 
          version="v2.1"
          time="14h 30m"
          weight="450g"
          estCost="R$ 12,50"
          sellPrice="R$ 45,00"
          imgIcon={<Box size={32} opacity={0.2} />}
        />
        <ProductCard 
          title="Conjunto de Engrenagens Pesadas" 
          version="v1.8"
          time="8h 15m"
          weight="210g"
          estCost="R$ 28,00"
          sellPrice="R$ 85,00"
          imgIcon={<div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box size={20} opacity={0.3} /></div>}
        />
        <UploadCard />
      </div>
    </motion.div>
  );
}

function ProductCard({ title, version, time, weight, estCost, sellPrice, imgIcon }: any) {
  return (
    <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Preview Area */}
      <div style={{ height: '180px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {imgIcon}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', opacity: 0.5 }}></div>
        </div>
      </div>

      {/* Info Area */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{title}</h3>
          <span style={{ fontSize: '10px', color: 'var(--primary)', background: 'rgba(103, 58, 183, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{version}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <p style={labelStyle}>TEMPO DE IMPRESSÃO</p>
            <div style={valueWrapperStyle}>
              <Clock size={12} color="var(--text-muted)" />
              <span style={valueStyle}>{time}</span>
            </div>
          </div>
          <div>
            <p style={labelStyle}>MATERIAL</p>
            <div style={valueWrapperStyle}>
              <Weight size={12} color="var(--text-muted)" />
              <span style={valueStyle}>{weight}</span>
            </div>
          </div>
          <div>
            <p style={labelStyle}>CUSTO EST.</p>
            <p style={{ ...valueStyle, color: 'var(--text-dim)' }}>{estCost}</p>
          </div>
          <div>
            <p style={labelStyle}>PREÇO DE VENDA</p>
            <p style={{ ...valueStyle, color: 'white', fontWeight: 700 }}>{sellPrice}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
          <button style={actionButtonStyle}><Edit2 size={14} /></button>
          <button style={actionButtonStyle}><Download size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function UploadCard() {
  return (
    <div className="glass-panel" style={{ 
      borderRadius: '16px', 
      border: '1px dashed rgba(255,255,255,0.1)', 
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center'
    }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <UploadCloud size={24} color="var(--text-muted)" />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Fazer Upload de Nova Peça</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '24px' }}>Arraste e solte arquivos STL, OBJ ou 3MF</p>
      <button style={selectFilesButtonStyle}>Selecionar Arquivos</button>
    </div>
  );
}

const labelStyle: any = { fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' };
const valueWrapperStyle: any = { display: 'flex', alignItems: 'center', gap: '6px' };
const valueStyle: any = { fontSize: '14px', fontWeight: 500 };

const outlineButtonStyle: any = {
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '0 16px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const actionButtonStyle: any = {
  flex: 1,
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '8px',
  color: 'var(--text-dim)',
  cursor: 'pointer'
};

const selectFilesButtonStyle: any = {
  padding: '10px 24px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};
