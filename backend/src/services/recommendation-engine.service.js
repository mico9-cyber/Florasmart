import { getPrismaClient } from '../database/prisma.js';

const SUNLIGHT_MAP = {
  'full sun': { score: 25, exact: ['full sun', 'full sun to partial'] },
  'partial shade': { score: 25, exact: ['partial shade', 'full sun to partial', 'low to bright indirect'] },
  'bright indirect light': { score: 25, exact: ['bright indirect light', 'bright indirect', 'bright indirect to direct', 'low to bright indirect'] },
  'low light': { score: 25, exact: ['low light', 'low to bright indirect', 'shade-tolerant'] },
};

const WATERING_MAP = {
  low: { score: 20, exact: ['low', 'none'] },
  moderate: { score: 20, exact: ['moderate'] },
  high: { score: 20, exact: ['high', 'daily'] },
};

const PET_SAFE_TAGS = ['pet-safe', 'pet-friendly', 'pet-friendly-yes'];
const NOT_PET_SAFE_TAGS = ['pet-friendly-no'];

const EXPERIENCE_MAP = {
  beginner: { score: 5, levels: ['easy'] },
  intermediate: { score: 5, levels: ['easy', 'moderate'] },
  expert: { score: 5, levels: ['easy', 'moderate', 'expert'] },
};

function tagMatch(tags, keywords) {
  if (!tags) return false;
  const tagList = tags.toLowerCase().split(',');
  return keywords.some((kw) => tagList.includes(kw.trim().toLowerCase()));
}

function getLightRequirementKeywords(level) {
  const entry = SUNLIGHT_MAP[level.toLowerCase()];
  return entry ? entry.exact : [];
}

function scoreSunlight(product, sunlightLevel) {
  if (!sunlightLevel || !product.lightRequirement) return 5;
  const userLight = sunlightLevel.toLowerCase();
  const prodLight = product.lightRequirement.toLowerCase();
  const entry = SUNLIGHT_MAP[userLight];
  if (!entry) return 5;
  if (entry.exact.some((e) => prodLight.includes(e))) return entry.score;
  if (prodLight.includes('any') || prodLight.includes('low to bright') || prodLight.includes('full sun to partial')) return 15;
  return 5;
}

function scoreWatering(product, wateringLevel) {
  if (!wateringLevel || !product.waterRequirement) return 5;
  const userWater = wateringLevel.toLowerCase();
  const prodWater = product.waterRequirement.toLowerCase();
  const entry = WATERING_MAP[userWater];
  if (!entry) return 5;
  if (entry.exact.some((e) => prodWater.includes(e))) return entry.score;
  return 5;
}

function scorePetSafety(product, petSafeRequired) {
  if (!petSafeRequired) return 20;
  const tags = product.tags ? product.tags.toLowerCase() : '';
  if (tagMatch(product.tags, PET_SAFE_TAGS)) return 20;
  if (tagMatch(product.tags, NOT_PET_SAFE_TAGS)) return 0;
  return 10;
}

function scorePurpose(product, purpose) {
  if (!purpose || !product.tags) return 10;
  const purposeLower = purpose.toLowerCase();
  const tags = product.tags.toLowerCase();
  const purposeKeywords = {
    'air purification': ['air-purifying', 'air-purifier'],
    'flowering decoration': ['flowering', 'blooms', 'colorful'],
    'low maintenance': ['beginners', 'drought-tolerant', 'easy'],
    'indoor beauty': ['indoor', 'statement', 'elegant'],
    'outdoor garden': ['outdoor', 'garden', 'perennial'],
    'vase arrangement': ['bouquet', 'flowers', 'arrangement'],
    'balcony garden': ['compact', 'small', 'trailing', 'pot'],
  };
  const keywords = purposeKeywords[purposeLower];
  if (!keywords) return 10;
  if (keywords.some((kw) => tags.includes(kw))) return 20;
  return 5;
}

function scoreBudget(product, budgetMin, budgetMax) {
  const price = Number(product.price);
  if (budgetMin && budgetMax) {
    if (price >= budgetMin && price <= budgetMax) return 10;
    if (price < budgetMin && price >= budgetMin * 0.7) return 5;
    if (price <= budgetMax * 1.3 && price >= budgetMin) return 5;
    return 0;
  }
  if (budgetMax && price <= budgetMax) return 10;
  if (budgetMin && price >= budgetMin) return 10;
  return 5;
}

