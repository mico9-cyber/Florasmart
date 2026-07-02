import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const roles = ['ADMIN', 'CUSTOMER', 'FLORIST', 'GARDENER'];
const permissions = [
  'MANAGE_USERS',
  'MANAGE_ROLES',
  'VIEW_DASHBOARD',
  'MANAGE_PRODUCTS',
  'MANAGE_INVENTORY',
  'VIEW_INVENTORY',
  'ADJUST_INVENTORY',
  'MANAGE_ORDERS',
  'MANAGE_DELIVERY',
  'VIEW_ANALYTICS',
  'VIEW_AUDIT_LOGS',
  'USE_CHATBOT',
  'USE_RECOMMENDATIONS',
  'MANAGE_PROFILE',
];

const rolePermissions = {
  ADMIN: permissions,
  CUSTOMER: ['VIEW_DASHBOARD', 'USE_CHATBOT', 'USE_RECOMMENDATIONS', 'MANAGE_PROFILE'],
  FLORIST: ['VIEW_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_INVENTORY', 'VIEW_INVENTORY', 'ADJUST_INVENTORY', 'MANAGE_ORDERS', 'MANAGE_DELIVERY', 'VIEW_ANALYTICS', 'MANAGE_PROFILE'],
  GARDENER: ['VIEW_DASHBOARD', 'USE_CHATBOT', 'USE_RECOMMENDATIONS', 'MANAGE_PROFILE'],
};

