import { getPrismaClient } from '../database/prisma.js';
import { AppError } from '../utils/appError.js';
import { NotificationService } from './notification.service.js';

export class PlantCareReminderService {
  constructor() {
    this.prisma = getPrismaClient();
  }

  async generateRandomCareTips(userId) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: { include: { role: true } },
          orders: {
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      category: true,
                      attributes: true
                    }
                  }
                }
              }
            },
            take: 1
          }
        }
      });
      
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      const userPlants = this.extractPlantsFromOrders(user.orders);
      
      if (userPlants.length === 0) {
        return this.getGeneralPlantCareTips();
      }
      
      const specificTips = await this.generateSpecificPlantTips(userPlants);
      const seasonalTips = this.getSeasonalPlantTips();
      const allTips = [...specificTips, ...seasonalTips].sort(() => 0.5 - Math.random()).slice(0, 2);
      
      try {
        await this.saveCareTips(userId, allTips);
      } catch (saveErr) {
        console.error('Save failed but returning tips anyway:', saveErr.message);
      }
      
      return allTips;
    } catch (error) {
      console.error('Error generating plant care tips:', error.message, error.stack);
      throw new AppError('Failed to generate plant care tips', 500, 'PLANT_CARE_GENERATION_FAILED');
    }
  }

  extractPlantsFromOrders(orders) {
    const plants = [];
    for (const order of orders) {
      for (const orderItem of order.items || []) {
        const product = orderItem.product;
        if (product) {
          plants.push({
            id: product.id,
            name: product.name,
            category: product.category?.name || product.categorySlug || 'plant',
            productType: product.productType || 'plant',
            careLevel: product.careLevel || 'easy',
            lightRequirement: product.lightRequirement || 'bright indirect light',
            waterRequirement: product.waterRequirement || 'moderate',
            imageUrl: product.imageUrl,
            careInstructions: this.extractCareInstructions(product)
          });
        }
      }
    }
    return plants;
  }

  extractCareInstructions(product) {
    const instructions = [];
    if (product.careLevel) instructions.push(`Care Level: ${product.careLevel}`);
    if (product.lightRequirement) instructions.push(`Light: ${product.lightRequirement}`);
    if (product.waterRequirement) instructions.push(`Watering: ${product.waterRequirement}`);
    if (product.tags) instructions.push(`Tags: ${product.tags}`);
    if (product.sunlight) instructions.push(`Sunlight: ${product.sunlight}`);
    return instructions.join(' | ');
  }

  async generateSpecificPlantTips(plants) {
    const tips = [];
    for (const plant of plants) {
      if (plant.waterRequirement) {
        const wateringTip = this.generateWateringTip(plant);
        if (wateringTip) tips.push(wateringTip);
      }
      
      if (plant.lightRequirement) {
        const lightTip = this.generateLightTip(plant);
        if (lightTip) tips.push(lightTip);
      }
      
      if (plant.careInstructions) {
        const careTip = this.generateCareReminder(plant);
        if (careTip) tips.push(careTip);
      }
      
      if (tips.length >= 3) break;
    }
    
    return tips;
  }

  generateWateringTip(plant) {
    const wateringTips = {
      'moderate': {
        title: '💧 Watering Reminder',
        message: `Water your ${plant.name} when the top 2 inches of soil are dry. Stick your finger 2-3cm deep - if it feels dry, it's time to water.`,
        priority: 'MEDIUM',
        careType: 'watering',
        actionable: true,
        actionLink: `/plant-care/watering/${plant.id}`, 
        iconEmoji: '💧'
      },
      'high': {
        title: '🌊 Water Daily',
        message: `Your ${plant.name} needs frequent watering. Keep the soil consistently moist but not soggy. Check soil every 2-3 days and water when the surface feels dry.`,
        priority: 'HIGH',
        careType: 'watering',
        actionable: true,
        actionLink: `/plant-care/watering/${plant.id}`, 
        iconEmoji: '🌊'
      },
      'low': {
        title: '💧 Water Sparingly',
        message: `Your ${plant.name} is drought-tolerant! Water only when the top 3 inches of soil are completely dry. This plant appreciates a break between waterings.`,
        priority: 'LOW',
        careType: 'watering',
        actionable: true,
        actionLink: `/plant-care/watering/${plant.id}`, 
        iconEmoji: '💧'
      },
      'daily': {
        title: '🌊 Daily Watering Required',
        message: `Your ${plant.name} requires daily watering. Keep soil consistently moist. If you go on vacation, consider asking someone to water or using a self-watering system.`,
        priority: 'HIGH',
        careType: 'watering',
        actionable: true,
        actionLink: `/plant-care/watering/${plant.id}`, 
        iconEmoji: '🌊'
      }
    };
    
    const tip = wateringTips[plant.waterRequirement.toLowerCase()];
    if (tip) {
      return tip;
    }
    return null;
  }

  generateLightTip(plant) {
    const lightTips = {
      'bright indirect light': {
        title: '☀️ Light Optimization',
        message: `${plant.name} thrives in bright indirect light. Position near an east or north-facing window. Rotate the plant weekly for even growth on all sides.`,
        priority: 'MEDIUM',
        careType: 'light',
        actionable: true,
        actionLink: `/plant-care/light/${plant.id}`, 
        iconEmoji: '☀️'
      },
      'low light': {
        title: '🌿 Low Light Guide',
        message: `Your ${plant.name} is a low-light champion! Place it in a bathroom, hallway, or north-facing room. Avoid direct afternoon sun which can scorch the leaves.`,
        priority: 'MEDIUM',
        careType: 'light',
        actionable: true,
        actionLink: `/plant-care/light/${plant.id}`, 
        iconEmoji: '🌿'
      },
      'direct sun': {
        title: '☀️ Direct Sunlight Care',
        message: `Your ${plant.name} needs full sun! Give it 6+ hours of direct sunlight. If indoors, place near a south-facing window or use grow lights.`,
        priority: 'HIGH',
        careType: 'light',
        actionable: true,
        actionLink: `/plant-care/light/${plant.id}`, 
        iconEmoji: '☀️'
      },
      'partial shade': {
        title: '🌤️ Partial Shade Care',
        message: `Your ${plant.name} prefers partial shade. Give it 3-6 hours of filtered sunlight. Perfect for east-facing windows or away from harsh afternoon sun.`,
        priority: 'MEDIUM',
        careType: 'light',
        actionable: true,
        actionLink: `/plant-care/light/${plant.id}`, 
        iconEmoji: '🌤️'
      },
      'full sun': {
        title: '☀️ Full Sun Expert',
        message: `Your ${plant.name} is a sun lover! Give it at least 6-8 hours of direct sunlight. Great for summer patios or sunny indoor spots.`,
        priority: 'MEDIUM',
        careType: 'light',
        actionable: true,
        actionLink: `/plant-care/light/${plant.id}`, 
        iconEmoji: '☀️'
      }
    };
    
    const tip = lightTips[plant.lightRequirement.toLowerCase()];
    if (tip) {
      return tip;
    }
    return null;
  }

  generateCareReminder(plant) {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[today.getDay()];
    
    const reminders = {
      sunday: {
        title: '🌿 Weekend Reset',
        message: `Sunday self-care: check your ${plant.name}'s soil moisture and give it a gentle leaf wipe. A happy plant starts the week strong!`,
        priority: 'LOW',
        careType: 'scheduling',
        actionable: true,
        actionLink: `/plant-care/schedule/${plant.id}`,
        iconEmoji: '🌿'
      },
      monday: {
        title: '📅 Weekly Plant Care',
        message: `Monday is the perfect day to check your ${plant.name}. Inspect for pests, water if needed, and rotate the plant for even growth.`,
        priority: 'MEDIUM',
        careType: 'scheduling',
        actionable: true,
        actionLink: `/plant-care/schedule/${plant.id}`, 
        iconEmoji: '📅'
      },
      wednesday: {
        title: '🌱 Mid-Week Check',
        message: `Wednesday's the day to mist your ${plant.name} and ensure the humidity is adequate. Keep an eye out for yellowing leaves or signs of stress.`,
        priority: 'LOW',
        careType: 'scheduling',
        actionable: true,
        actionLink: `/plant-care/schedule/${plant.id}`, 
        iconEmoji: '🌱'
      },
      friday: {
        title: '🌙 Weekend Prep',
        message: `Friday care: Prepare your ${plant.name} for the weekend by checking drainage and ensuring it has adequate water before Saturday and Sunday.`,
        priority: 'MEDIUM',
        careType: 'scheduling',
        actionable: true,
        actionLink: `/plant-care/schedule/${plant.id}`, 
        iconEmoji: '🌙'
      }
    };
    
    return reminders[dayOfWeek] || null;
  }

  getSeasonalPlantTips() {
    const today = new Date();
    const month = today.getMonth() + 1;
    let season = 'spring';
    if (month >= 3 && month <= 5) season = 'spring';
    else if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'fall';
    else season = 'winter';
    
    const seasonalTips = {
      'spring': [
        {
          title: '🌱 Spring Growth',
          message: 'Spring is ideal for pruning, repotting, and fertilizing your plants. New growth is beginning - support it with proper nutrients!',
          priority: 'MEDIUM',
          careType: 'seasonal',
          actionable: false
        },
        {
          title: '🌼 Pest Watch',
          message: 'As plants wake from winter dormancy, keep an eye out for pests that become active. Check undersides of leaves and around pot drainage holes.',
          priority: 'LOW',
          careType: 'seasonal',
          actionable: false
        }
      ],
      'summer': [
        {
          title: '☀️ Summer Alert',
          message: 'Your plants need extra water during summer heat. Water in the early morning or late evening to prevent evaporation and leaf scorch.',
          priority: 'HIGH',
          careType: 'seasonal',
          actionable: false
        },
        {
          title: '🌡️ Heat Protection',
          message: 'Keep plants away from air conditioning vents and radiators. Use shade cloth or move pots to shaded areas during the hottest parts of the day.',
          priority: 'MEDIUM',
          careType: 'seasonal',
          actionable: false
        }
      ],
      'fall': [
        {
          title: '🍂 Fall Prep',
          message: 'Reduce watering as plants enter dormancy. Add mulch around base plants and consider bringing tropical plants indoors for the winter.',
          priority: 'MEDIUM',
          careType: 'seasonal',
          actionable: false
        },
        {
          title: '🌱 Fall Fertilizing',
          message: 'Feed plants once this month with a balanced fertilizer to help them build energy reserves for winter survival.',
          priority: 'LOW',
          careType: 'seasonal',
          actionable: false
        }
      ],
      'winter': [
        {
          title: '❄️ Winter Care',
          message: 'Keep indoor plants hydrated but not waterlogged. Reduce fertilizing during dormancy. Mist regularly to combat dry indoor heating.',
          priority: 'MEDIUM',
          careType: 'seasonal',
          actionable: false
        },
        {
          title: '💡 Light Optimization',
          message: 'With shorter days, your plants may need supplemental light. Consider using grow lights for best results during winter months.',
          priority: 'LOW',
          careType: 'seasonal',
          actionable: false
        }
      ]
    };
    
    return seasonalTips[season] || [];
  }

  getGeneralPlantCareTips() {
    return [
      {
        title: '💧 Watering Basics',
        message: 'Most indoor plants need watering when the top 2-3cm of soil feels dry. Stick your finger in the soil to test moisture before watering.',
        priority: 'MEDIUM',
        careType: 'watering',
        actionable: false,
        iconEmoji: '💧'
      },
      {
        title: '☀️ Light Matters',
        message: 'Place plants near windows for natural light. East-facing windows are ideal for most houseplants. Rotate plants weekly for even growth.',
        priority: 'MEDIUM',
        careType: 'light',
        actionable: false,
        iconEmoji: '☀️'
      },
      {
        title: '🌱 Start Your Plant Journey',
        message: 'Browse our catalog to find the perfect plant for your space. We have options for every light condition and experience level!',
        priority: 'LOW',
        careType: 'general',
        actionable: true,
        actionLink: '/products',
        iconEmoji: '🌱'
      }
    ];
  }

  async saveCareTips(userId, tips) {
    try {
      const notifService = new NotificationService();
      
      for (const tip of tips) {
        await notifService.createInAppNotification(
          userId,
          'GARDEN',
          tip.title,
          tip.message,
          {
            tipId: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...tip,
            action: 'PLANT_CARE_REMINDER',
            timeSensitive: true,
            category: tip.careType,
            actionable: tip.actionable || false,
            actionLink: tip.actionLink || null
          }
        );
      }
      
      console.log(`Saved ${tips.length} plant care tips for user ${userId}`);
    } catch (error) {
      console.error('Error saving plant care tips:', error.message, error.stack);
      throw error;
    }
  }
}