function scoreExperience(product, experienceLevel) {
  if (!experienceLevel || !product.careLevel) return 5;
  const entry = EXPERIENCE_MAP[experienceLevel.toLowerCase()];
  if (!entry) return 5;
  if (entry.levels.includes(product.careLevel.toLowerCase())) return entry.score;
  return 0;
}

function generateReasons(product, criteria) {
  const reasons = [];
  if (criteria.sunlightLevel && scoreSunlight(product, criteria.sunlightLevel) >= 20) {
    reasons.push('Matches your available sunlight conditions');
  }
  if (criteria.wateringLevel && scoreWatering(product, criteria.wateringLevel) >= 15) {
    reasons.push('Fits your watering routine');
  }
  if (criteria.petSafeRequired && scorePetSafety(product, true) >= 20) {
    reasons.push('Safe for homes with pets');
  }
  if (criteria.purpose && scorePurpose(product, criteria.purpose) >= 15) {
    reasons.push(`Great for ${criteria.purpose}`);
  }
  if (criteria.experienceLevel) {
    const score = scoreExperience(product, criteria.experienceLevel);
    if (score >= 5) reasons.push(`Suitable for ${criteria.experienceLevel} level`);
    else reasons.push('May require more advanced care');
  }
  if (criteria.spaceType && product.tags && product.tags.toLowerCase().includes(criteria.spaceType.toLowerCase())) {
    reasons.push(`Perfect for ${criteria.spaceType} spaces`);
  }
  if (product.careLevel) {
    reasons.push(`${product.careLevel.charAt(0).toUpperCase() + product.careLevel.slice(1)} care level`);
  }
  return reasons;
}

function generateCareNotes(product) {
  const notes = [];
  if (product.lightRequirement) notes.push(`Light: ${product.lightRequirement}`);
  if (product.waterRequirement) notes.push(`Water: ${product.waterRequirement}`);
  if (product.soilType) notes.push(`Soil: ${product.soilType}`);
  if (product.temperatureRange) notes.push(`Temperature: ${product.temperatureRange}`);
  if (product.growthSize) notes.push(`Grows to: ${product.growthSize}`);
  return notes;
}

function generateWarnings(product, criteria) {
  const warnings = [];
  if (criteria.petSafeRequired && tagMatch(product.tags, NOT_PET_SAFE_TAGS)) {
    warnings.push('Not recommended for homes with pets');
  }
  if (product.waterRequirement && criteria.wateringLevel) {
    const prodWater = product.waterRequirement.toLowerCase();
    const userWater = criteria.wateringLevel.toLowerCase();
    if (prodWater === 'high' && userWater === 'low') warnings.push('Requires frequent watering');
    if (prodWater === 'low' && userWater === 'high') warnings.push('Drought-tolerant — avoid overwatering');
  }
  if (product.lightRequirement && criteria.sunlightLevel) {
    const prodLight = product.lightRequirement.toLowerCase();
    const userLight = criteria.sunlightLevel.toLowerCase();
    if (prodLight.includes('full sun') && (userLight.includes('low light') || userLight.includes('shade'))) {
      warnings.push('Needs bright direct sunlight');
    }
    if ((prodLight.includes('low light') || prodLight.includes('shade')) && userLight.includes('full sun')) {
      warnings.push('Prefers shade — avoid direct sun');
    }
  }
  return warnings;
}

