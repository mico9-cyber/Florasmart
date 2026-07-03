# Phase 15 Report — Frontend-Backend Integration

## 1. Files Created

| File | Purpose |
|------|---------|
| `src/pages/ReportsPage.jsx` | Reports generation UI — type selection, format picker, date range, job list, download/delete |
| `src/pages/NotificationsPage.jsx` | Notifications list, mark read, mark all read, preferences modal, announcement sender (admin), email logs (admin) |

## 2. Files Modified

| File | Change |
|------|--------|
| `src/context/AppContext.jsx` | Replaced all 43 imports from `src/utils/api.js` with modern service files from `src/services/`. Removed legacy `authFromUser()`, `updateAuth()`, and `request()` pattern. Added `auth:logout` event listener. |
| `src/components/Navbar.jsx` | Added notification bell icon with live unread count (polls every 30s). Added `notificationService.unreadCount()` integration. |
| `src/components/Sidebar.jsx` | Added Reports route for admin/florist. Added Notifications route for all roles. |
| `src/App.jsx` | Added routes for `/reports` and `/notifications`. |
| `src/pages/PlantRecommendationPage.jsx` | Calls `recommendPlantsApi` from context (backend-first). Added `await` to `addToCart` calls (critical bug fix — was operating on Promise objects). Removed hardcoded `stock: 999`. |
| `src/pages/ChatbotPage.jsx` | Calls `quickAskChatbot` from context first; falls back to hardcoded responses on API failure. |
| `src/pages/VaseMatchingPage.jsx` | Calls backend recommendation API first; falls back to local calculation. |
| `src/pages/AnalyticsPage.jsx` | Now reads from `context.analytics` (admin/florist/customer). Falls back to sample data when backend returns null. |
| `src/pages/LoyaltyPage.jsx` | Uses `subscriptionPlans` from context for dynamic plan rendering. Uses `loyalty.transactions` for point ledger. |
| `src/pages/AdminDashboard.jsx` | Reads from `context.analytics.admin`. Removed hardcoded `+1500000` revenue bonus. Uses real user/role counts. |
| `src/pages/FloristDashboard.jsx` | "Stems Handled" computed from actual order data. |
| `src/pages/GardenerDashboard.jsx` | Specimens persist to localStorage. Luminosity card replaced with specimen count. |
| `src/pages/GardenPlannerPage.jsx` | Removed `FALLBACK_PLANTS` hardcoded array; shows empty state instead. |

## 3. API Client Status

**`src/services/api.js`** — Complete and correct:
- Uses `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api/v1`)
- `Authorization: Bearer` token attachment for protected requests
- Auto token refresh on 401 with 1 retry (`attemptRefresh`)
- Dispatch of `auth:logout` event on refresh failure (listened to by AppContext)
- Network errors → `ApiError('Backend server is unreachable', { status: 0 })`
- 403 → `'You do not have permission to perform this action.'`
- Supports FormData body (for future file uploads)

## 4. Auth Integration Status

| Endpoint | Status |
|----------|--------|
| `POST /auth/login` | ✅ Connected via `authService.login()`, tokens stored via `setAuthSession()` |
| `POST /auth/register` | ✅ Connected via `authService.register()` |
| `POST /auth/logout` | ✅ Connected via `authService.logout()` |
| `POST /auth/refresh` | ✅ Auto-handled by `api.js` |
| `GET /auth/me` | ✅ Connected via `authService.me()` |
| `PATCH /users/me` | ✅ Connected via `authService.updateMe()` |
| `POST /auth/password/forgot` | ✅ Service exists, no dedicated UI page |
| `POST /auth/password/reset` | ✅ Service exists, no dedicated UI page |
| `POST /auth/register/verify-otp` | ✅ Connected via `authService.verifyRegistrationOtp()` |
| `POST /auth/register/resend-otp` | ✅ Connected via `authService.resendRegistrationOtp()` |

**Demo accounts**: admin/customer/florist/gardener@florasmart.com / `Admin@12345`

## 5. Product/Catalog Status

| Endpoint | Status |
|----------|--------|
| `GET /products` | ✅ Via `productService.list()` |
| `GET /products/:id` | ✅ Via `productService.getById()` |
| `GET /products/slug/:slug` | ✅ Via `productService.getBySlug()` |
| `GET /categories` | ✅ Via `categoryService.list()` |
| `POST /products` | ✅ Via `productService.create()` |
| `PATCH /products/:id` | ✅ Via `productService.update()` |
| `DELETE /products/:id` | ✅ Via `productService.remove()` |

