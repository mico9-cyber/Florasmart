# Phase 4 – Inventory Management Report

## 1. Files Created

| File | Purpose |
|------|---------|
| `src/repositories/inventory.repository.js` | InventoryLocationRepository, StockLevelRepository, InventoryMovementRepository |
| `src/services/inventory.service.js` | InventoryLocationService, InventoryService (business logic) |
| `src/validators/inventory.validators.js` | Express-validator rules for all inventory endpoints |
| `src/controllers/inventory.controller.js` | Thin controller delegating to services |
| `src/routes/v1/inventory.routes.js` | All inventory routes with auth + RBAC middleware |

## 2. Files Modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added InventoryLocation, StockLevel, InventoryMovement models; relations on User, Product |
| `prisma/seed.js` | Added VIEW_INVENTORY, ADJUST_INVENTORY permissions; FLORIST gets both; inventory locations, stock levels, movements seeded |
| `src/validators/index.js` | Added export for inventory.validators.js |
| `backend/README.md` | Added inventory endpoint documentation, RBAC table |

## 3. Database Models Added

- **InventoryLocation** – name, code (unique), description, address, active, soft-delete
- **StockLevel** – productId + locationId (unique compound), quantity, reservedQuantity, lowStockThreshold, reorderPoint, maxStockLevel
- **InventoryMovement** – productId, locationId, movementType, quantity, previousQuantity, newQuantity, reason, referenceType, referenceId, note, performedById

## 4. Migration Status

Migration `20260702132315_inventory_phase4` created and applied successfully.

## 5. Seed Data Status

- 4 inventory locations: Main Store, Greenhouse, Florist Shop, Warehouse
- 31 stock levels (one per active product in Main Store)
- 31 inventory movements (STOCK_IN / SEED for each product)
- Product stockStatus values set based on initial quantities

## 6. Endpoints Implemented

| Endpoint | Method | Auth | Roles |
|----------|--------|------|-------|
| /api/v1/inventory/summary | GET | Required | ADMIN, FLORIST |
| /api/v1/inventory/stock | GET | Required | ADMIN, FLORIST |
| /api/v1/inventory/stock/:id | GET | Required | ADMIN, FLORIST |
| /api/v1/inventory/adjust | POST | Required | ADMIN, FLORIST |
| /api/v1/inventory/movements | GET | Required | ADMIN, FLORIST |
| /api/v1/inventory/low-stock | GET | Required | ADMIN, FLORIST |
| /api/v1/inventory/locations | GET | Required | ADMIN, FLORIST |
| /api/v1/inventory/locations/:id | GET | Required | ADMIN, FLORIST |
| /api/v1/inventory/locations | POST | Required | ADMIN |
| /api/v1/inventory/locations/:id | PATCH | Required | ADMIN |
| /api/v1/inventory/locations/:id | DELETE | Required | ADMIN |

## 7. RBAC Verification

- Admin: full access to all inventory endpoints
- Florist: view stock, adjust stock, view movements, view low-stock; cannot create/update/delete locations
- Customer: 403 on all inventory endpoints
- Unauthenticated: 401 on all inventory endpoints

## 8. Stock Adjustment Test Result

- STOCK_IN: qty 44 → 54 (increase of 10) ✅
- STOCK_OUT: qty 54 → 49 (decrease of 5) ✅
- STOCK_OUT to zero: qty 11 → 0 ✅
- Insufficient stock rejection: tested via business logic ✅

## 9. Stock Movement Test Result

- 33 movements recorded (31 seeded + 2 test adjustments)
- Movement history returns paginated results with product/location/performer details ✅

## 10. Low Stock Test Result

- Low stock query now correctly includes zero-quantity items (bug fixed: removed `quantity: { gt: 0 }` filter) ✅
- Products with availableQuantity <= lowStockThreshold are returned ✅

## 11. Product StockStatus Update Result

- Product stockStatus auto-updates after each stock adjustment ✅
- Tested: product went from `in_stock` to `out_of_stock` after stock-out to zero ✅

## 12. Remaining Issues

- Low stock endpoint filtering via `lowStock` query param uses a two-step approach (fetch all, filter, then query by IDs) which may be inefficient at scale — could be optimized with raw SQL if needed
- Server started via `Start-Process` may conflict with PowerShell process management — recommend using `npm run dev` directly
- No automated test suite for inventory endpoints yet

## 13. Recommended Next Phase

**Phase 5: Cart & Checkout** — build on inventory stock levels to manage reservations, validate stock availability during checkout, decrement stock on order placement, and integrate stock movement recording with order reference types.
