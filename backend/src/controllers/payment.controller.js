import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AirtelMoneyService } from '../services/airtel-money.service.js';
import { CheckoutService } from '../services/checkout.service.js';
import { CartRepository, CartItemRepository } from '../repositories/cart.repository.js';
import { OrderRepository, OrderItemRepository, OrderStatusHistoryRepository } from '../repositories/order.repository.js';
import { AppError } from '../utils/appError.js';

const airtelService = new AirtelMoneyService();
const cartRepo = new CartRepository();
const cartItemRepo = new CartItemRepository();
const orderRepo = new OrderRepository();
const orderItemRepo = new OrderItemRepository();
const orderStatusRepo = new OrderStatusHistoryRepository();
const checkoutService = new CheckoutService(cartRepo, cartItemRepo, orderRepo, orderItemRepo, orderStatusRepo);

export const initiateAirtelPayment = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const { phone, deliveryMethod, shippingFullName, shippingPhone, shippingAddress, shippingCity, shippingDistrict, shippingNotes, total } = req.body;

  if (!phone) {
    throw new AppError('Airtel Money phone number is required', 400, 'PHONE_REQUIRED');
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const validPrefixes = ['2507', '25073'];
  const msisdn = cleanPhone.startsWith('250') ? cleanPhone : `250${cleanPhone.replace(/^0/, '')}`;

  if (msisdn.length < 12 || msisdn.length > 15) {
    throw new AppError('Please enter a valid Airtel Money phone number', 400, 'INVALID_PHONE');
  }

  if (!validPrefixes.some((p) => msisdn.startsWith(p))) {
    throw new AppError('Please enter a valid Airtel Rwanda phone number', 400, 'INVALID_PHONE_PREFIX');
  }

  const cart = await cartRepo.findActiveByUserId(userId);
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400, 'EMPTY_CART');
  }

  const checkoutPayload = {
    deliveryMethod: deliveryMethod || 'STANDARD',
    shippingFullName: shippingFullName || '',
    shippingPhone: shippingPhone || phone,
    shippingAddress: shippingAddress || '',
    shippingCity: shippingCity || '',
    shippingDistrict: shippingDistrict || '',
    shippingNotes: shippingNotes || '',
    paymentMethod: 'AIRTEL_MONEY',
  };

  const transactionId = airtelService.generateTransactionId();

  const result = await airtelService.initiatePayment({
    phone: msisdn,
    amount: Number(total) || 0,
    transactionId,
  });

  if (!result.success) {
    throw new AppError(result.message || 'Failed to initiate payment', 500, 'PAYMENT_INIT_FAILED');
  }

  // Store checkout data in the payment record for later order creation
  try {
    const { getPrismaClient } = await import('../database/prisma.js');
    const prisma = getPrismaClient();
    await prisma.payment.update({
      where: { transactionId },
      data: { checkoutData: checkoutPayload },
    });
  } catch {
    // Non-critical - shipping data will use defaults if this fails
  }

  return successResponse(res, {
    message: 'Payment request sent to your Airtel Money number',
    data: {
      transactionId,
      customerPhone: msisdn,
      paymentMethod: 'AIRTEL_MONEY',
      checkoutData: checkoutPayload,
    },
  });
});

export const checkAirtelPaymentStatus = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    throw new AppError('Transaction ID is required', 400, 'TRANSACTION_ID_REQUIRED');
  }

  const payment = await airtelService.checkStatus(transactionId);

  // If payment is completed and no order exists yet, create the order now
  if (payment.status === 'COMPLETED' && !payment.orderId) {
    const prisma = (await import('../database/prisma.js')).getPrismaClient();
    const dbPayment = await prisma.payment.findUnique({ where: { transactionId } });
    const userId = req.auth.userId;

    // Use stored checkout data from the initiate phase (not req.query)
    const storedData = dbPayment?.checkoutData || {};
    const checkoutPayload = {
      deliveryMethod: storedData.deliveryMethod || 'STANDARD',
      shippingFullName: storedData.shippingFullName || '',
      shippingPhone: storedData.shippingPhone || '',
      shippingAddress: storedData.shippingAddress || '',
      shippingCity: storedData.shippingCity || '',
      shippingDistrict: storedData.shippingDistrict || '',
      shippingNotes: storedData.shippingNotes || '',
      paymentMethod: 'AIRTEL_MONEY',
      transactionId,
    };

    // Prevent duplicate orders: re-check after fetching data
    const freshPayment = await prisma.payment.findUnique({ where: { transactionId } });
    if (freshPayment?.orderId) {
      return successResponse(res, {
        message: 'Payment completed successfully. Thank you for your order.',
        data: {
          status: 'COMPLETED',
          transactionId,
          orderId: freshPayment.orderId,
          orderNumber: freshPayment.order?.orderNumber || '',
          payment,
        },
      });
    }

    const order = await checkoutService.checkout(userId, checkoutPayload);

    await airtelService.confirmPayment(transactionId, order.id);

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID' },
    });

    try {
      const { NotificationService } = await import('../services/notification.service.js');
      const ns = new NotificationService();
      ns.sendNotification(userId, 'PAYMENT', 'Payment Successful', `Your Airtel Money payment of ${payment.currency} ${payment.amount} for order ${order.orderNumber} was successful.`, { orderId: order.id, transactionId });
    } catch {}

    return successResponse(res, {
      message: 'Payment completed successfully. Thank you for your order.',
      data: {
        status: 'COMPLETED',
        transactionId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        payment,
      },
    });
  }

  const messages = {
    COMPLETED: 'Payment completed successfully. Thank you for your order.',
    FAILED: 'Payment could not be completed. Please try again.',
    CANCELLED: 'Payment was cancelled.',
    EXPIRED: 'The payment request has expired. Please initiate a new payment.',
    TIMEOUT: 'Payment confirmation is taking longer than expected. We will continue checking your payment status.',
    PENDING: 'Waiting for you to authorize the payment on your phone...',
  };

  const data = {
    status: payment.status,
    transactionId: payment.transactionId,
    amount: payment.amount,
    currency: payment.currency,
    customerPhone: payment.customerPhone,
    orderId: payment.orderId,
    message: messages[payment.status] || 'Processing your payment...',
  };

  return successResponse(res, { message: data.message, data });
});

export const cancelAirtelPayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    throw new AppError('Transaction ID is required', 400, 'TRANSACTION_ID_REQUIRED');
  }

  await airtelService.cancelPayment(transactionId);

  return successResponse(res, { message: 'Payment cancelled successfully' });
});

export const handleAirtelWebhook = asyncHandler(async (req, res) => {
  const prisma = (await import('../database/prisma.js')).getPrismaClient();
  const body = req.body;

  const transactionId = body?.reference || body?.data?.reference || body?.transaction?.id || body?.id;
  const apiStatus = body?.data?.status || body?.status || '';

  if (transactionId) {
    const statusMap = {
      SUCCESS: 'COMPLETED',
      SUCCESSFUL: 'COMPLETED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
      EXPIRED: 'EXPIRED',
      TIMEOUT: 'TIMEOUT',
    };

    const mappedStatus = statusMap[apiStatus];
    if (mappedStatus && mappedStatus !== 'PENDING') {
      await prisma.payment.update({
        where: { transactionId },
        data: {
          status: mappedStatus,
          completedAt: mappedStatus === 'COMPLETED' ? new Date() : null,
          callbackData: body,
          airtelMessage: body?.message || null,
        },
      });
    }
  }

  return successResponse(res, { message: 'Webhook received' });
});
