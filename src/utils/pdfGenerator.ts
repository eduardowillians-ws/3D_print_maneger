import { jsPDF } from 'jspdf';

interface ProductionReportData {
  id: string;
  product_name: string;
  quantity: number;
  quantity_good: number;
  quantity_bad: number;
  quality_checked: boolean;
  quality_notes: string;
  target_hotend: number;
  target_bed: number;
  speed_percentage: number;
  created_at: string;
  end_time: string | null;
  printer_name: string;
}

export const generateProductionPDF = (jobs: ProductionReportData[], month?: string, year?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors matching the app theme
  const primaryColor = '#8B5CF6';
  const textColor = '#374151';
  const mutedColor = '#9CA3AF';
  const borderColor = '#E5E7EB';
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE PRODUÇÃO', pageWidth / 2, 18, { align: 'center' });
  
  if (month || year) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${month || ''} ${year || ''}`.trim(), pageWidth / 2, 28, { align: 'center' });
  }
  
  doc.setTextColor(textColor);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 32, { align: 'center' });
  
  let yPos = 45;
  
  // Summary section
  const totalJobs = jobs.length;
  const totalUnits = jobs.reduce((acc, j) => acc + (j.quantity || 0), 0);
  const goodUnits = jobs.reduce((acc, j) => acc + (j.quantity_good || 0), 0);
  const badUnits = jobs.reduce((acc, j) => acc + (j.quantity_bad || 0), 0);
  const efficiency = totalUnits > 0 ? Math.round((goodUnits / totalUnits) * 100) : 0;
  
  doc.setFillColor(249, 250, 251);
  doc.rect(10, yPos, pageWidth - 20, 30, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO', 15, yPos + 8);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Ordens: ${totalJobs}`, 15, yPos + 16);
  doc.text(`Total de Peças: ${totalUnits}`, 70, yPos + 16);
  doc.text(`Peças Boas: ${goodUnits}`, 120, yPos + 16);
  doc.text(`Peças Ruins: ${badUnits}`, 15, yPos + 22);
  doc.text(`Eficiência: ${efficiency}%`, 70, yPos + 22);
  
  yPos += 40;
  
  // Table header
  const headers = ['Peça', 'Qtd', 'Boas', 'Ruins', 'Efic.', 'Temp.Bico', 'Temp.Mesa', 'Vel.%', 'Impressora'];
  const colWidths = [40, 15, 15, 15, 15, 20, 20, 15, 30];
  let xPos = 10;
  
  doc.setFillColor(primaryColor);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  headers.forEach((header, i) => {
    doc.text(header, xPos + 2, yPos + 5.5);
    xPos += colWidths[i];
  });
  
  yPos += 8;
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'normal');
  
  // Table rows
  jobs.forEach((job, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(10, yPos, pageWidth - 20, 8, 'F');
    }
    
    xPos = 10;
    const jobEfficiency = job.quantity > 0 ? Math.round(((job.quantity_good || 0) / job.quantity) * 100) : 0;
    
    const rowData = [
      (job.product_name || '').substring(0, 18),
      (job.quantity || 0).toString(),
      (job.quantity_good || 0).toString(),
      (job.quantity_bad || 0).toString(),
      `${jobEfficiency}%`,
      `${job.target_hotend || 200}°C`,
      `${job.target_bed || 60}°C`,
      `${job.speed_percentage || 100}%`,
      (job.printer_name || '-').substring(0, 12)
    ];
    
    doc.setFontSize(8);
    rowData.forEach((cell, i) => {
      doc.text(cell, xPos + 2, yPos + 5.5);
      xPos += colWidths[i];
    });
    
    yPos += 8;
  });
  
  // Quality notes section
  const jobsWithNotes = jobs.filter(j => j.quality_notes);
  if (jobsWithNotes.length > 0) {
    yPos += 5;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES DE QUALIDADE', 10, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    jobsWithNotes.forEach(job => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${job.product_name}:`, 10, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(job.quality_notes || '-', 60, yPos);
      yPos += 6;
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(mutedColor);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    doc.text('3D Print Manager', 10, 290);
  }
  
  return doc;
};

export const downloadProductionPDF = (jobs: ProductionReportData[], month?: string, year?: string) => {
  const doc = generateProductionPDF(jobs, month, year);
  const fileName = `relatorio-producao-${month || 'todos'}-${year || new Date().getFullYear()}.pdf`;
  doc.save(fileName);
};

export const previewProductionPDF = (jobs: ProductionReportData[], month?: string, year?: string) => {
  const doc = generateProductionPDF(jobs, month, year);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};