import { BaseRepository } from './base.repository.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super('user');
  }

  findByEmail(email) {
    return this.client.findUnique({ where: { email } });
  }

  findById(id, include = undefined) {
    return this.client.findUnique({ where: { id }, include });
  }
}

