import { BaseService } from './base.service.js';
import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';

export class CartService extends BaseService {
  constructor(cartRepository, cartItemRepository) {
    super(cartRepository);
    this.cartItemRepository = cartItemRepository;
  }

  async getCart(userId) {
    let cart = await this.repository.findActiveByUserId(userId);
    if (!cart) {
      cart = await this.repository.create({ userId, status: 'ACTIVE' });
      cart = await this.repository.findActiveByUserId(userId);
    }
    return this._enrichCart(cart);
  }

  async addItem(userId, productId, quantity) {
    const prisma = getPrismaClient();
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    if (!product.active) {
      throw new AppError('Product is not active', 400, 'PRODUCT_INACTIVE');
    }

    const stockLevel = await prisma.stockLevel.findFirst({
      where: { productId, location: { active: true, deletedAt: null } },
      orderBy: { quantity: 'desc' },
    });
    const available = stockLevel ? (stockLevel.quantity - stockLevel.reservedQuantity) : 0;
    if (available < quantity) {
      throw new AppError(`Insufficient stock. Available: ${available}`, 400, 'INSUFFICIENT_STOCK');
    }

    let cart = await this.repository.findActiveByUserId(userId);
    if (!cart) {
      cart = await this.repository.create({ userId, status: 'ACTIVE' });
      cart = await this.repository.findActiveByUserId(userId);
    }

    const existingItem = await this.cartItemRepository.findByCartAndProduct(cart.id, productId);
    const unitPrice = product.discountPrice || product.price;
    const newQty = existingItem ? existingItem.quantity + quantity : quantity;

    if (available < newQty) {
      throw new AppError(`Insufficient stock. Available: ${available}`, 400, 'INSUFFICIENT_STOCK');
    }

    if (existingItem) {
      await this.cartItemRepository.update(existingItem.id, { quantity: newQty, unitPrice });
    } else {
      await this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        unitPrice,
        currency: product.currency || 'RWF',
      });
    }

    await logAuditEvent(prisma, { action: 'cart_item_added', userId, productId, quantity });
    return this._enrichCart(await this.repository.findActiveByUserId(userId));
  }

  async updateItem(userId, itemId, quantity) {
    const item = await this.cartItemRepository.findById(itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }
    const cart = await this.repository.findById(item.cartId);
    if (!cart || cart.userId !== userId) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }
    if (cart.status !== 'ACTIVE') {
      throw new AppError('Cart is not active', 400, 'CART_NOT_ACTIVE');
    }

    const prisma = getPrismaClient();
    const stockLevel = await prisma.stockLevel.findFirst({
      where: { productId: item.productId, location: { active: true, deletedAt: null } },
      orderBy: { quantity: 'desc' },
    });
    const available = stockLevel ? (stockLevel.quantity - stockLevel.reservedQuantity) : 0;
    if (available < quantity) {
      throw new AppError(`Insufficient stock. Available: ${available}`, 400, 'INSUFFICIENT_STOCK');
    }

    await this.cartItemRepository.update(itemId, { quantity });
    await logAuditEvent(prisma, { action: 'cart_item_updated', userId, itemId, quantity });
    return this._enrichCart(await this.repository.findActiveByUserId(userId));
  }

  async removeItem(userId, itemId) {
    const item = await this.cartItemRepository.findById(itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }
    const cart = await this.repository.findById(item.cartId);
    if (!cart || cart.userId !== userId) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    await this.cartItemRepository.delete(itemId);
    await logAuditEvent(getPrismaClient(), { action: 'cart_item_removed', userId, itemId });
    return this._enrichCart(await this.repository.findActiveByUserId(userId));
  }

  async clearCart(userId) {
    const cart = await this.repository.findActiveByUserId(userId);
    if (!cart) {
      return this._enrichCart({ id: null, items: [] });
    }
    await this.cartItemRepository.deleteManyByCartId(cart.id);
    await logAuditEvent(getPrismaClient(), { action: 'cart_cleared', userId, cartId: cart.id });
    return this._enrichCart(await this.repository.findActiveByUserId(userId));
  }

  _enrichCart(cart) {
    if (!cart) {
      return { id: null, items: [], subtotal: 0, itemCount: 0, currency: 'RWF' };
    }
    const items = (cart.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      product: item.product ? {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        imageUrl: item.product.imageUrl,
        stockStatus: item.product.stockStatus,
      } : null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      currency: item.currency,
    }));
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    return {
      id: cart.id,
      items,
      subtotal,
      itemCount: items.length,
      currency: 'RWF',
    };
  }
}
