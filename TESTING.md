# FloraSmart Manual Testing Checklist

This project does not currently include a test framework. Use this checklist after changes until a lightweight automated test setup is added.

## Auth and Role Routing
- Register a new customer account and confirm it redirects to `/customer-dashboard`.
- Log out, then log in with that new account and confirm the same role dashboard opens.
- Log in with demo users using password `demo123`:
  - `darrly@florasmart.com` as customer
  - `florist@florasmart.com` as florist
  - `gardener@florasmart.com` as gardener
  - `admin@florasmart.com` as admin
- Try visiting a protected dashboard while logged out and confirm it redirects to `/login`.
- Try visiting an admin-only page as a customer and confirm it redirects to the customer dashboard.

## Inventory and Catalog
- Add a product in `/inventory` and confirm it appears in `/catalog`.
- Edit a product in `/inventory` and confirm the catalog reflects the new name, price, category, image, and stock.
- Delete a product in `/inventory` and confirm it disappears from the catalog and cart.
- Change product stock and confirm cart quantities do not exceed available stock.

## Cart and Checkout
- Confirm `/checkout` redirects to login when logged out.
- Confirm checkout shows an error or disabled submit for an empty cart.
- Add an in-stock product, place an order, and confirm stock is reduced.
- Attempt to order more than available stock and confirm checkout is blocked.
- Confirm new orders appear in order tracking and dashboards.

## Mobile Navigation
- Resize browser below 992px.
- Confirm the mobile menu button is visible.
- Open and close the drawer.
- Confirm mobile links navigate and close the drawer.

## Exports
- Use export buttons on analytics, inventory, florist/orders, delivery/orders, admin, gardener, and security pages.
- Confirm report downloads produce `.txt` files and sheet exports produce `.csv` files.

## Storage Safety
- Manually corrupt a `flora_*` localStorage value in DevTools.
- Refresh and confirm the app falls back to demo data without a blank screen.
