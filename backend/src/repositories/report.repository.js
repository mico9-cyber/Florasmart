import { getPrismaClient } from '../database/prisma.js';

function db() {
  return getPrismaClient();
}

export async function createJob(data) {
  return db().reportJob.create({ data });
}

export async function findJobById(id) {
  return db().reportJob.findUnique({
    where: { id },
    include: { requestedBy: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateJob(id, data) {
  return db().reportJob.update({ where: { id }, data });
}

export async function findJobs(query) {
  const { requestedById, reportType, format, status, dateFrom, dateTo } = query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const where = {};
  if (requestedById) where.requestedById = requestedById;
  if (reportType) where.reportType = reportType;
  if (format) where.format = format;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    db().reportJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { requestedBy: { select: { id: true, name: true, email: true } } },
    }),
    db().reportJob.count({ where }),
  ]);
  return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function deleteJob(id) {
  return db().reportJob.delete({ where: { id } });
}

export async function logDownload(reportJobId, downloadedById, ipAddress, userAgent) {
  return db().reportDownload.create({
    data: { reportJobId, downloadedById, ipAddress, userAgent },
  });
}

export async function getDownloadCount(reportJobId) {
  return db().reportDownload.count({ where: { reportJobId } });
}
