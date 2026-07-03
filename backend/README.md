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

1. Create the MySQL database `florasmart`.
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
- Role: ADMIN (full access)
- Other accounts: customer@florasmart.com, florist@florasmart.com, gardener@florasmart.com (same password)

### Auth endpoints

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- PATCH /api/v1/users/me
- POST /api/v1/auth/password/forgot
- POST /api/v1/auth/password/reset
- POST /api/v1/auth/register/verify-otp
- POST /api/v1/auth/register/resend-otp

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

### Garden Planner Endpoints (Phase 7)

All garden planner endpoints require authentication. Grid uses zero-indexed row/column coordinates.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/garden-plans | required | CUSTOMER, GARDENER, ADMIN, FLORIST | List plans (admin sees all users) |
| GET | /api/v1/garden-plans/summary/me | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Get plan summary counts |
| POST | /api/v1/garden-plans | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Create a garden plan |
| GET | /api/v1/garden-plans/:planId | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Get plan details |
| PATCH | /api/v1/garden-plans/:planId | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Update plan |
| DELETE | /api/v1/garden-plans/:planId | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Soft delete plan |
| POST | /api/v1/garden-plans/:planId/default | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Set plan as default |
| PUT | /api/v1/garden-plans/:planId/cells/:row/:col | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Update cell soil/sun/notes |
| DELETE | /api/v1/garden-plans/:planId/cells/:row/:col | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Reset cell to default |
| GET | /api/v1/garden-plans/:planId/placements | required | CUSTOMER, GARDENER, ADMIN, FLORIST | List plant placements |
| POST | /api/v1/garden-plans/:planId/placements | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Add plant placement |
| PATCH | /api/v1/garden-plans/:planId/placements/:placementId | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Update placement |
| DELETE | /api/v1/garden-plans/:planId/placements/:placementId | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Remove placement |
| GET | /api/v1/garden-plans/:planId/notes | required | CUSTOMER, GARDENER, ADMIN, FLORIST | List garden notes |
| POST | /api/v1/garden-plans/:planId/notes | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Add garden note |
| PATCH | /api/v1/garden-plans/:planId/notes/:noteId | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Update note |
| DELETE | /api/v1/garden-plans/:planId/notes/:noteId | required | CUSTOMER, GARDENER, ADMIN, FLORIST | Delete note |

**Create plan example:**
```json
POST /api/v1/garden-plans
{
  "name": "My Summer Garden",
  "description": "Planning my summer vegetable patch",
  "width": 8,
  "height": 6,
  "gridData": null,
  "tags": "summer,vegetables"
}
```

**Update cell example:**
```json
PUT /api/v1/garden-plans/:planId/cells/2/3
{
  "soilType": "loamy",
  "sunExposure": "partial shade",
  "notes": "Good spot for tomatoes"
}
```

**Add plant placement example:**
```json
POST /api/v1/garden-plans/:planId/placements
{
  "productId": "product-uuid",
  "row": 1,
  "col": 2,
  "quantity": 3,
  "notes": "Plant near trellis"
}
```

**Add garden note example:**
```json
POST /api/v1/garden-plans/:planId/notes
{
  "title": "Watering Reminder",
  "content": "Water plants every morning during dry season",
  "noteType": "reminder"
}
```

Note types: `general`, `reminder`, `observation`, `task`, `idea`

**Summary response example:**
```json
GET /api/v1/garden-plans/summary/me
{
  "success": true,
  "data": {
    "totalPlans": 3,
    "totalCells": 12,
    "totalPlacements": 8,
    "totalNotes": 5,
    "defaultPlanId": "plan-uuid"
  }
}
```

**Grid behavior:**
- Grid is zero-indexed (row 0, col 0 is top-left)
- Cells are upserted (PUT creates or updates)
- DELETE cell resets it (removes custom soil/sun/notes)
- Width/height are for frontend rendering hints

**Placement behavior:**
- Each placement references a Product record (any product type)
- Unique constraint: one product per row/col per plan
- Placement includes row, col, quantity, optional notes and plantedAt

