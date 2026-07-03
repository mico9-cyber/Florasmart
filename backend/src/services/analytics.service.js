import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';
import { parseDateRange } from '../utils/date-range.js';
import * as analyticsRepo from '../repositories/analytics.repository.js';

export class AnalyticsService {
  async getAdminOverview() {
    const [users, orders, sales, inventory, engagement] = await Promise.all([
      analyticsRepo.countUsersByRole(),
      analyticsRepo.countOrdersByStatus(),
      analyticsRepo.getSalesSummary(),
      analyticsRepo.getInventorySummary(),
      this.getEngagementCounts(),
    ]);
    await logAuditEvent(getPrismaClient(), { action: 'analytics_admin_overview' });
    return { users, orders, sales, inventory, engagement };
  }

  async getFloristOverview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [sales, ordersByStatus, inventory, products, deliveries] = await Promise.all([
      analyticsRepo.getSalesSummary(thirtyDaysAgo, now),
      analyticsRepo.getOrdersByStatus(thirtyDaysAgo, now),
      analyticsRepo.getInventorySummary(),
      analyticsRepo.getProductStockStatusCounts(),
      analyticsRepo.getDeliverySummary(),
    ]);
    await logAuditEvent(getPrismaClient(), { action: 'analytics_florist_overview' });
    return { sales, orders: ordersByStatus, inventory, products, deliveries };
  }

  async getCustomerSummary(userId) {
    const [summary, recentOrders] = await Promise.all([
      analyticsRepo.getCustomerOwnSummary(userId),
      analyticsRepo.getCustomerRecentOrders(userId),
    ]);
    await logAuditEvent(getPrismaClient(), { action: 'analytics_customer_summary', userId });
    return { ...summary, recentOrders };
  }

  async getSalesAnalytics(dateFrom, dateTo, groupBy, categoryId) {
    const range = parseDateRange(dateFrom, dateTo);
    if (!range) throw new AppError('Invalid date range', 400, 'INVALID_DATE_RANGE');
    const { dateFrom: from, dateTo: to } = range;
    const [summary, timeline, topProducts] = await Promise.all([
      analyticsRepo.getSalesSummary(from, to),
      analyticsRepo.getSalesByDateRange(from, to, groupBy || 'day'),
      analyticsRepo.getTopSellingProducts(10),
    ]);
    await logAuditEvent(getPrismaClient(), { action: 'analytics_sales_viewed' });
    return {
      summary,
      timeline,
      topProducts,
      dateFrom: from,
      dateTo: to,
      groupBy: groupBy || 'day',
      currency: 'RWF',
    };
  }

  async getOrderAnalytics(dateFrom, dateTo, status, groupBy) {
    const range = parseDateRange(dateFrom, dateTo);
    if (!range) throw new AppError('Invalid date range', 400, 'INVALID_DATE_RANGE');
    const { dateFrom: from, dateTo: to } = range;
    const [ordersByStatus, timeline, cancellationRate, recentOrders] = await Promise.all([
      analyticsRepo.getOrdersByStatus(from, to),
      analyticsRepo.getOrdersByDateRange(from, to, groupBy || 'day'),
      analyticsRepo.getCancellationRate(from, to),
      analyticsRepo.getRecentOrders(10),
    ]);
    await logAuditEvent(getPrismaClient(), { action: 'analytics_orders_viewed' });
    return {
      ordersByStatus,
      timeline,
      cancellationRate,
      recentOrders,
      dateFrom: from,
      dateTo: to,
      groupBy: groupBy || 'day',
    };
  }

  async getInventoryAnalytics() {
    const [summary, recentMovements, topAdjusted] = await Promise.all([
      analyticsRepo.getInventorySummary(),
      analyticsRepo.getRecentStockMovements(10),
      analyticsRepo.getMostAdjustedProducts(10),
    ]);
    await logAuditEvent(getPrismaClient(), { action: 'analytics_inventory_viewed' });
    return {
      summary,
      recentMovements,
      mostAdjustedProducts: topAdjusted,
      currency: 'RWF',
    };
  }

  async getDeliveryAnalytics() {
    const [summary, avgTime, recent] = await Promise.all([
      analyticsRepo.getDeliverySummary(),
      analyticsRepo.getAverageDeliveryTime(),
      analyticsRepo.getRecentDeliveries(10),
    ]);
    await logAuditEvent(getPrismaClient(), { action: 'analytics_delivery_viewed' });
    return {
      summary,
      averageDeliveryTimeHours: avgTime,
      recentDeliveries: recent,
    };
  }

  async getProductAnalytics() {
    const [byCategory, stockStatus, revenue] = await Promise.all([
      analyticsRepo.getProductCategoryBreakdown(),
      analyticsRepo.getProductStockStatusCounts(),
      analyticsRepo.getProductRevenue(),
    ]);
    const activeCount = Object.values(stockStatus).reduce((a, b) => a + b, 0);
    const topSelling = revenue.filter(r => r.orderCount > 0).slice(0, 10);
    await logAuditEvent(getPrismaClient(), { action: 'analytics_products_viewed' });
    return {
      totalActiveProducts: activeCount,
      byCategory,
      stockStatus,
      topSelling,
      productRevenue: revenue,
      currency: 'RWF',
    };
  }

  async getEngagementAnalytics() {
    const [active] = await Promise.all([
      analyticsRepo.getActiveUsers(),
    ]);
    const counts = await this.getEngagementCounts();
    await logAuditEvent(getPrismaClient(), { action: 'analytics_engagement_viewed' });
    return { ...counts, activeUsers: active };
  }

  async getEngagementCounts() {
    const [recommendationRequests, chatbotConversations, gardenPlans] = await Promise.all([
      getPrismaClient().recommendationRequest.count(),
      getPrismaClient().chatbotConversation.count(),
      getPrismaClient().gardenPlan.count({ where: { deletedAt: null } }),
    ]);
    return { recommendationRequests, chatbotConversations, gardenPlans };
  }
}
