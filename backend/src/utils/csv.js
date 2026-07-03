export function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(headers, rows) {
  const headerLine = headers.map(h => escapeCsvValue(h.label)).join(',');
  const dataLines = rows.map(row => {
    return headers.map(h => escapeCsvValue(row[h.key])).join(',');
  });
  return [headerLine, ...dataLines].join('\r\n');
}

export function generateCsvBuffer(csvContent) {
  const BOM = '\uFEFF';
  return Buffer.from(BOM + csvContent, 'utf-8');
}
