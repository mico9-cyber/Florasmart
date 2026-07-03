# FloraSmart API Summary

Base URL: `/api/v1`

## Authentication

All protected routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /auth/register | No | - | Register (CUSTOMER, FLORIST, GARDENER) |
| POST | /auth/login | No | - | Login |
| POST | /auth/refresh | No | - | Refresh token |
| POST | /auth/logout | Yes | ALL | Logout |
| GET | /auth/me | Yes | ALL | Current user profile |
| PATCH | /users/me | Yes | ALL | Update profile |
| POST | /auth/password/forgot | No | - | Request password reset |
| POST | /auth/password/reset | No | - | Reset password |
| POST | /auth/register/verify-otp | No | - | Verify registration OTP |
| POST | /auth/register/resend-otp | No | - | Resend OTP |

## Products & Categories

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /products | No | - | List active products |
| GET | /products/:id | No | - | Get product by ID |
| GET | /products/slug/:slug | No | - | Get product by slug |
| POST | /products | Yes | ADMIN, FLORIST | Create product |
| PATCH | /products/:id | Yes | ADMIN, FLORIST | Update product |
| DELETE | /products/:id | Yes | ADMIN | Soft delete |
| GET | /categories | No | - | List categories |
| GET | /categories/:id | No | - | Get category by ID |
| POST | /categories | Yes | ADMIN, FLORIST | Create category |
| PATCH | /categories/:id | Yes | ADMIN, FLORIST | Update category |
| DELETE | /categories/:id | Yes | ADMIN | Soft delete |

## Inventory

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /inventory/summary | Yes | ADMIN, FLORIST | Dashboard summary |
| GET | /inventory/stock | Yes | ADMIN, FLORIST | List stock levels |
| GET | /inventory/stock/:id | Yes | ADMIN, FLORIST | Stock details |
| POST | /inventory/adjust | Yes | ADMIN, FLORIST | Adjust stock |
| GET | /inventory/movements | Yes | ADMIN, FLORIST | Movement history |
| GET | /inventory/low-stock | Yes | ADMIN, FLORIST | Low stock alerts |
| GET | /inventory/locations | Yes | ADMIN, FLORIST | List locations |
| GET | /inventory/locations/:id | Yes | ADMIN, FLORIST | Location details |
| POST | /inventory/locations | Yes | ADMIN | Create location |
| PATCH | /inventory/locations/:id | Yes | ADMIN | Update location |
| DELETE | /inventory/locations/:id | Yes | ADMIN | Soft delete |

## Cart & Checkout

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /cart | Yes | CUSTOMER | Get cart |
| POST | /cart/items | Yes | CUSTOMER | Add item |
| PATCH | /cart/items/:itemId | Yes | CUSTOMER | Update quantity |
| DELETE | /cart/items/:itemId | Yes | CUSTOMER | Remove item |
| DELETE | /cart | Yes | CUSTOMER | Clear cart |
| POST | /checkout | Yes | CUSTOMER | Complete checkout |

## Orders

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /orders | Yes | CUSTOMER, ADMIN, FLORIST | List orders |
| GET | /orders/:id | Yes | CUSTOMER, ADMIN, FLORIST | Order details |
| PATCH | /orders/:id/status | Yes | ADMIN, FLORIST | Update status |
| POST | /orders/:id/cancel | Yes | CUSTOMER, ADMIN, FLORIST | Cancel order |

## Deliveries

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /deliveries | Yes | ADMIN, FLORIST | List deliveries |
| GET | /deliveries/:id | Yes | ADMIN, FLORIST | Delivery details |
| POST | /deliveries/:orderId/assign | Yes | ADMIN, FLORIST | Assign delivery |
| PATCH | /deliveries/:id/status | Yes | ADMIN, FLORIST | Update status |
| GET | /deliveries/track/:orderId | Yes | CUSTOMER, ADMIN, FLORIST | Track delivery |

## Garden Plans

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /garden-plans | Yes | ALL | List plans |
| GET | /garden-plans/summary/me | Yes | ALL | Plan summary |
| POST | /garden-plans | Yes | ALL | Create plan |
| GET | /garden-plans/:id | Yes | ALL | Plan details |
| PATCH | /garden-plans/:id | Yes | ALL | Update plan |
| DELETE | /garden-plans/:id | Yes | ALL | Soft delete |
| POST | /garden-plans/:id/default | Yes | ALL | Set as default |
| PUT | /garden-plans/:id/cells/:row/:col | Yes | ALL | Update cell |
| DELETE | /garden-plans/:id/cells/:row/:col | Yes | ALL | Reset cell |
| GET | /garden-plans/:id/placements | Yes | ALL | List placements |
| POST | /garden-plans/:id/placements | Yes | ALL | Add placement |
| PATCH | /garden-plans/:id/placements/:pid | Yes | ALL | Update placement |
| DELETE | /garden-plans/:id/placements/:pid | Yes | ALL | Remove placement |
| GET | /garden-plans/:id/notes | Yes | ALL | List notes |
| POST | /garden-plans/:id/notes | Yes | ALL | Add note |
| PATCH | /garden-plans/:id/notes/:nid | Yes | ALL | Update note |
| DELETE | /garden-plans/:id/notes/:nid | Yes | ALL | Delete note |

