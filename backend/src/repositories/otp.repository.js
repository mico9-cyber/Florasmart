import { BaseRepository } from './base.repository.js';

export class OtpRepository extends BaseRepository {
  constructor() {
    super('otpVerification');
  }

  findLatestByEmailAndPurpose(email, purpose) {
    return this.client.findFirst({
      where: { email, purpose },
      orderBy: { createdAt: 'desc' },
    });
  }

  expirePreviousOtps(email, purpose) {
    return this.client.updateMany({
      where: { email, purpose, usedAt: null },
      data: { expiresAt: new Date(0) },
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }
}
