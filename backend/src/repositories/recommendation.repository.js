import { BaseRepository } from './base.repository.js';

export class UserPreferenceRepository extends BaseRepository {
  constructor() {
    super('userPreference');
  }

  findByUserId(userId) {
    return this.client.findUnique({ where: { userId } });
  }

  upsert(userId, data) {
    return this.client.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}

export class RecommendationRequestRepository extends BaseRepository {
  constructor() {
    super('recommendationRequest');
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: {
        results: {
          include: { product: true },
          orderBy: { rank: 'asc' },
        },
      },
    });
  }

  findByUserId(userId, limit = 20) {
    return this.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        results: {
          include: { product: true },
          orderBy: { rank: 'asc' },
          take: 5,
        },
      },
    });
  }

  findAll(limit = 50) {
    return this.client.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        results: {
          include: { product: true },
          orderBy: { rank: 'asc' },
          take: 5,
        },
      },
    });
  }

  create(data) {
    return this.client.create({ data });
  }
}

export class RecommendationResultRepository extends BaseRepository {
  constructor() {
    super('recommendationResult');
  }

  create(data) {
    return this.client.create({ data });
  }

  createMany(dataArray) {
    return this.client.createMany({ data: dataArray });
  }
}