**Note behavior:**
- Notes have a `noteType` field: general (default), reminder, observation, task, idea
- Soft deletion: plans use `deletedAt` for soft delete
- Notes are hard-deleted

### AI Recommendation Endpoints (Phase 8)

All recommendation endpoints require authentication.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /api/v1/recommendations/plants | required | CUSTOMER, GARDENER, ADMIN | Plant suitability recommendations |
| POST | /api/v1/recommendations/vase-match | required | CUSTOMER, FLORIST, ADMIN | Vase/bouquet matching |
| POST | /api/v1/recommendations/garden-plan | required | CUSTOMER, GARDENER, ADMIN | Garden plan recommendations |
| GET | /api/v1/recommendations/products | required | CUSTOMER, GARDENER, FLORIST, ADMIN | Product recommendations (catalog) |
| GET | /api/v1/recommendations/history | required | CUSTOMER, GARDENER, FLORIST, ADMIN | Recommendation history |

**Plant recommendation request:**
```json
POST /api/v1/recommendations/plants
{
  "sunlightLevel": "Full Sun",
  "wateringLevel": "Moderate",
  "petSafeRequired": false,
  "purpose": "Flowering Decoration",
  "experienceLevel": "Beginner",
  "spaceType": "Outdoor",
  "budgetMin": 5000,
  "budgetMax": 80000
}
```

**Plant recommendation response:**
```json
{
  "success": true,
  "message": "Plant recommendations generated successfully",
  "data": {
    "requestId": "uuid",
    "matchesFound": 10,
    "recommendations": [
      {
        "product": { "id": "uuid", "name": "Hibiscus Rosa-Sinensis", ... },
        "score": 100,
        "rank": 1,
        "reasons": ["Matches your available sunlight conditions", "Fits your watering routine", "Great for Flowering Decoration", "Suitable for Beginner level", "Perfect for Outdoor spaces", "Easy care level"],
        "careNotes": ["Light: full sun", "Water: moderate", "Soil: well-draining loamy", "Temperature: 20-32°C", "Grows to: 100-250cm"],
        "warnings": []
      }
    ]
  }
}
```

**Vase match request:**
```json
POST /api/v1/recommendations/vase-match
{
  "bouquetProductId": "product-uuid",
  "vaseHeightCm": 25,
  "openingWidthCm": 10,
  "vaseShape": "CYLINDER"
}
```

**Vase match response:**
```json
{
  "success": true,
  "message": "Vase match calculated successfully",
  "data": {
    "requestId": "uuid",
    "fitScore": 86,
    "structuralFit": "GOOD",
    "visualBalance": "GOOD",
    "warnings": [],
    "recommendedVases": [...],
    "recommendedArrangements": [...]
  }
}
```

**Garden plan recommendation:**
```json
POST /api/v1/recommendations/garden-plan
{
  "gardenPlanId": "plan-uuid"
}
```

**Product recommendations (catalog):**
```
GET /api/v1/recommendations/products?type=plant&budgetMin=5000&budgetMax=50000&limit=10
```

**Scoring system (0-100):**
| Criterion | Max Points | Description |
|-----------|-----------|-------------|
| Sunlight match | 25 | Exact or compatible light requirement |
| Watering match | 20 | Matching watering frequency |
| Pet safety | 20 | Pet-safe products score high |
| Purpose/tags | 20 | Purpose matches product tags |
| Budget | 10 | Within budget range |
| Experience | 5 | Care level matches experience |

**Vase match logic:**
- Stem length inferred from product slug or defaults (rose=40cm, tulip=32cm, orchid=45cm, sunflower=50cm)
- Vase height should be 40-70% of stem length for excellent structural fit
- Opening width must match bouquet density
- CYLINDER/FLARED vases are stable for medium arrangements
- BUD vases work for small arrangements

**Garden plan recommendation logic:**
- Matches plants to garden sunlight conditions from cell data
- Matches plants to soil types from cell data
- Prefers outdoor/garden plants
- Excludes already-placed products

### Chatbot / Care Bot Endpoints (Phase 9)