export class RecommendationEngine {
  async getPlantRecommendations(criteria) {
    const prisma = getPrismaClient();
    const budgetMin = criteria.budgetMin ? Number(criteria.budgetMin) : null;
    const budgetMax = criteria.budgetMax ? Number(criteria.budgetMax) : null;

    const products = await prisma.product.findMany({
      where: { active: true, deletedAt: null },
      include: { category: true },
    });

    const scored = products.map((product) => {
      const sunlight = scoreSunlight(product, criteria.sunlightLevel);
      const watering = scoreWatering(product, criteria.wateringLevel);
      const petSafety = scorePetSafety(product, criteria.petSafeRequired);
      const purpose = scorePurpose(product, criteria.purpose);
      const budget = scoreBudget(product, budgetMin, budgetMax);
      const experience = scoreExperience(product, criteria.experienceLevel);
      const total = sunlight + watering + petSafety + purpose + budget + experience;

      return {
        product,
        score: total,
        sunlight,
        watering,
        petSafety,
        purpose,
        budget,
        experience,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 10);

    return top.map((item, index) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        price: Number(item.product.price),
        imageUrl: item.product.imageUrl,
        productType: item.product.productType,
        careLevel: item.product.careLevel,
        lightRequirement: item.product.lightRequirement,
        waterRequirement: item.product.waterRequirement,
        category: item.product.category ? { id: item.product.category.id, name: item.product.category.name } : null,
      },
      score: item.score,
      rank: index + 1,
      reasons: generateReasons(item.product, criteria),
      careNotes: generateCareNotes(item.product),
      warnings: generateWarnings(item.product, criteria),
    }));
  }

  async getVaseMatch(criteria) {
    const prisma = getPrismaClient();
    const product = criteria.bouquetProductId
      ? await prisma.product.findUnique({ where: { id: criteria.bouquetProductId } })
      : null;

    const defaultStemLengths = {
      'premium-rose-bouquet': 40,
      'tulip-bouquet-mixed': 32,
      'tropical-orchid-arrangement': 45,
      'sunflower-bouquet-happy': 50,
      'mixed-bouquet-rainbow': 35,
      'dried-lavender-bundle': 30,
    };

    const stemLength = product
      ? (defaultStemLengths[product.slug] || 35)
      : 35;

    const vaseHeightCm = criteria.vaseHeightCm || 20;
    const openingWidthCm = criteria.openingWidthCm || 10;
    const vaseShape = (criteria.vaseShape || 'CYLINDER').toUpperCase();

    const heightRatio = vaseHeightCm / stemLength;
    let structuralFit;
    let fitScore = 0;

    if (heightRatio >= 0.4 && heightRatio <= 0.7) {
      structuralFit = 'EXCELLENT';
      fitScore = 40;
    } else if (heightRatio >= 0.3 && heightRatio <= 0.8) {
      structuralFit = 'GOOD';
      fitScore = 30;
    } else if (heightRatio >= 0.2 && heightRatio <= 1.0) {
      structuralFit = 'FAIR';
      fitScore = 20;
    } else {
      structuralFit = 'POOR';
      fitScore = 5;
    }

    let visualBalance;
    if (vaseShape === 'CYLINDER' || vaseShape === 'FLARED') {
      if (openingWidthCm >= 8 && openingWidthCm <= 15) {
        visualBalance = 'GOOD';
        fitScore += 30;
      } else if (openingWidthCm >= 5 && openingWidthCm <= 20) {
        visualBalance = 'FAIR';
        fitScore += 20;
      } else {
        visualBalance = 'POOR';
        fitScore += 5;
      }
    } else if (vaseShape === 'BUD') {
      if (openingWidthCm >= 3 && openingWidthCm <= 8) {
        visualBalance = 'EXCELLENT';
        fitScore += 35;
      } else {
        visualBalance = 'FAIR';
        fitScore += 15;
      }
    } else {
      visualBalance = 'FAIR';
      fitScore += 20;
    }

    const warnings = [];
    if (structuralFit === 'POOR') warnings.push('Vase height not proportional to stem length');
    if (visualBalance === 'POOR') warnings.push('Opening width may not support bouquet density');
    if (heightRatio < 0.3) warnings.push('Vase is too short — bouquet may tip over');
    if (heightRatio > 0.8) warnings.push('Vase is too tall — stems may not be visible');

    const vases = await prisma.product.findMany({
      where: { productType: 'vase', active: true, deletedAt: null },
      take: 3,
    });

    const flowers = await prisma.product.findMany({
      where: { productType: 'flower', active: true, deletedAt: null },
      take: 3,
    });

    return {
      fitScore,
      structuralFit,
      visualBalance,
      warnings,
      vaseHeightCm,
      stemLengthCm: stemLength,
      heightRatio: Math.round(heightRatio * 100) / 100,
      recommendedVases: vases.map((v) => ({
        id: v.id, name: v.name, slug: v.slug, price: Number(v.price), imageUrl: v.imageUrl, color: v.color,
      })),
      recommendedArrangements: flowers.map((f) => ({
        id: f.id, name: f.name, slug: f.slug, price: Number(f.price), imageUrl: f.imageUrl, color: f.color,
      })),
    };
  }

  async getGardenPlanRecommendations(gardenPlanId) {
    const prisma = getPrismaClient();
    const plan = await prisma.gardenPlan.findUnique({
      where: { id: gardenPlanId },
      include: {
        cells: true,
        placements: { include: { product: true } },
      },
    });

    if (!plan || plan.deletedAt) return null;

    const sunExposures = [...new Set(plan.cells.map((c) => c.sunExposure).filter(Boolean))];
    const soilTypes = [...new Set(plan.cells.map((c) => c.soilType).filter(Boolean))];
    const existingProductIds = plan.placements.map((p) => p.productId);

    const products = await prisma.product.findMany({
      where: { active: true, deletedAt: null, productType: 'plant' },
      include: { category: true },
    });

    const recommendations = products
      .filter((p) => !existingProductIds.includes(p.id))
      .map((product) => {
        let score = 0;
        const reasons = [];

        if (sunExposures.length > 0) {
          const hasLightMatch = sunExposures.some((se) => {
            const ex = se.toLowerCase();
            const pl = product.lightRequirement ? product.lightRequirement.toLowerCase() : '';
            return pl.includes(ex) || pl.includes('any') || ex.includes(pl);
          });
          if (hasLightMatch) { score += 30; reasons.push('Matches garden sunlight conditions'); }
        } else {
          score += 15;
        }

        if (soilTypes.length > 0) {
          const hasSoilMatch = soilTypes.some((st) => {
            const ps = product.soilType ? product.soilType.toLowerCase() : '';
            return ps.includes(st.toLowerCase());
          });
          if (hasSoilMatch) { score += 25; reasons.push('Suitable for your garden soil type'); }
        } else {
          score += 10;
        }

        if (product.careLevel === 'easy') { score += 15; reasons.push('Low-maintenance garden plant'); }
        else if (product.careLevel) { score += 5; }

        if (product.tags && (product.tags.includes('outdoor') || product.tags.includes('garden'))) {
          score += 15;
          reasons.push('Great for outdoor garden spaces');
        }

        const spacingNote = product.growthSize
          ? `Allow ${product.growthSize} spacing`
          : 'Standard spacing recommended';

        return {
          product: {
            id: product.id, name: product.name, slug: product.slug, sku: product.sku,
            price: Number(product.price), imageUrl: product.imageUrl, productType: product.productType,
            careLevel: product.careLevel, lightRequirement: product.lightRequirement,
            waterRequirement: product.waterRequirement,
            category: product.category ? { id: product.category.id, name: product.category.name } : null,
          },
          score,
          reasons: reasons.length > 0 ? reasons : ['General garden suitability'],
          careNotes: [
            product.lightRequirement ? `Light: ${product.lightRequirement}` : null,
            product.waterRequirement ? `Water: ${product.waterRequirement}` : null,
            spacingNote,
          ].filter(Boolean),
          warnings: [],
        };
      });

    recommendations.sort((a, b) => b.score - a.score);
    return {
      gardenPlanId: plan.id,
      planName: plan.name,
      planWidth: plan.width,
      planHeight: plan.height,
      recommendations: recommendations.slice(0, 10).map((r, i) => ({ ...r, rank: i + 1 })),
    };
  }

  async getProductRecommendations(criteria) {
    const prisma = getPrismaClient();
    const where = { active: true, deletedAt: null };

    if (criteria.type) where.productType = criteria.type;
    if (criteria.categoryId) where.categoryId = criteria.categoryId;
    if (criteria.budgetMin || criteria.budgetMax) {
      const priceFilter = {};
      if (criteria.budgetMin) priceFilter.gte = Number(criteria.budgetMin);
      if (criteria.budgetMax) priceFilter.lte = Number(criteria.budgetMax);
      where.price = priceFilter;
    }

    const limit = Math.min(parseInt(criteria.limit) || 12, 50);
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return products.map((p) => ({
      id: p.id, name: p.name, slug: p.slug, sku: p.sku, price: Number(p.price),
      imageUrl: p.imageUrl, productType: p.productType, careLevel: p.careLevel,
      lightRequirement: p.lightRequirement, waterRequirement: p.waterRequirement,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
    }));
  }
}
