import { getPrismaClient } from '../database/prisma.js';

const INTENT_PATTERNS = [
  { intent: 'WATERING_ADVICE', patterns: ['water', 'watering', 'overwater', 'underwater', 'how often', 'dry soil', 'moisture', 'soggy', 'mushy'] },
  { intent: 'SUNLIGHT_ADVICE', patterns: ['sun', 'sunlight', 'light', 'bright', 'shade', 'dark', 'low light', 'direct sun', 'indirect'] },
  { intent: 'FERTILIZER_ADVICE', patterns: ['fertilizer', 'fertilize', 'feed', 'nutrients', 'plant food', 'compost', 'manure'] },
  { intent: 'PEST_HELP', patterns: ['pest', 'bug', 'aphid', 'mite', 'mealybug', 'whitefly', 'insect', 'infestation', 'webbing'] },
  { intent: 'DISEASE_HELP', patterns: ['disease', 'yellow', 'brown', 'wilting', 'root rot', 'mold', 'fungus', 'spots', 'drooping'] },
  { intent: 'PRODUCT_RECOMMENDATION', patterns: ['recommend', 'suggest', 'best', 'good', 'which plant', 'what plant', 'buy', 'affordable', 'under', 'budget'] },
  { intent: 'VASE_CARE', patterns: ['vase', 'fresh', 'cut flower', 'stem', 'bouquet', 'arrangement', 'trim'] },
  { intent: 'GARDEN_PLANNING', patterns: ['garden plan', 'balcony', 'space', 'spacing', 'layout', 'design', 'small garden', 'plan'] },
  { intent: 'ORDER_HELP', patterns: ['order', 'delivery', 'ship', 'track', 'status', 'arrive', 'shipping'] },
  { intent: 'GENERAL_HELP', patterns: ['help', 'hello', 'hi', 'hey', 'care', 'tip', 'advice', 'how to', 'guide'] },
];

const COMPACT_PRODUCT_TAGS = ['compact', 'small', 'trailing', 'pot', 'herb', 'balcony'];

function detectIntent(message) {
  const lower = message.toLowerCase();
  for (const entry of INTENT_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) return entry.intent;
    }
  }
  return 'GENERAL_HELP';
}

async function searchKnowledgeBase(message) {
  const prisma = getPrismaClient();
  const keywords = message.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
  const items = await prisma.chatbotKnowledgeBase.findMany({ where: { active: true } });
  const scored = items.map((item) => {
    const kw = (item.keywords || '').toLowerCase();
    const q = (item.question || '').toLowerCase();
    const a = (item.answer || '').toLowerCase();
    let score = 0;
    for (const k of keywords) {
      if (kw.includes(k)) score += 15;
      if (q.includes(k)) score += 8;
      if (a.includes(k)) score += 3;
    }
    return { item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.item);
}

async function findSuggestedProducts(intent, message) {
  const prisma = getPrismaClient();
  const lower = message.toLowerCase();
  let where = { active: true, deletedAt: null };

  if (lower.includes('low light') || lower.includes('shade') || lower.includes('dark')) {
    where = { ...where, productType: 'plant', lightRequirement: { contains: 'low' } };
  } else if (lower.includes('air purif')) {
    where = { ...where, productType: 'plant', tags: { contains: 'air-purifying' } };
  } else if (lower.includes('pet safe') || lower.includes('pet-friendly') || lower.includes('dog') || lower.includes('cat')) {
    where = { ...where, productType: 'plant', tags: { contains: 'pet-safe' } };
  } else if (lower.includes('flower') || lower.includes('bloom')) {
    where = { ...where, productType: 'flower' };
  } else if (lower.includes('vase')) {
    where = { ...where, productType: 'vase' };
  } else if (lower.includes('outdoor') || lower.includes('garden')) {
    where = { ...where, productType: 'plant', tags: { contains: 'outdoor' } };
  } else if (lower.includes('beginner') || lower.includes('easy')) {
    where = { ...where, productType: 'plant', careLevel: 'easy' };
  } else if (intent === 'PRODUCT_RECOMMENDATION') {
    if (lower.includes('under')) {
      const match = lower.match(/under\s*rwf?\s*([\d,]+)/i);
      if (match) {
        const maxPrice = parseFloat(match[1].replace(/,/g, ''));
        where = { ...where, price: { lte: maxPrice } };
      }
    }
    if (!where.productType) where.productType = 'plant';
  }

  if (Object.keys(where).length <= 3) return [];

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    take: 5,
    orderBy: { featured: 'desc' },
  });

  return products.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, price: Number(p.price),
    currency: p.currency, imageUrl: p.imageUrl,
    category: p.category ? { id: p.category.id, name: p.category.name } : null,
    reason: `Recommended based on your question about ${intent.toLowerCase().replace(/_/g, ' ')}`,
  }));
}

