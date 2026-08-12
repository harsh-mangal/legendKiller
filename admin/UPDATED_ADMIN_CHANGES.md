# Amyeka Veda Admin Update

Replace your existing `admin` folder with this folder.

## Changes made

1. Added Product Reviews page
   - New route: `/reviews`
   - Shows live reviews submitted from the website product detail page.
   - Pulls reviews from the existing `/api/products?limit=all` API.
   - Auto-refreshes every 30 seconds and also has a manual refresh button.
   - Shows product name, product image, category, customer name/email, rating, comment, status, and review date.

2. Updated Admin Layout
   - Added Reviews menu item in the sidebar.
   - Shows logged-in admin name and email in the top header and sidebar.
   - Added mobile responsive sidebar menu.

3. Updated Dashboard
   - Dashboard now fetches all products using `/products?limit=all`.
   - Added Product Reviews count and average rating card.
   - Recent orders now also show guest checkout customer names.

4. Updated Users page
   - Shows logged-in/registered users when the admin users API is available.
   - Falls back to live order records if `/admin/users-wallet-cart` is not available.
   - Shows customer name, email, phone, guest/registered type, last login, order count, total spent, and Amyeka Coins.

5. Safety fixes
   - Added missing `React` imports to admin JSX files to avoid `React is not defined` errors.
   - Verified admin production build successfully.

## Run

```bash
cd admin
npm install
npm start
```

## Build check

```bash
npm run build
```