## Recommendations

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /recommendations/plants | Yes | CUSTOMER, GARDENER, ADMIN | Plant suitability |
| POST | /recommendations/vase-match | Yes | CUSTOMER, FLORIST, ADMIN | Vase matching |
| POST | /recommendations/garden-plan | Yes | CUSTOMER, GARDENER, ADMIN | Garden recommendations |
| GET | /recommendations/products | Yes | ALL | Product recommendations |
| GET | /recommendations/history | Yes | ALL | Recommendation history |

## Chatbot

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /chatbot/ask | Yes | ALL | Quick ask |
| POST | /chatbot/conversations | Yes | ALL | Start conversation |
| GET | /chatbot/conversations | Yes | ALL | List conversations |
| GET | /chatbot/conversations/:id | Yes | ALL | Conversation detail |
| POST | /chatbot/conversations/:id/messages | Yes | ALL | Send message |
| POST | /chatbot/conversations/:id/archive | Yes | ALL | Archive |
| DELETE | /chatbot/conversations/:id | Yes | ALL | Close/delete |
| POST | /chatbot/messages/:id/feedback | Yes | ALL | Submit feedback |
| GET | /chatbot/knowledge | Yes | ADMIN | List KB entries |
| GET | /chatbot/knowledge/:id | Yes | ADMIN | Get KB entry |
| POST | /chatbot/knowledge | Yes | ADMIN | Create KB entry |
| PATCH | /chatbot/knowledge/:id | Yes | ADMIN | Update KB entry |
| DELETE | /chatbot/knowledge/:id | Yes | ADMIN | Deactivate KB entry |

## Analytics

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /analytics/admin/overview | Yes | ADMIN | Full dashboard overview |
| GET | /analytics/florist/overview | Yes | ADMIN, FLORIST | Florist overview |
| GET | /analytics/customer/me | Yes | CUSTOMER, GARDENER | Own dashboard |
| GET | /analytics/sales | Yes | ADMIN, FLORIST | Sales analytics |
| GET | /analytics/orders | Yes | ADMIN, FLORIST | Order analytics |
| GET | /analytics/inventory | Yes | ADMIN, FLORIST | Inventory analytics |
| GET | /analytics/delivery | Yes | ADMIN, FLORIST | Delivery analytics |
| GET | /analytics/products | Yes | ADMIN, FLORIST | Product performance |
| GET | /analytics/engagement | Yes | ADMIN | Engagement metrics |

## Loyalty

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /loyalty/me | Yes | CUSTOMER | Account info |
| GET | /loyalty/transactions | Yes | CUSTOMER | Points history |
| GET | /loyalty/rewards | Yes | CUSTOMER | Active rewards |
| POST | /loyalty/rewards/:id/redeem | Yes | CUSTOMER | Redeem reward |
| GET | /loyalty/redemptions | Yes | CUSTOMER | Redemption history |
| GET | /loyalty/admin/accounts | Yes | ADMIN | All accounts |
| POST | /loyalty/admin/accounts/:id/adjust | Yes | ADMIN | Adjust points |
| GET | /loyalty/admin/rewards | Yes | ADMIN | All rewards |
| POST | /loyalty/admin/rewards | Yes | ADMIN | Create reward |
| PATCH | /loyalty/admin/rewards/:id | Yes | ADMIN | Update reward |
| DELETE | /loyalty/admin/rewards/:id | Yes | ADMIN | Soft-delete reward |
| GET | /loyalty/admin/redemptions | Yes | ADMIN | All redemptions |
| GET | /loyalty/admin/transactions | Yes | ADMIN | All transactions |

## Subscriptions

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /subscriptions/plans | No | - | List plans |
| POST | /subscriptions/subscribe | Yes | CUSTOMER | Subscribe |
| GET | /subscriptions/me | Yes | CUSTOMER | My subscriptions |
| POST | /subscriptions/:id/cancel | Yes | CUSTOMER | Cancel |
| GET | /subscriptions/admin/plans | Yes | ADMIN | All plans |
| POST | /subscriptions/admin/plans | Yes | ADMIN | Create plan |
| PATCH | /subscriptions/admin/plans/:id | Yes | ADMIN | Update plan |
| DELETE | /subscriptions/admin/plans/:id | Yes | ADMIN | Soft-delete plan |
| POST | /subscriptions/admin/:id/cancel | Yes | ADMIN | Admin cancel |

## Reports

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /reports/generate | Yes | Role-restricted | Generate report |
| GET | /reports/jobs | Yes | Role-restricted | List jobs |
| GET | /reports/jobs/:id | Yes | Role-restricted | Job details |
| GET | /reports/jobs/:id/download | Yes | Role-restricted | Download file |
| DELETE | /reports/jobs/:id | Yes | Role-restricted | Delete job |

## Notifications

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | /notifications | Yes | ALL | List notifications |
| GET | /notifications/unread-count | Yes | ALL | Unread count |
| PATCH | /notifications/:id/read | Yes | ALL | Mark read |
| PATCH | /notifications/read-all | Yes | ALL | Mark all read |
| GET | /notifications/preferences | Yes | ALL | Get preferences |
| PATCH | /notifications/preferences | Yes | ALL | Update preferences |
| POST | /notifications/admin/announcement | Yes | ADMIN | Send announcement |
| GET | /notifications/admin/email-logs | Yes | ADMIN | Email logs |

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Health check |
| GET | /api/v1/health | No | Health check |