function generateActions(intent, knowledgeResults) {
  const actions = [];
  if (knowledgeResults.length > 0) {
    actions.push({ type: 'READ_MORE', label: 'View detailed care guide', data: { category: knowledgeResults[0].category } });
  }
  if (intent === 'PRODUCT_RECOMMENDATION') {
    actions.push({ type: 'VIEW_PRODUCTS', label: 'Browse matching products' });
    actions.push({ type: 'FILTER', label: 'Refine by budget', data: { filter: 'budget' } });
  }
  if (intent === 'GARDEN_PLANNING') {
    actions.push({ type: 'OPEN_GARDEN_PLANNER', label: 'Open Garden Planner' });
  }
  actions.push({ type: 'ASK_MORE', label: 'Ask a follow-up question' });
  return actions;
}

function generateFallback(intent) {
  const fallbacks = {
    WATERING_ADVICE: 'For watering advice, most indoor plants prefer their soil to dry slightly between waterings. Stick your finger 2-3cm into the soil — if dry, it\'s time to water. Overwatering is the most common cause of plant problems. Check our knowledge base for specific plant watering guides.',
    SUNLIGHT_ADVICE: 'Light is crucial for plant health. Low-light plants like Snake Plant and ZZ Plant can thrive in dim corners. Bright indirect light is ideal for most tropical plants. Direct sun works for succulents, cacti, and many outdoor flowers. Observe your plant — stretching or pale leaves mean it needs more light.',
    FERTILIZER_ADVICE: 'Fertilize most plants every 2-4 weeks during spring and summer growing season. Use a balanced fertilizer or one formulated for your plant type. Reduce fertilizing in winter. Our Organic All-Purpose Fertilizer (FS-FRT-001) is great for most indoor and outdoor plants.',
    PEST_HELP: 'Common plant pests include aphids, spider mites, and mealybugs. Isolate affected plants immediately. Wipe leaves with soapy water or neem oil solution. Increase humidity to deter spider mites. Check nearby plants as pests spread quickly between plants.',
    DISEASE_HELP: 'Common plant diseases include root rot (from overwatering), leaf spot (fungal), and powdery mildew. Improve air circulation, avoid wetting leaves, and ensure proper drainage. Remove affected leaves. For root rot, repot with fresh dry soil and trim rotten roots.',
    PRODUCT_RECOMMENDATION: 'We have many wonderful plants and flowers! For beginners, we recommend Snake Plant (RWF 15,000) or Peace Lily (RWF 18,000). For flowering options, check our Hibiscus or Rose Bush. Browse our catalog for more options within your budget.',
    VASE_CARE: 'To keep flowers fresh: trim stems at 45° angle, remove leaves below waterline, change water every 2 days, add flower food, and keep away from direct sunlight and fruit. Our Glass Vase - Tall Cylinder is perfect for most arrangements.',
    GARDEN_PLANNING: 'Planning a garden? Consider sunlight exposure, soil type, and available space. Use our Garden Planner tool to design your layout. For small spaces, try vertical gardening with compact plants, herbs, and trailing varieties.',
    ORDER_HELP: 'For order inquiries, check your Orders page in your account dashboard. Each order shows current status and tracking information. For urgent issues, contact support@florasmart.com.',
    GENERAL_HELP: 'Welcome to FloraSmart Care Bot! I can help with plant care advice, watering tips, sunlight requirements, pest control, product recommendations, vase care, garden planning, and order support. Ask me anything about your plants!',
  };
  return fallbacks[intent] || fallbacks.GENERAL_HELP;
}

export class ChatbotEngine {
  async processMessage(message) {
    const intent = detectIntent(message);

    const knowledgeMatches = await searchKnowledgeBase(message);
    const suggestedProducts = await findSuggestedProducts(intent, message);
    const suggestedActions = generateActions(intent, knowledgeMatches);

    let botMessage;
    if (knowledgeMatches.length > 0) {
      const best = knowledgeMatches[0];
      botMessage = best.answer;
    } else {
      botMessage = generateFallback(intent);
    }

    let responseType = 'TEXT';
    if (intent === 'PRODUCT_RECOMMENDATION' || suggestedProducts.length > 0) responseType = 'PRODUCT_SUGGESTION';
    else if (['WATERING_ADVICE', 'SUNLIGHT_ADVICE', 'FERTILIZER_ADVICE', 'VASE_CARE'].includes(intent)) responseType = 'CARE_GUIDE';
    else if (['PEST_HELP', 'DISEASE_HELP'].includes(intent)) responseType = 'WARNING';

    return {
      message: botMessage,
      intent,
      responseType,
      suggestedActions,
      suggestedProducts,
      knowledgeMatches: knowledgeMatches.map((k) => ({ id: k.id, title: k.title, category: k.category })),
    };
  }
}