All chatbot endpoints require authentication. Knowledge base management requires ADMIN role.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /api/v1/chatbot/ask | required | ALL | Quick ask — single question, auto-creates conversation |
| POST | /api/v1/chatbot/conversations | required | ALL | Start a new conversation |
| GET | /api/v1/chatbot/conversations | required | ALL | List conversations (admin sees all) |
| GET | /api/v1/chatbot/conversations/:id | required | ALL | Get conversation with messages |
| POST | /api/v1/chatbot/conversations/:id/messages | required | ALL | Send a message in a conversation |
| POST | /api/v1/chatbot/conversations/:id/archive | required | ALL | Archive a conversation |
| DELETE | /api/v1/chatbot/conversations/:id | required | ALL | Close/delete a conversation |
| POST | /api/v1/chatbot/messages/:messageId/feedback | required | ALL | Submit feedback on a bot message |
| GET | /api/v1/chatbot/knowledge | required | ADMIN | List knowledge base entries |
| GET | /api/v1/chatbot/knowledge/:id | required | ADMIN | Get knowledge entry |
| POST | /api/v1/chatbot/knowledge | required | ADMIN | Create knowledge entry |
| PATCH | /api/v1/chatbot/knowledge/:id | required | ADMIN | Update knowledge entry |
| DELETE | /api/v1/chatbot/knowledge/:id | required | ADMIN | Soft delete (deactivate) knowledge entry |

**Start conversation example:**
```json
POST /api/v1/chatbot/conversations
{
  "title": "Plant care question",
  "contextType": "GENERAL",
  "contextId": null
}
```

Context types: `GENERAL`, `PRODUCT`, `GARDEN_PLAN`, `ORDER`, `RECOMMENDATION`

**Send message example:**
```json
POST /api/v1/chatbot/conversations/:id/messages
{
  "message": "Why are my Monstera leaves turning yellow?",
  "context": {
    "productId": null,
    "gardenPlanId": null
  }
}
```

**Quick ask example (single-turn, auto-creates conversation):**
```json
POST /api/v1/chatbot/ask
{
  "message": "How often should I water my succulent?",
  "contextType": "GENERAL"
}
```