async function main() {
  const roleRecords = {};
  const permissionRecords = {};

  for (const name of roles) {
    roleRecords[name] = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of permissions) {
    permissionRecords[name] = await prisma.permission.upsert({ where: { name }, update: {}, create: { name } });
  }

  await prisma.rolePermission.deleteMany();
  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    for (const permissionName of permissionNames) {
      await prisma.rolePermission.create({
        data: { roleId: roleRecords[roleName].id, permissionId: permissionRecords[permissionName].id },
      });
    }
  }

  const passwordHash = await bcrypt.hash('Admin@12345', 12);

  const demoUsers = [
    { email: 'admin@florasmart.com', name: 'Admin User', roleName: 'ADMIN' },
    { email: 'customer@florasmart.com', name: 'Customer User', roleName: 'CUSTOMER' },
    { email: 'florist@florasmart.com', name: 'Florist User', roleName: 'FLORIST' },
    { email: 'gardener@florasmart.com', name: 'Gardener User', roleName: 'GARDENER' },
  ];

  const userRecords = {};
  for (const du of demoUsers) {
    const existingUser = await prisma.user.findUnique({ where: { email: du.email } });
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { name: du.name, passwordHash, isActive: true, isEmailVerified: true },
      });
      userRecords[du.roleName] = existingUser;
      const existingUr = await prisma.userRole.findUnique({
        where: { userId_roleId: { userId: existingUser.id, roleId: roleRecords[du.roleName].id } },
      }).catch(() => null);
      if (!existingUr) {
        await prisma.userRole.create({ data: { userId: existingUser.id, roleId: roleRecords[du.roleName].id } });
      }
    } else {
      const user = await prisma.user.create({
        data: {
          name: du.name,
          email: du.email,
          passwordHash,
          isActive: true,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          userRoles: { create: [{ roleId: roleRecords[du.roleName].id }] },
        },
      });
      userRecords[du.roleName] = user;
    }
  }

  const admin = userRecords.ADMIN;

  const categoryData = [
    { name: 'Indoor Plants', slug: 'indoor-plants', description: 'Perfect plants for inside your home' },
    { name: 'Outdoor Plants', slug: 'outdoor-plants', description: 'Plants that thrive in outdoor gardens' },
    { name: 'Flowers', slug: 'flowers', description: 'Beautiful fresh and dried flowers' },
    { name: 'Seeds', slug: 'seeds', description: 'High-quality seeds for your garden' },
    { name: 'Pots & Vases', slug: 'pots-vases', description: 'Stylish containers for every plant' },
    { name: 'Garden Tools', slug: 'garden-tools', description: 'Essential tools for gardening' },
    { name: 'Fertilizers', slug: 'fertilizers', description: 'Nutrients to help your plants thrive' },
    { name: 'Decorative Items', slug: 'decorative-items', description: 'Beautiful garden and home decorations' },
  ];

  const categoryRecords = {};
  for (const cat of categoryData) {
    categoryRecords[cat.slug] = await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: { description: cat.description },
      create: cat,
    });
  }

  const IMG = 'https://images.unsplash.com/photo-';

  const products = [
    { name: 'Monstera Deliciosa', slug: 'monstera-deliciosa', sku: 'FS-PLT-001', description: 'The iconic Swiss cheese plant with large, fenestrated leaves. A stunning statement piece for any room.', price: 35000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1741620979764-54cf622e3d84?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'bright indirect light', waterRequirement: 'moderate', soilType: 'well-draining potting mix', temperatureRange: '18-30°C', growthSize: '60-120cm', tags: 'indoor,statement,large,pet-friendly-no', featured: true },
    { name: 'Snake Plant', slug: 'snake-plant', sku: 'FS-PLT-002', description: 'Nearly indestructible snake plant with tall sword-like leaves. Perfect for beginners and low-light spaces.', price: 15000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1567225557594-88d73e55f2cb?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'low to bright indirect', waterRequirement: 'low', soilType: 'cactus mix', temperatureRange: '15-30°C', growthSize: '30-120cm', tags: 'indoor,beginners,low-light,air-purifying', featured: true },
    { name: 'Peace Lily', slug: 'peace-lily', sku: 'FS-PLT-003', description: 'Elegant white blooms and glossy dark leaves. One of the best air-purifying indoor plants.', price: 18000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1547816999-d99671865dcf?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'low to bright indirect', waterRequirement: 'moderate', soilType: 'rich potting mix', temperatureRange: '18-27°C', growthSize: '30-60cm', tags: 'indoor,flowering,air-purifying,shade-tolerant' },
    { name: 'Red Rose Bush', slug: 'rose-bush-red-velvet', sku: 'FS-PLT-004', description: 'Stunning hybrid tea rose with deep red velvety blooms. A garden classic loved across Rwanda.', price: 22000, categorySlug: 'outdoor-plants', productType: 'plant', imageUrl: IMG + '1518709779341-56cf4535e94b?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'full sun', waterRequirement: 'moderate', soilType: 'rich loamy soil', temperatureRange: '15-28°C', growthSize: '60-120cm', tags: 'outdoor,flowering,rose,perennial', featured: true },
    { name: 'Gardenia Jasminoides', slug: 'gardenia-jasminoides', sku: 'FS-PLT-005', description: 'Fragrant white flowers with a sweet intoxicating scent. Thrives in Rwandan highlands.', price: 18000, categorySlug: 'outdoor-plants', productType: 'plant', imageUrl: IMG + '1668315005673-f26a5f20a4cd?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'partial shade', waterRequirement: 'moderate', soilType: 'acidic well-draining', temperatureRange: '18-25°C', growthSize: '60-150cm', tags: 'outdoor,flowering,fragrant,acid-loving' },
    { name: 'Hibiscus Rosa-Sinensis', slug: 'hibiscus-rosa-sinensis', sku: 'FS-PLT-006', description: 'Vibrant tropical hibiscus with large crimson blooms. A beloved garden flower in Rwanda.', price: 25000, categorySlug: 'outdoor-plants', productType: 'plant', imageUrl: IMG + '1567990989224-6441e1483ac8?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'full sun', waterRequirement: 'moderate', soilType: 'well-draining loamy', temperatureRange: '20-32°C', growthSize: '100-250cm', tags: 'outdoor,flowering,tropical,showy', featured: true },
    { name: 'Bougainvillea Spectabilis', slug: 'bougainvillea-spectabilis', sku: 'FS-PLT-007', description: 'Stunning climbing plant with brilliant magenta bracts. Perfect for Rwandan garden walls and trellises.', price: 20000, categorySlug: 'outdoor-plants', productType: 'plant', imageUrl: IMG + '1744446499844-5b8b773b23b1?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'full sun', waterRequirement: 'low', soilType: 'well-draining any', temperatureRange: '18-35°C', growthSize: '200-500cm', tags: 'outdoor,climbing,flowering,drought-tolerant', featured: true },
    { name: 'Frangipani (Plumeria)', slug: 'frangipani-plumeria', sku: 'FS-PLT-008', description: 'Exquisitely fragrant flowers in pink and white. Thrives in warm Rwandan gardens.', price: 28000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1715899495384-213543e6ed1e?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'full sun', waterRequirement: 'low', soilType: 'well-draining sandy', temperatureRange: '20-35°C', growthSize: '150-500cm', tags: 'indoor,flowering,fragrant,tropical', featured: true },
    { name: 'Lavender English', slug: 'lavender-english', sku: 'FS-SD-001', description: 'Aromatic English lavender seeds. Grow your own fragrant purple blooms for gardens and sachets.', price: 3500, categorySlug: 'seeds', productType: 'seed', imageUrl: IMG + '1460191269172-12c3ce6e8bfa?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'full sun', waterRequirement: 'low', soilType: 'well-draining alkaline', temperatureRange: '15-25°C', growthSize: '30-60cm', tags: 'seeds,aromatic,purple,drought-tolerant', featured: true },
    { name: 'Sunflower Giant', slug: 'sunflower-giant', sku: 'FS-SD-002', description: 'Giant sunflower seeds that grow up to 3m tall with massive 30cm flower heads.', price: 2500, categorySlug: 'seeds', productType: 'seed', imageUrl: IMG + '1460191269172-12c3ce6e8bfa?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'full sun', waterRequirement: 'moderate', soilType: 'any well-draining', temperatureRange: '18-30°C', growthSize: '200-350cm', tags: 'seeds,annual,tall,children-friendly' },
    { name: 'Mixed Wildflower Meadow', slug: 'mixed-wildflower-meadow', sku: 'FS-SD-003', description: 'A beautiful blend of native wildflowers. Perfect for pollinator gardens.', price: 4500, categorySlug: 'seeds', productType: 'seed', imageUrl: IMG + '1661142175513-a5f0871f1ad1?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'full sun to partial', waterRequirement: 'low', soilType: 'any', temperatureRange: '10-28°C', growthSize: '20-80cm', tags: 'seeds,wildflower,pollinator,native' },
    { name: 'Premium Rose Bouquet', slug: 'premium-rose-bouquet', sku: 'FS-FLW-001', description: 'A dozen premium long-stem red roses arranged by master florists. Perfect for any romantic occasion.', price: 55000, categorySlug: 'flowers', productType: 'flower', imageUrl: IMG + '1518895949257-7621c3c786d7?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'bright indirect', waterRequirement: 'daily', temperatureRange: '15-25°C', color: 'red', occasion: 'romance', tags: 'flowers,bouquet,roses,romantic,gift', featured: true },
    { name: 'Tropical Orchid Arrangement', slug: 'tropical-orchid-arrangement', sku: 'FS-FLW-004', description: 'Exquisite orchid arrangement featuring vibrant blooms. A sophisticated gift for any occasion.', price: 65000, categorySlug: 'flowers', productType: 'flower', imageUrl: IMG + '1610397648930-477b8c7f0943?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'bright indirect', waterRequirement: 'low', temperatureRange: '18-28°C', color: 'purple', occasion: 'any', tags: 'flowers,orchid,tropical,premium,gift', featured: true },
    { name: 'Dried Lavender Bundle', slug: 'dried-lavender-bundle', sku: 'FS-FLW-003', description: 'Hand-tied dried lavender bundles. Bring lasting fragrance and rustic charm to any space.', price: 10000, categorySlug: 'flowers', productType: 'flower', imageUrl: IMG + '1460191269172-12c3ce6e8bfa?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'any', waterRequirement: 'none', temperatureRange: 'any', color: 'purple', tags: 'flowers,dried,lavender,aromatic,long-lasting' },
    { name: 'Jasmine Flowering Plant', slug: 'jasmine-flowering-plant', sku: 'FS-PLT-009', description: 'Enchantingly fragrant jasmine blooms that perfume the evening air. Ideal for Rwandan verandas.', price: 16000, categorySlug: 'outdoor-plants', productType: 'plant', imageUrl: IMG + '1763227998461-0def27f3de3b?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'full sun to partial', waterRequirement: 'moderate', soilType: 'well-draining fertile', temperatureRange: '18-30°C', growthSize: '100-300cm', tags: 'outdoor,flowering,fragrant,climbing' },
    { name: 'Bird of Paradise', slug: 'bird-of-paradise', sku: 'FS-PLT-010', description: 'Stunning crane-like flowers in orange and blue. A tropical showstopper for Rwandan gardens.', price: 35000, categorySlug: 'outdoor-plants', productType: 'plant', imageUrl: IMG + '1621233575336-fb37d63123d7?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'full sun', waterRequirement: 'moderate', soilType: 'well-draining fertile', temperatureRange: '18-32°C', growthSize: '100-150cm', tags: 'outdoor,flowering,tropical,showy', featured: true },
    { name: 'Marigold African', slug: 'marigold-african', sku: 'FS-SD-004', description: 'Vibrant African marigold seeds producing large golden-orange blooms. A Rwandan garden favorite.', price: 3000, categorySlug: 'seeds', productType: 'seed', imageUrl: IMG + '1661142175513-a5f0871f1ad1?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'full sun', waterRequirement: 'low', soilType: 'any well-draining', temperatureRange: '15-30°C', growthSize: '30-60cm', tags: 'seeds,marigold,flowering,annual,pollinator' },
    { name: 'Poinsettia Pulcherrima', slug: 'poinsettia-pulcherrima', sku: 'FS-PLT-011', description: 'Brilliant red bracts that bring festive color. A popular ornamental in Rwandan homes.', price: 20000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1744446499844-5b8b773b23b1?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'bright indirect', waterRequirement: 'moderate', soilType: 'well-draining potting mix', temperatureRange: '18-25°C', growthSize: '50-120cm', tags: 'indoor,flowering,colorful,festive' },
    { name: 'Aloe Vera', slug: 'aloe-vera', sku: 'FS-PLT-012', description: 'Versatile succulent with healing properties. Thrives in Rwandan sun with minimal care.', price: 12000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1613143798921-c342c82c32e2?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'bright indirect to direct', waterRequirement: 'low', soilType: 'cactus mix sandy', temperatureRange: '18-32°C', growthSize: '30-60cm', tags: 'indoor,succulent,medicinal,drought-tolerant' },
    { name: 'Ceramic Planter Pot - White', slug: 'ceramic-planter-pot-white', sku: 'FS-POT-001', description: 'Minimalist white ceramic planter with drainage hole and matching saucer.', price: 15000, categorySlug: 'pots-vases', productType: 'pot', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'white', tags: 'pots,ceramic,indoor,minimalist', featured: true },
    { name: 'Terracotta Pot Set - 3 Sizes', slug: 'terracotta-pot-set', sku: 'FS-POT-002', description: 'Classic terracotta pot set in 3 sizes. Essential for every plant lover.', price: 12000, categorySlug: 'pots-vases', productType: 'pot', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'terracotta', tags: 'pots,terracotta,set,classic' },
    { name: 'Glass Vase - Tall Cylinder', slug: 'glass-vase-tall-cylinder', sku: 'FS-POT-003', description: 'Elegant tall cylindrical glass vase. Perfect for showcasing long-stem flowers.', price: 18000, categorySlug: 'pots-vases', productType: 'vase', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'clear', tags: 'vases,glass,modern,tall' },
    { name: 'Pruning Shears Set', slug: 'pruning-shears-set', sku: 'FS-TOOL-001', description: 'Professional-grade stainless steel pruning shears with ergonomic handles. Bypass design for clean cuts.', price: 25000, categorySlug: 'garden-tools', productType: 'tool', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'tools,pruning,shears,stainless-steel', featured: true },
    { name: 'Garden Trowel Set', slug: 'garden-trowel-set', sku: 'FS-TOOL-002', description: 'Set of 3 ergonomic garden trowels with rust-resistant coated steel heads.', price: 12000, categorySlug: 'garden-tools', productType: 'tool', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'tools,trowel,set,ergonomic' },
    { name: 'Watering Can - Copper', slug: 'watering-can-copper', sku: 'FS-TOOL-003', description: 'Beautiful copper watering can with elegant design. Holds 2L with a precision rose spout.', price: 30000, categorySlug: 'garden-tools', productType: 'tool', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'copper', tags: 'tools,watering,copper,decorative' },
    { name: 'Organic All-Purpose Fertilizer', slug: 'organic-all-purpose-fertilizer', sku: 'FS-FRT-001', description: 'Balanced organic fertilizer (5-5-5) suitable for all indoor and outdoor plants. 1kg bag.', price: 8000, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,organic,all-purpose,npk', featured: true },
    { name: 'Liquid Seaweed Plant Food', slug: 'liquid-seaweed-plant-food', sku: 'FS-FRT-002', description: 'Concentrated liquid seaweed extract. Boosts root growth and plant vitality. 500ml bottle.', price: 6000, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,liquid,seaweed,organic' },
    { name: 'Rose & Flower Food', slug: 'rose-flower-food', sku: 'FS-FRT-003', description: 'Specialized fertilizer formulated for roses and flowering plants. 800g granules.', price: 7000, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,rose,flowering,granules' },
    { name: 'Garden Gnome - Classic', slug: 'garden-gnome-classic', sku: 'FS-DEC-001', description: 'Traditional hand-painted resin garden gnome with red hat. 20cm tall.', price: 12000, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'multicolor', tags: 'decorative,garden,gnome,outdoor', featured: true },
    { name: 'Solar Fairy Lights - 50 LED', slug: 'solar-fairy-lights', sku: 'FS-DEC-002', description: 'Warm white solar-powered fairy lights. 10m length with 50 LEDs. Perfect for garden ambiance.', price: 15000, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'warm white', tags: 'decorative,lights,solar,fairy,outdoor' },
    { name: 'Wind Chime - Bamboo', slug: 'wind-chime-bamboo', sku: 'FS-DEC-003', description: 'Soothing bamboo wind chime with deep resonant tones. 60cm length.', price: 10000, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: IMG + '1581783898377-1c85bf937427?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'natural', tags: 'decorative,wind-chime,bamboo,outdoor' },
  ];

  for (const p of products) {
    const cat = categoryRecords[p.categorySlug];
    if (!cat) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        description: p.description,
        imageUrl: p.imageUrl,
        active: true,
        featured: p.featured || false,
        currency: 'RWF',
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        currency: 'RWF',
        categoryId: cat.id,
        productType: p.productType,
        imageUrl: p.imageUrl,
        careLevel: p.careLevel || null,
        lightRequirement: p.lightRequirement || null,
        waterRequirement: p.waterRequirement || null,
        soilType: p.soilType || null,
        temperatureRange: p.temperatureRange || null,
        growthSize: p.growthSize || null,
        color: p.color || null,
        occasion: p.occasion || null,
        tags: p.tags || null,
        createdById: admin.id,
        active: true,
        featured: p.featured || false,
      },
    });
  }

  const locationData = [
    { name: 'Main Store', code: 'MAIN', description: 'Primary retail store location', address: 'Kigali, Rwanda' },
    { name: 'Greenhouse', code: 'GREENHOUSE', description: 'Greenhouse for live plant storage', address: 'Kigali, Rwanda' },
    { name: 'Florist Shop', code: 'FLORIST', description: 'Florist workshop and arrangement space', address: 'Kigali, Rwanda' },
    { name: 'Warehouse', code: 'WAREHOUSE', description: 'Bulk storage warehouse', address: 'Kigali, Rwanda' },
  ];

  const locationRecords = {};
  for (const loc of locationData) {
    locationRecords[loc.code] = await prisma.inventoryLocation.upsert({
      where: { code: loc.code },
      update: { name: loc.name, description: loc.description, address: loc.address, active: true, deletedAt: null },
      create: loc,
    });
  }

  const stockByProductType = {
    plant: { min: 10, max: 60, threshold: 5, reorder: 3, maxStock: 100 },
    flower: { min: 5, max: 30, threshold: 3, reorder: 2, maxStock: 50 },
    seed: { min: 50, max: 300, threshold: 20, reorder: 10, maxStock: 500 },
    pot: { min: 10, max: 80, threshold: 5, reorder: 3, maxStock: 150 },
    vase: { min: 10, max: 80, threshold: 5, reorder: 3, maxStock: 150 },
    tool: { min: 10, max: 100, threshold: 5, reorder: 3, maxStock: 200 },
    fertilizer: { min: 20, max: 150, threshold: 10, reorder: 5, maxStock: 300 },
    decorative: { min: 10, max: 100, threshold: 5, reorder: 3, maxStock: 150 },
  };

  const activeProducts = await prisma.product.findMany({ where: { deletedAt: null } });

  for (const product of activeProducts) {
    const stockConfig = stockByProductType[product.productType] || { min: 10, max: 50, threshold: 5, reorder: 3, maxStock: 100 };
    const quantity = Math.floor(Math.random() * (stockConfig.max - stockConfig.min + 1)) + stockConfig.min;

    const existingStock = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: product.id, locationId: locationRecords.MAIN.id } },
    });

    if (!existingStock) {
      await prisma.stockLevel.create({
        data: {
          productId: product.id,
          locationId: locationRecords.MAIN.id,
          quantity,
          reservedQuantity: 0,
          lowStockThreshold: stockConfig.threshold,
          reorderPoint: stockConfig.reorder,
          maxStockLevel: stockConfig.maxStock,
        },
      });
    }

    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        locationId: locationRecords.MAIN.id,
        movementType: 'STOCK_IN',
        quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        reason: 'Initial seed stock',
        referenceType: 'SEED',
        performedById: admin.id,
      },
    });

    const totalAvailable = quantity;
    let stockStatus;
    if (totalAvailable <= 0) {
      stockStatus = 'out_of_stock';
    } else if (totalAvailable <= stockConfig.threshold) {
      stockStatus = 'low_stock';
    } else {
      stockStatus = 'in_stock';
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { stockStatus },
    });
  }

  console.log('Seed completed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
