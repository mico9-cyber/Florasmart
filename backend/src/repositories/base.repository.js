import { getPrismaClient } from '../database/prisma.js';

export class BaseRepository {
  constructor(modelName) {
    this.modelName = modelName;
  }

  get client() {
    return getPrismaClient()[this.modelName];
  }
}