**Quick ask response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "message": "Most indoor plants need watering once every 7-14 days...",
    "intent": "WATERING_ADVICE",
    "responseType": "CARE_GUIDE",
    "suggestedActions": [
      { "type": "READ_MORE", "label": "View detailed care guide", "data": { "category": "WATERING" } },
      { "type": "ASK_MORE", "label": "Ask a follow-up question" }
    ],
    "suggestedProducts": []
  }
}
```

**Submit feedback example:**
```json
POST /api/v1/chatbot/messages/:messageId/feedback
{
  "rating": "HELPFUL",
  "comment": "Great advice, saved my plant!"
}
```

Rating values: `HELPFUL`, `NOT_HELPFUL`

**Create knowledge entry (admin):**
```json
POST /api/v1/chatbot/knowledge
{
  "title": "Overwatering symptoms",
  "category": "WATERING",
  "question": "What are signs of overwatering?",
  "answer": "Yellow leaves, mushy stems, fungus gnats...",
  "keywords": "overwatering, yellow leaves, root rot",
  "active": true
}
```

Knowledge categories: `WATERING`, `SUNLIGHT`, `FERTILIZER`, `PESTS`, `DISEASE`, `INDOOR_PLANTS`, `OUTDOOR_PLANTS`, `FLOWERS`, `VASE_CARE`, `GARDEN_PLANNER`, `PRODUCT_HELP`, `ORDER_HELP`

**Intent detection (rule-based engine):**
| Intent | Keywords |
|--------|----------|
| WATERING_ADVICE | water, overwater, underwater, dry, soak, moisture |
| LIGHT_ADVICE | sun, light, shade, bright, dark, window |
| FERTILIZER_ADVICE | fertilize, nutrient, feed, compost, nitrogen |
| PEST_HELP | pest, bug, aphid, spider mite, mealybug, fungus gnat |
| DISEASE_HELP | yellow, brown spot, wilt, droop, rot, mold, fungus |
| PLANT_CARE | repot, prune, propagate, transplant, clean, trim |
| VASE_CARE | vase, flower, bouquet, cut stem, arrangement |
| GARDEN_PLAN_HELP | garden plan, layout, grid, placement |
| PRODUCT_HELP | product, buy, recommend, price, cost, order |
| ORDER_HELP | order, shipping, delivery, return, refund, cancel |
| GENERAL_HELP | (fallback — greeting, unclear) |

**Conversation archiving:**
- Archived conversations are flagged with `archivedAt` timestamp
- Archived conversations still appear in list but can be hidden via `?includeArchived=false`
- Deletion sets `deletedAt` (soft delete)

### Analytics Endpoints (Phase 10)

All analytics endpoints require authentication. Role-based access enforced.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/analytics/admin/overview | required | ADMIN | Full admin dashboard overview |
| GET | /api/v1/analytics/florist/overview | required | ADMIN, FLORIST | Florist sales/order/inventory overview |
| GET | /api/v1/analytics/customer/me | required | CUSTOMER, GARDENER | Own dashboard summary |
| GET | /api/v1/analytics/sales | required | ADMIN, FLORIST | Sales analytics with timelines |
| GET | /api/v1/analytics/orders | required | ADMIN, FLORIST | Order analytics by status/date |
| GET | /api/v1/analytics/inventory | required | ADMIN, FLORIST | Inventory summary and movements |
| GET | /api/v1/analytics/delivery | required | ADMIN, FLORIST | Delivery performance |
| GET | /api/v1/analytics/products | required | ADMIN, FLORIST | Product performance by category |
| GET | /api/v1/analytics/engagement | required | ADMIN | Engagement and activity metrics |

**Admin overview response:**
```json
{
  "success": true,
  "data": {
    "users": { "total": 4, "admins": 1, "customers": 1, "florists": 1, "gardeners": 1 },
    "orders": { "total": 1, "pending": 0, "processing": 0, "delivered": 1, "cancelled": 0 },
    "sales": { "totalRevenue": 37000, "averageOrderValue": 37000, "currency": "RWF" },
    "inventory": { "totalProducts": 41, "lowStockCount": 0, "outOfStockCount": 0 },
    "engagement": { "gardenPlans": 6, "chatbotConversations": 8, "recommendationRequests": 9 }
  }
}
```

**Customer me response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1, "activeOrders": 0, "deliveredOrders": 1, "cancelledOrders": 0,
    "totalSpending": 37000, "gardenPlans": 5, "recommendationCount": 9, "chatbotCount": 8,
    "recentOrders": []
  }
}
```

**Sales analytics query params:**
| Param | Type | Description |
|-------|------|-------------|
| dateFrom | ISO 8601 | Start date (default: 30 days ago) |
| dateTo | ISO 8601 | End date (default: now) |
| groupBy | string | Group by: day, week, month (default: day) |
| categoryId | UUID | Filter by product category |

**Query examples:**
```
GET /api/v1/analytics/sales?dateFrom=2026-06-01&dateTo=2026-07-01&groupBy=month
GET /api/v1/analytics/orders?groupBy=week&dateFrom=2026-01-01&dateTo=2026-07-01
```

**Date range behavior:**
- Defaults to last 30 days if no range provided
- Accepts ISO 8601 date format
- Returns 422 for invalid dates
- Empty datasets return zero values and empty arrays

**Currency:**
All monetary values use RWF (Rwandan Franc).

### Loyalty Endpoints (Phase 11)

Base: `/api/v1/loyalty`. All require authentication.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/loyalty/me | required | CUSTOMER | Get own loyalty account (auto-creates if missing) |
| GET | /api/v1/loyalty/transactions | required | CUSTOMER | Points history with pagination/filters |
| GET | /api/v1/loyalty/rewards | required | CUSTOMER | List active redeemable rewards |
| POST | /api/v1/loyalty/rewards/:id/redeem | required | CUSTOMER | Redeem reward with points |
| GET | /api/v1/loyalty/redemptions | required | CUSTOMER | Own redemption history |
| GET | /api/v1/loyalty/admin/accounts | required | ADMIN | List all loyalty accounts |
| POST | /api/v1/loyalty/admin/accounts/:userId/adjust | required | ADMIN | Manually adjust customer points |
| GET | /api/v1/loyalty/admin/rewards | required | ADMIN | List all rewards (incl. inactive) |
| POST | /api/v1/loyalty/admin/rewards | required | ADMIN | Create reward |
| PATCH | /api/v1/loyalty/admin/rewards/:id | required | ADMIN | Update reward |
| DELETE | /api/v1/loyalty/admin/rewards/:id | required | ADMIN | Soft-delete reward |
| GET | /api/v1/loyalty/admin/redemptions | required | ADMIN | List all redemptions |
| GET | /api/v1/loyalty/admin/transactions | required | ADMIN | List all transactions with filters |

