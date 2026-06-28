import { BaseService } from './base.service.js';
import { slugify } from '../utils/slugify.js';
import { AppError } from '../utils/appError.js';

export class CategoryService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async list(query = {}) {
    const where = { deletedAt: null };
    if (query.active === 'false' || query.active === '0') {
      delete where.active;
      delete where.deletedAt;
    } else {
      where.active = true;
    }
    const categories = await this.repository.findAll(where, { name: 'asc' });
    return categories;
  }

  async getById(id) {
    const category = await this.repository.findById(id);
    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    return category;
  }

  async create(data) {
    const slug = slugify(data.name);
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new AppError('A category with this name already exists', 409, 'CATEGORY_SLUG_CONFLICT');
    }
    return this.repository.create({
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      active: data.active !== undefined ? data.active : true,
    });
  }

  async update(id, data) {
    const category = await this.repository.findById(id);
    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    const updateData = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
      const slug = slugify(data.name);
      const existing = await this.repository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new AppError('A category with this name already exists', 409, 'CATEGORY_SLUG_CONFLICT');
      }
      updateData.slug = slug;
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.active !== undefined) updateData.active = data.active;
    return this.repository.update(id, updateData);
  }

  async delete(id) {
    const category = await this.repository.findById(id);
    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    return this.repository.softDelete(id);
  }
}