Products normalized in AppContext with stock mapping for admin/florist inventory. Prices in RWF. Images display via `ImageWithFallback` component.

## 6. Cart/Checkout Status

| Endpoint | Status |
|----------|--------|
| `GET /cart` | ✅ Via `cartService.getCart()` |
| `POST /cart/items` | ✅ Via `cartService.addItem()` |
| `PATCH /cart/items/:id` | ✅ Via `cartService.updateItem()` |
| `DELETE /cart/items/:id` | ✅ Via `cartService.removeItem()` |
| `DELETE /cart` | ✅ Via `cartService.clear()` |
| `POST /checkout` | ✅ Via `orderService.checkout()` |

Cart is backend-driven. No localStorage as source of truth.

## 7. Orders/Delivery Status

| Endpoint | Status |
|----------|--------|
| `GET /orders` | ✅ Via `orderService.list()` |
| `GET /orders/:id` | ✅ Via `orderService.getById()` |
| `PATCH /orders/:id/status` | ✅ Via `orderService.updateStatus()` |
| `POST /orders/:id/cancel` | ✅ Via `orderService.cancel()` |
| `GET /deliveries` | ✅ Via `deliveryService.list()` |
| `GET /deliveries/:id` | ✅ Via `deliveryService.getById()` |
| `POST /deliveries/:id/assign` | ✅ Via `deliveryService.assign()` |
| `PATCH /deliveries/:id/status` | ✅ Via `deliveryService.updateStatus()` |
| `GET /deliveries/track/:id` | ✅ Via `deliveryService.track()` |

## 8. Dashboard/Analytics Status

| Dashboard | Data Source | Status |
|-----------|-------------|--------|
| Admin Dashboard | `context.analytics.admin` | ✅ Real analytics with fallback to computed order values |
| Customer Dashboard | `context.orders`, `context.loyalty`, etc. | ✅ Real data from services |
| Florist Dashboard | `context.orders`, `context.products` | ✅ Computed from actual order/inventory data |

| Analytics Endpoint | Status |
|--------------------|--------|
| `GET /analytics/admin/overview` | ✅ Via `analyticsService.adminOverview()` |
| `GET /analytics/florist/overview` | ✅ Via `analyticsService.floristOverview()` |
| `GET /analytics/customer/me` | ✅ Via `analyticsService.customerOverview()` |
| `GET /analytics/sales` | ✅ Via `analyticsService.sales()` |
| `GET /analytics/orders` | ✅ Via `analyticsService.orders()` |
| `GET /analytics/inventory` | ✅ Via `analyticsService.inventory()` |
| `GET /analytics/delivery` | ✅ Via `analyticsService.delivery()` |
| `GET /analytics/products` | ✅ Via `analyticsService.products()` |
| `GET /analytics/engagement` | ✅ Via `analyticsService.engagement()` |

## 9. Inventory Status

| Endpoint | Status |
|----------|--------|
| `GET /inventory/summary` | ✅ Via `inventoryService.summary()` |
| `GET /inventory/stock` | ✅ Via `inventoryService.stock()` |
| `GET /inventory/stock/:id` | ✅ Via `inventoryService.stockById()` |
| `POST /inventory/adjust` | ✅ Via `inventoryService.adjust()` |
| `GET /inventory/movements` | ✅ Via `inventoryService.movements()` |
| `GET /inventory/low-stock` | ✅ Via `inventoryService.lowStock()` |
| `GET /inventory/locations` | ✅ Via `inventoryService.locations()` |

InventoryPage loads data directly via `inventoryService` calls.

## 10. Garden Planner Status

| Endpoint | Status |
|----------|--------|
| `GET /garden-plans` | ✅ Via `gardenPlanService.list()` |
| `GET /garden-plans/summary/me` | ✅ Via `gardenPlanService.summary()` |
| `POST /garden-plans` | ✅ Via `gardenPlanService.create()` |
| `GET /garden-plans/:id` | ✅ Via `gardenPlanService.getById()` |
| `PATCH /garden-plans/:id` | ✅ Via `gardenPlanService.update()` |
| `DELETE /garden-plans/:id` | ✅ Via `gardenPlanService.remove()` |
| `POST /garden-plans/:id/default` | ✅ Via `gardenPlanService.setDefault()` |
| `PUT /garden-plans/:id/cells/:r/:c` | ✅ Via `gardenPlanService.updateCell()` |
| `DELETE /garden-plans/:id/cells/:r/:c` | ✅ Via `gardenPlanService.removeCell()` |
| `GET /garden-plans/:id/placements` | ✅ Via `gardenPlanService.listPlacements()` |
| `POST /garden-plans/:id/placements` | ✅ Via `gardenPlanService.addPlacement()` |
| `PATCH /garden-plans/:id/placements/:p` | ✅ Via `gardenPlanService.updatePlacement()` |
| `DELETE /garden-plans/:id/placements/:p` | ✅ Via `gardenPlanService.removePlacement()` |
| `GET /garden-plans/:id/notes` | ✅ Via `gardenPlanService.listNotes()` |
| `POST /garden-plans/:id/notes` | ✅ Via `gardenPlanService.addNote()` |
| `PATCH /garden-plans/:id/notes/:n` | ✅ Via `gardenPlanService.updateNote()` |
| `DELETE /garden-plans/:id/notes/:n` | ✅ Via `gardenPlanService.removeNote()` |

