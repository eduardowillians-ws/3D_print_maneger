import { transactionsApi } from './transactions';
import { quotesApi } from './quotes';
import { productionApi } from './production';
import { printersApi } from './printers';
import { materialsApi } from './materials';
import { clientsApi } from './clients';

export const dashboardApi = {
  async getStats(month: string, year: string) {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthIndex = months.indexOf(month);
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    const [transactions, quotes, production, printers, materials, clients] = await Promise.all([
      transactionsApi.getAll(),
      quotesApi.getAll(),
      productionApi.getAll(),
      printersApi.getAll(),
      materialsApi.getAll(),
      clientsApi.getAll()
    ]);

    const monthTransactions = transactions.data?.filter((t: any) => {
      const dateStr = String(t.date).split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    }) || [];

    const receita = monthTransactions
      .filter((t: any) => t.type === 'INCOME' && t.status === 'CONCLUÍDO')
      .reduce((acc: number, t: any) => acc + Number(t.value), 0);

    const custos = monthTransactions
      .filter((t: any) => t.type === 'EXPENSE' && t.status === 'CONCLUÍDO')
      .reduce((acc: number, t: any) => acc + Number(t.value), 0);

    const orcamentosPendentes = quotes.data?.filter((q: any) => q.status === 'PENDENTE').length || 0;
    const impressoesAtivas = production.data?.filter((p: any) => p.status === 'IMPRIMINDO').length || 0;
    const impressorasTotal = printers.data?.length || 0;
    const impressorasAtivas = printers.data?.filter((p: any) => p.status === 'IMPRIMINDO').length || 0;

    const materialsLowStock = materials.data?.filter((m: any) => m.weight_g < 500).length || 0;
    const printersMaintenance = printers.data?.filter((p: any) => p.status === 'MANUTENÇÃO').length || 0;

    const previousMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    const previousYear = monthIndex === 0 ? String(parseInt(year) - 1) : year;
    const prevStartDate = `${previousYear}-${String(previousMonthIndex + 1).padStart(2, '0')}-01`;
    const prevEndDate = `${previousYear}-${previousMonthIndex + 1}-31`;

    const prevTransactions = transactions.data?.filter((t: any) => {
      const dateStr = String(t.date).split('T')[0];
      return dateStr >= prevStartDate && dateStr <= prevEndDate && t.type === 'INCOME' && t.status === 'CONCLUÍDO';
    }) || [];
    const prevReceita = prevTransactions.reduce((acc: number, t: any) => acc + Number(t.value), 0);
    const changeReceita = prevReceita > 0 ? ((receita - prevReceita) / prevReceita * 100).toFixed(1) : '0';

    const lucro = receita - custos;
    const prevLucro = prevReceita - custos;
    const changeLucro = prevLucro > 0 ? ((lucro - prevLucro) / Math.abs(prevLucro) * 100).toFixed(1) : '0';

    const productionJobs = production.data || [];
    const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
    const dailyProduction = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayJobs = productionJobs.filter((j: any) => {
        if (!j.created_at) return false;
        const jobDate = new Date(j.created_at);
        return jobDate.getDate() === day && jobDate.getMonth() === monthIndex && jobDate.getFullYear() === parseInt(year);
      }).length;
      return { label: day.toString(), val: dayJobs };
    });

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
    const normalizedChart = chartData.map(v => Math.round((v / maxChart) * 140) + 20);

    const clientTypes = clients.data?.reduce((acc: any, c: any) => {
      const type = c.type || 'Outro';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};
    const totalClients = Object.values(clientTypes).reduce((a: any, b: any) => a + b, 0) || 1;
    const typeColors: any = { 'B2B': 'var(--primary)', 'Prototipagem': 'var(--accent-cyan)', 'Hobbyista': '#F59E0B', 'Educação': 'var(--secondary)', 'Outro': '#6B7280' };
    const pieData = Object.entries(clientTypes).map(([label, val]: [string, any]) => ({
      label,
      val: Math.round((Number(val) / Number(totalClients)) * 100),
      color: typeColors[label] || typeColors['Outro']
    }));

    const alerts: any[] = [];
    const lowStockMaterials = materials.data?.filter((m: any) => m.weight_g < 500) || [];
    lowStockMaterials.forEach((m: any) => {
      alerts.push({ color: '#EF4444', title: `Estoque Baixo: ${m.name}`, desc: `${m.weight_g}g restantes. Repor em breve.`, time: 'Recente', type: 'material' });
    });
    const maintenancePrinters = printers.data?.filter((p: any) => p.status === 'MANUTENÇÃO') || [];
    maintenancePrinters.forEach((p: any) => {
      alerts.push({ color: '#F59E0B', title: `Manutenção: ${p.name}`, desc: 'Impressora em manutenção.', time: 'Recente', type: 'printer' });
    });
    const failedJobs = production.data?.filter((j: any) => j.status === 'FALHA') || [];
    if (failedJobs.length > 0) {
      alerts.push({ color: '#EF4444', title: `${failedJobs.length} falha(s) de impressão`, desc: 'Verificar jobs com falha.', time: 'Recente', type: 'production' });
    }
    if (alerts.length === 0) {
      alerts.push({ color: 'var(--secondary)', title: 'Tudo OK', desc: 'Nenhum alerta crítico no momento.', time: 'Agora', type: 'info' });
    }

    return {
      receita,
      custos,
      lucro,
      orcamentosPendentes,
      impressoesAtivas,
      impressorasTotal,
      impressorasAtivas,
      utilization: impressorasTotal > 0 ? Math.round((impressorasAtivas / impressorasTotal) * 100) : 0,
      materialsLowStock,
      printersMaintenance,
      changeReceita,
      changeLucro,
      productionData: dailyProduction,
      chartData: normalizedChart,
      pieData,
      alerts: alerts.slice(0, 5)
    };
  }
};

export default dashboardApi;