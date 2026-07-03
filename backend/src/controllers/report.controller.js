import path from 'path';
import fs from 'fs';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ReportService } from '../services/report.service.js';
import { getReportsDir } from '../utils/report-file.js';

const reportService = new ReportService();

export const generateReport = asyncHandler(async (req, res) => {
  const { reportType, format, filters } = req.body;
  const result = await reportService.generateReport(req.auth.userId, req.auth.roles, reportType, format, filters);
  return successResponse(res, { statusCode: 201, message: 'Report generated successfully', data: { reportJob: result } });
});

export const listJobs = asyncHandler(async (req, res) => {
  const result = await reportService.listJobs(req.auth.userId, req.auth.roles, req.query);
  return successResponse(res, { message: 'Report jobs retrieved successfully', data: result });
});

export const getJob = asyncHandler(async (req, res) => {
  const result = await reportService.getJob(req.auth.userId, req.auth.roles, req.params.id);
  return successResponse(res, { message: 'Report job retrieved successfully', data: result });
});

export const downloadReport = asyncHandler(async (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  const job = await reportService.downloadJob(req.auth.userId, req.auth.roles, req.params.id, ip, ua);
  const filePath = path.resolve(job.filePath);
  if (!fs.existsSync(filePath)) {
    return successResponse(res, { statusCode: 404, message: 'Report file not found on disk' });
  }
  res.download(filePath, job.fileName || 'report');
});

export const deleteJob = asyncHandler(async (req, res) => {
  await reportService.deleteJob(req.auth.userId, req.auth.roles, req.params.id);
  return successResponse(res, { message: 'Report job deleted successfully' });
});
