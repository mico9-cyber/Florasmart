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

### Authorization

| Role | Categories | Products |
|------|-----------|----------|
| ADMIN | Full CRUD | Full CRUD |
| FLORIST | Create, Read, Update | Create, Read, Update |
| CUSTOMER | Read active only | Read active only |
| GARDENER | Read active only | Read active only |
| Unauthenticated | Read active only | Read active only |
