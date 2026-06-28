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
  FLORIST: ['VIEW_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_INVENTORY', 'MANAGE_ORDERS', 'MANAGE_DELIVERY', 'VIEW_ANALYTICS', 'MANAGE_PROFILE'],
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
  const admin = await prisma.user.upsert({
    where: { email: 'admin@florasmart.com' },
    update: { name: 'Admin User', passwordHash, isActive: true },
    create: {
      name: 'Admin User',
      email: 'admin@florasmart.com',
      passwordHash,
      isActive: true,
      userRoles: { create: [{ roleId: roleRecords.ADMIN.id }] },
    },
  });

  const existing = await prisma.userRole.findUnique({ where: { userId_roleId: { userId: admin.id, roleId: roleRecords.ADMIN.id } } }).catch(() => null);
  if (!existing) {
    await prisma.userRole.create({ data: { userId: admin.id, roleId: roleRecords.ADMIN.id } });
  }

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

  const products = [
    { name: 'Monstera Deliciosa', slug: 'monstera-deliciosa', sku: 'FS-PLT-001', description: 'The iconic Swiss cheese plant with large, fenestrated leaves. A stunning statement piece for any room.', price: 49.99, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: '/images/products/monstera.jpg', careLevel: 'easy', lightRequirement: 'bright indirect light', waterRequirement: 'moderate', soilType: 'well-draining potting mix', temperatureRange: '18-30°C', growthSize: '60-120cm', tags: 'indoor,statement,large,pet-friendly-no', featured: true },
    { name: 'Snake Plant', slug: 'snake-plant', sku: 'FS-PLT-002', description: 'Nearly indestructible snake plant with tall sword-like leaves. Perfect for beginners and low-light spaces.', price: 24.99, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: '/images/products/snake-plant.jpg', careLevel: 'easy', lightRequirement: 'low to bright indirect', waterRequirement: 'low', soilType: 'cactus mix', temperatureRange: '15-30°C', growthSize: '30-120cm', tags: 'indoor,beginners,low-light,air-purifying', featured: true },
    { name: 'Peace Lily', slug: 'peace-lily', sku: 'FS-PLT-003', description: 'Elegant white blooms and glossy dark leaves. One of the best air-purifying indoor plants.', price: 29.99, categorySlug: 'indoor-plants', productType: 'plant', imageUrl: '/images/products/peace-lily.jpg', careLevel: 'easy', lightRequirement: 'low to bright indirect', waterRequirement: 'moderate', soilType: 'rich potting mix', temperatureRange: '18-27°C', growthSize: '30-60cm', tags: 'indoor,flowering,air-purifying,shade-tolerant' },
    { name: 'Rose Bush - Red Velvet', slug: 'rose-bush-red-velvet', sku: 'FS-PLT-004', description: 'Stunning hybrid tea rose with deep red velvety blooms. A garden classic.', price: 34.99, categorySlug: 'outdoor-plants', productType: 'plant', imageUrl: '/images/products/red-rose.jpg', careLevel: 'moderate', lightRequirement: 'full sun', waterRequirement: 'moderate', soilType: 'rich loamy soil', temperatureRange: '15-28°C', growthSize: '60-120cm', tags: 'outdoor,flowering,rose,perennial', featured: true },
    { name: 'Gardenia Jasminoides', slug: 'gardenia-jasminoides', sku: 'FS-PLT-005', description: 'Fragrant white flowers with a sweet intoxicating scent. A southern garden treasure.', price: 27.99, categorySlug: 'outdoor-plants', productType: 'plant', imageUrl: '/images/products/gardenia.jpg', careLevel: 'moderate', lightRequirement: 'partial shade', waterRequirement: 'moderate', soilType: 'acidic well-draining', temperatureRange: '18-25°C', growthSize: '60-150cm', tags: 'outdoor,flowering,fragrant,acid-loving' },
    { name: 'Lavender English', slug: 'lavender-english', sku: 'FS-SD-001', description: 'Aromatic English lavender seeds. Grow your own fragrant purple blooms for gardens and sachets.', price: 4.99, categorySlug: 'seeds', productType: 'seed', imageUrl: '/images/products/lavender-seeds.jpg', careLevel: 'easy', lightRequirement: 'full sun', waterRequirement: 'low', soilType: 'well-draining alkaline', temperatureRange: '15-25°C', growthSize: '30-60cm', tags: 'seeds,aromatic,purple,drought-tolerant', featured: true },
    { name: 'Sunflower Giant', slug: 'sunflower-giant', sku: 'FS-SD-002', description: 'Giant sunflower seeds that grow up to 3m tall with massive 30cm flower heads.', price: 3.99, categorySlug: 'seeds', productType: 'seed', imageUrl: '/images/products/sunflower-seeds.jpg', careLevel: 'easy', lightRequirement: 'full sun', waterRequirement: 'moderate', soilType: 'any well-draining', temperatureRange: '18-30°C', growthSize: '200-350cm', tags: 'seeds,annual,tall,children-friendly' },
    { name: 'Mixed Wildflower Meadow', slug: 'mixed-wildflower-meadow', sku: 'FS-SD-003', description: 'A beautiful blend of native wildflowers. Perfect for pollinator gardens.', price: 6.99, categorySlug: 'seeds', productType: 'seed', imageUrl: '/images/products/wildflower-seeds.jpg', careLevel: 'easy', lightRequirement: 'full sun to partial', waterRequirement: 'low', soilType: 'any', temperatureRange: '10-28°C', growthSize: '20-80cm', tags: 'seeds,wildflower,pollinator,native' },
    { name: 'Premium Rose Bouquet', slug: 'premium-rose-bouquet', sku: 'FS-FLW-001', description: 'A dozen premium long-stem red roses arranged by master florists. Perfect for any romantic occasion.', price: 79.99, categorySlug: 'flowers', productType: 'flower', imageUrl: '/images/products/rose-bouquet.jpg', careLevel: 'easy', lightRequirement: 'bright indirect', waterRequirement: 'daily', temperatureRange: '15-25°C', color: 'red', occasion: 'romance', tags: 'flowers,bouquet,roses,romantic,gift', featured: true },
    { name: 'Dried Lavender Bundle', slug: 'dried-lavender-bundle', sku: 'FS-FLW-002', description: 'Hand-tied dried lavender bundles. Bring lasting fragrance and rustic charm to any space.', price: 14.99, categorySlug: 'flowers', productType: 'flower', imageUrl: '/images/products/dried-lavender.jpg', careLevel: 'easy', lightRequirement: 'any', waterRequirement: 'none', temperatureRange: 'any', color: 'purple', tags: 'flowers,dried,lavender,aromatic,long-lasting' },
    { name: 'Ceramic Planter Pot - White', slug: 'ceramic-planter-pot-white', sku: 'FS-POT-001', description: 'Minimalist white ceramic planter with drainage hole and matching saucer.', price: 22.99, categorySlug: 'pots-vases', productType: 'pot', imageUrl: '/images/products/white-planter.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'white', tags: 'pots,ceramic,indoor,minimalist', featured: true },
    { name: 'Terracotta Pot Set - 3 Sizes', slug: 'terracotta-pot-set', sku: 'FS-POT-002', description: 'Classic terracotta pot set in 3 sizes. Essential for every plant lover.', price: 18.99, categorySlug: 'pots-vases', productType: 'pot', imageUrl: '/images/products/terracotta-set.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'terracotta', tags: 'pots,terracotta,set,classic' },
    { name: 'Glass Vase - Tall Cylinder', slug: 'glass-vase-tall-cylinder', sku: 'FS-POT-003', description: 'Elegant tall cylindrical glass vase. Perfect for showcasing long-stem flowers.', price: 26.99, categorySlug: 'pots-vases', productType: 'vase', imageUrl: '/images/products/glass-vase.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'clear', tags: 'vases,glass,modern,tall' },
    { name: 'Pruning Shears Set', slug: 'pruning-shears-set', sku: 'FS-TOOL-001', description: 'Professional-grade stainless steel pruning shears with ergonomic handles. Bypass design for clean cuts.', price: 34.99, categorySlug: 'garden-tools', productType: 'tool', imageUrl: '/images/products/pruning-shears.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'tools,pruning,shears,stainless-steel', featured: true },
    { name: 'Garden Trowel Set', slug: 'garden-trowel-set', sku: 'FS-TOOL-002', description: 'Set of 3 ergonomic garden trowels with rust-resistant coated steel heads.', price: 16.99, categorySlug: 'garden-tools', productType: 'tool', imageUrl: '/images/products/trowel-set.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'tools,trowel,set,ergonomic' },
    { name: 'Watering Can - Copper', slug: 'watering-can-copper', sku: 'FS-TOOL-003', description: 'Beautiful copper watering can with elegant design. Holds 2L with a precision rose spout.', price: 42.99, categorySlug: 'garden-tools', productType: 'tool', imageUrl: '/images/products/copper-watering-can.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'copper', tags: 'tools,watering,copper,decorative' },
    { name: 'Organic All-Purpose Fertilizer', slug: 'organic-all-purpose-fertilizer', sku: 'FS-FRT-001', description: 'Balanced organic fertilizer (5-5-5) suitable for all indoor and outdoor plants. 1kg bag.', price: 12.99, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: '/images/products/organic-fertilizer.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,organic,all-purpose,npk', featured: true },
    { name: 'Liquid Seaweed Plant Food', slug: 'liquid-seaweed-plant-food', sku: 'FS-FRT-002', description: 'Concentrated liquid seaweed extract. Boosts root growth and plant vitality. 500ml bottle.', price: 9.99, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: '/images/products/seaweed-fertilizer.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,liquid,seaweed,organic' },
    { name: 'Rose & Flower Food', slug: 'rose-flower-food', sku: 'FS-FRT-003', description: 'Specialized fertilizer formulated for roses and flowering plants. 800g granules.', price: 11.49, categorySlug: 'fertilizers', productType: 'fertilizer', imageUrl: '/images/products/rose-food.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, tags: 'fertilizer,rose,flowering,granules' },
    { name: 'Garden Gnome - Classic', slug: 'garden-gnome-classic', sku: 'FS-DEC-001', description: 'Traditional hand-painted resin garden gnome with red hat. 20cm tall.', price: 19.99, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: '/images/products/garden-gnome.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'multicolor', tags: 'decorative,garden,gnome,outdoor', featured: true },
    { name: 'Solar Fairy Lights - 50 LED', slug: 'solar-fairy-lights', sku: 'FS-DEC-002', description: 'Warm white solar-powered fairy lights. 10m length with 50 LEDs. Perfect for garden ambiance.', price: 24.99, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: '/images/products/fairy-lights.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'warm white', tags: 'decorative,lights,solar,fairy,outdoor' },
    { name: 'Wind Chime - Bamboo', slug: 'wind-chime-bamboo', sku: 'FS-DEC-003', description: 'Soothing bamboo wind chime with deep resonant tones. 60cm length.', price: 15.99, categorySlug: 'decorative-items', productType: 'decorative', imageUrl: '/images/products/bamboo-chime.jpg', careLevel: null, lightRequirement: null, waterRequirement: null, soilType: null, temperatureRange: null, growthSize: null, color: 'natural', tags: 'decorative,wind-chime,bamboo,outdoor' },
  ];

  for (const p of products) {
    const cat = categoryRecords[p.categorySlug];
    if (!cat) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        price: p.price,
        description: p.description,
        active: true,
        featured: p.featured || false,
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
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

  console.log('Seed completed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
