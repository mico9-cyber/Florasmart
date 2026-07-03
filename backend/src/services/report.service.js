import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';
import { generateCsv, generateCsvBuffer } from '../utils/csv.js';
import { generateFileName, writeReportFile, writeReportBuffer, deleteReportFile, getReportFileSize } from '../utils/report-file.js';
import { ReportGenerator } from './report-generator.service.js';
import * as reportRepo from '../repositories/report.repository.js';

const VALID_REPORT_TYPES = ['SALES', 'ORDERS', 'INVENTORY', 'PRODUCTS', 'DELIVERY', 'CUSTOMERS', 'LOYALTY', 'GARDEN_PLANS', 'CHATBOT', 'RECOMMENDATIONS'];
const VALID_FORMATS = ['CSV', 'JSON', 'PDF'];

const FLORIST_REPORT_TYPES = ['SALES', 'ORDERS', 'INVENTORY', 'PRODUCTS', 'DELIVERY'];
const CUSTOMER_REPORT_TYPES = ['ORDERS'];
const GARDENER_REPORT_TYPES = ['GARDEN_PLANS'];

export class ReportService {
  constructor() {
    this.generator = new ReportGenerator();
  }

  async generateReport(userId, userRoles, reportType, format, filters = {}) {
    if (!VALID_REPORT_TYPES.includes(reportType)) {
      throw new AppError(`Invalid report type: ${reportType}`, 400, 'INVALID_REPORT_TYPE');
    }
    if (!VALID_FORMATS.includes(format)) {
      throw new AppError(`Invalid format: ${format}`, 400, 'INVALID_FORMAT');
    }

    this.validateRoleAccess(userRoles, reportType);

    const job = await reportRepo.createJob({
      requestedById: userId,
      reportType,
      format,
      status: 'PROCESSING',
      filters: filters || {},
    });

    try {
      const data = await this.generator.generate(reportType, filters || {});
      const headers = this.generator.getHeaders(reportType);
      const fileName = generateFileName(reportType, format);
      let filePath;

      if (format === 'CSV') {
        const csv = generateCsv(headers, data);
        const buffer = generateCsvBuffer(csv);
        filePath = await writeReportBuffer(fileName, buffer);
      } else if (format === 'JSON') {
        const json = JSON.stringify({ reportType, generatedAt: new Date().toISOString(), filters: filters || {}, data }, null, 2);
        filePath = await writeReportFile(fileName, json);
      } else {
        const htmlRows = data.map(row => {
          const cells = headers.map(h => `<td>${String(row[h.key] ?? '')}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('\n');
        const headerCells = headers.map(h => `<th>${h.label}</th>`).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${reportType} Report</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#4CAF50;color:white}</style></head><body><h1>${reportType} Report</h1><p>Generated: ${new Date().toISOString()}</p><table><thead><tr>${headerCells}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
        filePath = await writeReportFile(fileName, html);
      }

      const fileSize = await getReportFileSize(filePath);
      const updated = await reportRepo.updateJob(job.id, {
        status: 'COMPLETED',
        filePath,
        fileName,
        fileSize,
        generatedAt: new Date(),
      });

      await logAuditEvent(getPrismaClient(), { action: 'report_generated', userId, reportType, format });
      return { ...updated, downloadUrl: `/api/v1/reports/jobs/${job.id}/download` };
    } catch (error) {
      await reportRepo.updateJob(job.id, { status: 'FAILED', errorMessage: error.message });
      await logAuditEvent(getPrismaClient(), { action: 'report_generation_failed', userId, reportType, format, error: error.message });
      throw new AppError(`Report generation failed: ${error.message}`, 500, 'REPORT_FAILED');
    }
  }

  validateRoleAccess(userRoles, reportType) {
    if (userRoles.includes('ADMIN')) return;
    if (userRoles.includes('FLORIST') && FLORIST_REPORT_TYPES.includes(reportType)) return;
    if (userRoles.includes('CUSTOMER') && CUSTOMER_REPORT_TYPES.includes(reportType)) return;
    if (userRoles.includes('GARDENER') && GARDENER_REPORT_TYPES.includes(reportType)) return;
    throw new AppError('You do not have permission to generate this report type', 403, 'FORBIDDEN_REPORT');
  }

  canAccessJob(userRoles, job) {
    if (userRoles.includes('ADMIN')) return true;
    if (userRoles.includes('FLORIST') && job.requestedById) {
      return true;
    }
    return job.requestedById === job.requestedById;
  }

  async listJobs(userId, userRoles, query) {
    if (userRoles.includes('ADMIN')) {
      return reportRepo.findJobs(query);
    }
    return reportRepo.findJobs({ ...query, requestedById: userId });
  }

  async getJob(userId, userRoles, jobId) {
    const job = await reportRepo.findJobById(jobId);
    if (!job) throw new AppError('Report job not found', 404, 'JOB_NOT_FOUND');
    if (!userRoles.includes('ADMIN') && job.requestedById !== userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    return job;
  }

  async downloadJob(userId, userRoles, jobId, ipAddress, userAgent) {
    const job = await this.getJob(userId, userRoles, jobId);
    if (job.status !== 'COMPLETED' || !job.filePath) {
      throw new AppError('Report file not available', 404, 'FILE_NOT_FOUND');
    }
    await reportRepo.logDownload(jobId, userId, ipAddress, userAgent);
    await logAuditEvent(getPrismaClient(), { action: 'report_downloaded', userId, jobId });
    return job;
  }

  async deleteJob(userId, userRoles, jobId) {
    const job = await reportRepo.findJobById(jobId);
    if (!job) throw new AppError('Report job not found', 404, 'JOB_NOT_FOUND');
    if (!userRoles.includes('ADMIN') && job.requestedById !== userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    if (job.filePath) {
      await deleteReportFile(job.filePath);
    }
    await reportRepo.deleteJob(jobId);
    await logAuditEvent(getPrismaClient(), { action: 'report_deleted', userId, jobId });
  }
}
