import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.resolve(__dirname, '../../reports');

export function getReportsDir() {
  return REPORTS_DIR;
}

export function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 200);
}

export function generateFileName(reportType, format) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeType = sanitizeFileName(reportType.toLowerCase());
  return `${safeType}_${timestamp}.${format.toLowerCase()}`;
}

export async function ensureReportsDir() {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  } catch {
  }
}

export async function writeReportFile(fileName, content) {
  await ensureReportsDir();
  const filePath = path.join(REPORTS_DIR, fileName);
  await fs.writeFile(filePath, content);
  return filePath;
}

export async function writeReportBuffer(fileName, buffer) {
  await ensureReportsDir();
  const filePath = path.join(REPORTS_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function deleteReportFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
  }
}

export async function getReportFileSize(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}
