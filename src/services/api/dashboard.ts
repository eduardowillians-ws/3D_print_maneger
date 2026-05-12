import { transactionsApi } from './transactions';
import { quotesApi } from './quotes';
import { productionApi } from './production';
import { printersApi } from './printers';
import { materialsApi } from './materials';
import { clientsApi } from './clients';

export const dashboardApi = {
  async getStats(month: string, year: string) {
    const months = ['Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthIndex = months.indexOf(month);
    
    // Se for "Todos" ou índice inválido, buscar todo o ano
    const isAllMonths = month === 'Todos' || monthIndex <= 0;
    
    // Calcular string do mês: índice 1 = Janeiro = '01'
    const monthStr = isAllMonths ? '01' : String(monthIndex).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;
    
    // Filtro de datas
    const dateFilter = (dateStr: string) => {
      if (isAllMonths) {
        return dateStr.startsWith(year);
      }
      return dateStr >= startDate && dateStr <= endDate;
    };

    // Buscar todos os dados em paralelo
    const [transactions, quotes, production, printers, materials, clients] = await Promise.all([
      transactionsApi.getAll(),
      quotesApi.getAll(),
      productionApi.getAll(),
      printersApi.getAll(),
      materialsApi.getAll(),
      clientsApi.getAll()
    ]);

    // Filtrar transações do período
    const monthTransactions = transactions.data?.filter((t: any) => {
      const dateStr = String(t.date).split('T')[0];
      return dateFilter(dateStr);
    }) || [];

    // Calcular métricas financeiras
    const receita = monthTransactions
      .filter((t: any) => t.type === 'INCOME' && t.status === 'CONCLUÍDO')
      .reduce((acc: number, t: any) => acc + Number(t.value), 0);

    const custos = monthTransactions
      .filter((t: any) => t.type === 'EXPENSE' && t.status === 'CONCLUÍDO')
      .reduce((acc: number, t: any) => acc + Number(t.value), 0);

    const lucro = receita - custos;

    // Filtrar orçamentos e produções do período
    const periodQuotes = quotes.data?.filter((q: any) => {
      if (!q.created_at) return false;
      const dateStr = String(q.created_at).split('T')[0];
      return dateFilter(dateStr);
    }) || [];
    
    const periodProduction = production.data?.filter((p: any) => {
      if (!p.created_at) return false;
      const dateStr = String(p.created_at).split('T')[0];
      return dateFilter(dateStr);
    }) || [];

    // Métricas de produção (do período selecionado)
    const orcamentosPendentes = periodQuotes.filter((q: any) => q.status === 'PENDENTE').length || 0;
    const orcamentosAprovados = periodQuotes.filter((q: any) => q.status === 'APROVADO').length || 0;
    const alertasAtivas = periodProduction.filter((p: any) => p.status === 'IMPRIMINDO').length || 0;
    const impressorasTotal = printers.data?.length || 0;
    const impressorasAtivas = printers.data?.filter((p: any) => p.status === 'IMPRIMINDO').length || 0;

    const materialsLowStock = materials.data?.filter((m: any) => m.weight_g < 500).length || 0;
    const printersMaintenance = printers.data?.filter((p: any) => p.status === 'MANUTENÇÃO').length || 0;

    // Dados diários de produção
    const monthProduction = production.data?.filter((j: any) => {
      if (!j.created_at) return false;
      const dateStr = String(j.created_at).split('T')[0];
      return dateFilter(dateStr);
    }) || [];

    const daysInMonth = monthIndex > 0 ? new Date(parseInt(year), monthIndex, 0).getDate() : 31;
    
    const dailyProduction = Array.from({ length: isAllMonths ? 12 : daysInMonth }, (_, i) => {
      let day = i + 1;
      let monthIdx = monthIndex;
      
      if (isAllMonths) {
        monthIdx = i + 1;
        day = 1;
      }
      
      const dayUnits = monthProduction.reduce((acc: number, j: any) => {
        if (!j.created_at) return acc;
        const jobDate = new Date(j.created_at);
        const jobMonth = jobDate.getMonth() + 1;
        const jobDay = jobDate.getDate();
        const jobYear = jobDate.getFullYear();
        
        let matchDay = false;
        if (isAllMonths) {
          matchDay = jobMonth === monthIdx && jobYear === parseInt(year);
        } else {
          matchDay = jobDay === day && jobMonth === monthIdx && jobYear === parseInt(year);
        }
        
        if (matchDay) {
          return acc + (j.quantity || 1);
        }
        return acc;
      }, 0);
      
      const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return { label: isAllMonths ? (monthLabels[monthIdx - 1] || '') : day.toString(), val: dayUnits };
    });

    // Gráfico anual
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const chartData = monthNames.map((_, idx) => {
      const m = idx + 1;
      const monthStart = `${year}-${String(m).padStart(2, '0')}-01`;
      const monthEnd = `${year}-${String(m).padStart(2, '0')}-31`;
      const monthTx = transactions.data?.filter((t: any) => {
        const dateStr = String(t.date).split('T')[0];
        return dateStr >= monthStart && dateStr <= monthEnd && t.type === 'INCOME' && t.status === 'CONCLUÍDO';
      }) || [];
      return monthTx.reduce((acc: number, t: any) => acc + Number(t.value), 0);
    });
    const maxChart = Math.max(...chartData, 1);
    const normalizedChart = chartData.map(v => v > 0 ? Math.round((v / maxChart) * 100) + 5 : 0);

    // Dados de clientes (por tipo)
    const clientTypes = clients.data?.reduce((acc: any, c: any) => {
      const type = c.type || 'Outro';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};
    const totalClientsByType = Object.values(clientTypes).reduce((a: any, b: any) => a + b, 0) || 1;
    const typeColors: any = { 'B2B': 'var(--primary)', 'Prototipagem': 'var(--accent-cyan)', 'Hobbyista': '#F59E0B', 'Educação': 'var(--secondary)', 'Outro': '#6B7280' };
    const pieData = Object.entries(clientTypes).map(([label, val]: [string, any]) => ({
      label,
      val: Math.round((Number(val) / Number(totalClientsByType)) * 100),
      color: typeColors[label] || typeColors['Outro']
    }));
    
    // Total de clientes reais
    const totalClients = clients.data?.length || 0;

    // Alertas
    const alertas: any[] = [];
    const lowStockMaterials = materials.data?.filter((m: any) => {
      const minStock = m.min_stock_g || 200;
      return m.weight_g < minStock;
    }) || [];
    lowStockMaterials.forEach((m: any) => {
      const minStock = m.min_stock_g || 200;
      alertas.push({ color: '#EF4444', title: `Estoque Baixo: ${m.name}`, desc: `${m.weight_g}g restantes (mín: ${minStock}g)`, time: 'Recente', type: 'material' });
    });
    const maintenancePrinters = printers.data?.filter((p: any) => p.status === 'MANUTENÇÃO') || [];
    maintenancePrinters.forEach((p: any) => {
      alertas.push({ color: '#F59E0B', title: `Manutenção: ${p.name}`, desc: 'Impressora em manutenção.', time: 'Recente', type: 'printer' });
    });
    const failedJobs = production.data?.filter((j: any) => j.status === 'FALHA') || [];
    if (failedJobs.length > 0) {
      alertas.push({ color: '#EF4444', title: `${failedJobs.length} falha(s) de impressão`, desc: 'Verificar jobs com falha.', time: 'Recente', type: 'production' });
    }
    if (alertas.length === 0) {
      alertas.push({ color: 'var(--secondary)', title: 'Tudo OK', desc: 'Nenhum alerta crítico no momento.', time: 'Agora', type: 'info' });
    }

    return {
      receita,
      custos,
      lucro,
      orcamentosPendentes,
      orcamentosAprovados,
      impressoesAtivas: alertasAtivas,
      impressorasTotal,
      impressorasAtivas,
      utilization: impressorasTotal > 0 ? Math.round((impressorasAtivas / impressorasTotal) * 100) : 0,
      materialsLowStock,
      printersMaintenance,
      changeReceita: '0',
      changeLucro: '0',
      productionData: dailyProduction,
      chartData: normalizedChart,
      pieData,
      totalClients,
      alerts: alertas.slice(0, 5)
    };
  }
};

export default dashboardApi;