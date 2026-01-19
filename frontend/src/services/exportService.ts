import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportSection {
  title: string;
  data: Record<string, unknown>[] | Record<string, unknown>;
  columns?: { key: string; label: string }[];
}

export interface ExportConfig {
  title: string;
  filename: string;
  data?: Record<string, unknown>[] | Record<string, unknown>;
  columns?: { key: string; label: string }[];
  sections?: ExportSection[];
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
}

function renderSectionToPDF(
  doc: jsPDF,
  sectionTitle: string,
  data: Record<string, unknown>[] | Record<string, unknown>,
  yPosition: number
): number {
  // Section title
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(0, 120, 212);
  doc.setFont('helvetica', 'bold');
  doc.text(sectionTitle, 20, yPosition);
  yPosition += 8;

  doc.setTextColor(0, 0, 0);

  if (Array.isArray(data) && data.length > 0) {
    // Table data - auto-detect columns from first row
    const columns = Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));

    doc.setFontSize(9);

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition - 5, 170, 7, 'F');
    doc.setFont('helvetica', 'bold');

    let xPosition = 22;
    const colWidth = Math.min(170 / columns.length, 40);

    columns.slice(0, 5).forEach(col => { // Limit to 5 columns
      doc.text(col.label.substring(0, 15), xPosition, yPosition);
      xPosition += colWidth;
    });

    yPosition += 7;
    doc.setFont('helvetica', 'normal');

    // Table rows (limit to 20 rows for PDF)
    data.slice(0, 20).forEach((row, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPosition - 4, 170, 6, 'F');
      }

      xPosition = 22;
      columns.slice(0, 5).forEach(col => {
        const value = formatValue(row[col.key]);
        doc.text(value.substring(0, 18), xPosition, yPosition);
        xPosition += colWidth;
      });
      yPosition += 6;
    });

    if (data.length > 20) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`... and ${data.length - 20} more rows (see Excel export for full data)`, 22, yPosition);
      yPosition += 8;
    }
  } else if (!Array.isArray(data) && data) {
    // Key-value data
    doc.setFontSize(10);
    Object.entries(data).forEach(([key, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', 22, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(formatValue(value), 80, yPosition);
      yPosition += 7;
    });
  }

  return yPosition + 8;
}

export async function exportToPDF(config: ExportConfig): Promise<void> {
  const { title, filename, data, columns, sections } = config;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 120, 212); // D365 blue
  doc.text(title, 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${formatDate()}`, 20, 28);
  doc.text('Retail AI Agent Portal', 20, 34);

  // Divider line
  doc.setDrawColor(0, 120, 212);
  doc.setLineWidth(0.5);
  doc.line(20, 38, 190, 38);

  let yPosition = 48;

  // Handle sections if provided
  if (sections && sections.length > 0) {
    sections.forEach(section => {
      yPosition = renderSectionToPDF(doc, section.title, section.data, yPosition);
    });
  } else if (data) {
    // Legacy single data support
    if (Array.isArray(data) && columns) {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition - 6, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');

      let xPosition = 22;
      const colWidth = 170 / columns.length;

      columns.forEach(col => {
        doc.text(col.label, xPosition, yPosition);
        xPosition += colWidth;
      });

      yPosition += 8;
      doc.setFont('helvetica', 'normal');

      data.forEach((row, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, yPosition - 5, 170, 7, 'F');
        }

        xPosition = 22;
        columns.forEach(col => {
          const value = formatValue(row[col.key]);
          doc.text(value.substring(0, 30), xPosition, yPosition);
          xPosition += colWidth;
        });
        yPosition += 7;
      });
    } else if (!Array.isArray(data)) {
      doc.setFontSize(11);
      Object.entries(data).forEach(([key, value]) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(key + ':', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formatValue(value), 80, yPosition);
        yPosition += 8;
      });
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 20, 285);
    doc.text('Retail AI Agent Portal - Confidential', 130, 285);
  }

  doc.save(`${filename}.pdf`);
}

function addSectionToWorkbook(
  workbook: XLSX.WorkBook,
  sectionTitle: string,
  data: Record<string, unknown>[] | Record<string, unknown>,
  sheetIndex: number
): void {
  const sheetName = `${sheetIndex + 1}. ${sectionTitle}`.substring(0, 31);

  if (Array.isArray(data) && data.length > 0) {
    const columns = Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));

    const wsData = [
      columns.map(c => c.label),
      ...data.map(row => columns.map(c => formatValue(row[c.key])))
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    worksheet['!cols'] = columns.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  } else if (!Array.isArray(data) && data) {
    const wsData = Object.entries(data).map(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      return [label, formatValue(value)];
    });
    const worksheet = XLSX.utils.aoa_to_sheet([['Property', 'Value'], ...wsData]);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
}

export async function exportToExcel(config: ExportConfig): Promise<void> {
  const { title, filename, data, columns, sections } = config;

  const workbook = XLSX.utils.book_new();

  if (sections && sections.length > 0) {
    sections.forEach((section, index) => {
      addSectionToWorkbook(workbook, section.title, section.data, index);
    });
  } else if (data) {
    if (Array.isArray(data) && columns) {
      const wsData = [
        columns.map(c => c.label),
        ...data.map(row => columns.map(c => row[c.key]))
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      worksheet['!cols'] = columns.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31));
    } else if (!Array.isArray(data)) {
      const wsData = Object.entries(data).map(([key, value]) => [key, formatValue(value)]);
      const worksheet = XLSX.utils.aoa_to_sheet([['Property', 'Value'], ...wsData]);
      worksheet['!cols'] = [{ wch: 30 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31));
    }
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

function sectionToCSV(
  sectionTitle: string,
  data: Record<string, unknown>[] | Record<string, unknown>
): string {
  let content = `\n### ${sectionTitle} ###\n`;

  if (Array.isArray(data) && data.length > 0) {
    const columns = Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));

    content += columns.map(c => `"${c.label}"`).join(',') + '\n';
    data.forEach(row => {
      const rowData = columns.map(c => {
        const value = formatValue(row[c.key]);
        return `"${value.replace(/"/g, '""')}"`;
      });
      content += rowData.join(',') + '\n';
    });
  } else if (!Array.isArray(data) && data) {
    content += 'Property,Value\n';
    Object.entries(data).forEach(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      content += `"${label}","${formatValue(value).replace(/"/g, '""')}"\n`;
    });
  }

  return content;
}

export async function exportToCSV(config: ExportConfig): Promise<void> {
  const { filename, data, columns, sections } = config;

  let csvContent = '';

  if (sections && sections.length > 0) {
    sections.forEach(section => {
      csvContent += sectionToCSV(section.title, section.data);
    });
  } else if (data) {
    if (Array.isArray(data) && columns) {
      csvContent = columns.map(c => `"${c.label}"`).join(',') + '\n';
      data.forEach(row => {
        const rowData = columns.map(c => {
          const value = formatValue(row[c.key]);
          return `"${value.replace(/"/g, '""')}"`;
        });
        csvContent += rowData.join(',') + '\n';
      });
    } else if (!Array.isArray(data)) {
      csvContent = 'Property,Value\n';
      Object.entries(data).forEach(([key, value]) => {
        csvContent += `"${key}","${formatValue(value).replace(/"/g, '""')}"\n`;
      });
    }
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportData(format: ExportFormat, config: ExportConfig): Promise<void> {
  switch (format) {
    case 'pdf':
      return exportToPDF(config);
    case 'excel':
      return exportToExcel(config);
    case 'csv':
      return exportToCSV(config);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
