import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const cats = await prisma.productCategory.findMany();
  console.log('=== Categories ===');
  for (const c of cats) {
    const count = await prisma.product.count({ where: { categoryId: c.id, active: true, deletedAt: null } });
    console.log(`${c.name} (${c.slug}): ${count} active products`);
  }

  console.log('\n=== All active products ===');
  const products = await prisma.product.findMany({ where: { active: true, deletedAt: null }, include: { category: true }, orderBy: { createdAt: 'desc' } });
  for (const p of products) {
    console.log(`${p.name} | cat: ${p.category.name} | price: ${p.price} | imageUrl: ${p.imageUrl ? 'YES' : 'NO'}`);
  }
} finally {
  await prisma.$disconnect();
}
