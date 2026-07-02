# FloraSmart Backend

Node.js + Express.js + MySQL + Prisma backend foundation for FloraSmart.

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in the database, JWT, and mail values.

## Running the server

```bash
npm run dev
```

## Database setup

1. Create the MySQL database `florasmart_db`.
2. Set `DATABASE_URL` in `.env`.
3. Run Prisma migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Authentication phase

### Seed

```bash
npx prisma db seed
```

### Demo admin

- Email: admin@florasmart.com
- Password: Admin@12345
- Role: ADMIN

### Auth endpoints

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- PATCH /api/v1/users/me
- POST /api/v1/auth/password/forgot
- POST /api/v1/auth/password/reset

### Category endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/categories | public | - | List active categories |
| GET | /api/v1/categories/:id | public | - | Get category by ID |
| POST | /api/v1/categories | required | ADMIN, FLORIST | Create category |
| PATCH | /api/v1/categories/:id | required | ADMIN, FLORIST | Update category |
| DELETE | /api/v1/categories/:id | required | ADMIN | Soft delete category |

**Create category example:**
```json
POST /api/v1/categories
{
  "name": "Succulents",
  "description": "Drought-tolerant succulent plants"
}
```

### Product endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/products | public | - | List active products (with filters) |
| GET | /api/v1/products/slug/:slug | public | - | Get product by slug |
| GET | /api/v1/products/:id | public | - | Get product by ID |
| POST | /api/v1/products | required | ADMIN, FLORIST | Create product |
| PATCH | /api/v1/products/:id | required | ADMIN, FLORIST | Update product |
| DELETE | /api/v1/products/:id | required | ADMIN | Soft delete product |

**Query parameters for GET /api/v1/products:**

| Param | Type | Description |
|-------|------|-------------|
| q | string | Search by name, description, tags |
| category | string | Filter by category slug |
| productType | string | Filter by type (plant, flower, seed, pot, tool, fertilizer, decorative, vase) |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| careLevel | string | Filter by care level (easy, moderate) |
| lightRequirement | string | Filter by light requirement |
| active | boolean | Show inactive items (admin only) |
| featured | boolean | Filter featured products |
| sort | string | Sort: price_asc, price_desc, name_asc, name_desc, newest, oldest |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 12, max: 100) |

