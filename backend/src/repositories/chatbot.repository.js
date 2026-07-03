import { BaseRepository } from './base.repository.js';

export class ChatbotConversationRepository extends BaseRepository {
  constructor() {
    super('chatbotConversation');
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  findByUserId(userId, status, page = 1, limit = 20) {
    const where = { userId };
    if (status) where.status = status;
    return this.client.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { messages: true } } },
    });
  }

  findAll(status, page = 1, limit = 20) {
    const where = {};
    if (status) where.status = status;
    return this.client.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { messages: true } } },
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }
}

export class ChatbotMessageRepository extends BaseRepository {
  constructor() {
    super('chatbotMessage');
  }

  create(data) {
    return this.client.create({ data });
  }

  findById(id) {
    return this.client.findUnique({ where: { id } });
  }
}

export class ChatbotFeedbackRepository extends BaseRepository {
  constructor() {
    super('chatbotFeedback');
  }

  create(data) {
    return this.client.create({ data });
  }
}

export class ChatbotKnowledgeBaseRepository extends BaseRepository {
  constructor() {
    super('chatbotKnowledgeBase');
  }

  findById(id) {
    return this.client.findUnique({ where: { id } });
  }

  findAll(activeOnly = true) {
    const where = {};
    if (activeOnly) where.active = true;
    return this.client.findMany({
      where,
      orderBy: { category: 'asc' },
    });
  }

  searchByKeywords(keywords, category = null) {
    const where = { active: true };
    if (category) where.category = category;
    const keywordList = keywords.toLowerCase().split(' ');
    return this.client.findMany({
      where,
    }).then((items) => {
      const scored = items.map((item) => {
        const kw = (item.keywords || '').toLowerCase();
        const q = (item.question || '').toLowerCase();
        const a = (item.answer || '').toLowerCase();
        let score = 0;
        for (const k of keywordList) {
          if (k.length < 2) continue;
          if (kw.includes(k)) score += 10;
          if (q.includes(k)) score += 5;
          if (a.includes(k)) score += 2;
        }
        return { ...item, score };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored.filter((i) => i.score > 0).slice(0, 5);
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }

  delete(id) {
    return this.client.update({ where: { id }, data: { active: false } });
  }
}
