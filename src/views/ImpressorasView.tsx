import { useState } from 'react';
import { 
  Printer, 
  Plus, 
  Search, 
  MoreVertical, 
  Settings, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Activity,
  Cpu,
  Thermometer,
  Cloud,
  Trash2,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImpressorasView() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const printers = [
    { id: 1, name: 'Voron 2.4 R2', model: 'Voron CoreXY', status: 'ativa', progress: 78, temp: 245, bed: 100, job: 'Drone_Chassis_v4.gcode', time: '1.240 h' },
    { id: 2, name: 'Bambu Lab X1C', model: 'X1-Carbon', status: 'ociosa', progress: 0, temp: 25, bed: 25, job: 'Pronta para o próximo trabalho.', time: '850 h' },
    { id: 3, name: 'Prusa MK4', model: 'Original Prusa', status: 'manutencao', progress: 0, temp: 0, bed: 0, job: 'EXTRUSORA ENTUPIDA', error: 'Sensor de filamento acionado.', time: '2.100 h' },
  ];

  const handleAddPrinter = () => {
    alert('Impressora vinculada com sucesso ao sistema!');
    setShowAddModal(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Impressoras</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie e monitore sua frota de manufatura aditiva.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowAddModal(true)}
          style={{ padding: '12px 24px', fontSize: '15px' }} // Botão de Adicionar maior
        >
          <Plus size={20} /> Adicionar Impressora
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <MiniCard title="Frota Total" value="12" icon={<Printer size={16} />} />
        <MiniCard title="Impressão Ativa" value="8" icon={<Activity size={16} color="var(--primary)" />} />
        <MiniCard title="Ociosas / Prontas" value="3" icon={<CheckCircle2 size={16} color="var(--secondary)" />} />
        <MiniCard title="Manutenção" value="1" icon={<AlertTriangle size={16} color="var(--error)" />} />
      </div>

      {/* Printers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {printers.map(printer => (
          <PrinterCard 
            key={printer.id} 
            printer={printer} 
            onDetails={() => setSelectedPrinter(printer)} 
            isMenuOpen={activeMenu === printer.id}
            onToggleMenu={() => setActiveMenu(activeMenu === printer.id ? null : printer.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <Modal title="Nova Impressora" onClose={() => setShowAddModal(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label>Nome da Máquina</label>
                <input type="text" placeholder="Ex: Voron Stealth" />
              </div>
              <div className="input-group">
                <label>Modelo / Fabricante</label>
                <input type="text" placeholder="Ex: Creality, Bambu Lab..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Endereço IP</label>
                  <input type="text" placeholder="192.168.1.50" />
                </div>
                <div className="input-group">
                  <label>Tipo de Conexão</label>
                  <select style={selectStyle}>
                    <option>Klipper (Moonraker)</option>
                    <option>OctoPrint</option>
                    <option>Repetier</option>
                  </select>
                </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ width: '100%', height: '54px', fontSize: '16px', marginTop: '10px' }} // Botão de Vincular mais robusto
                onClick={handleAddPrinter}
              >
                Vincular Máquina
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPrinter && (
          <Modal title={`Detalhes: ${selectedPrinter.name}`} onClose={() => setSelectedPrinter(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <DetailStat icon={<Thermometer size={16} />} label="Nozzle" value={`${selectedPrinter.temp}°C`} />
                <DetailStat icon={<Thermometer size={16} />} label="Mesa" value={`${selectedPrinter.bed}°C`} />
                <DetailStat icon={<Cpu size={16} />} label="CPU Temp" value="42°C" />
                <DetailStat icon={<Cloud size={16} />} label="IP" value="192.168.10.45" />
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Console Log Próximo</p>
                <code style={{ fontSize: '10px', color: 'var(--secondary)', fontFamily: 'monospace' }}>
                  [15:42:01] G1 X145.2 Y122.4 E1.24<br/>
                  [15:42:02] M105 (Report Temperatures)<br/>
                  [15:42:05] HEATER_BED: ok
                </code>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }} onClick={() => setSelectedPrinter(null)}>Fechar</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => alert('Abrindo Interface Moonraker...')}>Abrir WebUI</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PrinterCard({ printer, onDetails, isMenuOpen, onToggleMenu }: any) {
  const isManutencao = printer.status === 'manutencao';
  const isAtiva = printer.status === 'ativa';

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', position: 'relative', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{printer.name}</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {printer.time}
          </p>
        </div>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          padding: '4px 8px', 
          borderRadius: '4px', 
          textTransform: 'uppercase',
          background: isAtiva ? 'rgba(74, 225, 118, 0.1)' : isManutencao ? 'rgba(255, 77, 77, 0.1)' : 'rgba(255,255,255,0.05)',
          color: isAtiva ? 'var(--secondary)' : isManutencao ? 'var(--error)' : 'var(--text-dim)',
          border: `1px solid ${isAtiva ? 'var(--secondary)' : isManutencao ? 'var(--error)' : 'var(--text-dim)'}30`
        }}>
          • {printer.status}
        </div>
      </div>

      <div style={{ 
        height: '140px', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '12px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {isManutencao ? (
          <>
            <AlertTriangle size={32} color="var(--error)" />
            <span style={{ fontSize: '12px', color: 'var(--error)', fontWeight: 700 }}>{printer.job}</span>
          </>
        ) : isAtiva ? (
          <div style={{ width: '80%', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>Trabalho Atual</p>
            <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{printer.job}</p>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '16px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${printer.progress}%` }} style={{ height: '100%', background: 'var(--primary)' }} />
            </div>
          </div>
        ) : (
          <>
            <Printer size={32} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Mesa Livre</span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
        <button onClick={onDetails} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Detalhes</button>
        {isAtiva && <button onClick={() => confirm('Deseja realmente cancelar esta impressão?')} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)', color: 'var(--error)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>}
        {!isAtiva && !isManutencao && <button className="btn-primary" style={{ flex: 1, fontSize: '13px' }}>Iniciar Trabalho</button>}
        {isManutencao && <button className="btn-primary" style={{ flex: 1, fontSize: '13px' }}>Resolver</button>}
        
        {/* Menu de Três Pontos Ativado */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={onToggleMenu}
            style={{ 
              padding: '12px', 
              borderRadius: '10px', 
              background: isMenuOpen ? 'var(--primary)' : 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border-glass)', 
              color: 'white', 
              cursor: 'pointer' 
            }}
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{ 
                  position: 'absolute', 
                  bottom: '100%', 
                  right: 0, 
                  marginBottom: '8px', 
                  width: '160px', 
                  background: 'var(--bg-card)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '8px',
                  zIndex: 50,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
              >
                <ContextMenuItem icon={<RefreshCw size={14}/>} label="Calibrar" onClick={() => { alert('Calibração Iniciada'); onToggleMenu(); }} />
                <ContextMenuItem icon={<Edit2 size={14}/>} label="Renomear" onClick={() => { alert('Função Renomear'); onToggleMenu(); }} />
                <div style={{ margin: '4px 0', borderTop: '1px solid var(--border-glass)' }}></div>
                <ContextMenuItem icon={<Trash2 size={14}/>} label="Remover" color="var(--error)" onClick={() => { alert('Remover Máquina'); onToggleMenu(); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ContextMenuItem({ icon, label, onClick, color = 'var(--text-main)' }: any) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '8px 12px', 
        borderRadius: '8px', 
        fontSize: '12px', 
        color: color, 
        cursor: 'pointer',
        transition: '0.2s'
      }}
      className="dropdown-item"
    >
      {icon} {label}
    </div>
  );
}

function MiniCard({ title, value, icon }: any) {
  return (
    <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>{icon}</div>
      <div>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{title}</p>
        <p style={{ fontSize: '15px', fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  );
}

function DetailStat({ icon, label, value }: any) {
  return (
    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {icon} <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600 }}>{value}</p>
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
