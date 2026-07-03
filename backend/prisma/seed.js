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
  'MANAGE_LOYALTY',
  'VIEW_LOYALTY',
  'MANAGE_NOTIFICATIONS',
  'VIEW_NOTIFICATIONS',
];

const rolePermissions = {
  ADMIN: permissions,
  CUSTOMER: ['VIEW_DASHBOARD', 'USE_CHATBOT', 'USE_RECOMMENDATIONS', 'MANAGE_PROFILE', 'VIEW_LOYALTY', 'VIEW_NOTIFICATIONS'],
  FLORIST: ['VIEW_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_INVENTORY', 'VIEW_INVENTORY', 'ADJUST_INVENTORY', 'MANAGE_ORDERS', 'MANAGE_DELIVERY', 'VIEW_ANALYTICS', 'MANAGE_PROFILE', 'VIEW_NOTIFICATIONS'],
  GARDENER: ['VIEW_DASHBOARD', 'USE_CHATBOT', 'USE_RECOMMENDATIONS', 'MANAGE_PROFILE', 'VIEW_NOTIFICATIONS'],
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
    { name: 'Ceramic Planter Pot - White', slug: 'ceramic-planter-pot-white', sku: 'FS-POT-001', description: 'Minimalist white ceramic planter with drainage hole and matching saucer.', price: 15000, categorySlug: 'pots-vases', productType: 'pot', imageUrl: IMG + '1485955900006-10f4d324d411?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'white', tags: 'pots,ceramic,indoor,minimalist', featured: true },
    { name: 'Terracotta Pot Set - 3 Sizes', slug: 'terracotta-pot-set', sku: 'FS-POT-002', description: 'Classic terracotta pot set in 3 sizes. Essential for every plant lover.', price: 12000, categorySlug: 'pots-vases', productType: 'pot', imageUrl: IMG + '1530936781878-07b3c5b8cc28?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'terracotta', tags: 'pots,terracotta,set,classic' },
    { name: 'Glass Vase - Tall Cylinder', slug: 'glass-vase-tall-cylinder', sku: 'FS-POT-003', description: 'Elegant tall cylindrical glass vase. Perfect for showcasing long-stem flowers.', price: 18000, categorySlug: 'pots-vases', productType: 'vase', imageUrl: IMG + '1578500494893-f760f0e48b2d?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'clear', tags: 'vases,glass,modern,tall' },
    { name: 'Pruning Shears Set', slug: 'pruning-shears-set', sku: 'FS-TOOL-001', description: 'Professional-grade stainless steel pruning shears with ergonomic handles. Bypass design for clean cuts.', price: 25000, categorySlug: 'garden-tools', productType: 'tool', imageUrl: IMG + '1416879595382-4da1acebcd36?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'tools,pruning,shears,stainless-steel', featured: true },
    { name: 'Garden Trowel Set', slug: 'garden-trowel-set', sku: 'FS-TOOL-002', description: 'Set of 3 ergonomic garden trowels with rust-resistant coated steel heads.', price: 12000, categorySlug: 'garden-tools', productType: 'tool', imageUrl: IMG + '1592417817098-8fd3d9eb14a5?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'tools,trowel,set,ergonomic' },
    { name: 'Watering Can - Copper', slug: 'watering-can-copper', sku: 'FS-TOOL-003', description: 'Beautiful copper watering can with elegant design. Holds 2L with a precision rose spout.', price: 30000, categorySlug: 'garden-tools', productType: 'tool', imageUrl: IMG + '1563544326-03cb6fdc1d95?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'copper', tags: 'tools,watering,copper,decorative' },
    { name: 'Organic All-Purpose Fertilizer', slug: 'organic-all-purpose-fertilizer', sku: 'FS-FRT-001', description: 'Balanced organic fertilizer (5-5-5) suitable for all indoor and outdoor plants. 1kg bag.', price: 8000, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: IMG + '1585336763698-24f8a0e4e8e3?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,organic,all-purpose,npk', featured: true },
    { name: 'Liquid Seaweed Plant Food', slug: 'liquid-seaweed-plant-food', sku: 'FS-FRT-002', description: 'Concentrated liquid seaweed extract. Boosts root growth and plant vitality. 500ml bottle.', price: 6000, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: IMG + '1598866595-0b43e5a5e16c?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,liquid,seaweed,organic' },
    { name: 'Rose & Flower Food', slug: 'rose-flower-food', sku: 'FS-FRT-003', description: 'Specialized fertilizer formulated for roses and flowering plants. 800g granules.', price: 7000, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: IMG + '1592152645537-6b022f92ed2c?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,rose,flowering,granules' },
    { name: 'Garden Gnome - Classic', slug: 'garden-gnome-classic', sku: 'FS-DEC-001', description: 'Traditional hand-painted resin garden gnome with red hat. 20cm tall.', price: 12000, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: IMG + '1558618666-fcd25c85f82e?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'multicolor', tags: 'decorative,garden,gnome,outdoor', featured: true },
    { name: 'Solar Fairy Lights - 50 LED', slug: 'solar-fairy-lights', sku: 'FS-DEC-002', description: 'Warm white solar-powered fairy lights. 10m length with 50 LEDs. Perfect for garden ambiance.', price: 15000, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: IMG + '1558618666-fcd25c85f82e?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'warm white', tags: 'decorative,lights,solar,fairy,outdoor' },
    { name: 'Wind Chime - Bamboo', slug: 'wind-chime-bamboo', sku: 'FS-DEC-003', description: 'Soothing bamboo wind chime with deep resonant tones. 60cm length.', price: 10000, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: IMG + '1558618666-fcd25c85f82e?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'natural', tags: 'decorative,wind-chime,bamboo,outdoor' },
    { name: 'Spider Plant', slug: 'spider-plant', sku: 'FS-PLT-013', description: 'Hardy trailing plant with arching green and white striped leaves. Excellent air purifier and pet-safe.', price: 10000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1567225557594-88d73e55f2cb?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'bright indirect light', waterRequirement: 'moderate', soilType: 'well-draining potting mix', temperatureRange: '15-28°C', growthSize: '30-60cm', tags: 'indoor,air-purifying,pet-safe,trailing' },
    { name: 'Boston Fern', slug: 'boston-fern', sku: 'FS-PLT-014', description: 'Lush green fern with feathery fronds. Thrives in humidity and indirect light. Pet-safe and elegant.', price: 14000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1567225557594-88d73e55f2cb?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'partial shade', waterRequirement: 'high', soilType: 'rich potting mix', temperatureRange: '15-25°C', growthSize: '30-90cm', tags: 'indoor,pet-safe,humidity-loving,feathery' },
    { name: 'Areca Palm', slug: 'areca-palm', sku: 'FS-PLT-015', description: 'Elegant indoor palm with feathery fronds. Excellent air purifier and pet-friendly. Grows up to 2m indoors.', price: 22000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1721660782241-1e0cc5cdbce1?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'bright indirect light', waterRequirement: 'moderate', soilType: 'well-draining potting mix', temperatureRange: '18-28°C', growthSize: '120-200cm', tags: 'indoor,palm,air-purifying,pet-safe,statement', featured: true },
    { name: 'Calathea Orbifolia', slug: 'calathea-orbifolia', sku: 'FS-PLT-016', description: 'Stunning round leaves with silver-green stripes. A dramatic pet-safe plant for indirect light spaces.', price: 20000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1741620979764-54cf622e3d84?w=600&h=600&fit=crop', careLevel: 'expert', lightRequirement: 'low to bright indirect', waterRequirement: 'high', soilType: 'well-draining potting mix', temperatureRange: '18-27°C', growthSize: '40-60cm', tags: 'indoor,pet-safe,colorful,high-humidity' },
    { name: 'Orchid Plant - Phalaenopsis', slug: 'orchid-plant-phalaenopsis', sku: 'FS-PLT-017', description: 'Elegant moth orchid with long-lasting white blooms. A sophisticated gift that blooms for months.', price: 30000, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: IMG + '1610397648930-477b8c7f0943?w=600&h=600&fit=crop', careLevel: 'moderate', lightRequirement: 'bright indirect light', waterRequirement: 'low', soilType: 'orchid bark mix', temperatureRange: '18-28°C', growthSize: '30-60cm', tags: 'indoor,orchid,flowering,pet-safe,elegant', featured: true },
    { name: 'Tulip Bouquet - Mixed Colors', slug: 'tulip-bouquet-mixed', sku: 'FS-FLW-005', description: 'Vibrant mixed tulip bouquet in assorted colors. Perfect spring gift for any occasion.', price: 35000, categorySlug: 'flowers', productType: 'flower', imageUrl: IMG + '1518895949257-7621c3c786d7?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'bright indirect', waterRequirement: 'daily', temperatureRange: '15-24°C', color: 'multicolor', occasion: 'any', tags: 'flowers,bouquet,tulip,spring,colorful', featured: true },
    { name: 'Sunflower Bouquet - Happy', slug: 'sunflower-bouquet-happy', sku: 'FS-FLW-006', description: 'Bright and cheerful sunflower bouquet. Brings sunshine to any room.', price: 25000, categorySlug: 'flowers', productType: 'flower', imageUrl: IMG + '1518895949257-7621c3c786d7?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'bright indirect', waterRequirement: 'moderate', temperatureRange: '15-28°C', color: 'yellow', occasion: 'cheer-up', tags: 'flowers,bouquet,sunflower,cheerful,bright' },
    { name: 'Mixed Bouquet - Rainbow', slug: 'mixed-bouquet-rainbow', sku: 'FS-FLW-007', description: 'Colorful mixed flower bouquet with roses, lilies, and seasonal blooms. Perfect for any celebration.', price: 45000, categorySlug: 'flowers', productType: 'flower', imageUrl: IMG + '1518895949257-7621c3c786d7?w=600&h=600&fit=crop', careLevel: 'easy', lightRequirement: 'bright indirect', waterRequirement: 'daily', temperatureRange: '15-26°C', color: 'multicolor', occasion: 'celebration', tags: 'flowers,bouquet,mixed,colorful,premium' },
    { name: 'Ceramic Vase - Wide Flared', slug: 'ceramic-vase-wide-flared', sku: 'FS-POT-004', description: 'Beautiful wide-mouthed ceramic vase in cream. Perfect for large bouquets and statement arrangements.', price: 25000, categorySlug: 'pots-vases', productType: 'vase', imageUrl: IMG + '1578500494893-f760f0e48b2d?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'cream', tags: 'vases,ceramic,wide,flared,large-bouquet' },
    { name: 'Bud Vase - Glass Set 3', slug: 'bud-vase-glass-set-3', sku: 'FS-POT-005', description: 'Set of 3 small glass bud vases in varying heights. Ideal for single stems and small arrangements.', price: 12000, categorySlug: 'pots-vases', productType: 'vase', imageUrl: IMG + '1612994076779-59c73e4b6a45?w=600&h=600&fit=crop', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'clear', tags: 'vases,glass,bud,set,small' },
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

  const knowledgeItems = [
    { title: 'Watering indoor plants frequency', category: 'WATERING', keywords: 'water,watering,indoor,how often,frequency', question: 'How often should I water indoor plants?', answer: 'Most indoor plants need watering once every 7-14 days. Check soil moisture by inserting your finger 2-3cm deep — if dry, water thoroughly. Succulents need less frequent watering (every 2-3 weeks), while ferns may need water twice a week. Always ensure pots have drainage holes.' },
    { title: 'Yellow leaves cause', category: 'DISEASE', keywords: 'yellow,leaves,yellowing,monstera,why', question: 'Why are my plant leaves turning yellow?', answer: 'Yellow leaves are usually caused by overwatering (most common), poor drainage, low nutrients, or insufficient light. Check soil moisture first — if soggy, reduce watering. Ensure your pot has drainage. Consider fertilizing during growing season. For Monstera specifically, yellowing lower leaves are normal aging, but widespread yellowing suggests overwatering.' },
    { title: 'Overwatering signs', category: 'WATERING', keywords: 'overwater,overwatering,soggy,root rot,mushy', question: 'How do I know if I overwatered a plant?', answer: 'Signs of overwatering include yellow or wilting leaves, mushy stems, soggy soil that stays wet for days, mold on soil surface, and a musty smell. Stop watering immediately, move plant to brighter area, and consider repotting with fresh dry soil. Trim any rotten roots.' },
    { title: 'Low light plants', category: 'INDOOR_PLANTS', keywords: 'low light,shade,dim,no sun,dark room,beginner,dark corner', question: 'Which plants survive low light?', answer: 'Excellent low-light plants include Snake Plant (Sansevieria), ZZ Plant, Pothos, Peace Lily, Cast Iron Plant, and Philodendron. These can thrive in north-facing windows or corners with minimal natural light. Water less frequently in low-light conditions as plants use less water.' },
    { title: 'Indirect bright light explained', category: 'SUNLIGHT', keywords: 'indirect,bright indirect,what is,direct light,filtered', question: 'What is indirect bright light?', answer: 'Indirect bright light means the plant receives plenty of natural light but not direct sun rays. Place plants 1-2 meters from a south or west-facing window, or behind a sheer curtain. The light should be bright enough to read by. This is ideal for most tropical indoor plants like Monstera, Calathea, and Fiddle Leaf Fig.' },
    { title: 'Direct sun tolerant plants', category: 'SUNLIGHT', keywords: 'direct sun,full sun,direct sunlight,tolerate,can survive', question: 'Can plants survive direct sun?', answer: 'Many plants thrive in direct sun, including succulents, cacti, Hibiscus, Bougainvillea, Bird of Paradise, and most herbs. Outdoor plants like roses, marigolds, and sunflowers need full sun (6+ hours daily). For indoor plants, gradually acclimate them to direct sun to avoid leaf burn.' },
    { title: 'Fertilizer timing for flowers', category: 'FERTILIZER', keywords: 'fertilize,fertilizer,when,flowers,feeding,nutrients', question: 'When should I fertilize flowers?', answer: 'Fertilize flowering plants every 2-4 weeks during the growing season (spring through early autumn). Use a balanced fertilizer (10-10-10) or one higher in phosphorus for blooms. Reduce or stop fertilizing in winter when plants are dormant. Always follow package instructions — over-fertilizing can burn roots.' },
    { title: 'Rose fertilizer recommendation', category: 'FERTILIZER', keywords: 'fertilizer,roses,rose,feeding,nutrients,best', question: 'What fertilizer is good for roses?', answer: 'Roses thrive with a balanced fertilizer like 10-10-10 or a specialized rose food. Apply in early spring when new growth appears, then after each bloom cycle. Organic options include well-rotted manure, bone meal, and compost tea. We recommend our Rose & Flower Food (FS-FRT-003) for best results in Rwandan soil conditions.' },
    { title: 'Fertilizer frequency', category: 'FERTILIZER', keywords: 'fertilizer,how often,frequency,use,apply', question: 'How often should I use fertilizer?', answer: 'For most houseplants, fertilize once a month during spring and summer. Outdoor garden plants benefit from fertilization every 2-4 weeks during growing season. Slow-release fertilizers last 3-6 months. Always water plants before fertilizing to prevent root burn, and reduce frequency in cooler months.' },
    { title: 'Aphid removal', category: 'PESTS', keywords: 'aphid,aphids,remove,get rid,bugs,small green', question: 'How do I remove aphids?', answer: 'Remove aphids by spraying plants with a strong stream of water, or wipe leaves with a mixture of mild soap and water. Neem oil is an effective natural treatment. Introduce beneficial insects like ladybugs. For severe infestations, use insecticidal soap. Isolate affected plants to prevent spread.' },
    { title: 'Spider mite removal', category: 'PESTS', keywords: 'spider mite,mites,webbing,remove,get rid,webs', question: 'How do I remove spider mites?', answer: 'Spider mites thrive in dry conditions. Increase humidity by misting plants regularly. Wipe leaves with a damp cloth. Use neem oil or insecticidal soap spray. For severe cases, prune affected leaves. Isolate the plant and check nearby plants as mites spread quickly.' },
    { title: 'White bugs identification', category: 'PESTS', keywords: 'white bugs,white flies,mealybugs,small white,what are', question: 'What are white bugs on my plant?', answer: 'White bugs are likely mealybugs or whiteflies. Mealybugs look like small cottony masses on stems and leaf joints. Whiteflies are tiny white flying insects that scatter when disturbed. Treat both with neem oil, insecticidal soap, or rubbing alcohol on a cotton swab. Isolate affected plants immediately.' },
    { title: 'Brown leaves causes', category: 'DISEASE', keywords: 'brown,leaves,brown tips,browning,edges,crispy', question: 'Why are my plant leaves turning brown?', answer: 'Brown leaf tips or edges are usually caused by low humidity, inconsistent watering, or mineral buildup from tap water. For tropical plants, increase humidity with a pebble tray or mister. Use filtered or distilled water. Trim brown tips with clean scissors. Check for fertilizer salt buildup on soil surface.' },
    { title: 'Wilting leaves causes', category: 'DISEASE', keywords: 'wilting,wilt,drooping,leaves,limp,why', question: 'Why are my plant leaves wilting?', answer: 'Wilting can be from under-watering or over-watering. Check soil moisture: dry soil means water immediately, soggy soil means overwatering. Other causes include root rot, extreme temperatures, or transplant shock. For Monstera and similar plants, wilting with yellowing usually indicates overwatering.' },
    { title: 'Root rot prevention', category: 'DISEASE', keywords: 'root rot,prevent,drainage,how to avoid,mushy roots', question: 'How do I prevent root rot?', answer: 'Prevent root rot by using well-draining soil, pots with drainage holes, and allowing soil to dry between waterings. Never let plants sit in standing water. For indoor plants, use pots with saucers and empty excess water after 30 minutes. Add perlite or sand to heavy soils to improve drainage.' },
    { title: 'Best indoor plants for beginners', category: 'INDOOR_PLANTS', keywords: 'best,indoor,beginner,easy,starting,recommend,low maintenance', question: 'What are the best indoor plants for beginners?', answer: 'Great beginner plants include Snake Plant (impossible to kill), Pothos (trailing, forgiving), ZZ Plant (tolerates neglect), Peace Lily (tells you when thirsty), and Spider Plant (easy propagator). All tolerate low to medium light and irregular watering. Start with one of these to build confidence!' },
    { title: 'Pet-safe indoor plants', category: 'INDOOR_PLANTS', keywords: 'pet safe,pet-friendly,dogs,cats,non-toxic,safe,animals', question: 'What are the best pet-safe indoor plants?', answer: 'Pet-safe plants include Spider Plant, Boston Fern, Areca Palm, Calathea, Orchids, Parlor Palm, and African Violet. Avoid lilies, sago palm, aloe vera (toxic to cats/dogs), and Monstera (calcium oxalate crystals). Always check ASPCA database before bringing new plants home.' },
    { title: 'Air-purifying indoor plants', category: 'INDOOR_PLANTS', keywords: 'air purifying,air purification,clean air,oxygen,filter,NASA', question: 'What are the best air-purifying plants?', answer: 'NASA studies show Snake Plant, Peace Lily, Spider Plant, Areca Palm, and Boston Fern are top air-purifiers. Snake Plant releases oxygen at night, making it ideal for bedrooms. Peace Lily removes mold spores. Areca Palm is excellent for large spaces. Place 2-3 plants per 100 sq ft for best results.' },
    { title: 'Full sun flowers for Rwanda', category: 'OUTDOOR_PLANTS', keywords: 'full sun,flowers,Rwanda,tropical,warm climate,best', question: 'What are the best flowers for full sun in Rwanda?', answer: 'Rwanda\'s warm climate is perfect for Hibiscus, Bougainvillea, Bird of Paradise, Marigolds, Zinnias, and Roses. All thrive in full sun (6+ hours daily). In Kigali\'s moderate temperatures, these flowers bloom year-round with regular watering and monthly fertilization during growing seasons.' },
    { title: 'Hibiscus care', category: 'OUTDOOR_PLANTS', keywords: 'hibiscus,care,how to,grow,prune,watering', question: 'How do I care for hibiscus?', answer: 'Hibiscus loves full sun and regular watering — keep soil consistently moist but not waterlogged. Fertilize weekly during growing season with high-potassium fertilizer. Prune in early spring to shape and encourage blooms. Watch for aphids and spider mites. In Rwanda, hibiscus blooms year-round with proper care.' },
    { title: 'Vase flower freshness', category: 'VASE_CARE', keywords: 'vase,fresh,keep,flowers,freshness,longer,last,how', question: 'How do I keep flowers fresh in a vase?', answer: 'Keep flowers fresh by: 1) Cutting stems at a 45° angle before placing in vase, 2) Removing all leaves below waterline, 3) Changing water every 2 days, 4) Adding flower food or a pinch of sugar, 5) Keeping away from direct sun and fruit bowls. Recut stems every few days for best water uptake.' },
    { title: 'Vase water level', category: 'VASE_CARE', keywords: 'vase,water,how much,level,filled,amount', question: 'How much water should be in a vase?', answer: 'Fill vase with room-temperature water to about 2/3 of the vase height for most flowers. For woody stems (roses, chrysanthemums), fill to 3/4. For bulb flowers (tulips, daffodils), fill only 1/3 to prevent stem rot. Change water completely every 2-3 days for longest vase life.' },
    { title: 'Trimming flower stems', category: 'VASE_CARE', keywords: 'trim,stems,cut,how,angle,flowers,prune', question: 'How do I trim flower stems?', answer: 'Trim flower stems at a 45-degree angle using sharp, clean scissors or shears. Cut about 2-3cm from the bottom. The angled cut increases water absorption area. Trim every 2-3 days when changing water. For woody stems like roses, split the stem end with a clean cut for better water uptake.' },
    { title: 'Small balcony garden planning', category: 'GARDEN_PLANNER', keywords: 'balcony,garden,plan,small,space,compact,pots,herbs', question: 'How do I plan a small balcony garden?', answer: 'For a balcony garden: 1) Assess sunlight hours, 2) Choose compact or trailing plants, 3) Use vertical space with hanging planters and wall pockets, 4) Select self-watering pots for convenience, 5) Herbs like basil, mint, and rosemary are perfect for small spaces. Add a small water feature for ambiance and humidity.' },
    { title: 'Plant spacing guide', category: 'GARDEN_PLANNER', keywords: 'spacing,space,distance,apart,how much,between plants,sunflowers', question: 'How much spacing should plants have?', answer: 'Spacing depends on mature plant size: Small plants/herbs: 15-30cm apart, Medium shrubs: 60-90cm, Large plants: 90-150cm, Climbing plants: 100-200cm. For Sunflowers: 30-45cm apart for standard varieties, 60cm for giant types. Always check plant tags and consider mature size, not current size.' },
    { title: 'Low-maintenance plants recommendation', category: 'PRODUCT_HELP', keywords: 'recommend,low maintenance,easy care,beginners,hard to kill,best plants', question: 'Can you recommend low-maintenance plants?', answer: 'We recommend: Snake Plant (FS-PLT-002) — nearly indestructible, thrives on neglect, perfect for beginners. Peace Lily (FS-PLT-003) — tells you when it needs water by drooping. Aloe Vera (FS-PLT-012) — drought-tolerant succulent. Spider Plant (FS-PLT-013) — resilient and pet-safe. All under RWF 20,000!' },
    { title: 'Flowering plants recommendation', category: 'PRODUCT_HELP', keywords: 'recommend,flowering,blooms,flowers,colorful,best plants', question: 'Can you recommend flowering plants?', answer: 'Our top flowering plants: Hibiscus (FS-PLT-006) — vibrant tropical blooms all year. Bougainvillea (FS-PLT-007) — stunning magenta bracts, drought-tolerant. Peace Lily (FS-PLT-003) — elegant white blooms even in low light. Red Rose Bush (FS-PLT-004) — classic garden favorite. Premium Rose Bouquet (FS-FLW-001) — perfect gift arrangement.' },
    { title: 'Budget-friendly plants', category: 'PRODUCT_HELP', keywords: 'recommend,budget,cheap,under,affordable,50000,30000', question: 'Can you recommend plants under RWF 50,000?', answer: 'Many excellent plants under RWF 50,000: Snake Plant (RWF 15,000), Peace Lily (RWF 18,000), Aloe Vera (RWF 12,000), Spider Plant (RWF 10,000), Lavender Seeds (RWF 3,500), Marigold Seeds (RWF 3,000). For under RWF 10,000, seeds and small plants are great affordable options to start your garden.' },
    { title: 'Order support query', category: 'ORDER_HELP', keywords: 'order,delivery,status,shipping,track,where,when,arrive', question: 'How can I check my order status?', answer: 'You can check your order status by going to your Orders page in your account dashboard. Each order shows current status (PENDING, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED). For delivery tracking, use the Track Delivery option on your order. Contact support at support@florasmart.com for urgent inquiries.' },
    { title: 'Vase shape for bouquet', category: 'VASE_CARE', keywords: 'vase,shape,best,choose,match,bouquet,arrangement,which', question: 'What vase shape is best for my bouquet?', answer: 'Cylinder vases work well for most medium arrangements and provide stability. Bud vases are perfect for single stems or small arrangements. Wide/flared vases complement large, full bouquets. As a rule: vase height should be 40-70% of stem length. Our Glass Vase - Tall Cylinder (FS-POT-003) is versatile for most bouquets.' },
    { title: 'Frangipani care', category: 'OUTDOOR_PLANTS', keywords: 'frangipani,plumeria,care,tropical,flowering,fragrant', question: 'How do I care for Frangipani (Plumeria)?', answer: 'Frangipani loves full sun, warm temperatures (20-35°C), and well-draining sandy soil. Water moderately during growing season and reduce in winter. Fertilize monthly with high-phosphorus fertilizer for abundant blooms. In Rwanda, they thrive outdoors year-round. Prune in early spring to maintain shape and encourage branching.' },
  ];

  for (const item of knowledgeItems) {
    const existing = await prisma.chatbotKnowledgeBase.findFirst({
      where: { question: item.question },
    });
    if (!existing) {
      await prisma.chatbotKnowledgeBase.create({ data: item });
    }
  }

  const rewardData = [
    { name: 'Free Standard Delivery', description: 'Free standard delivery on your next order', pointsCost: 100, discountType: 'FREE_DELIVERY', discountValue: null, minimumOrderAmount: null },
    { name: 'RWF 5,000 Discount', description: 'Get RWF 5,000 off your order', pointsCost: 300, discountType: 'FIXED_AMOUNT', discountValue: 5000, minimumOrderAmount: 50000 },
    { name: '10% Off Flower Bouquets', description: '10% discount on any flower bouquet', pointsCost: 500, discountType: 'PERCENTAGE', discountValue: 10, minimumOrderAmount: null },
  ];
  for (const data of rewardData) {
    const existing = await prisma.loyaltyReward.findFirst({ where: { name: data.name } });
    if (!existing) {
      await prisma.loyaltyReward.create({ data });
    }
  }

  const planData = [
    { name: 'Basic Garden Care', description: 'Monthly care tips and basic plant recommendations', price: 5000, billingCycle: 'MONTHLY', benefits: { tips: 'monthly care tips', recommendations: 'basic recommendations' } },
    { name: 'Premium Plant Club', description: 'Priority recommendations, free delivery discount, monthly plant care guide', price: 15000, billingCycle: 'MONTHLY', benefits: { recommendations: 'priority recommendations', delivery: 'free delivery discount', guide: 'monthly plant care guide' } },
    { name: 'Florist Plus', description: 'Premium arrangements, event flower planning support, priority delivery', price: 30000, billingCycle: 'MONTHLY', benefits: { arrangements: 'premium arrangements', events: 'event flower planning support', delivery: 'priority delivery' } },
  ];
  for (const data of planData) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { name: data.name } });
    if (!existing) {
      await prisma.subscriptionPlan.create({ data });
    }
  }

  const notificationTemplates = [
    { name: 'REGISTRATION_OTP', subject: 'Your FloraSmart Registration OTP', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#4CAF50">Welcome to FloraSmart!</h2><p>Hi {{fullName}},</p><p>Use the OTP below to complete your registration. It expires in 10 minutes.</p><div style="font-size:28px;letter-spacing:6px;font-weight:700;text-align:center;padding:16px;background:#f5f5f5;border-radius:8px;margin:16px 0">{{otp}}</div><p>If you did not request this, please ignore this email.</p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'PASSWORD_RESET', subject: 'FloraSmart Password Reset', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#4CAF50">Password Reset</h2><p>Hi {{fullName}},</p><p>You requested a password reset. Use the token below to reset your password. It expires in 1 hour.</p><div style="font-size:18px;font-weight:700;text-align:center;padding:16px;background:#f5f5f5;border-radius:8px;margin:16px 0;word-break:break-all">{{token}}</div><p>If you did not request this, please ignore this email.</p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'ORDER_CONFIRMATION', subject: 'Order Confirmed - {{orderNumber}}', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#4CAF50">Order Confirmed!</h2><p>Hi {{fullName}},</p><p>Your order <strong>{{orderNumber}}</strong> has been confirmed.</p><p><strong>Total:</strong> {{totalAmount}} RWF</p><p><strong>Delivery:</strong> {{shippingAddress}}, {{shippingCity}}</p><p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p><p style="text-align:center;margin:24px 0"><a href="{{orderUrl}}" style="background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">View Order</a></p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'ORDER_STATUS_UPDATE', subject: 'Order Update - {{orderNumber}}', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#4CAF50">Order Status Update</h2><p>Hi {{fullName}},</p><p>Your order <strong>{{orderNumber}}</strong> status has changed to <strong>{{status}}</strong>.</p>{{#if note}}<p>{{note}}</p>{{/if}}<p style="text-align:center;margin:24px 0"><a href="{{orderUrl}}" style="background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">Track Order</a></p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'DELIVERY_STATUS_UPDATE', subject: 'Delivery Update - {{orderNumber}}', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#4CAF50">Delivery Update</h2><p>Hi {{fullName}},</p><p>Your delivery for order <strong>{{orderNumber}}</strong> is now: <strong>{{deliveryStatus}}</strong>.</p>{{#if note}}<p>{{note}}</p>{{/if}}<p style="text-align:center;margin:24px 0"><a href="{{orderUrl}}" style="background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">Track Delivery</a></p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'LOW_STOCK_ALERT', subject: 'Low Stock Alert - {{productName}}', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#e74c3c">Low Stock Alert</h2><p>The following product is low on stock:</p><table style="width:100%;border-collapse:collapse"><tr><th style="border:1px solid #ddd;padding:8px;text-align:left">Product</th><td style="border:1px solid #ddd;padding:8px">{{productName}}</td></tr><tr><th style="border:1px solid #ddd;padding:8px;text-align:left">SKU</th><td style="border:1px solid #ddd;padding:8px">{{sku}}</td></tr><tr><th style="border:1px solid #ddd;padding:8px;text-align:left">Available</th><td style="border:1px solid #ddd;padding:8px">{{availableQuantity}}</td></tr><tr><th style="border:1px solid #ddd;padding:8px;text-align:left">Threshold</th><td style="border:1px solid #ddd;padding:8px">{{threshold}}</td></tr></table><p style="text-align:center;margin:24px 0"><a href="{{inventoryUrl}}" style="background:#e74c3c;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">View Inventory</a></p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'LOYALTY_REWARD', subject: 'You earned a reward at FloraSmart!', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#4CAF50">Congratulations!</h2><p>Hi {{fullName}},</p><p>You redeemed a reward: <strong>{{rewardName}}</strong></p>{{#if couponCode}}<p>Use coupon code: <strong>{{couponCode}}</strong> on your next order.</p>{{/if}}<p style="text-align:center;margin:24px 0"><a href="{{loyaltyUrl}}" style="background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">View Rewards</a></p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'SUBSCRIPTION_STARTED', subject: 'Subscription Started - {{planName}}', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#4CAF50">Subscription Started!</h2><p>Hi {{fullName}},</p><p>Your <strong>{{planName}}</strong> subscription has started.</p><p><strong>Billing Cycle:</strong> {{billingCycle}}</p><p><strong>Next Billing Date:</strong> {{nextBillingDate}}</p><p style="text-align:center;margin:24px 0"><a href="{{subscriptionUrl}}" style="background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">Manage Subscription</a></p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'SUBSCRIPTION_CANCELLED', subject: 'Subscription Cancelled - {{planName}}', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#888">Subscription Cancelled</h2><p>Hi {{fullName}},</p><p>Your <strong>{{planName}}</strong> subscription has been cancelled.</p>{{#if reason}}<p>Reason: {{reason}}</p>{{/if}}<p>You can resubscribe anytime from your account settings.</p><p style="text-align:center;margin:24px 0"><a href="{{subscriptionUrl}}" style="background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">View Plans</a></p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
    { name: 'SYSTEM_ANNOUNCEMENT', subject: '{{subject}}', body: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#4CAF50">{{title}}</h2><p>{{message}}</p><hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small></div>', type: 'EMAIL', active: true },
  ];

  for (const tpl of notificationTemplates) {
    await prisma.notificationTemplate.upsert({
      where: { name: tpl.name },
      update: { subject: tpl.subject, body: tpl.body, active: true },
      create: tpl,
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
