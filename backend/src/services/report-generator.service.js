import { getPrismaClient } from '../database/prisma.js';

function db() {
  return getPrismaClient();
}

export class ReportGenerator {
  async generate(reportType, filters) {
    switch (reportType) {
      case 'SALES': return this.salesReport(filters);
      case 'ORDERS': return this.ordersReport(filters);
      case 'INVENTORY': return this.inventoryReport(filters);
      case 'PRODUCTS': return this.productsReport(filters);
      case 'DELIVERY': return this.deliveryReport(filters);
      case 'CUSTOMERS': return this.customersReport(filters);
      case 'LOYALTY': return this.loyaltyReport(filters);
      case 'GARDEN_PLANS': return this.gardenPlansReport(filters);
      case 'CHATBOT': return this.chatbotReport(filters);
      case 'RECOMMENDATIONS': return this.recommendationsReport(filters);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  getHeaders(reportType) {
    const map = {
      SALES: [
        { key: 'orderNumber', label: 'Order Number' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'orderStatus', label: 'Order Status' },
        { key: 'paymentStatus', label: 'Payment Status' },
        { key: 'subtotal', label: 'Subtotal (RWF)' },
        { key: 'deliveryFee', label: 'Delivery Fee (RWF)' },
        { key: 'discountAmount', label: 'Discount (RWF)' },
        { key: 'totalAmount', label: 'Total (RWF)' },
        { key: 'currency', label: 'Currency' },
        { key: 'createdAt', label: 'Date' },
      ],
      ORDERS: [
        { key: 'orderNumber', label: 'Order Number' },
        { key: 'customerName', label: 'Customer' },
        { key: 'phone', label: 'Phone' },
        { key: 'district', label: 'District' },
        { key: 'status', label: 'Status' },
        { key: 'paymentStatus', label: 'Payment Status' },
        { key: 'deliveryMethod', label: 'Delivery Method' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'totalAmount', label: 'Total (RWF)' },
        { key: 'createdAt', label: 'Date' },
      ],
      INVENTORY: [
        { key: 'productName', label: 'Product' },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Category' },
        { key: 'location', label: 'Location' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'reservedQuantity', label: 'Reserved' },
        { key: 'availableQuantity', label: 'Available' },
        { key: 'lowStockThreshold', label: 'Low Stock Threshold' },
        { key: 'stockStatus', label: 'Stock Status' },
        { key: 'inventoryValue', label: 'Value (RWF)' },
      ],
      PRODUCTS: [
        { key: 'name', label: 'Name' },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Category' },
        { key: 'productType', label: 'Type' },
        { key: 'price', label: 'Price (RWF)' },
        { key: 'currency', label: 'Currency' },
        { key: 'stockStatus', label: 'Stock Status' },
        { key: 'active', label: 'Active' },
        { key: 'featured', label: 'Featured' },
        { key: 'createdAt', label: 'Date Created' },
      ],
      DELIVERY: [
        { key: 'orderNumber', label: 'Order' },
        { key: 'deliveryStatus', label: 'Delivery Status' },
        { key: 'assignedTo', label: 'Assigned To' },
        { key: 'deliveryAddress', label: 'Address' },
        { key: 'scheduledAt', label: 'Scheduled' },
        { key: 'pickedUpAt', label: 'Picked Up' },
        { key: 'deliveredAt', label: 'Delivered' },
        { key: 'failedAt', label: 'Failed' },
      ],
      CUSTOMERS: [
        { key: 'fullName', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'address', label: 'Address' },
        { key: 'isVerified', label: 'Verified' },
        { key: 'totalOrders', label: 'Total Orders' },
        { key: 'createdAt', label: 'Registered' },
      ],
      LOYALTY: [
        { key: 'customerName', label: 'Customer' },
        { key: 'email', label: 'Email' },
        { key: 'pointsBalance', label: 'Points Balance' },
        { key: 'lifetimePoints', label: 'Lifetime Points' },
        { key: 'tier', label: 'Tier' },
        { key: 'transactionCount', label: 'Transactions' },
        { key: 'lastTransactionDate', label: 'Last Activity' },
      ],
      GARDEN_PLANS: [
        { key: 'planName', label: 'Plan Name' },
        { key: 'userName', label: 'User' },
        { key: 'gridWidth', label: 'Width' },
        { key: 'gridHeight', label: 'Height' },
        { key: 'totalPlacements', label: 'Placements' },
        { key: 'tags', label: 'Tags' },
        { key: 'createdAt', label: 'Created' },
      ],
      CHATBOT: [
        { key: 'conversationTitle', label: 'Title' },
        { key: 'userName', label: 'User' },
        { key: 'status', label: 'Status' },
        { key: 'contextType', label: 'Context' },
        { key: 'messageCount', label: 'Messages' },
        { key: 'createdAt', label: 'Created' },
      ],
      RECOMMENDATIONS: [
        { key: 'userName', label: 'User' },
        { key: 'recommendationType', label: 'Type' },
        { key: 'matchCount', label: 'Matches' },
        { key: 'createdAt', label: 'Date' },
      ],
    };
    return map[reportType] || [];
  }

  async salesReport(filters) {
    const where = { status: { not: 'CANCELLED' } };
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

    const orders = await db().order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        subtotal: true,
        deliveryFee: true,
        discountAmount: true,
        totalAmount: true,
        currency: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
    return orders.map(o => ({
      orderNumber: o.orderNumber,
      customerName: o.user.name,
      orderStatus: o.status,
      paymentStatus: o.paymentStatus,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      discountAmount: Number(o.discountAmount),
      totalAmount: Number(o.totalAmount),
      currency: o.currency,
      createdAt: o.createdAt.toISOString(),
    }));
  }

  async ordersReport(filters) {
    const where = {};
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

    const orders = await db().order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        deliveryMethod: true,
        paymentMethod: true,
        totalAmount: true,
        shippingPhone: true,
        shippingDistrict: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
    return orders.map(o => ({
      orderNumber: o.orderNumber,
      customerName: o.user.name,
      phone: o.shippingPhone,
      district: o.shippingDistrict,
      status: o.status,
      paymentStatus: o.paymentStatus,
      deliveryMethod: o.deliveryMethod,
      paymentMethod: o.paymentMethod,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt.toISOString(),
    }));
  }

  async inventoryReport() {
    const levels = await db().stockLevel.findMany({
      where: { product: { deletedAt: null } },
      include: {
        product: { select: { name: true, sku: true, price: true, stockStatus: true, category: { select: { name: true } } } },
        location: { select: { name: true } },
      },
    });
    return levels.map(sl => ({
      productName: sl.product.name,
      sku: sl.product.sku,
      category: sl.product.category?.name || '',
      location: sl.location.name,
      quantity: sl.quantity,
      reservedQuantity: sl.reservedQuantity,
      availableQuantity: sl.quantity - sl.reservedQuantity,
      lowStockThreshold: sl.lowStockThreshold,
      stockStatus: sl.product.stockStatus,
      inventoryValue: Number(sl.product.price) * sl.quantity,
    }));
  }

  async productsReport() {
    const products = await db().product.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { category: { select: { name: true } } },
    });
    return products.map(p => ({
      name: p.name,
      sku: p.sku,
      category: p.category?.name || '',
      productType: p.productType,
      price: Number(p.price),
      currency: p.currency,
      stockStatus: p.stockStatus,
      active: p.active ? 'Yes' : 'No',
      featured: p.featured ? 'Yes' : 'No',
      createdAt: p.createdAt.toISOString(),
    }));
  }

