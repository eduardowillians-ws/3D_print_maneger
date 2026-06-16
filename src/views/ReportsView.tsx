import { useState, useEffect } from 'react';
import { Download, Zap, TrendingUp, ChevronDown, RefreshCw, Clock, Users, Target, Package, X, BarChart3, DollarSign, TrendingDown, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import dashboardApi from '../services/api/dashboard';
import { productionApi } from '../services/api/production';
import { quotesApi } from '../services/api/quotes';
import { transactionsApi } from '../services/api/transactions';
import { clientsApi } from '../services/api/clients';
import { productsApi } from '../services/api/products';
import { quoteItemsApi } from '../services/api/quoteItems';
import { downloadFinancialReportPDF, FinancialReportData } from '../utils/financialReportPdf';

const months = ['Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

function dateFilter(dateStr: string, month: string, year: string): boolean {
  const isAllMonths = month === 'Todos';
  if (isAllMonths) {
    return dateStr.startsWith(year);
  }
  const monthIndex = months.indexOf(month);
  const monthStr = String(monthIndex).padStart(2, '0');
  const startDate = `${year}-${monthStr}-01`;
  const monthNum = monthIndex;
  const lastDay = new Date(parseInt(year), monthNum, 0).getDate();
  const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
  return dateStr >= startDate && dateStr <= endDate;
}

function getFirstLastDay(month: string, year: string): { first: string; last: string } {
  if (month === 'Todos') {
    return { first: `01/01/${year}`, last: `31/12/${year}` };
  }
  const monthIndex = months.indexOf(month);
  const lastDay = new Date(parseInt(year), monthIndex, 0).getDate();
  const mm = String(monthIndex).padStart(2, '0');
  return {
    first: `01/${mm}/${year}`,
    last: `${String(lastDay).padStart(2, '0')}/${mm}/${year}`,
  };
}

export default function ReportsView() {
  const { currencySymbol } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [isGenerating, setIsGenerating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [materialMonth, setMaterialMonth] = useState<string>('Todos');
  const [materialYear, setMaterialYear] = useState<string>(String(currentYear));

  const showMaterialClear = materialMonth !== 'Todos' || materialYear !== String(currentYear);

  useEffect(() => {
    loadReportData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadMaterialData();
  }, [materialMonth, materialYear]);

  const loadMaterialData = async () => {
    try {
      const monthListForAPI = ['Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const monthIndexForAPI = materialMonth === 'Todos' ? -1 : monthListForAPI.indexOf(materialMonth) - 1;
      const matMonthIndex = materialMonth === 'Todos' ? undefined : monthIndexForAPI;

      const materialsData = await productionApi.getAggregatedMaterials(matMonthIndex, materialYear);
      const totalWeight = materialsData.reduce((acc: number, m: any) => acc + m.total_weight, 0);

      const materialMix = materialsData.map((m: any) => ({
        type: m.material_name,
        qty: (m.total_weight / 1000).toFixed(2) + 'kg',
        weight: m.total_weight,
        pct: totalWeight > 0 ? Math.round((m.total_weight / totalWeight) * 100) : 0
      }));

      setReportData((prev: any) => prev ? { ...prev, materialMix } : null);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    }
  };

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const monthListForAPI = ['Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const monthIndexForAPI = selectedMonth === 'Todos' ? -1 : monthListForAPI.indexOf(selectedMonth) - 1;
      const matMonthIndex = materialMonth === 'Todos' ? undefined : monthListForAPI.indexOf(materialMonth) - 1;

      const [dashboardStats, materialsData, topClientsData, topProductsData, jobsWithTime, allQuotesRes, allTransactionsRes, allProductionRes, allClientsRes, allProductsRes] = await Promise.all([
        dashboardApi.getStats(selectedMonth, selectedYear),
        productionApi.getAggregatedMaterials(matMonthIndex, materialYear),
        productionApi.getTopClients(monthIndexForAPI, selectedYear, 5),
        productionApi.getTopProducts(monthIndexForAPI, selectedYear, 5),
        productionApi.getJobsWithEstimatedTime(monthIndexForAPI, selectedYear),
        quotesApi.getAll(),
        transactionsApi.getAll(),
        productionApi.getAll(),
        clientsApi.getAll(),
        productsApi.getAll()
      ]);

      const allQuotes = allQuotesRes.data || [];
      const allTransactions = allTransactionsRes.data || [];
      const allProduction = allProductionRes.data || [];
      const allClients = allClientsRes.data || [];
      const allProducts = allProductsRes.data || [];

      const periodTransactions = allTransactions.filter((t: any) => {
        const dateStr = String(t.date).split('T')[0];
        return dateFilter(dateStr, selectedMonth, selectedYear);
      });

      const periodQuotes = allQuotes.filter((q: any) => {
        if (!q.created_at) return false;
        const dateStr = String(q.created_at).split('T')[0];
        return dateFilter(dateStr, selectedMonth, selectedYear);
      });

      const periodProduction = allProduction.filter((p: any) => {
        if (!p.created_at) return false;
        const dateStr = String(p.created_at).split('T')[0];
        return dateFilter(dateStr, selectedMonth, selectedYear);
      });

      const revenue = periodTransactions
        .filter((t: any) => t.type === 'INCOME' && t.status === 'CONCLUÍDO')
        .reduce((acc: number, t: any) => acc + Number(t.value), 0);

      const expenses = periodTransactions
        .filter((t: any) => t.type === 'EXPENSE' && t.status === 'CONCLUÍDO')
        .reduce((acc: number, t: any) => acc + Number(t.value), 0);

      const netProfit = revenue - expenses;
      const transactionCount = periodTransactions.filter((t: any) => t.status === 'CONCLUÍDO').length;
      const avgTicket = transactionCount > 0 ? revenue / transactionCount : 0;

      const approvedQuotes = periodQuotes.filter((q: any) => q.status === 'APROVADO').length;
      const rejectedQuotes = periodQuotes.filter((q: any) => q.status === 'REJEITADO').length;
      const pendingQuotes = periodQuotes.filter((q: any) => q.status === 'PENDENTE').length;
      const sentQuotes = periodQuotes.filter((q: any) => q.status === 'ENVIADO').length;
      const conversionRate = (approvedQuotes + rejectedQuotes) > 0
        ? (approvedQuotes / (approvedQuotes + rejectedQuotes)) * 100
        : 0;

      const totalProduced = periodProduction.reduce((acc: number, p: any) => acc + (p.quantity || 1), 0);

      const hoursPrinted = jobsWithTime.reduce((acc: number, job: any) => acc + job.estimatedHours, 0);
      const hoursPrintedFormatted = hoursPrinted.toFixed(1);

      const approvedQuoteIds = periodQuotes
        .filter((q: any) => q.status === 'APROVADO')
        .map((q: any) => q.id);

      let allQuoteItems: any[] = [];
      for (const qId of approvedQuoteIds) {
        const itemsRes = await quoteItemsApi.getByQuoteId(qId);
        if (itemsRes.data) {
          allQuoteItems = allQuoteItems.concat(itemsRes.data);
        }
      }

      const revenueByClientMap: Record<string, { name: string; total: number; count: number }> = {};
      periodQuotes
        .filter((q: any) => q.status === 'APROVADO')
        .forEach((q: any) => {
          const clientId = q.client_id;
          if (!clientId) return;
          const client = allClients.find((c: any) => c.id === clientId);
          const clientName = client?.name || 'Cliente Desconhecido';
          if (!revenueByClientMap[clientId]) {
            revenueByClientMap[clientId] = { name: clientName, total: 0, count: 0 };
          }
          revenueByClientMap[clientId].total += Number(q.total_value) || 0;
          revenueByClientMap[clientId].count += 1;
        });
      const revenueByClient = Object.values(revenueByClientMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      const revenueByProductMap: Record<string, { name: string; total: number; quantity: number }> = {};
      allQuoteItems.forEach((item: any) => {
        const productId = item.product_id;
        if (!productId) return;
        const product = allProducts.find((p: any) => p.id === productId);
        const productName = product?.name || item.description || 'Produto Desconhecido';
        if (!revenueByProductMap[productId]) {
          revenueByProductMap[productId] = { name: productName, total: 0, quantity: 0 };
        }
        revenueByProductMap[productId].total += (Number(item.unit_price) || 0) * (Number(item.quantity) || 0);
        revenueByProductMap[productId].quantity += Number(item.quantity) || 0;
      });
      const revenueByProduct = Object.values(revenueByProductMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      const ordersByClientMap: Record<string, { name: string; count: number }> = {};
      periodQuotes
        .filter((q: any) => q.status === 'APROVADO')
        .forEach((q: any) => {
          const clientId = q.client_id;
          if (!clientId) return;
          const client = allClients.find((c: any) => c.id === clientId);
          const clientName = client?.name || 'Cliente Desconhecido';
          if (!ordersByClientMap[clientId]) {
            ordersByClientMap[clientId] = { name: clientName, count: 0 };
          }
          ordersByClientMap[clientId].count += 1;
        });
      const ordersByClient = Object.values(ordersByClientMap)
        .sort((a, b) => b.count - a.count);

      const ltvByClient = revenueByClient.map((c) => ({ name: c.name, ltv: c.total }));

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyData = monthNames.map((label, idx) => {
        const m = idx + 1;
        const monthStart = `${selectedYear}-${String(m).padStart(2, '0')}-01`;
        const lastDay = new Date(parseInt(selectedYear), m, 0).getDate();
        const monthEnd = `${selectedYear}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const monthTx = allTransactions.filter((t: any) => {
          const dateStr = String(t.date).split('T')[0];
          return dateStr >= monthStart && dateStr <= monthEnd;
        });

        const income = monthTx
          .filter((t: any) => t.type === 'INCOME' && t.status === 'CONCLUÍDO')
          .reduce((acc: number, t: any) => acc + Number(t.value), 0);

        const expense = monthTx
          .filter((t: any) => t.type === 'EXPENSE' && t.status === 'CONCLUÍDO')
          .reduce((acc: number, t: any) => acc + Number(t.value), 0);

        return { label, income, expense };
      });

      const totalWeight = materialsData.reduce((acc: number, m: any) => acc + m.total_weight, 0);
      const materialMix = materialsData.map((m: any) => ({
        type: m.material_name,
        qty: (m.total_weight / 1000).toFixed(2) + 'kg',
        weight: m.total_weight,
        pct: totalWeight > 0 ? Math.round((m.total_weight / totalWeight) * 100) : 0
      }));

      setReportData({
        revenue,
        expenses,
        netProfit,
        avgTicket,
        transactionCount,
        approvedQuotes,
        rejectedQuotes,
        pendingQuotes,
        sentQuotes,
        conversionRate,
        totalProduced,
        hoursPrinted,
        hoursPrintedFormatted,
        revenueByClient,
        revenueByProduct,
        ordersByClient,
        ltvByClient,
        monthlyData,
        materialMix,
        topClients: topClientsData,
        topProducts: topProductsData,
        allQuotes,
        allTransactions,
        allProduction,
        allClients,
        allProducts,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const handleGeneratePDF = () => {
    if (!reportData || isLoading) return;
    setIsGenerating(true);

    const { first, last } = getFirstLastDay(selectedMonth, selectedYear);
    const dateRange = `${first} a ${last}`;

    const pdfData: FinancialReportData = {
      monthLabel: selectedMonth,
      yearLabel: selectedYear,
      dateRange,
      totalRevenue: reportData.revenue,
      totalExpenses: reportData.expenses,
      netProfit: reportData.netProfit,
      avgTicket: reportData.avgTicket,
      transactionCount: reportData.transactionCount,
      approvedQuotes: reportData.approvedQuotes,
      rejectedQuotes: reportData.rejectedQuotes,
      pendingQuotes: reportData.pendingQuotes,
      sentQuotes: reportData.sentQuotes,
      conversionRate: reportData.conversionRate,
      totalProduced: reportData.totalProduced,
      revenueByClient: reportData.revenueByClient,
      revenueByProduct: reportData.revenueByProduct,
      ordersByClient: reportData.ordersByClient,
      ltvByClient: reportData.ltvByClient,
      monthlyData: reportData.monthlyData,
    };

    try {
      downloadFinancialReportPDF(pdfData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }

    setTimeout(() => setIsGenerating(false), 1000);
  };

  const clearMaterialFilter = () => {
    setMaterialMonth('Todos');
    setMaterialYear(String(currentYear));
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 128px)', padding: '0 0 40px 0' }}>
      <div style={headerContainerStyle}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Relatórios Estratégicos</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Análise completa de resultados operacionais e financeiros.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <CustomSelect label={selectedMonth} options={months} isOpen={openDropdown === 'month'} onToggle={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')} onSelect={(m: string) => { setSelectedMonth(m); setOpenDropdown(null); }} />
            <CustomSelect label={selectedYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')} onSelect={(y: string) => { setSelectedYear(y); setOpenDropdown(null); }} />
          </div>
          
          <button className="btn-primary" onClick={handleGeneratePDF} disabled={isGenerating || isLoading} style={{ height: '54px', padding: '0 24px', minWidth: '180px', position: 'relative', overflow: 'hidden' }}>
            {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
            <span style={{ marginLeft: '10px' }}>{isGenerating ? 'Gerando...' : 'Baixar PDF'}</span>
          </button>
        </div>
      </div>

      <div style={kpiGridStyle}>
        {isLoading ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>Carregando...</p>
          </div>
        ) : reportData ? (
          <>
            <KPICard title="Receita Total" value={`${currencySymbol} ${reportData.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<TrendingUp size={20} color="#22C55E" />} color="#22C55E" desc="Faturamento bruto" />
            <KPICard title="Custos Totais" value={`${currencySymbol} ${reportData.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<TrendingDown size={20} color="#EF4444" />} color="#EF4444" desc="Despesas do período" />
            <KPICard title="Lucro Líquido" value={`${currencySymbol} ${reportData.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<Zap size={20} color="var(--primary)" />} color="var(--primary)" desc="Resultado líquido" />
            <KPICard title="Ticket Médio" value={`${currencySymbol} ${reportData.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<DollarSign size={20} color="#F59E0B" />} color="#F59E0B" desc={`Em ${reportData.transactionCount} transações`} />
            <KPICard title="Peças Produzidas" value={`${reportData.totalProduced} un`} icon={<Package size={20} color="var(--accent-cyan)" />} color="var(--accent-cyan)" desc="Total no período" />
            <KPICard title="Horas de Impressão" value={`${reportData.hoursPrintedFormatted}h`} icon={<Clock size={20} color="#F59E0B" />} color="#F59E0B" desc="Tempo total estimado" />
            <KPICard title="Taxa de Conversão" value={`${reportData.conversionRate.toFixed(1)}%`} icon={<Percent size={20} color="#22C55E" />} color="#22C55E" desc={`${reportData.approvedQuotes} aprovados / ${reportData.rejectedQuotes} rejeitados`} />
            <KPICard title="Orçamentos" value={`${reportData.approvedQuotes + reportData.rejectedQuotes + reportData.pendingQuotes + reportData.sentQuotes}`} icon={<BarChart3 size={20} color="var(--secondary)" />} color="var(--secondary)" desc={`${reportData.approvedQuotes} aprov · ${reportData.rejectedQuotes} rej · ${reportData.pendingQuotes} pend`} />
          </>
        ) : null}
      </div>

      {!isLoading && reportData && (
        <>
          <div style={gridStyle}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="var(--primary)" /> Faturamento por Cliente
              </h3>
              {reportData.revenueByClient.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>Nenhum cliente no período</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reportData.revenueByClient.map((client: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(138, 43, 226, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                          {i + 1}
                        </div>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>{client.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{client.count} pedido{client.count !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--secondary)' }}>{currencySymbol} {client.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={18} color="var(--accent-cyan)" /> Faturamento por Produto
              </h3>
              {reportData.revenueByProduct.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>Nenhum produto no período</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reportData.revenueByProduct.map((product: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(22, 189, 202, 0.2)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                          {i + 1}
                        </div>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>{product.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{product.quantity} un</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{currencySymbol} {product.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="var(--secondary)" /> Mix de Materiais
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CustomSelect label={materialMonth} options={months} isOpen={openDropdown === 'materialMonth'} onToggle={() => setOpenDropdown(openDropdown === 'materialMonth' ? null : 'materialMonth')} onSelect={(m: string) => { setMaterialMonth(m); setOpenDropdown(null); }} />
                <CustomSelect label={materialYear} options={years} isOpen={openDropdown === 'materialYear'} onToggle={() => setOpenDropdown(openDropdown === 'materialYear' ? null : 'materialYear')} onSelect={(y: string) => { setMaterialYear(y); setOpenDropdown(null); }} />
                {showMaterialClear && (
                  <button onClick={clearMaterialFilter} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <X size={14} /> Limpar
                  </button>
                )}
              </div>
            </div>
            
            {reportData.materialMix.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>Nenhum material</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reportData.materialMix.map((mat: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{mat.type}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{mat.pct}% ({mat.qty})</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(mat.pct || 0, 0)}%` }} transition={{ duration: 1, delay: 0.2 }} style={{ height: '100%', background: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--accent-cyan)' : 'var(--secondary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, color, desc }: any) {
  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{title.toUpperCase()}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{value}</h2>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  );
}

function CustomSelect({ label, options, isOpen, onToggle, onSelect }: any) {
  return (
    <div style={{ position: 'relative', minWidth: '120px' }}>
      <div onClick={onToggle} style={{ height: '48px', padding: '0 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
        <span>{label}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={dropdownStyle}>
            {options.map((opt: string) => (<div key={opt} onClick={() => onSelect(opt)} style={dropdownItemStyle}>{opt}</div>))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const headerContainerStyle: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' };
const kpiGridStyle: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' };
const gridStyle: any = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };
const dropdownStyle: any = { position: 'absolute', top: '55px', left: 0, width: '100%', background: '#0a0a0a', border: '1px solid var(--border-glass)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' };
const dropdownItemStyle: any = { padding: '12px 16px', fontSize: '13px', cursor: 'pointer', transition: '0.2s', borderBottom: '1px solid rgba(255,255,255,0.03)' };