Removed `FALLBACK_PLANTS` hardcoded array. Empty state shown when no products available.

## 11. Recommendation Status

| Endpoint | Status |
|----------|--------|
| `POST /recommendations/plants` | ✅ Via `recommendationService.plants()` |
| `POST /recommendations/vase-match` | ✅ Via `recommendationService.vaseMatch()` |
| `POST /recommendations/garden-plan` | ✅ Via `recommendationService.gardenPlan()` |
| `GET /recommendations/products` | ✅ Via `recommendationService.products()` |
| `GET /recommendations/history` | ✅ Via `recommendationService.history()` |

All pages try backend first with client-side fallback.

## 12. Chatbot Status

| Endpoint | Status |
|----------|--------|
| `POST /chatbot/ask` | ✅ Via `chatbotService.quickAsk()` |
| `POST /chatbot/conversations` | ✅ Via `chatbotService.startConversation()` |
| `GET /chatbot/conversations` | ✅ Via `chatbotService.listConversations()` |
| `GET /chatbot/conversations/:id` | ✅ Via `chatbotService.getConversation()` |
| `POST /chatbot/conversations/:id/messages` | ✅ Via `chatbotService.sendMessage()` |
| `POST /chatbot/conversations/:id/archive` | ✅ Via `chatbotService.archiveConversation()` |
| `DELETE /chatbot/conversations/:id` | ✅ Via `chatbotService.removeConversation()` |
| `POST /chatbot/messages/:id/feedback` | ✅ Via `chatbotService.submitFeedback()` |

ChatbotPage tries backend `quickAskChatbot` first, falls back to local keyword matching.

## 13. Loyalty/Subscription Status

| Endpoint | Status |
|----------|--------|
| `GET /loyalty/me` | ✅ Via `loyaltyService.me()` |
| `GET /loyalty/transactions` | ✅ Via `loyaltyService.transactions()` |
| `GET /loyalty/rewards` | ✅ Via `loyaltyService.rewards()` |
| `POST /loyalty/rewards/:id/redeem` | ✅ Via `loyaltyService.redeemReward()` |
| `GET /loyalty/redemptions` | ✅ Via `loyaltyService.redemptions()` |
| `GET /subscriptions/plans` | ✅ Via `subscriptionService.plans()` |
| `POST /subscriptions/subscribe` | ✅ Via `subscriptionService.subscribe()` |
| `GET /subscriptions/me` | ✅ Via `subscriptionService.me()` |
| `POST /subscriptions/:id/cancel` | ✅ Via `subscriptionService.cancel()` |

LoyaltyPage now renders subscription plans dynamically from backend data.

## 14. Reports Status

| Endpoint | Status |
|----------|--------|
| `POST /reports/generate` | ✅ Via `reportService.generate()` |
| `GET /reports/jobs` | ✅ Via `reportService.jobs()` |
| `GET /reports/jobs/:id` | ✅ Via `reportService.jobById()` |
| `GET /reports/jobs/:id/download` | ✅ Via `reportService.download()` |
| `DELETE /reports/jobs/:id` | ✅ Via `reportService.remove()` |

New `ReportsPage.jsx` created with: type selection (SALES, INVENTORY, ORDERS, etc.), format picker (CSV, PDF), date range, job list with polling, download/delete actions. Route `/reports` available to admin/florist. Add to sidebar.

## 15. Notifications Status