**Points rules:**
- 1 point per 1,000 RWF spent on delivered orders
- Points awarded when order status becomes DELIVERED
- Reversed if order is cancelled after points awarded

**Tier rules:**
| Tier | Lifetime Points Required |
|------|--------------------------|
| BRONZE | 0–499 |
| SILVER | 500–1,499 |
| GOLD | 1,500–4,999 |
| PLATINUM | 5,000+ |

**Redeem reward example:**
```json
POST /api/v1/loyalty/rewards/:id/redeem
Response: { "redemption": { "couponCode": "FLR-93A74BEC-661E", "status": "ACTIVE" } }
```

**Adjust points example:**
```json
POST /api/v1/loyalty/admin/accounts/:userId/adjust
{ "points": 500, "reason": "Welcome bonus" }
```

### Subscription Endpoints (Phase 11)

Base: `/api/v1/subscriptions`.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/subscriptions/plans | public | - | List active subscription plans |
| POST | /api/v1/subscriptions/subscribe | required | CUSTOMER | Subscribe to a plan |
| GET | /api/v1/subscriptions/me | required | CUSTOMER | List own subscriptions |
| POST | /api/v1/subscriptions/:id/cancel | required | CUSTOMER | Cancel own subscription |
| GET | /api/v1/subscriptions/admin/plans | required | ADMIN | List all plans (incl. inactive) |
| POST | /api/v1/subscriptions/admin/plans | required | ADMIN | Create plan |
| PATCH | /api/v1/subscriptions/admin/plans/:id | required | ADMIN | Update plan |
| DELETE | /api/v1/subscriptions/admin/plans/:id | required | ADMIN | Soft-delete plan |
| POST | /api/v1/subscriptions/admin/:id/cancel | required | ADMIN | Admin-cancel any subscription |

**Subscribe example:**
```json
POST /api/v1/subscriptions/subscribe
{ "planId": "uuid", "autoRenew": true }
```

**Billing cycles:** MONTHLY, QUARTERLY, YEARLY

**Seed plans:**
- Basic Garden Care (5,000 RWF/month)
- Premium Plant Club (15,000 RWF/month)
- Florist Plus (30,000 RWF/month)

### Reports & Export Endpoints (Phase 12)

All report endpoints require authentication. Reports are generated synchronously and stored as files.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /api/v1/reports/generate | required | ADMIN, FLORIST*, CUSTOMER*, GARDENER* | Generate report |
| GET | /api/v1/reports/jobs | required | ADMIN, FLORIST, CUSTOMER*, GARDENER* | List report jobs |
| GET | /api/v1/reports/jobs/:id | required | Same as generate | Get job details |
| GET | /api/v1/reports/jobs/:id/download | required | Same as generate | Download report file |
| DELETE | /api/v1/reports/jobs/:id | required | Same as generate | Delete job and file |

\* Role-restricted report types apply:
- **FLORIST**: SALES, ORDERS, INVENTORY, PRODUCTS, DELIVERY
- **CUSTOMER**: ORDERS only
- **GARDENER**: GARDEN_PLANS only
- **ADMIN**: All 10 report types

**Generate report example:**
```json
POST /api/v1/reports/generate
{
  "reportType": "SALES",
  "format": "CSV",
  "filters": {}
}
```

**Supported report types:** SALES, ORDERS, INVENTORY, PRODUCTS, DELIVERY, CUSTOMERS, LOYALTY, GARDEN_PLANS, CHATBOT, RECOMMENDATIONS

**Supported formats:** CSV (with UTF-8 BOM), JSON, PDF (HTML-based for now)

