import { BaseService } from './base.service.js';
import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';

const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
};

export class InventoryLocationService extends BaseService {
  constructor(locationRepository) {
    super(locationRepository);
  }

  async list(query = {}) {
    const where = { deletedAt: null };
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
    const skip = (page - 1) * limit;
    const orderBy = { name: 'asc' };

    const [data, total] = await Promise.all([
      this.repository.findAll(where, orderBy, skip, limit),
      this.repository.count(where),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id) {
    const location = await this.repository.findById(id);
    if (!location || location.deletedAt) {
      throw new AppError('Inventory location not found', 404, 'LOCATION_NOT_FOUND');
    }
    return location;
  }

  async create(data) {
    const existing = await this.repository.findByCode(data.code);
    if (existing) {
      throw new AppError('A location with this code already exists', 409, 'LOCATION_CODE_CONFLICT');
    }
    return this.repository.create({
      name: data.name,
      code: data.code,
      description: data.description || null,
      address: data.address || null,
      active: data.active !== undefined ? data.active : true,
    });
  }

  async update(id, data) {
    const location = await this.repository.findById(id);
    if (!location || location.deletedAt) {
      throw new AppError('Inventory location not found', 404, 'LOCATION_NOT_FOUND');
    }

    if (data.code && data.code !== location.code) {
      const existing = await this.repository.findByCode(data.code);
      if (existing) {
        throw new AppError('A location with this code already exists', 409, 'LOCATION_CODE_CONFLICT');
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.active !== undefined) updateData.active = data.active;

    return this.repository.update(id, updateData);
  }

  async delete(id) {
    const location = await this.repository.findById(id);
    if (!location || location.deletedAt) {
      throw new AppError('Inventory location not found', 404, 'LOCATION_NOT_FOUND');
    }
    return this.repository.softDelete(id);
  }
}

export class InventoryService extends BaseService {
  constructor(stockLevelRepository, movementRepository, locationRepository) {
    super(stockLevelRepository);
    this.movementRepository = movementRepository;
    this.locationRepository = locationRepository;
  }

  async getSummary() {
    const prisma = getPrismaClient();

    const allStockLevels = await prisma.stockLevel.findMany({
      include: {
        product: { select: { id: true, price: true, discountPrice: true } },
      },
    });

    const totalProducts = allStockLevels.length;
    const totalStockQuantity = allStockLevels.reduce((sum, s) => sum + s.quantity, 0);
    const totalReservedQuantity = allStockLevels.reduce((sum, s) => sum + s.reservedQuantity, 0);
    const totalAvailableQuantity = allStockLevels.reduce((sum, s) => sum + (s.quantity - s.reservedQuantity), 0);

    const lowStockCount = allStockLevels.filter(
      (s) => (s.quantity - s.reservedQuantity) <= s.lowStockThreshold
    ).length;

    const outOfStockCount = allStockLevels.filter(
      (s) => (s.quantity - s.reservedQuantity) <= 0
    ).length;

    const inventoryValue = allStockLevels.reduce((sum, s) => {
      const price = s.product.discountPrice || s.product.price;
      return sum + (parseFloat(price) * s.quantity);
    }, 0);

    return {
      totalProducts,
      totalStockQuantity,
      totalReservedQuantity,
      totalAvailableQuantity,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
    };
  }

  async listStock(query = {}) {
    const where = {};
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const orderBy = {};

    if (query.q) {
      where.product = {
        OR: [
          { name: { contains: query.q } },
          { sku: { contains: query.q } },
        ],
      };
    }

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.categoryId) {
      where.product = {
        ...where.product,
        categoryId: query.categoryId,
      };
    }

    if (query.locationId) {
      where.locationId = query.locationId;
    }

    if (query.stockStatus) {
      if (query.stockStatus === 'out_of_stock') {
        where.quantity = { lte: 0 };
      }
    }

    if (query.lowStock === 'true' || query.lowStock === '1') {
      const allStockLevels = await this.repository.findAll({ ...where, product: { deletedAt: null } });
      const lowStockIds = allStockLevels
        .filter((s) => (s.quantity - s.reservedQuantity) <= s.lowStockThreshold)
        .map((s) => s.id);
      where.id = { in: lowStockIds };
    }

    switch (query.sort) {
      case 'quantity_asc': orderBy.quantity = 'asc'; break;
      case 'quantity_desc': orderBy.quantity = 'desc'; break;
      case 'name_asc': orderBy.product = { name: 'asc' }; break;
      case 'name_desc': orderBy.product = { name: 'desc' }; break;
      default: orderBy.updatedAt = 'desc'; break;
    }

    const [data, total] = await Promise.all([
      this.repository.findAll(where, orderBy, skip, limit),
      this.repository.count(where),
    ]);

    const enhanced = data.map((s) => ({
      ...s,
      availableQuantity: s.quantity - s.reservedQuantity,
      stockStatus: this._deriveStockStatus(s.quantity - s.reservedQuantity, s.lowStockThreshold),
    }));

    return {
      data: enhanced,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStockById(id) {
    const stock = await this.repository.findById(id);
    if (!stock) {
      throw new AppError('Stock level not found', 404, 'STOCK_NOT_FOUND');
    }
    return {
      ...stock,
      availableQuantity: stock.quantity - stock.reservedQuantity,
      stockStatus: this._deriveStockStatus(stock.quantity - stock.reservedQuantity, stock.lowStockThreshold),
    };
  }

  async adjustStock(data, userId) {
    const prisma = getPrismaClient();
    const { productId, locationId, quantity, movementType, reason, note, referenceType, referenceId } = data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const location = await this.locationRepository.findById(locationId);
    if (!location || location.deletedAt || !location.active) {
      throw new AppError('Inventory location not found or inactive', 404, 'LOCATION_NOT_FOUND');
    }

    let stockLevel = await this.repository.findByProductAndLocation(productId, locationId);

    const previousQuantity = stockLevel ? stockLevel.quantity : 0;
    let newQuantity;

    switch (movementType) {
      case 'STOCK_IN':
      case 'RETURN':
        newQuantity = previousQuantity + quantity;
        break;
      case 'STOCK_OUT':
      case 'DAMAGE':
      case 'SALE':
        newQuantity = previousQuantity - quantity;
        if (newQuantity < 0) {
          throw new AppError('Insufficient stock for this operation', 400, 'INSUFFICIENT_STOCK');
        }
        break;
      case 'ADJUSTMENT':
        newQuantity = quantity;
        break;
      case 'RESERVATION':
        newQuantity = previousQuantity;
        if (stockLevel) {
          const available = stockLevel.quantity - stockLevel.reservedQuantity;
          if (available < quantity) {
            throw new AppError('Insufficient available stock for reservation', 400, 'INSUFFICIENT_STOCK');
          }
          await this.repository.update(stockLevel.id, {
            reservedQuantity: stockLevel.reservedQuantity + quantity,
          });
        }
        break;
      case 'RELEASE':
        newQuantity = previousQuantity;
        if (stockLevel && stockLevel.reservedQuantity >= quantity) {
          await this.repository.update(stockLevel.id, {
            reservedQuantity: stockLevel.reservedQuantity - quantity,
          });
        }
        break;
      default:
        throw new AppError('Invalid movement type', 400, 'INVALID_MOVEMENT_TYPE');
    }

    if (movementType !== 'RESERVATION' && movementType !== 'RELEASE') {
      if (stockLevel) {
        stockLevel = await this.repository.update(stockLevel.id, { quantity: newQuantity });
      } else {
        stockLevel = await this.repository.create({
          productId,
          locationId,
          quantity: newQuantity,
          reservedQuantity: 0,
          lowStockThreshold: 10,
          reorderPoint: 5,
          maxStockLevel: 100,
        });
      }
    }

    await this.movementRepository.create({
      productId,
      locationId,
      movementType,
      quantity,
      previousQuantity,
      newQuantity,
      reason,
      referenceType: referenceType || 'MANUAL',
      referenceId: referenceId || null,
      note: note || null,
      performedById: userId,
    });

    await this._updateProductStockStatus(productId);

    const updatedStock = await this.repository.findById(stockLevel.id);
    return {
      ...updatedStock,
      availableQuantity: updatedStock.quantity - updatedStock.reservedQuantity,
      stockStatus: this._deriveStockStatus(updatedStock.quantity - updatedStock.reservedQuantity, updatedStock.lowStockThreshold),
    };
  }

  async listMovements(query = {}) {
    const where = {};
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const orderBy = { createdAt: 'desc' };

    if (query.productId) where.productId = query.productId;
    if (query.locationId) where.locationId = query.locationId;
    if (query.movementType) where.movementType = query.movementType;
    if (query.performedById) where.performedById = query.performedById;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.movementRepository.findAll(where, orderBy, skip, limit),
      this.movementRepository.count(where),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getLowStock() {
    const prisma = getPrismaClient();
    const lowStockItems = await prisma.stockLevel.findMany({
      where: {
        product: { deletedAt: null },
      },
      include: {
        product: { include: { category: true } },
        location: true,
      },
      orderBy: { quantity: 'asc' },
    });

    const filtered = lowStockItems.filter((s) => {
      const available = s.quantity - s.reservedQuantity;
      return available <= s.lowStockThreshold;
    });

    return filtered.map((s) => ({
      ...s,
      availableQuantity: s.quantity - s.reservedQuantity,
      stockStatus: this._deriveStockStatus(s.quantity - s.reservedQuantity, s.lowStockThreshold),
    }));
  }

  async _updateProductStockStatus(productId) {
    const prisma = getPrismaClient();
    const stockLevels = await prisma.stockLevel.findMany({
      where: { productId },
    });

    const totalAvailable = stockLevels.reduce((sum, s) => sum + (s.quantity - s.reservedQuantity), 0);

    let status;
    if (totalAvailable <= 0) {
      status = STOCK_STATUS.OUT_OF_STOCK;
    } else {
      const anyLowStock = stockLevels.some(
        (s) => (s.quantity - s.reservedQuantity) <= s.lowStockThreshold
      );
      status = anyLowStock ? STOCK_STATUS.LOW_STOCK : STOCK_STATUS.IN_STOCK;
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stockStatus: status },
    });
  }

  _deriveStockStatus(availableQuantity, lowStockThreshold) {
    if (availableQuantity <= 0) return STOCK_STATUS.OUT_OF_STOCK;
    if (availableQuantity <= lowStockThreshold) return STOCK_STATUS.LOW_STOCK;
    return STOCK_STATUS.IN_STOCK;
  }
}
