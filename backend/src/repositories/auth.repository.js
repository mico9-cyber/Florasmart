import { BaseRepository } from './base.repository.js';

export class AuthRepository extends BaseRepository {
  constructor() {
    super('user');
  }

  findByEmail(email, include = undefined) {
    return this.client.findUnique({ where: { email }, include });
  }

  findById(id, include = undefined) {
    return this.client.findUnique({ where: { id }, include });
  }
}

export class RoleRepository extends BaseRepository {
  constructor() {
    super('role');
  }
}

export class PermissionRepository extends BaseRepository {
  constructor() {
    super('permission');
  }
}

export class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super('refreshToken');
  }
}

export class PasswordResetTokenRepository extends BaseRepository {
  constructor() {
    super('passwordResetToken');
  }
}
