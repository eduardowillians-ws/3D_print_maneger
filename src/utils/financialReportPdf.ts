import { jsPDF } from 'jspdf';

export interface FinancialReportData {
  monthLabel: string;
  yearLabel: string;
  dateRange?: string;

  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  avgTicket: number;
  transactionCount: number;

  approvedQuotes: number;
  rejectedQuotes: number;
  pendingQuotes: number;
  sentQuotes: number;
  conversionRate: number;

  totalProduced: number;

  revenueByClient: { name: string; total: number; count: number }[];
  revenueByProduct: { name: string; total: number; quantity: number }[];
  ordersByClient: { name: string; count: number }[];
  ltvByClient: { name: string; ltv: number }[];

  monthlyData: { label: string; income: number; expense: number }[];
}

const primary: [number, number, number] = [139, 92, 246];
const primaryDark: [number, number, number] = [109, 40, 217];
const secondary: [number, number, number] = [74, 225, 118];
const danger: [number, number, number] = [239, 68, 68];
const warning: [number, number, number] = [245, 158, 11];
const textDark: [number, number, number] = [55, 65, 81];
const textMuted: [number, number, number] = [156, 163, 175];
const bgLight: [number, number, number] = [249, 250, 251];
const border: [number, number, number] = [229, 231, 235];
const white: [number, number, number] = [255, 255, 255];