**Response format:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "totalPages": 9
  }
}
```

**Create product example:**
```json
POST /api/v1/products
{
  "name": "Monstera Deliciosa",
  "sku": "FS-PLT-100",
  "price": 49.99,
  "categoryId": "<category-uuid>",
  "productType": "plant",
  "careLevel": "easy",
  "lightRequirement": "bright indirect light",
  "waterRequirement": "moderate"
}
```

**Query examples:**
```
GET /api/v1/products?q=rose&minPrice=10&maxPrice=50&sort=price_asc&page=1&limit=20
GET /api/v1/products?category=indoor-plants&productType=plant&featured=true
GET /api/v1/products?careLevel=easy&lightRequirement=low
```

### Inventory Endpoints (Phase 4)

All inventory endpoints require authentication.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/inventory/summary | required | ADMIN, FLORIST | Inventory dashboard summary |
| GET | /api/v1/inventory/stock | required | ADMIN, FLORIST | List stock levels (paginated, filterable) |
| GET | /api/v1/inventory/stock/:id | required | ADMIN, FLORIST | Get stock level details |
| POST | /api/v1/inventory/adjust | required | ADMIN, FLORIST | Adjust stock (STOCK_IN, STOCK_OUT, ADJUSTMENT, RETURN, DAMAGE) |
| GET | /api/v1/inventory/movements | required | ADMIN, FLORIST | Stock movement history |
| GET | /api/v1/inventory/low-stock | required | ADMIN, FLORIST | Low stock alerts |
| GET | /api/v1/inventory/locations | required | ADMIN, FLORIST | List inventory locations |
| GET | /api/v1/inventory/locations/:id | required | ADMIN, FLORIST | Get location by ID |
| POST | /api/v1/inventory/locations | required | ADMIN | Create location |
| PATCH | /api/v1/inventory/locations/:id | required | ADMIN | Update location |
| DELETE | /api/v1/inventory/locations/:id | required | ADMIN | Soft delete location |

**Stock adjustment request example:**
```json
POST /api/v1/inventory/adjust
{
  "productId": "uuid",
  "locationId": "uuid",
  "quantity": 10,
  "movementType": "STOCK_IN",
  "reason": "Restocked from supplier",
  "note": "Optional note"
}
```

**Stock adjustment rules:**
- `STOCK_IN` / `RETURN`: adds quantity to current stock
- `STOCK_OUT` / `DAMAGE` / `SALE`: subtracts quantity (cannot go below 0)
- `ADJUSTMENT`: sets quantity to the specified value
- `RESERVATION`: reserves quantity (does not change available count)
- `RELEASE`: releases reserved quantity

**Low stock logic:**
- `OUT_OF_STOCK`: total available quantity <= 0
- `LOW_STOCK`: total available quantity <= lowStockThreshold
- `IN_STOCK`: otherwise

**Stock movement types:** STOCK_IN, STOCK_OUT, ADJUSTMENT, RETURN, DAMAGE, RESERVATION, RELEASE, SALE

**Inventory summary response example:**
```json
{
  "success": true,
  "message": "Inventory summary retrieved successfully",
  "data": {
    "totalProducts": 31,
    "totalStockQuantity": 1682,
    "totalReservedQuantity": 0,
    "totalAvailableQuantity": 1682,
    "lowStockCount": 0,
    "outOfStockCount": 0,
    "inventoryValue": 20432000
  }
}
```

**Seed instructions for inventory:**
```bash
npx prisma db seed
```
This creates 4 default locations (Main Store, Greenhouse, Florist Shop, Warehouse), stock levels for all active products with realistic quantities by product type, and initial STOCK_IN movements with referenceType SEED. Idempotent — safe to run multiple times.

**Query parameters for GET /api/v1/inventory/stock:**

| Param | Type | Description |
|-------|------|-------------|
| q | string | Search by product name or SKU |
| productId | string | Filter by product |
| categoryId | string | Filter by category |
| locationId | string | Filter by location |
| stockStatus | string | Filter by status |
| lowStock | boolean | Show only low stock items |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 12, max: 100) |
| sort | string | Sort: quantity_asc, quantity_desc, name_asc, name_desc |

### Cart & Checkout Endpoints (Phase 5)

All cart and checkout endpoints require authentication and CUSTOMER role.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/cart | required | CUSTOMER | Get current active cart |
| POST | /api/v1/cart/items | required | CUSTOMER | Add item to cart |
| PATCH | /api/v1/cart/items/:itemId | required | CUSTOMER | Update cart item quantity |
| DELETE | /api/v1/cart/items/:itemId | required | CUSTOMER | Remove item from cart |
| DELETE | /api/v1/cart | required | CUSTOMER | Clear all cart items |
| POST | /api/v1/checkout | required | CUSTOMER | Complete checkout |

**Add to cart example:**
```json
POST /api/v1/cart/items
{
  "productId": "uuid",
  "quantity": 2
}
```

**Checkout example:**
```json
POST /api/v1/checkout
{
  "shippingFullName": "Ineza Darryl",
  "shippingPhone": "0780000000",
  "shippingAddress": "Kigali, Rwanda",
  "shippingCity": "Kigali",
  "shippingDistrict": "Gasabo",
  "shippingNotes": "Call on arrival",
  "deliveryMethod": "STANDARD",
  "paymentMethod": "TEST_PAYMENT"
}
```

**Delivery fee rules:**
- PICKUP: 0 RWF
- STANDARD: 2,000 RWF
- EXPRESS: 5,000 RWF

**Checkout process:**
1. Validate cart is not empty
2. Validate each product is active and not deleted
3. Check available stock from inventory
4. Calculate subtotal, delivery fee, and total
5. Generate order number (FLR-YYYY-NNNNNN)
6. Create order, order items, and status history in a transaction
7. Reduce inventory stock (SALE movement with referenceType ORDER)
8. Update product stockStatus
9. Mark cart as CHECKED_OUT
10. Return order summary

### Order Read Endpoints (Phase 5)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/orders | required | CUSTOMER, ADMIN, FLORIST | List orders (customer sees own only) |
| GET | /api/v1/orders/:id | required | CUSTOMER, ADMIN, FLORIST | Get order details |

### Order Management Endpoints (Phase 6)

All order management endpoints require authentication.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/orders | required | CUSTOMER, ADMIN, FLORIST | List orders (customer sees own only) |
| GET | /api/v1/orders/:id | required | CUSTOMER, ADMIN, FLORIST | Get order details with status history, items, delivery |
| PATCH | /api/v1/orders/:id/status | required | ADMIN, FLORIST | Update order status |
| POST | /api/v1/orders/:id/cancel | required | CUSTOMER, ADMIN, FLORIST | Cancel order |

**Order status transitions:**
```
PENDING → PROCESSING → CONFIRMED → PREPARING → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED
CANCELLED allowed from: PENDING, PROCESSING, CONFIRMED, READY_FOR_DELIVERY
DELIVERED and CANCELLED are final — no further transitions allowed
```

**Update order status example:**
```json
PATCH /api/v1/orders/:id/status
{
  "status": "PROCESSING",
  "note": "Starting processing"
}
```

**Cancel order example:**
```json
POST /api/v1/orders/:id/cancel
{
  "reason": "Changed my mind"
}
```

**Cancellation rules:**
- CUSTOMER can only cancel own orders in PENDING or PROCESSING status
- ADMIN/FLORIST can cancel any order that is not DELIVERED or already CANCELLED
- Cancellation restores stock to the inventory via RETURN movement with referenceType ORDER_CANCEL
- Product stockStatus is recalculated after restoration

**Auto-delivery creation:**
- When order reaches READY_FOR_DELIVERY status (and deliveryMethod is not PICKUP), a Delivery record is auto-created with status PENDING_ASSIGNMENT

### Delivery Management Endpoints (Phase 6)

All delivery endpoints require authentication.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/deliveries | required | ADMIN, FLORIST | List deliveries |
| GET | /api/v1/deliveries/:id | required | ADMIN, FLORIST | Get delivery details |
| POST | /api/v1/deliveries/:orderId/assign | required | ADMIN, FLORIST | Assign delivery to a user |
| PATCH | /api/v1/deliveries/:id/status | required | ADMIN, FLORIST | Update delivery status |
| GET | /api/v1/deliveries/track/:orderId | required | CUSTOMER, ADMIN, FLORIST | Track delivery by order |

**Delivery status transitions:**
```
PENDING_ASSIGNMENT → ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED
FAILED allowed from: ASSIGNED, PICKED_UP, ON_THE_WAY
CANCELLED allowed from: PENDING_ASSIGNMENT, ASSIGNED
DELIVERED, FAILED, CANCELLED are final
```

**Assign delivery example:**
```json
POST /api/v1/deliveries/:orderId/assign
{
  "assignedToId": "user-uuid",
  "scheduledAt": "2026-07-03T10:00:00Z",
  "note": "Assign to warehouse team"
}
```

**Update delivery status example:**
```json
PATCH /api/v1/deliveries/:id/status
{
  "status": "PICKED_UP",
  "location": "Main Store - Kigali",
  "note": "Package picked up from store"
}
```

**Delivery-to-order status sync:**
- ASSIGNED → Order set to OUT_FOR_DELIVERY (if currently READY_FOR_DELIVERY)
- PICKED_UP → Order set to OUT_FOR_DELIVERY
- ON_THE_WAY → Order set to OUT_FOR_DELIVERY
- DELIVERED → Order set to DELIVERED
- FAILED → Order set to READY_FOR_DELIVERY

**Delivery tracking response example (customer view):**
```json
GET /api/v1/deliveries/track/:orderId
{
  "success": true,
  "data": {
    "orderNumber": "FLR-2026-000001",
    "orderStatus": "OUT_FOR_DELIVERY",
    "deliveryId": "uuid",
    "deliveryStatus": "ASSIGNED",
    "assignedTo": { "name": "Admin User" },
    "scheduledAt": "2026-07-03T10:00:00.000Z",
    "currentLocation": null,
    "events": [
      {
        "status": "ASSIGNED",
        "note": "Assign to warehouse team",
        "location": null,
        "createdAt": "2026-07-02T16:08:05.891Z"
      }
    ]
  }
}
```

**Query parameters for GET /api/v1/orders:**

| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by order status |
| paymentStatus | string | Filter by payment status |
| customerId | string | Filter by customer (admin/florist only) |
| dateFrom | string | Filter by start date |
| dateTo | string | Filter by end date |
| q | string | Search by order number or shipping name |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 12, max: 100) |
| sort | string | Sort: newest, oldest, total_asc, total_desc |

**Query parameters for GET /api/v1/deliveries:**

| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by delivery status |
| assignedToId | string | Filter by assigned user |
| dateFrom | string | Filter by start date |
| dateTo | string | Filter by end date |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 12, max: 100) |

### Authorization

| Role | Categories | Products | Inventory | Cart & Checkout | Orders | Deliveries |
|------|-----------|----------|-----------|-----------------|--------|------------|
| ADMIN | Full CRUD | Full CRUD | Full CRUD | None | Full CRUD | Full CRUD |
| FLORIST | Create, Read, Update | Create, Read, Update | View stock, adjust stock | None | Manage status | Manage status, assign |
| CUSTOMER | Read active only | Read active only | None | Full cart management + checkout | View own, cancel own | Track own |
| GARDENER | Read active only | Read active only | None | None | None | None |
| Unauthenticated | Read active only | Read active only | None | None | None | None |
