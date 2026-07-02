import { getPrismaClient } from '../database/prisma.js';

export async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prisma = getPrismaClient();
  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: `FLR-${year}-` } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });
  let nextNum = 1;
  if (lastOrder) {
    const parts = lastOrder.orderNumber.split('-');
    nextNum = parseInt(parts[2], 10) + 1;
  }
  return `FLR-${year}-${String(nextNum).padStart(6, '0')}`;
}
