function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
  downloadFile(filename, csv, 'text/csv;charset=utf-8');
}

export function downloadReport(filename, title, sections = []) {
  const generatedAt = new Date().toLocaleString();
  const body = [
    title,
    `Generated: ${generatedAt}`,
    '',
    ...sections.flatMap((section) => [
      section.heading,
      ...(section.lines || []),
      '',
    ]),
  ].join('\n');

  downloadFile(filename, body, 'text/plain;charset=utf-8');
}
