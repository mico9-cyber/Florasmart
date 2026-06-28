import { BaseService } from './base.service.js';
import { slugify } from '../utils/slugify.js';
import { AppError } from '../utils/appError.js';

export class ProductService extends BaseService {
  constructor(productRepository, categoryRepository) {
    super(productRepository);
    this.categoryRepository = categoryRepository;
  }

  async list(query = {}) {
    const where = { deletedAt: null };
    const isAdmin = query._admin === true;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const orderBy = {};

    if (!isAdmin || query.active !== 'false') {
      where.active = true;
    }

    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { description: { contains: query.q } },
        { tags: { contains: query.q } },
      ];
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.productType) {
      where.productType = query.productType;
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    if (query.careLevel) {
      where.careLevel = query.careLevel;
    }

    if (query.lightRequirement) {
      where.lightRequirement = { contains: query.lightRequirement };
    }

    if (query.featured === 'true' || query.featured === '1') {
      where.featured = true;
    }

    switch (query.sort) {
      case 'price_asc': orderBy.price = 'asc'; break;
      case 'price_desc': orderBy.price = 'desc'; break;
      case 'name_asc': orderBy.name = 'asc'; break;
      case 'name_desc': orderBy.name = 'desc'; break;
      case 'newest': orderBy.createdAt = 'desc'; break;
      case 'oldest': orderBy.createdAt = 'asc'; break;
      default: orderBy.createdAt = 'desc'; break;
    }

    const [products, total] = await Promise.all([
      this.repository.findAll(where, orderBy, skip, limit),
      this.repository.count(where),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id) {
    const product = await this.repository.findById(id);
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return product;
  }

  async getBySlug(slug) {
    const product = await this.repository.findBySlug(slug);
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return product;
  }

  async create(data, userId) {
    const slug = slugify(data.name);
    const existingSlug = await this.repository.findBySlug(slug);
    if (existingSlug) {
      throw new AppError('A product with this name already exists', 409, 'PRODUCT_SLUG_CONFLICT');
    }

    const existingSku = await this.repository.findBySku(data.sku);
    if (existingSku) {
      throw new AppError('A product with this SKU already exists', 409, 'PRODUCT_SKU_CONFLICT');
    }

    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    if (data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice >= data.price) {
      throw new AppError('discountPrice must be less than price', 400, 'INVALID_DISCOUNT');
    }

    return this.repository.create({
      name: data.name,
      slug,
      sku: data.sku,
      description: data.description || null,
      shortDescription: data.shortDescription || null,
      price: data.price,
      discountPrice: data.discountPrice || null,
      currency: data.currency || 'USD',
      categoryId: data.categoryId,
      productType: data.productType,
      imageUrl: data.imageUrl || null,
      active: data.active !== undefined ? data.active : true,
      featured: data.featured || false,
      stockStatus: data.stockStatus || 'in_stock',
      careLevel: data.careLevel || null,
      lightRequirement: data.lightRequirement || null,
      waterRequirement: data.waterRequirement || null,
      soilType: data.soilType || null,
      temperatureRange: data.temperatureRange || null,
      growthSize: data.growthSize || null,
      color: data.color || null,
      occasion: data.occasion || null,
      tags: data.tags || null,
      createdById: userId,
    });
  }

  async update(id, data) {
    const product = await this.repository.findById(id);
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const updateData = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      const slug = slugify(data.name);
      const existing = await this.repository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new AppError('A product with this name already exists', 409, 'PRODUCT_SLUG_CONFLICT');
      }
      updateData.slug = slug;
    }

    if (data.sku !== undefined) {
      const existingSku = await this.repository.findBySku(data.sku);
      if (existingSku && existingSku.id !== id) {
        throw new AppError('A product with this SKU already exists', 409, 'PRODUCT_SKU_CONFLICT');
      }
      updateData.sku = data.sku;
    }

    if (data.categoryId !== undefined) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category || category.deletedAt) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
      updateData.categoryId = data.categoryId;
    }

    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.discountPrice !== undefined) {
      const price = data.price !== undefined ? data.price : product.price;
      if (data.discountPrice !== null && data.discountPrice >= price) {
        throw new AppError('discountPrice must be less than price', 400, 'INVALID_DISCOUNT');
      }
      updateData.discountPrice = data.discountPrice;
    }
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.productType !== undefined) updateData.productType = data.productType;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.stockStatus !== undefined) updateData.stockStatus = data.stockStatus;
    if (data.careLevel !== undefined) updateData.careLevel = data.careLevel;
    if (data.lightRequirement !== undefined) updateData.lightRequirement = data.lightRequirement;
    if (data.waterRequirement !== undefined) updateData.waterRequirement = data.waterRequirement;
    if (data.soilType !== undefined) updateData.soilType = data.soilType;
    if (data.temperatureRange !== undefined) updateData.temperatureRange = data.temperatureRange;
    if (data.growthSize !== undefined) updateData.growthSize = data.growthSize;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.occasion !== undefined) updateData.occasion = data.occasion;
    if (data.tags !== undefined) updateData.tags = data.tags;

    return this.repository.update(id, updateData);
  }

  async delete(id) {
    const product = await this.repository.findById(id);
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return this.repository.softDelete(id);
  }
}
