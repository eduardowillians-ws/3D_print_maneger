import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  History,
  X,
  ChevronDown,
  RotateCcw,
  Loader2,
  FileText,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { transactionsApi } from '../services/api/transactions';
import { TransactionType, TransactionStatus } from '../types/database';

interface Transaction {
  id: string;
  description: string;
  category: string;
  date: string;
  status: 'CONCLUÍDO' | 'PENDENTE' | 'ESTORNADO';
  type: 'INCOME' | 'EXPENSE';
  value: number;
}

export default function FinancialView() {
  const { currencySymbol } = useSettings();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  
  const [filterMonth, setFilterMonth] = useState(currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1));
  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeActions, setActiveActions] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');
  
  // Estados para o formulário
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Vendas');
  const [value, setValue] = useState('0');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados para dropdowns customizados
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const months = ['Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    const { data, error } = await transactionsApi.getAll();
    if (error) {
      console.error('Erro ao carregar transações:', error.message);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      const mappedData: Transaction[] = data.map(t => {
        const dateStr = String(t.date).split('T')[0];
        const [year, month, day] = dateStr.split('-');
        return {
          id: t.id,
          description: t.description,
          category: t.category,
          date: `${day}/${month}/${year}`,
          dateRaw: dateStr,
          status: t.status,
          type: t.type,
          value: Number(t.value)
        };
      });
      setTransactions(mappedData);
    }
    setIsLoading(false);
  };

  const currentMonthIndex = filterMonth === 'Todos' ? -1 : months.indexOf(filterMonth) - 1;
  const previousMonthIndex = currentMonthIndex === -1 ? -1 : (currentMonthIndex === 0 ? 11 : currentMonthIndex - 1);
  const previousMonthYear = currentMonthIndex === -1 || currentMonthIndex > 0 ? filterYear : (parseInt(filterYear) - 1).toString();

  const getMonthStats = (monthIndex: number, year: string) => {
    if (monthIndex === -1) {
      return transactions.filter(t => {
        const dateStr = (t as any).dateRaw || t.date;
        const dateParts = dateStr.split('-');
        if (dateParts.length !== 3) return false;
        return dateParts[0] === year;
      });
    }
    return transactions.filter(t => {
      const dateStr = (t as any).dateRaw || t.date;
      const dateParts = dateStr.split('-');
      if (dateParts.length !== 3) return false;
      const transYear = dateParts[0];
      const transMonth = parseInt(dateParts[1]) - 1;
      return transYear === year && transMonth === monthIndex;
    });
  };

  const currentMonthTransactions = getMonthStats(currentMonthIndex, filterYear);
  const previousMonthTransactions = getMonthStats(previousMonthIndex, previousMonthYear);

  const calculateStats = (txns: Transaction[]) => {
    const receita = txns.filter(t => t.type === 'INCOME' && t.status === 'CONCLUÍDO').reduce((acc, t) => acc + t.value, 0);
    const custos = txns.filter(t => t.type === 'EXPENSE' && t.status === 'CONCLUÍDO').reduce((acc, t) => acc + t.value, 0);
    return { receita, custos, lucro: receita - custos };
  };

  const currentStats = calculateStats(currentMonthTransactions);
  const previousStats = calculateStats(previousMonthTransactions);

  const getChange = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return '0%';
    if (previous === 0) return current > 0 ? '+100%' : '-100%';
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const stats = {
    receita: currentStats.receita,
    custos: currentStats.custos,
    lucro: currentStats.lucro,
    ticket: currentStats.receita > 0 ? currentStats.receita / Math.max(currentMonthTransactions.filter(t => t.type === 'INCOME').length, 1) : 0,
    changeReceita: getChange(currentStats.receita, previousStats.receita),
    changeCustos: getChange(currentStats.custos, previousStats.custos),
    changeLucro: getChange(currentStats.lucro, previousStats.lucro)
  };

  const filteredTransactions = transactions.filter(t => {
    const dateStr = (t as any).dateRaw || t.date;
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) return false;
    const year = dateParts[0];
    const transMonth = parseInt(dateParts[1]) - 1;
    
    const categoryMatch = filterCategory === 'Todas' || t.category === filterCategory;
    const dateMatch = filterMonth === 'Todos' 
      ? year === filterYear 
      : year === filterYear && transMonth === (months.indexOf(filterMonth) - 1);
    
    const searchMatch = searchQuery === '' || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && dateMatch && searchMatch;
  });

  const monthTransactions = months.slice(1).map((_, monthIndex) => { // slice(1) para ignorar "Todos"
    return transactions.filter(t => {
      const dateStr = (t as any).dateRaw || t.date;
      const dateParts = dateStr.split('-');
      if (dateParts.length !== 3) return false;
      const transYear = dateParts[0];
      const transMonth = parseInt(dateParts[1]) - 1;
      return transYear === filterYear && transMonth === monthIndex;
    });
  });

  const maxValue = Math.max(
    ...monthTransactions.map(t => t.reduce((acc, tr) => acc + (tr.type === 'INCOME' ? tr.value : 0), 0)),
    ...monthTransactions.map(t => t.reduce((acc, tr) => acc + (tr.type === 'EXPENSE' ? tr.value : 0), 0)),
    1
  );
  
  const chartValues = monthTransactions.map(t => {
    const income = t.reduce((acc, tr) => acc + (tr.type === 'INCOME' ? tr.value : 0), 0);
    const expense = t.reduce((acc, tr) => acc + (tr.type === 'EXPENSE' ? tr.value : 0), 0);
    return {
      income,
      expense,
      incomePercent: Math.round((income / maxValue) * 100),
      expensePercent: Math.round((expense / maxValue) * 100)
    };
  });

  const currentMonthIndexForHighlight = filterMonth === 'Todos' 
    ? new Date().getMonth() 
    : months.indexOf(filterMonth) - 1;
  
  const currentData = {
    receita: currentStats.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    custos: currentStats.custos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    lucro: currentStats.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    ticket: stats.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    chartValues,
    highlightMonth: currentMonthIndexForHighlight
  };

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'var(--secondary)';
    if (change.startsWith('-')) return 'var(--error)';
    return 'var(--text-dim)';
  };

  const handleRefresh = () => {
    setFilterMonth('Todos');
    setFilterCategory('Todas');
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 800);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'].join(','),
      ...filteredTransactions.map(t => [
        t.id,
        t.date,
        `"${t.description}"`,
        t.category,
        t.type === 'INCOME' ? 'Entrada' : 'Saída',
        t.value.toString().replace('.', ','),
        t.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financeiro_${filterMonth}_${filterYear}.csv`;
    link.click();
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    setExportType('pdf');
    setShowExportModal(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Deseja realmente excluir este registro financeiro? Esta ação é irreversível.')) {
      const { error } = await transactionsApi.delete(id);
      if (error) {
        alert('Erro ao excluir transação: ' + error.message);
        return;
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
      setActiveActions(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TransactionStatus) => {
    const { error } = await transactionsApi.updateStatus(id, newStatus);
    if (error) {
      alert('Erro ao atualizar status: ' + error.message);
      return;
    }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    setActiveActions(null);
  };

  const startEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setDescription(t.description);
    setCategory(t.category);
    setValue(t.value.toString());
    setType(t.type);
    // Para a data, vamos assumir o formato para o input type="date"
    const parts = t.date.split('/');
    if (parts.length === 3) {
      setDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    setShowAddModal(true);
    setActiveActions(null);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      alert('Informe uma descrição!');
      return;
    }

    const val = parseFloat(value.replace(',', '.')) || 0;
    
    const transactionData = {
      description,
      category,
      type: type as TransactionType,
      value: val,
      status: 'CONCLUÍDO' as TransactionStatus,
      date: date
    };

    if (editingTransaction) {
      const { error } = await transactionsApi.update(editingTransaction.id, transactionData);
      if (error) {
        alert('Erro ao atualizar transação: ' + error.message);
        return;
      }
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? {
        ...t,
        description,
        category,
        value: val,
        type,
        date: new Date(date).toLocaleDateString('pt-BR')
      } : t));
      alert('Transação atualizada!');
    } else {
      const { data, error } = await transactionsApi.create(transactionData);
      if (error) {
        alert('Erro ao criar transação: ' + error.message);
        return;
      }
      if (data) {
        const newTrx: Transaction = {
          id: data.id,
          description: data.description,
          category: data.category,
          date: new Date(data.date).toLocaleDateString('pt-BR'),
          status: data.status,
          type: data.type,
          value: Number(data.value)
        };
        setTransactions(prev => [newTrx, ...prev]);
      }
      alert('Nova transação lançada!');
    }
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setCategory('Vendas');
    setValue('0');
    setType('INCOME');
    setEditingTransaction(null);
    setShowAddModal(false);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Módulo Financeiro</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Gestão de fluxo de caixa, DRE e métricas de lucro.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', fontSize: '15px' }} onClick={() => setShowExportModal(true)}>
            <Download size={18} /> Exportar
          </button>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={() => setShowAddModal(true)}>
             <Plus size={20} /> Nova Transação
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
<KPICard title="RECEITA TOTAL" value={`${currencySymbol} ${currentData.receita}`} change={`${stats.changeReceita} vs mês anterior`} icon={<TrendingUp size={18} />} bgColor="rgba(74, 225, 118, 0.05)" accentColor="var(--secondary)" changeColor={getChangeColor(stats.changeReceita)} />
          <KPICard title="CUSTOS TOTAIS" value={`${currencySymbol} ${currentData.custos}`} change={`${stats.changeCustos} vs mês anterior`} icon={<TrendingDown size={18} />} bgColor="rgba(255, 77, 77, 0.05)" accentColor="var(--error)" changeColor={getChangeColor(stats.changeCustos)} />
          <KPICard title="LUCRO LÍQUIDO" value={`${currencySymbol} ${currentData.lucro}`} change={`${stats.changeLucro} vs mês anterior`} icon={<TrendingUp size={18} />} bgColor="rgba(138, 43, 226, 0.05)" accentColor="var(--primary)" changeColor={getChangeColor(stats.changeLucro)} />
          <KPICard title="TICKET MÉDIO" value={`${currencySymbol} ${currentData.ticket}`} change="Por transação" icon={<TrendingUp size={18} />} bgColor="rgba(22, 189, 202, 0.05)" accentColor="var(--accent-cyan)" changeColor="var(--text-dim)" />
      </div>

      <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={18} color="var(--primary)" /> Fluxo de Caixa Mensal
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Custom Dropdowns */}
            <CustomSelect label={filterMonth} options={months} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} onSelect={(val: string) => { setFilterMonth(val); setOpenDropdown(null); }} />
            <CustomSelect label={filterYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} onSelect={(val: string) => { setFilterYear(val); setOpenDropdown(null); }} />
            <CustomSelect label={filterCategory} options={['Todas', 'Vendas', 'Insumos', 'Serviços', 'Manutenção', 'Energia', 'Aluguel']} isOpen={openDropdown === 'category'} onToggle={() => toggleDropdown('category')} onSelect={(val: string) => { setFilterCategory(val); setOpenDropdown(null); }} />
            
            <button onClick={handleRefresh} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <RefreshCw size={16} className={isFiltering ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'visible' }}>
          {/* Legenda */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '16px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }}></div>
              <span style={{ color: 'var(--text-dim)' }}>Receitas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--error)', borderRadius: '2px' }}></div>
              <span style={{ color: 'var(--text-dim)' }}>Custos</span>
            </div>
          </div>
          
          {currentData.chartValues.map((data, i) => {
            const isCurrentMonth = i === currentData.highlightMonth;
            const total = data.incomePercent + data.expensePercent;
            const incomeHeight = data.incomePercent;
            const expenseHeight = data.expensePercent;
            
            return (
              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
                  {/* Barra de Receita ( Roxo ) */}
                  <motion.div 
                    key={`income-${filterMonth}-${filterYear}-${i}`}
                    initial={{ height: 0 }} 
                    animate={{ height: isFiltering ? 0 : `${incomeHeight}%` }} 
                    style={{ 
                      width: '100%',
                      background: isCurrentMonth ? 'var(--primary)' : 'rgba(138, 43, 226, 0.7)', 
                      borderRadius: '4px 4px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: data.income > 0 ? '24px' : '0',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {data.income > 0 && (
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {currencySymbol}{data.income >= 1000 ? (data.income/1000).toFixed(1)+'k' : data.income.toFixed(0)}
                      </span>
                    )}
                  </motion.div>
                  
                  {/* Barra de Despesa ( Vermelho ) */}
                  <motion.div 
                    key={`expense-${filterMonth}-${filterYear}-${i}`}
                    initial={{ height: 0 }} 
                    animate={{ height: isFiltering ? 0 : `${expenseHeight}%` }} 
                    style={{ 
                      width: '100%',
                      background: isCurrentMonth ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.6)', 
                      borderRadius: '0 0 4px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: data.expense > 0 ? '24px' : '0',
                      borderTop: data.income > 0 ? '1px solid rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {data.expense > 0 && (
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {currencySymbol}{data.expense >= 1000 ? (data.expense/1000).toFixed(1)+'k' : data.expense.toFixed(0)}
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px 4px', color: 'var(--text-dim)', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
          {months.slice(1).map((m, i) => (
            <span key={i} style={{ flex: 1, textAlign: 'center' }}>{m.substring(0, 3)}</span>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Cofre de Transações</h3>
          <div style={{ position: 'relative' }}>
<Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input type="text" placeholder="Buscar transação..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '10px 16px 10px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none' }} />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>ID</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>DESCRIÇÃO / CLIENTE</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>CATEGORIA</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>DATA</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500 }}>STATUS</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 500, textAlign: 'right' }}>VALOR</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '11px' }}>#{t.id}</td>
                <td style={{ padding: '16px 24px', fontWeight: 700 }}>{t.description}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(138, 43, 226, 0.1)', color: 'var(--primary)', fontSize: '11px', fontWeight: 600 }}>{t.category}</span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-dim)' }}>{t.date}</td>
                <td style={{ padding: '16px 24px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.status === 'CONCLUÍDO' ? 'var(--secondary)' : 'var(--warning)' }}></div>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{t.status}</span>
                   </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 800, color: t.type === 'INCOME' ? 'var(--secondary)' : 'white' }}>
                  {t.type === 'INCOME' ? '+' : '-'} {currencySymbol} {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                       <button onClick={(e) => { e.stopPropagation(); setSelectedTransaction(t); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--text-dim)' }}>
                         <Search size={16} />
                       </button>
                       <div style={{ position: 'relative' }}>
                          <button onClick={(e) => { e.stopPropagation(); setActiveActions(activeActions === t.id ? null : t.id); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--text-dim)' }}>
                            <MoreVertical size={16} />
                          </button>
                          <AnimatePresence>
                            {activeActions === t.id && (
                              <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} style={actionsDropdownStyle}>
                                 <div style={dropdownItemStyle} onClick={() => startEdit(t)}><Edit2 size={14} /> Editar</div>
                                 {t.status === 'PENDENTE' ? (
                                   <div style={{ ...dropdownItemStyle, color: 'var(--secondary)' }} onClick={() => handleStatusChange(t.id, 'CONCLUÍDO')}><CheckCircle size={14} /> Concluir</div>
                                 ) : (
                                   <div style={dropdownItemStyle} onClick={() => handleStatusChange(t.id, 'ESTORNADO')}><RotateCcw size={14} /> Estornar</div>
                                 )}
                                 <div style={{ ...dropdownItemStyle, color: 'var(--error)' }} onClick={() => handleDeleteTransaction(t.id)}><Trash2 size={14} /> Excluir</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </div>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <Modal title={editingTransaction ? "Editar Transação" : "Lançar Transação"} onClose={resetForm}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                   <label>Descrição / Origem</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Venda Peça Drone" style={inputStyle} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div className="input-group">
                      <label>Tipo</label>
                      <select value={type} onChange={e => setType(e.target.value as any)} style={inputStyle}>
                         <option value="INCOME">Receita (+)</option>
                         <option value="EXPENSE">Despesa (-)</option>
                      </select>
                   </div>
                   <div className="input-group">
                      <label>Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                         <option value="Vendas">Vendas</option>
                         <option value="Insumos">Insumos</option>
                         <option value="Serviços">Serviços</option>
                         <option value="Manutenção">Manutenção</option>
                         <option value="Outros">Outros</option>
                      </select>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div className="input-group">
                      <label>Data</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                   </div>
                   <div className="input-group">
                      <label>Valor ({currencySymbol})</label>
                      <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" style={inputStyle} />
                   </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', height: '54px', fontSize: '16px', marginTop: '12px' }} onClick={handleSave}>
                  {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
             </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTransaction && (
          <Modal title="Detalhes da Transação" onClose={() => setSelectedTransaction(null)}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                   <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(74, 225, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedTransaction.type === 'INCOME' ? <TrendingUp size={32} color="var(--secondary)" /> : <TrendingDown size={32} color="var(--error)" />}
                   </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                   <div>
                     <p style={detailLabelStyle}>DESCRIÇÃO</p>
                     <p style={detailValueStyle}>{selectedTransaction.description}</p>
                   </div>
                   <div>
                     <p style={detailLabelStyle}>VALOR</p>
                     <p style={{ ...detailValueStyle, color: selectedTransaction.type === 'INCOME' ? 'var(--secondary)' : 'var(--error)', fontSize: '20px' }}>
                       {currencySymbol} {selectedTransaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </p>
                   </div>
                   <div>
                     <p style={detailLabelStyle}>CATEGORIA</p>
                     <p style={detailValueStyle}>{selectedTransaction.category}</p>
                   </div>
                   <div>
                     <p style={detailLabelStyle}>DATA</p>
                     <p style={detailValueStyle}>{selectedTransaction.date}</p>
                   </div>
                </div>
                <div style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>ID da Auditoria</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{selectedTransaction.id}</span>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Recibo</button>
                   <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Auditoria</button>
                </div>
             </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExportModal && (
          <div style={modalOverlayStyle} onClick={() => setShowExportModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '24px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Exportar Dados</h2>
                <button onClick={() => setShowExportModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              <p style={{ color: 'var(--text-dim)', marginBottom: '20px', fontSize: '14px' }}>
                Selecione o formato de exportação. Os dados respeitarão os filtros atuais (mês, ano e categoria).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={handleExportCSV}
                  style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}
                >
                  <Download size={20} /> Baixar CSV
                </button>
                <button 
                  onClick={handleExportPDF}
                  style={{ padding: '16px', background: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '12px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 600 }}
                >
                  <FileText size={20} /> Visualizar PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExportModal && exportType === 'pdf' && (
          <FinancialPreviewPDF 
            transactions={filteredTransactions} 
            stats={stats} 
            filterMonth={filterMonth} 
            filterYear={filterYear}
            currencySymbol={currencySymbol}
            onClose={() => { setShowExportModal(false); setExportType('csv'); }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FinancialPreviewPDF({ transactions, stats, filterMonth, filterYear, currencySymbol, onClose }: any) {
  const handleDownloadPDF = () => {
    const printContent = document.getElementById('pdf-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro - PrintPulse 3D</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
            .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #8a2be2; padding-bottom: 24px; }
            .header h1 { font-size: 28px; color: #8a2be2; font-weight: 800; margin-bottom: 8px; }
            .header p { font-size: 16px; color: #666; }
            .header .period { font-size: 14px; color: #888; margin-top: 4px; }
            .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
            .kpi { padding: 16px; background: #f8f8f8; border-radius: 12px; text-align: center; }
            .kpi-label { font-size: 12px; color: #888; margin-bottom: 4px; }
            .kpi-value { font-size: 20px; font-weight: 700; }
            .kpi-value.green { color: #22c55e; }
            .kpi-value.red { color: #ef4444; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            thead { background: #8a2be2; color: white; }
            th { padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .type-income { color: #22c55e; }
            .type-expense { color: #ef4444; }
            .status-concluido { background: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .status-pendente { background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div id="pdf-content">
            <div class="header">
              <h1>PRINTPULSE 3D</h1>
              <p>Relatório Financeiro</p>
              <p class="period">${filterMonth} de ${filterYear}</p>
            </div>
            <div class="kpis">
              <div class="kpi">
                <div class="kpi-label">RECEITA</div>
                <div class="kpi-value green">${currencySymbol} ${stats.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="kpi">
                <div class="kpi-label">CUSTOS</div>
                <div class="kpi-value red">${currencySymbol} ${stats.custos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="kpi">
                <div class="kpi-label">LUCRO</div>
                <div class="kpi-value ${stats.lucro >= 0 ? 'green' : 'red'}">${currencySymbol} ${stats.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="kpi">
                <div class="kpi-label">TRANSAÇÕES</div>
                <div class="kpi-value">${transactions.length}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th style="text-align: right">Tipo</th>
                  <th style="text-align: right">Valor</th>
                  <th style="text-align: center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map((t: any) => `
                  <tr>
                    <td>${t.date}</td>
                    <td>${t.description}</td>
                    <td>${t.category}</td>
                    <td style="text-align: right" class="${t.type === 'INCOME' ? 'type-income' : 'type-expense'}">${t.type === 'INCOME' ? 'Entrada' : 'Saída'}</td>
                    <td style="text-align: right; font-weight: 600">${currencySymbol} ${t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align: center"><span class="${t.status === 'CONCLUÍDO' ? 'status-concluido' : 'status-pendente'}">${t.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', background: 'var(--bg-main)', borderRadius: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '32px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Pré-visualização - Relatório Financeiro</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <div id="pdf-content" style={{ padding: '32px', background: '#fff', color: '#1a1a1a', minHeight: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #8a2be2', paddingBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', color: '#8a2be2', fontWeight: 800, marginBottom: '8px' }}>PRINTPULSE 3D</h1>
            <p style={{ fontSize: '16px', color: '#666' }}>Relatório Financeiro</p>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>{filterMonth} de {filterYear}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '16px', background: '#f8f8f8', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>RECEITA</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>{currencySymbol} {stats.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f8f8', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>CUSTOS</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>{currencySymbol} {stats.custos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f8f8', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>LUCRO</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: stats.lucro >= 0 ? '#22c55e' : '#ef4444' }}>{currencySymbol} {stats.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div style={{ padding: '16px', background: '#f8f8f8', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>TRANSAÇÕES</p>
              <p style={{ fontSize: '20px', fontWeight: 700 }}>{transactions.length}</p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#8a2be2', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Data</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Descrição</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Categoria</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Tipo</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Valor</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{t.date}</td>
                  <td style={{ padding: '12px' }}>{t.description}</td>
                  <td style={{ padding: '12px' }}>{t.category}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: t.type === 'INCOME' ? '#22c55e' : '#ef4444' }}>{t.type === 'INCOME' ? 'Entrada' : 'Saída'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{currencySymbol} {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: t.status === 'CONCLUÍDO' ? '#dcfce7' : '#fef3c7', color: t.status === 'CONCLUÍDO' ? '#16a34a' : '#d97706' }}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '14px' }}>
            Cancelar
          </button>
          <button onClick={handleDownloadPDF} style={{ padding: '12px 24px', background: 'var(--primary)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            Baixar PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function KPICard({ title, value, change, icon, bgColor, accentColor, changeColor }: any) {
  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', borderLeft: `4px solid ${accentColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{title}</span>
        <div style={{ padding: '8px', borderRadius: '10px', background: bgColor, color: accentColor }}>{icon}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{value}</h2>
        <span style={{ fontSize: '12px', color: changeColor || 'var(--secondary)', fontWeight: 700 }}>{change}</span>
      </div>
    </div>
  );
}

function CustomSelect({ label, options, isOpen, onToggle, onSelect }: any) {
  return (
    <div style={{ position: 'relative', minWidth: '130px' }}>
      <div 
        onClick={onToggle}
        style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={dropdownStyle}>
            {options.map((opt: string) => (
              <div key={opt} onClick={() => onSelect(opt)} style={dropdownItemStyle}>
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const modalOverlayStyle: any = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContentStyle: any = { width: '100%', maxWidth: '500px', background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '32px', padding: '40px' };
const dropdownStyle: any = { position: 'absolute', left: '0', top: '50px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' };
const actionsDropdownStyle: any = { position: 'absolute', right: '0', top: '40px', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '8px', zIndex: 100, minWidth: '150px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' };
const dropdownItemStyle: any = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'white', transition: '0.2s', textAlign: 'left' };
const detailLabelStyle: any = { fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' };
const detailValueStyle: any = { fontSize: '15px', fontWeight: 700 };
const inputStyle: any = { width: '100%', padding: '14px 16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none' };
