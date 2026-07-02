# Phase 5 – Cart & Checkout Report

## 1. Files Created

| File | Purpose |
|------|---------|
| `src/utils/orderNumber.js` | Order number generation (FLR-YYYY-NNNNNN) |
| `src/repositories/cart.repository.js` | CartRepository, CartItemRepository |
| `src/repositories/order.repository.js` | OrderRepository, OrderItemRepository, OrderStatusHistoryRepository |
| `src/services/cart.service.js` | Cart business logic (get, add, update, remove, clear, stock check) |
| `src/services/checkout.service.js` | Checkout logic with atomic transaction |
| `src/services/order.service.js` | Order read logic (list, get with RBAC) |
| `src/validators/cart.validators.js` | Cart item validation rules |
| `src/validators/checkout.validators.js` | Checkout field validation |
| `src/validators/order.validators.js` | Order param validation |
| `src/controllers/cart.controller.js` | Thin cart controller |
| `src/controllers/checkout.controller.js` | Thin checkout controller |
| `src/controllers/order.controller.js` | Thin order controller |
| `src/routes/v1/checkout.routes.js` | POST /api/v1/checkout |

## 2. Files Modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added Cart, CartItem, Order, OrderItem, OrderStatusHistory models; relations on User, Product |
| `src/routes/v1/cart.routes.js` | Filled with cart endpoints (GET, POST, PATCH, DELETE) |
| `src/routes/v1/orders.routes.js` | Filled with order read endpoints (list, get by ID) |
| `src/routes/v1/index.js` | Added checkoutRoutes import and /checkout route |
| `backend/README.md` | Added cart, checkout, order endpoint documentation and RBAC table |

## 3. Database Models Added

- **Cart** – userId, status (ACTIVE/CHECKED_OUT/ABANDONED), unique(userId, status)
- **CartItem** – cartId + productId (unique), quantity, unitPrice, currency
- **Order** – orderNumber (unique), userId, status, paymentStatus, subtotal, deliveryFee, discountAmount, totalAmount, shipping fields, deliveryMethod, paymentMethod
- **OrderItem** – stores productName, productSku, unitPrice at checkout time (price snapshot)
- **OrderStatusHistory** – orderId, status, note, changedById

## 4. Migration Status

Migration `20260702142915_cart_checkout_phase5` created and applied successfully.

## 5. Cart Endpoints Implemented

| Endpoint | Method | Status |
|----------|--------|--------|
| GET /api/v1/cart | GET | ✅ Working (auto-creates cart if none exists) |
| POST /api/v1/cart/items | POST | ✅ Working (increments qty if product exists) |
| PATCH /api/v1/cart/items/:itemId | PATCH | ✅ Working |
| DELETE /api/v1/cart/items/:itemId | DELETE | ✅ Working |
| DELETE /api/v1/cart | DELETE | ✅ Working |

## 6. Checkout Endpoint Implemented

| Endpoint | Method | Status |
|----------|--------|--------|
| POST /api/v1/checkout | POST | ✅ Working |

## 7. Order Read Endpoints Implemented

| Endpoint | Method | Status |
|----------|--------|--------|
| GET /api/v1/orders | GET | ✅ Customer sees own, Admin sees all |
| GET /api/v1/orders/:id | GET | ✅ With RBAC filtering |

## 8. Inventory Integration

- Stock availability checked during add-to-cart and update-quantity ✅
- Stock availability re-checked during checkout ✅
- Inventory stock reduced via SALE movement on checkout ✅
- Inventory movements created with referenceType=ORDER, referenceId=order.id ✅
- Product stockStatus auto-updated after stock reduction ✅

## 9. Stock Reduction Test Result

After checkout of 2 items (qty 1 + qty 2):
- 2 SALE inventory movements created ✅
- Movements reference the created order ID ✅
- Product stockStatus updated ✅

## 10. Cart Checkout Transaction Result

Atomic transaction confirmed - order, order items, status history, stock reduction, inventory movements, and cart status change all completed ✅

## 11. RBAC Verification

- CUSTOMER: cart management + checkout ✅, orders (own only) ✅
- ADMIN: order list (all) ✅
- Unauthenticated: 401 on cart/checkout/orders ✅

## 12. Test Results

| Test | Result |
|------|--------|
| GET empty cart (auto-creates) | ✅ |
| Add product to cart | ✅ |
| Add same product (qty increases) | ✅ (2→5) |
| Update cart item quantity | ✅ (5→4) |
| Remove cart item | ✅ |
| Add 2 different products | ✅ |
| Checkout valid cart | ✅ Order FLR-2026-000001, total 54,000 RWF |
| Delivery fee calculated | ✅ (STANDARD = 2,000 RWF) |
| Order items created | ✅ (2 items) |
| Cart marked CHECKED_OUT | ✅ (new cart is empty) |
| Order history created | ✅ (PENDING status) |
| Customer lists own orders | ✅ (1 order) |
| Customer views order details | ✅ |
| Admin lists all orders | ✅ |
| Unauthenticated 401 | ✅ |

## 13. Remaining Issues

- Overflow qty > stock boundary requires an explicit product with known low stock to test precisely
- No automated tests yet
- Cart clearing via `DELETE /cart` returns successful even when cart is already empty (acceptable)
- Order status updates (PROCESSING, CONFIRMED, CANCELLED) not yet implemented

## 14. Recommended Next Phase

**Phase 6: Orders & Delivery** — Implement order status management (processing, confirmed, cancelled), delivery assignment, delivery tracking, notifications, and full admin order management.
