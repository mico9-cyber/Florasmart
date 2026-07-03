import { getPrismaClient } from '../database/prisma.js';

function db() {
  return getPrismaClient();
}

export async function countUsersByRole() {
  const roles = await db().role.findMany({
    where: { name: { in: ['ADMIN', 'FLORIST', 'CUSTOMER', 'GARDENER'] } },
    select: { id: true, name: true },
  });
  const results = {};
  for (const role of roles) {
    results[role.name.toLowerCase() + 's'] = await db().userRole.count({
      where: { roleId: role.id },
    });
  }
  results.total = Object.values(results).reduce((a, b) => a + b, 0);
  return results;
}

export async function countOrdersByStatus() {
  const rows = await db().order.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  const result = {};
  for (const row of rows) {
    result[row.status.toLowerCase()] = row._count.id;
  }
  result.total = rows.reduce((s, r) => s + r._count.id, 0);
  return result;
}

export async function countOrdersByPaymentStatus() {
  const rows = await db().order.groupBy({
    by: ['paymentStatus'],
    _count: { id: true },
  });
  const result = {};
  for (const row of rows) {
    result[row.paymentStatus.toLowerCase()] = row._count.id;
  }
  return result;
}

export async function getSalesSummary(dateFrom, dateTo) {
  const where = dateFrom && dateTo ? { createdAt: { gte: dateFrom, lte: dateTo } } : {};
  const agg = await db().order.aggregate({
    _sum: { totalAmount: true },
    _count: { id: true },
    where: { ...where, status: { not: 'CANCELLED' } },
  });
  const totalRevenue = Number(agg._sum.totalAmount) || 0;
  const totalOrders = agg._count.id || 0;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  return { totalRevenue, totalOrders, averageOrderValue };
}

export async function getSalesByDateRange(dateFrom, dateTo, groupBy) {
  const format = groupBy === 'month' ? '%Y-%m'
    : groupBy === 'week' ? '%Y-W%V'
    : '%Y-%m-%d';
  const raw = await db().$queryRawUnsafe(`
    SELECT DATE_FORMAT(createdAt, '${format}') as period,
           COUNT(*) as orderCount,
           COALESCE(SUM(totalAmount), 0) as revenue
    FROM orders
    WHERE createdAt >= ? AND createdAt <= ? AND status != 'CANCELLED'
    GROUP BY period
    ORDER BY period ASC
  `, dateFrom, dateTo);
  return raw.map(r => ({
    period: r.period,
    orderCount: Number(r.orderCount),
    revenue: Number(r.revenue),
  }));
}

export async function getTopSellingProducts(limit = 10) {
  const raw = await db().$queryRawUnsafe(`
    SELECT oi.productId, p.name as productName, p.sku,
           COUNT(oi.id) as orderCount,
           COALESCE(SUM(oi.subtotal), 0) as revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.orderId
    JOIN products p ON p.id = oi.productId
    WHERE o.status != 'CANCELLED'
    GROUP BY oi.productId, p.name, p.sku
    ORDER BY orderCount DESC
    LIMIT ?
  `, limit);
  return raw.map(r => ({
    productId: r.productId,
    productName: r.productName,
    sku: r.sku,
    orderCount: Number(r.orderCount),
    revenue: Number(r.revenue),
  }));
}

export async function getOrdersByStatus(dateFrom, dateTo) {
  const where = { createdAt: { gte: dateFrom, lte: dateTo } };
  const rows = await db().order.groupBy({
    by: ['status'],
    _count: { id: true },
    where,
  });
  const result = {};
  for (const row of rows) {
    result[row.status.toLowerCase()] = row._count.id;
  }
  result.total = rows.reduce((s, r) => s + r._count.id, 0);
  return result;
}

export async function getOrdersByDateRange(dateFrom, dateTo, groupBy) {
  const format = groupBy === 'month' ? '%Y-%m'
    : groupBy === 'week' ? '%Y-W%V'
    : '%Y-%m-%d';
  const raw = await db().$queryRawUnsafe(`
    SELECT DATE_FORMAT(createdAt, '${format}') as period,
           COUNT(*) as orderCount,
           COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) as cancelledCount
    FROM orders
    WHERE createdAt >= ? AND createdAt <= ?
    GROUP BY period
    ORDER BY period ASC
  `, dateFrom, dateTo);
  return raw.map(r => ({
    period: r.period,
    orderCount: Number(r.orderCount),
    cancelledCount: Number(r.cancelledCount),
  }));
}

export async function getRecentOrders(limit = 10) {
  const orders = await db().order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      currency: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return orders;
}

export async function getCancellationRate(dateFrom, dateTo) {
  const total = await db().order.count({
    where: { createdAt: { gte: dateFrom, lte: dateTo } },
  });
  const cancelled = await db().order.count({
    where: { createdAt: { gte: dateFrom, lte: dateTo }, status: 'CANCELLED' },
  });
  return { total, cancelled, rate: total > 0 ? Math.round((cancelled / total) * 100) : 0 };
}