| Endpoint | Status |
|----------|--------|
| `GET /notifications` | ✅ Via `notificationService.list()` |
| `GET /notifications/unread-count` | ✅ Via `notificationService.unreadCount()` |
| `PATCH /notifications/:id/read` | ✅ Via `notificationService.markRead()` |
| `PATCH /notifications/read-all` | ✅ Via `notificationService.markAllRead()` |
| `GET /notifications/preferences` | ✅ Via `notificationService.preferences()` |
| `PATCH /notifications/preferences` | ✅ Via `notificationService.updatePreferences()` |
| `POST /notifications/admin/announcement` | ✅ Via `notificationService.sendAnnouncement()` |
| `GET /notifications/admin/email-logs` | ✅ Via `notificationService.emailLogs()` |

New `NotificationsPage.jsx` with full UI. Notification bell in Navbar with live unread count badge (polling every 30s). Route `/notifications` for all roles.

## 16. Demo/Mock Cleanup Status

| Data Type | Cleanup Status |
|-----------|----------------|
| Products | ✅ Backend-driven. No hardcoded products. |
| Categories | ✅ Backend-driven. |
| Cart | ✅ Backend-driven. |
| Checkout | ✅ Backend-driven. |
| Orders | ✅ Backend-driven. |
| Deliveries | ✅ Backend-driven. |
| Dashboard stats | ✅ Most use backend data. Some hardcoded fallbacks remain when backend returns null. |
| Recommendations | ✅ Backend-first with client-side fallback. |
| Chatbot | ✅ Backend-first with hardcoded fallback answers. |
| Garden plans | ✅ Backend-driven. Removed FALLBACK_PLANTS. |
| Inventory | ✅ Backend-driven. |
| Notifications | ✅ New page, backend-driven. |
| Loyalty | ✅ Transactions from backend. Plans from backend. |
| Subscriptions | ✅ Plans from backend. |
| Reports | ✅ New page, backend-driven. |

**Remaining hardcoded values** (acceptable fallbacks):
- ChatbotPage: hardcoded fallback answers (used when backend unavailable)
- AnalyticsPage: fallback KPI values (when `activeAnalytics` is null)
- AdminDashboard: fallback metrics (when `adminAnalytics` is null)
- LoyaltyPage: fallback plans array (when `subscriptionPlans` empty)
- ProductDetailsPage: reviews are local-only (no backend review endpoint)
- OrderTrackingPage: tracking steps hardcoded (status-to-step mapping)

**localStorage usage** (acceptable):
- `flora_access_token`, `flora_refresh_token` — auth tokens
- `flora_theme` — theme preference
- `flora_specimens` — gardener's personal specimen log (no backend endpoint)
- `flora_user` — user cache (loaded from localStorage, refreshed from `/auth/me`)

## 17. Pages Tested

- ✅ Build: `npx vite build` passes (160 modules, 2.76s)
- All imports resolved, no compilation errors

Manual testing steps (requires running dev server):
1. Login as admin → admin dashboard with real data
2. Products load from backend in catalog
3. Inventory loads from backend
4. Orders load from backend
5. Reports generate from backend
6. Notifications load from backend
7. Logout → login as customer → catalog shows real products
8. Add to cart → backend cart
9. Checkout → backend order
10. AI Advisor → backend recommendations
11. Vase Match → backend result
12. Chatbot → backend answer
13. Garden planner → backend persistence
14. Loyalty → backend rewards/transactions
15. Subscription → backend plans/subscribe/cancel
16. Login as florist → florist dashboard
17. Login as gardener → garden planner

## 18. Remaining Issues

1. **No password forgot/reset UI pages** — service methods exist (`authService.forgotPassword()`, `authService.resetPassword()`) but no frontend pages.
2. **ChatbotPage doesn't use conversation history** — uses `quickAsk()` only; `startConversation()/sendMessage()` endpoints exist but not integrated.
3. **Product reviews not persistent** — `ProductDetailsPage` stores reviews in local state only.
4. **GardenPlannerPage bypasses context** — uses `gardenPlanService` directly rather than `context.updateGardenCell`. Dual state management possible.
5. **InventoryPage dual state** — loads via `inventoryService` directly into local state while also using context methods.
6. **Hardcoded fallbacks** remain as graceful degradation when backend returns null (acceptable for now).
7. **No background job queue** — report generation is synchronous; long reports may time out.
8. **`flora_user` localStorage cache** — user object cached; should verify it doesn't become stale.

## 19. Recommended Next Phase

Phase 16: **UI/UX Polish, Error Handling, and Edge Cases**
- Add loading spinners during API calls (many pages lack loading states)
- Add toast/snackbar notifications for success/error feedback
- Add empty states for all list views
- Add error boundaries per page
- Add form validation feedback
- Improve mobile responsiveness
- Add password forgot/reset UI pages
- Add notification toast when receiving new notifications (WebSocket or polling)
