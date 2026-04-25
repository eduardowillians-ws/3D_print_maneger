import { Workflow, Plus, Clock } from 'lucide-react';

export default function ProducaoView() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Fila de Produção</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gerencie e acompanhe os trabalhos de impressão em todas as frotas.</p>
        </div>
        <button className="btn-primary" style={{ height: '40px', padding: '0 16px', borderRadius: '8px' }}>
          <Plus size={18} /> Novo Trabalho
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', height: 'calc(100vh - 250px)' }}>
        <KanbanColumn title="PENDENTE" count={3}>
           <KanbanCard title="Conjunto de Engranagem Planetária" order="#6842" priority="ALTA" time="4h 20m" material="PETG Laranja" />
           <KanbanCard title="Hélice de Drone MK.IV" order="#6845" priority="NORMAL" time="1h 45m" material="Fibra de Carbono" />
        </KanbanColumn>
        <KanbanColumn title="IMPRIMINDO" count={2}>
           <KanbanCard title="Vaso Voronoi Grande" order="Alpha-01" progress={65} time="2h 14m" material="ABS Azul" />
        </KanbanColumn>
        <KanbanColumn title="CONCLUÍDO" count={1}>
           <KanbanCard title="Base de Modelo Arquitetônico" order="Gamma-02" isDone material="Resina Cinza" />
        </KanbanColumn>
      </div>
    </>
  );
}

function KanbanColumn({ title, count, children }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: title === 'IMPRIMINDO' ? 'var(--accent-cyan)' : title === 'CONCLUÍDO' ? 'var(--secondary)' : 'var(--text-muted)' }}></div>
         <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)' }}>{title}</h4>
         <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{count}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
}

function KanbanCard({ title, order, priority, time, material, progress, isDone }: any) {
  return (
    <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', cursor: 'grab' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
        <div>
          {priority && <span style={{ fontSize: '10px', fontWeight: 700, color: priority === 'ALTA' ? 'var(--error)' : 'var(--text-muted)' }}>{priority}</span>}
          <h3 style={{ fontSize: '13px', lineHeight: 1.2 }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--primary)' }}>{order}</span>
        </div>
      </div>
      
      {progress > 0 && (
         <div style={{ marginBottom: '12px' }}>
           <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
             <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-cyan)' }}></div>
           </div>
           <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{progress}% • {time} restantes</span>
         </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> {time || (isDone ? 'Concluído' : '--')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> {material}
        </span>
      </div>
    </div>
  );
}