**Response:**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "reportJob": {
      "id": "uuid",
      "reportType": "SALES",
      "format": "CSV",
      "status": "COMPLETED",
      "fileSize": 229,
      "generatedAt": "2026-07-02T19:15:59.650Z",
      "downloadUrl": "/api/v1/reports/jobs/uuid/download"
    }
  }
}
```

**List query params:**
| Param | Type | Description |
|-------|------|-------------|
| reportType | string | Filter by type |
| format | string | Filter by format (CSV, JSON, PDF) |
| status | string | Filter by status (PENDING, PROCESSING, COMPLETED, FAILED) |
| dateFrom | ISO 8601 | Filter by start date |
| dateTo | ISO 8601 | Filter by end date |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

**File storage:** `backend/reports/` directory. Files named as `{type}_{timestamp}.{ext}`.

### Notifications & Email Endpoints (Phase 13)

Base: `/api/v1/notifications`. All require authentication.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /api/v1/notifications | required | ALL authenticated | List own notifications |
| GET | /api/v1/notifications/unread-count | required | ALL authenticated | Get unread count |
| PATCH | /api/v1/notifications/:id/read | required | ALL authenticated | Mark notification as read |
| PATCH | /api/v1/notifications/read-all | required | ALL authenticated | Mark all as read |
| GET | /api/v1/notifications/preferences | required | ALL authenticated | Get notification preferences |
| PATCH | /api/v1/notifications/preferences | required | ALL authenticated | Update notification preferences |
| POST | /api/v1/notifications/admin/announcement | required | MANAGE_NOTIFICATIONS | Send system announcement |
| GET | /api/v1/notifications/admin/email-logs | required | MANAGE_NOTIFICATIONS | View email send logs |

**Notification types:** SYSTEM, AUTH, ORDER, DELIVERY, INVENTORY, LOYALTY, SUBSCRIPTION, GARDEN, CHATBOT, RECOMMENDATION, REPORT

**Preference fields:**
| Field | Default | Description |
|-------|---------|-------------|
| emailEnabled | true | Receive email notifications |
| inAppEnabled | true | Receive in-app notifications |
| orderUpdates | true | Order status change notifications |
| deliveryUpdates | true | Delivery status change notifications |
| inventoryAlerts | true | Low stock alerts (admin/florist) |
| loyaltyUpdates | true | Loyalty point/reward notifications |
| subscriptionUpdates | true | Subscription start/cancel notifications |
| gardenReminders | true | Garden planner reminders |
| marketingEmails | false | Marketing/promotional emails |
| securityAlerts | true | Security-related notifications |

**Update preferences example:**
```json
PATCH /api/v1/notifications/preferences
{
  "emailEnabled": true,
  "marketingEmails": false,
  "orderUpdates": true
}
```

**Admin announcement example:**
```json
POST /api/v1/notifications/admin/announcement
{
  "title": "New FloraSmart update",
  "message": "We added new flower recommendations.",
  "targetRoles": ["CUSTOMER", "FLORIST"],
  "channels": ["IN_APP", "EMAIL"]
}
```

**List query params:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | Filter by notification type |
| status | string | Filter by status (PENDING, SENT, FAILED, READ) |
| unreadOnly | boolean | Show only unread |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

**Email log query params (admin):**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status (PENDING, SENT, FAILED) |
| toEmail | string | Filter by recipient email |
| templateName | string | Filter by template |
| dateFrom | ISO 8601 | Start date |
| dateTo | ISO 8601 | End date |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

**SMTP Configuration:**
```env
# Gmail SMTP: Use an App Password (not your regular password)
# Generate at: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=FloraSmart <noreply@florasmart.com>
```

In development mode without SMTP configured, emails are logged to the console. No crash.

### Phase 14: Testing, Optimization & Deployment Preparation

**Build status:**
- No lint script configured — ESLint not installed
- No test script configured — test framework not installed
- Prisma generates client — client present
- Server runs on port 5000

**Deployment documents:**
- `DEPLOYMENT.md` — Full production setup guide
- `API_SUMMARY.md` — Complete endpoint reference
- `FINAL_BACKEND_REPORT.md` — Final completion report

**package.json scripts:**
| Script | Command |
|--------|---------|
| dev | `node src/server.js` |
| start | `node src/server.js` |
| prisma:generate | `prisma generate` |
| prisma:migrate | `prisma migrate dev` |
| prisma:deploy | `prisma migrate deploy` |
| seed | `prisma db seed` |
| postinstall | `prisma generate` |

**Known limitations:**
- PDF reports are HTML-based (not real PDF)
- Email requires Gmail app password configuration
- Audit logging is a no-op (no audit table)
- SMS notifications are placeholder only
- No background job queue
- No file upload API endpoints
- Prisma generate may fail with EPERM on Windows if Node.js processes hold the engine DLL

**Integration points (completed):**
- **Auth:** In-app notification on OTP send and password reset request
- **Orders:** In-app notification on order creation and status changes
- **Delivery:** In-app notification on assignment and status changes
- **Inventory:** Low stock alerts to ADMIN/FLORIST when stock drops below threshold
- **Loyalty:** In-app notification on reward redemption
- **Subscription:** In-app notification on subscribe and cancel

**Remaining for future:**
- Real email sending via SMTP
- Email templates with actual HTML rendering
- Marketing email campaign management
- Push notification support (mobile)
- SMS notification via third-party provider
- Advanced notification scheduling

### Authorization

| Role | Categories | Products | Inventory | Cart & Checkout | Orders | Deliveries | Garden Plans | AI Recommendations | Chatbot | Analytics | Loyalty | Subscriptions | Reports | Notifications |
|------|-----------|----------|-----------|-----------------|--------|------------|--------------|-------------------|---------|-----------|---------|--------------|---------|--------------|
| ADMIN | Full CRUD | Full CRUD | Full CRUD | None | Full CRUD | Full CRUD | View/Manage all | Full access | Full CRUD + KB management | Full access | Full CRUD | Full CRUD | All 10 types | Manage + View all |
| FLORIST | Create, Read, Update | Create, Read, Update | View stock, adjust stock | None | Manage status | Manage status, assign | Own plans | Vase match + product recs | Chat only | Sales, Orders, Inventory, Delivery, Products | None | None | SALES, ORDERS, INVENTORY, PRODUCTS, DELIVERY | View own + inventory alerts |
| CUSTOMER | Read active only | Read active only | None | Full cart management + checkout | View own, cancel own | Track own | Own plans | Plants, vase, garden, products, own history | Chat only | Own dashboard only | Own account + redeem + subscribe | Own subscriptions | ORDERS only | View own + preferences |
| GARDENER | Read active only | Read active only | None | None | None | None | Own plans | Plants, garden, products, own history | Chat only | Own dashboard only | None | None | GARDEN_PLANS only | View own + preferences |
| Unauthenticated | Read active only | Read active only | None | None | None | None | None | None | None | None | None | None | None | None | None |
|------|-----------|----------|-----------|-----------------|--------|------------|--------------|-------------------|---------|-----------|---------|--------------|---------|
| ADMIN | Full CRUD | Full CRUD | Full CRUD | None | Full CRUD | Full CRUD | View/Manage all | Full access | Full CRUD + KB management | Full access | Full CRUD | Full CRUD | All 10 types |
| FLORIST | Create, Read, Update | Create, Read, Update | View stock, adjust stock | None | Manage status | Manage status, assign | Own plans | Vase match + product recs | Chat only | Sales, Orders, Inventory, Delivery, Products | None | None | SALES, ORDERS, INVENTORY, PRODUCTS, DELIVERY |
| CUSTOMER | Read active only | Read active only | None | Full cart management + checkout | View own, cancel own | Track own | Own plans | Plants, vase, garden, products, own history | Chat only | Own dashboard only | Own account + redeem + subscribe | Own subscriptions | ORDERS only |
| GARDENER | Read active only | Read active only | None | None | None | None | Own plans | Plants, garden, products, own history | Chat only | Own dashboard only | None | None | GARDEN_PLANS only |
| Unauthenticated | Read active only | Read active only | None | None | None | None | None | None | None | None | None | None | None | None |