export async function getInventorySummary() {
  const products = await db().product.count({ where: { deletedAt: null } });
  const lowStock = await db().product.count({ where: { stockStatus: 'low_stock', deletedAt: null } });
  const outOfStock = await db().product.count({ where: { stockStatus: 'out_of_stock', deletedAt: null } });
  const agg = await db().stockLevel.aggregate({
    _sum: { quantity: true },
    where: { product: { deletedAt: null } },
  });
  const totalStock = agg._sum.quantity || 0;
  const valueAgg = await db().$queryRawUnsafe(`
    SELECT COALESCE(SUM(sl.quantity * p.price), 0) as totalValue
    FROM stock_levels sl
    JOIN products p ON p.id = sl.productId
    WHERE p.deletedAt IS NULL
  `);
  const inventoryValue = Number(valueAgg[0]?.totalValue) || 0;
  return { totalProducts: products, totalStock, lowStockCount: lowStock, outOfStockCount: outOfStock, inventoryValue };
}

export async function getRecentStockMovements(limit = 10) {
  return db().inventoryMovement.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      movementType: true,
      quantity: true,
      reason: true,
      referenceType: true,
      createdAt: true,
      product: { select: { id: true, name: true, sku: true } },
      location: { select: { id: true, name: true } },
      performedBy: { select: { id: true, name: true } },
    },
  });
}

export async function getMostAdjustedProducts(limit = 10) {
  const raw = await db().$queryRawUnsafe(`
    SELECT p.id as productId, p.name as productName, p.sku,
           COUNT(im.id) as adjustmentCount,
           COALESCE(SUM(ABS(im.quantity)), 0) as totalAdjusted
    FROM inventory_movements im
    JOIN products p ON p.id = im.productId
    GROUP BY p.id, p.name, p.sku
    ORDER BY adjustmentCount DESC
    LIMIT ?
  `, limit);
  return raw.map(r => ({
    productId: r.productId,
    productName: r.productName,
    sku: r.sku,
    adjustmentCount: Number(r.adjustmentCount),
    totalAdjusted: Number(r.totalAdjusted),
  }));
}

export async function getDeliverySummary() {
  const rows = await db().delivery.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  const result = {};
  for (const row of rows) {
    result[row.status.toLowerCase()] = row._count.id;
  }
  result.total = rows.reduce((s, r) => s + r._count.id, 0);
  return result;
}

export async function getAverageDeliveryTime() {
  const raw = await db().$queryRawUnsafe(`
    SELECT COALESCE(AVG(TIMESTAMPDIFF(HOUR, createdAt, deliveredAt)), 0) as avgHours
    FROM deliveries
    WHERE deliveredAt IS NOT NULL
  `);
  return Number(raw[0]?.avgHours) || 0;
}

export async function getRecentDeliveries(limit = 10) {
  return db().delivery.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      deliveredAt: true,
      failedAt: true,
      failureReason: true,
      createdAt: true,
      order: { select: { id: true, orderNumber: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
}

export async function getProductCategoryBreakdown() {
  const raw = await db().$queryRawUnsafe(`
    SELECT pc.id as categoryId, pc.name as categoryName,
           COUNT(p.id) as productCount,
           COALESCE(SUM(CASE WHEN p.featured = 1 THEN 1 ELSE 0 END), 0) as featuredCount,
           COALESCE(SUM(CASE WHEN p.stockStatus = 'low_stock' THEN 1 ELSE 0 END), 0) as lowStockCount,
           COALESCE(SUM(CASE WHEN p.stockStatus = 'out_of_stock' THEN 1 ELSE 0 END), 0) as outOfStockCount
    FROM product_categories pc
    LEFT JOIN products p ON p.categoryId = pc.id AND p.deletedAt IS NULL AND p.active = 1
    WHERE pc.deletedAt IS NULL
    GROUP BY pc.id, pc.name
    ORDER BY productCount DESC
  `);
  return raw.map(r => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    productCount: Number(r.productCount),
    featuredCount: Number(r.featuredCount),
    lowStockCount: Number(r.lowStockCount),
    outOfStockCount: Number(r.outOfStockCount),
  }));
}

export async function getProductStockStatusCounts() {
  const rows = await db().product.groupBy({
    by: ['stockStatus'],
    _count: { id: true },
    where: { deletedAt: null, active: true },
  });
  const result = {};
  for (const row of rows) {
    result[row.stockStatus] = row._count.id;
  }
  return result;
}

