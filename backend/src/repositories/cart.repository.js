import { BaseRepository } from './base.repository.js';

export class CartRepository extends BaseRepository {
  constructor() {
    super('cart');
  }

  findActiveByUserId(userId) {
    return this.client.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        items: {
          include: { product: { include: { category: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }
}

export class CartItemRepository extends BaseRepository {
  constructor() {
    super('cartItem');
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: { cart: true, product: true },
    });
  }

  findByCartAndProduct(cartId, productId) {
    return this.client.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }

  delete(id) {
    return this.client.delete({ where: { id } });
  }

  deleteManyByCartId(cartId) {
    return this.client.deleteMany({ where: { cartId } });
  }
}
