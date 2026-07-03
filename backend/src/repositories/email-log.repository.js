import { getPrismaClient } from '../database/prisma.js';

function db() {
  return getPrismaClient();
}

export async function findEmailLogs(query = {}) {
  const { status, toEmail, templateName, dateFrom, dateTo, page = 1, limit = 20 } = query;
  const where = {};
  if (status) where.status = status;
  if (toEmail) where.toEmail = { contains: toEmail };
  if (templateName) where.templateName = templateName;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  const skip = (Number(page) || 1) - 1;
  const take = Math.min(Number(limit) || 20, 100);
  const [logs, total] = await Promise.all([
    db().emailLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: skip * take,
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db().emailLog.count({ where }),
  ]);
  return { logs, total, page: Number(page) || 1, limit: take, totalPages: Math.ceil(total / take) || 1 };
}
