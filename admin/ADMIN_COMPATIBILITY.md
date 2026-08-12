# Admin, Storefront and Backend Compatibility

This admin was aligned to the current legendbornnutrition client and backend code supplied with the project.

## Operational modules

| Admin module | Backend contract | Storefront impact |
|---|---|---|
| Dashboard | `GET /api/admin/dashboard`, orders, products, enquiries | Operational signals only |
| Products | `/api/products/admin/all`, product CRUD | Product listing, detail, cart and order pricing |
| Inventory | Product update endpoint | Add-to-cart availability and server-side order validation |
| Categories | `/api/categories/admin/all`, category CRUD | Catalogue navigation and category pages |
| Combos | `/api/combos/admin/all`, combo CRUD | Combo catalogue and checkout items |
| Orders | Admin order list/detail/status/return/invoice endpoints | Customer orders, tracking, payment and return state |
| Customers | `/api/admin/users-wallet-cart`, block endpoint | Login/account access and customer service |
| Reviews | Product review moderation endpoints | Approved reviews and product ratings |
| Coupons | `/api/promotions/admin` | Server-validated checkout discounts |
| Delivery & payments | `/api/delivery/admin/settings` | Pincode checker, shipping charge, COD and online methods |
| Enquiries | `/api/contact/admin` | Homepage/contact lead capture |
| Banners | `/api/banners/admin/*` | Home and category campaign banners |
| Testimonials | `/api/testimonials/admin/all` and CRUD | Storefront testimonial section |
| Articles | `/api/blogs/admin/all` and CRUD | Backend-ready; current storefront has no article routes |
| Ameyka Coins | `/api/amyeka-coins/setting` | Earn/redeem rules used by cart and checkout |
| Operations | `/health`, `/ready`, protected dashboard | Environment and database readiness |

## Important behavior

- The admin never calculates final customer order totals. The backend remains authoritative for current prices, stock, shipping, coupons and coin redemption.
- Online orders cannot be progressed in the admin until payment is `PAID`.
- Marking an order `CANCELLED`, completing a return or delivering COD calls backend workflows that may change inventory, payment and coin records.
- Product images selected during edit replace the existing server image set because that is how the current product controller behaves.
- Product batch and expiry fields are flags only. The current backend does not implement batch-wise inventory records.
- Articles can be managed but are intentionally labelled as optional because the current customer frontend does not expose article pages.

## Backend capabilities not exposed as unsafe admin shortcuts

The admin does not provide direct controls for changing captured payment IDs, customer passwords, order totals, earned coin history or invoice numbering. Those values are generated or reconciled by the server and should not be manually overwritten.

## Remaining platform-level requirements

These require backend or infrastructure changes rather than admin UI work:

- Administrator MFA and audit logs
- Partial item returns/refunds and replacement-order creation
- Dedicated refund reconciliation worker
- Batch/expiry inventory ledger
- Courier API integration and shipping-label generation
- GST-compliant PDF invoice service and jurisdiction configuration
- Paginated customer API for very large databases
- Object-storage uploads for multi-instance deployment

The admin UI clearly reflects the contracts currently available and does not simulate unsupported operations.