  async deliveryReport(filters) {
    const where = {};
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }
    const deliveries = await db().delivery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true, shippingAddress: true } },
        assignedTo: { select: { name: true } },
      },
    });
    return deliveries.map(d => ({
      orderNumber: d.order?.orderNumber || '',
      deliveryStatus: d.status,
      assignedTo: d.assignedTo?.name || '',
      deliveryAddress: d.deliveryAddress || d.order?.shippingAddress || '',
      scheduledAt: d.scheduledAt?.toISOString() || '',
      pickedUpAt: d.pickedUpAt?.toISOString() || '',
      deliveredAt: d.deliveredAt?.toISOString() || '',
      failedAt: d.failedAt?.toISOString() || '',
    }));
  }

  async customersReport() {
    const role = await db().role.findFirst({ where: { name: 'CUSTOMER' } });
    if (!role) return [];
    const userRoles = await db().userRole.findMany({
      where: { roleId: role.id },
      select: { userId: true },
    });
    const ids = userRoles.map(ur => ur.userId);
    if (ids.length === 0) return [];

    const users = await db().user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    const orderCounts = await db().order.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { userId: { in: ids } },
    });
    const countMap = {};
    for (const oc of orderCounts) {
      countMap[oc.userId] = oc._count.id;
    }

    return users.map(u => ({
      fullName: u.name,
      email: u.email,
      phone: u.phone || '',
      address: u.address || '',
      isVerified: u.isEmailVerified ? 'Yes' : 'No',
      totalOrders: countMap[u.id] || 0,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async loyaltyReport() {
    const accounts = await db().loyaltyAccount.findMany({
      include: {
        user: { select: { name: true, email: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
        _count: { select: { transactions: true } },
      },
    });
    return accounts.map(a => ({
      customerName: a.user.name,
      email: a.user.email,
      pointsBalance: a.pointsBalance,
      lifetimePoints: a.lifetimePoints,
      tier: a.tier,
      transactionCount: a._count.transactions,
      lastTransactionDate: a.transactions[0]?.createdAt?.toISOString() || '',
    }));
  }

  async gardenPlansReport() {
    const plans = await db().gardenPlan.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { name: true } },
        _count: { select: { placements: true } },
      },
    });
    return plans.map(p => ({
      planName: p.name,
      userName: p.user.name,
      gridWidth: p.width,
      gridHeight: p.height,
      totalPlacements: p._count.placements,
      tags: p.tags || '',
      createdAt: p.createdAt.toISOString(),
    }));
  }

  async chatbotReport() {
    const conversations = await db().chatbotConversation.findMany({
      include: {
        user: { select: { name: true } },
        _count: { select: { messages: true } },
      },
    });
    return conversations.map(c => ({
      conversationTitle: c.title || '',
      userName: c.user.name,
      status: c.status,
      contextType: c.contextType || '',
      messageCount: c._count.messages,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async recommendationsReport() {
    const requests = await db().recommendationRequest.findMany({
      include: {
        user: { select: { name: true } },
        _count: { select: { results: true } },
      },
    });
    return requests.map(r => ({
      userName: r.user.name,
      recommendationType: r.type,
      matchCount: r._count.results,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