export async function getProductRevenue() {
  const raw = await db().$queryRawUnsafe(`
    SELECT p.id as productId, p.name as productName, p.sku,
           COALESCE(SUM(oi.subtotal), 0) as totalRevenue,
           COUNT(DISTINCT oi.orderId) as orderCount
    FROM products p
    LEFT JOIN order_items oi ON oi.productId = p.id
    LEFT JOIN orders o ON o.id = oi.orderId AND o.status != 'CANCELLED'
    WHERE p.deletedAt IS NULL
    GROUP BY p.id, p.name, p.sku
    ORDER BY totalRevenue DESC
  `);
  return raw.map(r => ({
    productId: r.productId,
    productName: r.productName,
    sku: r.sku,
    totalRevenue: Number(r.totalRevenue),
    orderCount: Number(r.orderCount),
  }));
}

export async function countCustomers() {
  const role = await db().role.findFirst({ where: { name: 'CUSTOMER' } });
  if (!role) return 0;
  return db().userRole.count({ where: { roleId: role.id } });
}

export async function countNewCustomers(dateFrom, dateTo) {
  const role = await db().role.findFirst({ where: { name: 'CUSTOMER' } });
  if (!role) return 0;
  const userIds = await db().userRole.findMany({
    where: { roleId: role.id },
    select: { userId: true },
  });
  const ids = userIds.map(u => u.userId);
  if (ids.length === 0) return 0;
  return db().user.count({
    where: { id: { in: ids }, createdAt: { gte: dateFrom, lte: dateTo } },
  });
}

export async function countActiveCustomers(dateFrom, dateTo) {
  const role = await db().role.findFirst({ where: { name: 'CUSTOMER' } });
  if (!role) return 0;
  const userIds = await db().userRole.findMany({
    where: { roleId: role.id },
    select: { userId: true },
  });
  const ids = userIds.map(u => u.userId);
  if (ids.length === 0) return 0;
  const orderUsers = await db().order.groupBy({
    by: ['userId'],
    _count: { id: true },
    where: { userId: { in: ids }, createdAt: { gte: dateFrom, lte: dateTo } },
  });
  return orderUsers.length;
}

export async function countCustomersWithOrders() {
  const raw = await db().$queryRawUnsafe(`
    SELECT COUNT(DISTINCT userId) as count FROM orders
  `);
  return Number(raw[0]?.count) || 0;
}

export async function countCustomersWithGardenPlans() {
  const raw = await db().$queryRawUnsafe(`
    SELECT COUNT(DISTINCT userId) as count FROM garden_plans WHERE deletedAt IS NULL
  `);
  return Number(raw[0]?.count) || 0;
}

export async function countCustomersWithChatbot() {
  const raw = await db().$queryRawUnsafe(`
    SELECT COUNT(DISTINCT userId) as count FROM chatbot_conversations
  `);
  return Number(raw[0]?.count) || 0;
}

export async function countCustomersWithRecommendations() {
  const raw = await db().$queryRawUnsafe(`
    SELECT COUNT(DISTINCT userId) as count FROM recommendation_requests
  `);
  return Number(raw[0]?.count) || 0;
}

export async function getActiveUsers() {
  const result = {};
  result.withOrders = Number((await db().$queryRawUnsafe(`SELECT COUNT(DISTINCT userId) as count FROM orders`))[0]?.count) || 0;
  result.withGardenPlans = Number((await db().$queryRawUnsafe(`SELECT COUNT(DISTINCT userId) as count FROM garden_plans WHERE deletedAt IS NULL`))[0]?.count) || 0;
  result.withChatbot = Number((await db().$queryRawUnsafe(`SELECT COUNT(DISTINCT userId) as count FROM chatbot_conversations`))[0]?.count) || 0;
  result.withRecommendations = Number((await db().$queryRawUnsafe(`SELECT COUNT(DISTINCT userId) as count FROM recommendation_requests`))[0]?.count) || 0;
  return result;
}

export async function getCustomerOwnSummary(userId) {
  const totalOrders = await db().order.count({ where: { userId } });
  const activeOrders = await db().order.count({
    where: { userId, status: { notIn: ['DELIVERED', 'CANCELLED'] } },
  });
  const deliveredOrders = await db().order.count({
    where: { userId, status: 'DELIVERED' },
  });
  const cancelledOrders = await db().order.count({
    where: { userId, status: 'CANCELLED' },
  });
  const agg = await db().order.aggregate({
    _sum: { totalAmount: true },
    where: { userId, status: { not: 'CANCELLED' } },
  });
  const totalSpending = Number(agg._sum.totalAmount) || 0;
  const gardenPlans = await db().gardenPlan.count({ where: { userId, deletedAt: null } });
  const recommendationCount = await db().recommendationRequest.count({ where: { userId } });
  const chatbotCount = await db().chatbotConversation.count({ where: { userId } });
  return { totalOrders, activeOrders, deliveredOrders, cancelledOrders, totalSpending, gardenPlans, recommendationCount, chatbotCount };
}

export async function getCustomerRecentOrders(userId, limit = 5) {
  return db().order.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      currency: true,
      createdAt: true,
    },
  });
}