function drawHeader(doc: jsPDF, pageWidth: number, data: FinancialReportData) {
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATORIO FINANCEIRO', pageWidth / 2, 17, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text('PrintPulse 3D', pageWidth / 2, 27, { align: 'center' });

  const now = new Date();
  const dateStr = `Gerado em: ${now.toLocaleDateString('pt-BR')} as ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  const periodStr = data.dateRange || `${data.monthLabel} / ${data.yearLabel}`;

  doc.setFontSize(9);
  doc.text(`${dateStr}  |  Periodo: ${periodStr}`, pageWidth / 2, 37, { align: 'center' });
}

function drawSectionTitle(doc: jsPDF, y: number, title: string, pageWidth: number): number {
  doc.setFillColor(...primary);
  doc.roundedRect(10, y, pageWidth - 20, 8, 1, 1, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, y + 5.5);
  return y + 12;
}

function drawKPICard(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, color: [number, number, number]) {
  doc.setFillColor(...bgLight);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, 3, 1, 1, 'F');

  doc.setTextColor(...textMuted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + w / 2, y + 10, { align: 'center' });

  doc.setTextColor(...textDark);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(value, x + w / 2, y + 18, { align: 'center' });
}

function drawPieChart(doc: jsPDF, cx: number, cy: number, radius: number, slices: { label: string; value: number; color: [number, number, number] }[]) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;

  slices.forEach((slice) => {
    if (slice.value <= 0) return;
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    const steps = 40;
    const points: [number, number][] = [];
    points.push([cx, cy]);

    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i) / steps;
      points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }

    doc.setFillColor(...slice.color);
    doc.setDrawColor(...white);
    doc.setLineWidth(0.5);

    doc.lines(
      points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]]),
      points[0][0],
      points[0][1],
      [1, 1],
      'F'
    );

    if (sliceAngle > 0.3) {
      const midAngle = startAngle + sliceAngle / 2;
      const lx = cx + (radius * 0.65) * Math.cos(midAngle);
      const ly = cy + (radius * 0.65) * Math.sin(midAngle);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(`${Math.round((slice.value / total) * 100)}%`, lx, ly + 1.5, { align: 'center' });
    }

    startAngle = endAngle;
  });
}

function drawBarChart(doc: jsPDF, x: number, y: number, w: number, h: number, data: { label: string; income: number; expense: number }[]) {
  doc.setFillColor(...bgLight);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
  const barAreaTop = y + 8;
  const barAreaH = h - 20;
  const barW = Math.min(8, (w - 20) / data.length / 2.5);

  doc.setTextColor(...textDark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('FATURAMENTO MENSAL', x + w / 2, y + 5, { align: 'center' });

  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const gy = barAreaTop + (barAreaH * i) / gridLines;
    doc.setDrawColor(...border);
    doc.setLineWidth(0.2);
    doc.line(x + 10, gy, x + w - 10, gy);

    const val = maxVal - (maxVal * i) / gridLines;
    doc.setTextColor(...textMuted);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0), x + 8, gy + 1.5, { align: 'right' });
  }

  const totalBars = data.length;
  const availableWidth = w - 24;
  const barSpacing = availableWidth / totalBars;

  data.forEach((d, i) => {
    const bx = x + 12 + i * barSpacing;

    const incomeH = (d.income / maxVal) * barAreaH;
    doc.setFillColor(...primary);
    doc.roundedRect(bx, barAreaTop + barAreaH - incomeH, barW, incomeH, 0.5, 0.5, 'F');

    const expenseH = (d.expense / maxVal) * barAreaH;
    doc.setFillColor(...danger);
    doc.roundedRect(bx + barW + 1, barAreaTop + barAreaH - expenseH, barW, expenseH, 0.5, 0.5, 'F');

    if (totalBars <= 12) {
      doc.setTextColor(...textMuted);
      doc.setFontSize(5);
      doc.setFont('helvetica', 'normal');
      doc.text(d.label.substring(0, 3), bx + barW, y + h - 3, { align: 'center' });
    }
  });

  doc.setFillColor(...primary);
  doc.roundedRect(x + 10, y + h - 5, 4, 3, 0.5, 0.5, 'F');
  doc.setTextColor(...textDark);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text('Receita', x + 16, y + h - 2.5);

  doc.setFillColor(...danger);
  doc.roundedRect(x + 40, y + h - 5, 4, 3, 0.5, 0.5, 'F');
  doc.text('Despesa', x + 46, y + h - 2.5);
}

function drawTable(doc: jsPDF, x: number, y: number, w: number, headers: string[], rows: string[][], colWidths: number[]): number {
  const headerH = 7;
  const rowH = 6;

  doc.setFillColor(...primary);
  doc.rect(x, y, w, headerH, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');

  let hx = x;
  headers.forEach((h, i) => {
    doc.text(h, hx + 2, y + 5);
    hx += colWidths[i];
  });

  let ty = y + headerH;
  rows.forEach((row, ri) => {
    if (ty > 270) {
      doc.addPage();
      ty = 15;
    }

    if (ri % 2 === 0) {
      doc.setFillColor(...bgLight);
      doc.rect(x, ty, w, rowH, 'F');
    }

    doc.setTextColor(...textDark);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    let rx = x;
    row.forEach((cell, ci) => {
      doc.text(cell, rx + 2, ty + 4.5);
      rx += colWidths[ci];
    });
    ty += rowH;
  });

  return ty;
}

function drawLegendItem(doc: jsPDF, x: number, y: number, color: [number, number, number], label: string, value: string) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, 4, 4, 0.5, 0.5, 'F');
  doc.setTextColor(...textDark);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + 6, y + 3);
  doc.setFont('helvetica', 'bold');
  doc.text(value, x + 50, y + 3);
}

export function generateFinancialReportPDF(data: FinancialReportData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  drawHeader(doc, pageWidth, data);
  let yPos = 50;

  yPos = drawSectionTitle(doc, yPos, 'INDICADORES PRINCIPAIS', pageWidth);
  const kpiW = (pageWidth - 30) / 4;
  drawKPICard(doc, 10, yPos, kpiW, 22, 'RECEITA TOTAL', `R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, primary);
  drawKPICard(doc, 10 + kpiW + 3, yPos, kpiW, 22, 'CUSTOS TOTAIS', `R$ ${data.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, danger);
  drawKPICard(doc, 10 + (kpiW + 3) * 2, yPos, kpiW, 22, 'LUCRO LIQUIDO', `R$ ${data.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, secondary);
  drawKPICard(doc, 10 + (kpiW + 3) * 3, yPos, kpiW, 22, 'TICKET MEDIO', `R$ ${data.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, primaryDark);
  yPos += 28;

  drawKPICard(doc, 10, yPos, kpiW, 22, 'TRANSACOES', `${data.transactionCount}`, warning);
  drawKPICard(doc, 10 + kpiW + 3, yPos, kpiW, 22, 'PECAS PRODUZIDAS', `${data.totalProduced}`, secondary);
  drawKPICard(doc, 10 + (kpiW + 3) * 2, yPos, kpiW, 22, 'TAXA CONVERSAO', `${data.conversionRate.toFixed(1)}%`, primary);
  drawKPICard(doc, 10 + (kpiW + 3) * 3, yPos, kpiW, 22, 'ORCAMENTOS TOTAL', `${data.approvedQuotes + data.rejectedQuotes + data.pendingQuotes + data.sentQuotes}`, primaryDark);
  yPos += 28;

  yPos = drawSectionTitle(doc, yPos, 'ORCAMENTOS POR STATUS', pageWidth);
  const pieX = 50;
  const pieY = yPos + 30;
  const pieR = 22;

  const pieSlices = [
    { label: 'Aprovados', value: data.approvedQuotes, color: secondary },
    { label: 'Rejeitados', value: data.rejectedQuotes, color: danger },
    { label: 'Pendentes', value: data.pendingQuotes, color: warning },
    { label: 'Enviados', value: data.sentQuotes, color: primary },
  ].filter(s => s.value > 0);

  drawPieChart(doc, pieX, pieY, pieR, pieSlices);

  let legendY = yPos + 10;
  const totalQuotes = data.approvedQuotes + data.rejectedQuotes + data.pendingQuotes + data.sentQuotes;
  [
    { label: 'Aprovados', value: data.approvedQuotes, color: secondary },
    { label: 'Rejeitados', value: data.rejectedQuotes, color: danger },
    { label: 'Pendentes', value: data.pendingQuotes, color: warning },
    { label: 'Enviados', value: data.sentQuotes, color: primary },
  ].forEach((item) => {
    if (item.value > 0) {
      const pct = totalQuotes > 0 ? ((item.value / totalQuotes) * 100).toFixed(1) : '0';
      drawLegendItem(doc, 90, legendY, item.color, `${item.label}: ${item.value}`, `${pct}%`);
      legendY += 7;
    }
  });

  yPos += 68;

  if (yPos > 220) {
    doc.addPage();
    yPos = 15;
  }

  yPos = drawSectionTitle(doc, yPos, 'FATURAMENTO MENSAL', pageWidth);
  const chartH = 65;
  if (data.monthlyData.length > 0) {
    drawBarChart(doc, 10, yPos, pageWidth - 20, chartH, data.monthlyData);
  }
  yPos += chartH + 8;

  if (yPos > 200) {
    doc.addPage();
    yPos = 15;
  }

  if (data.revenueByClient.length > 0) {
    yPos = drawSectionTitle(doc, yPos, 'FATURAMENTO POR CLIENTE', pageWidth);
    const clientRows = data.revenueByClient.slice(0, 10).map(c => [
      c.name.substring(0, 25),
      `${c.count}`,
      `R$ ${c.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]);
    yPos = drawTable(doc, 10, yPos, pageWidth - 20, ['CLIENTE', 'PEDIDOS', 'FATURAMENTO'], clientRows, [80, 30, 60]);
    yPos += 5;
  }

  if (yPos > 200) {
    doc.addPage();
    yPos = 15;
  }

  if (data.ltvByClient.length > 0) {
    yPos = drawSectionTitle(doc, yPos, 'LTV POR CLIENTE (Lifetime Value)', pageWidth);
    const ltvRows = data.ltvByClient.slice(0, 10).map(c => [
      c.name.substring(0, 30),
      `R$ ${c.ltv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]);
    yPos = drawTable(doc, 10, yPos, pageWidth - 20, ['CLIENTE', 'LTV TOTAL'], ltvRows, [110, 60]);
    yPos += 5;
  }

  if (yPos > 200) {
    doc.addPage();
    yPos = 15;
  }

  if (data.revenueByProduct.length > 0) {
    yPos = drawSectionTitle(doc, yPos, 'FATURAMENTO POR PRODUTO', pageWidth);
    const prodRows = data.revenueByProduct.slice(0, 10).map(p => [
      p.name.substring(0, 30),
      `${p.quantity}`,
      `R$ ${p.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]);
    yPos = drawTable(doc, 10, yPos, pageWidth - 20, ['PRODUTO', 'QTD VENDIDA', 'FATURAMENTO'], prodRows, [80, 30, 60]);
    yPos += 5;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(`Pagina ${i} de ${pageCount}`, pageWidth / 2, 292, { align: 'center' });
    doc.text('PrintPulse 3D - Relatorio Financeiro', 10, 292);
  }

  return doc;
}

export function downloadFinancialReportPDF(data: FinancialReportData) {
  const doc = generateFinancialReportPDF(data);
  const monthSlug = data.monthLabel.toLowerCase().replace(/\s+/g, '-');
  doc.save(`relatorio-financeiro-${monthSlug}-${data.yearLabel}.pdf`);
}

export function previewFinancialReportPDF(data: FinancialReportData) {
  const doc = generateFinancialReportPDF(data);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
