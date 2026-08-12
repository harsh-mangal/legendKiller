# Amyeka Veda Updated Ecommerce Setup

## What was connected

- Client website now calls the backend APIs first for products, categories, product details, related products, reviews, orders, login and registration.
- Clean fallback catalog data is used only when the API is empty or temporarily unreachable, so the website never looks broken on first setup.
- Admin panel already uses backend APIs for products, categories, orders, users and Amyeka Coins. Order data now includes guest checkout details too.
- Server now supports live product reviews, related products, guest-first checkout, authenticated checkout, OTP login by email and professional transactional emails.

## Fast checkout / 7-second rule

- `/api/orders/guest` lets a new customer place the first order without registration.
- The server creates/updates a lightweight customer record and marks `hasGuestOrdered=true`.
- If the same email/phone tries guest checkout again, the API returns `loginRequired=true` and asks the customer to login.
- Logged-in users can place repeat orders through `/api/orders` and can use Amyeka Coins.

## Product reviews

- Product schema now has `reviews[]`, `rating`, and `numReviews`.
- Product page has a live review form.
- Review endpoint: `POST /api/products/:slug/reviews`.
- Related products endpoint: `GET /api/products/:slug/related`.

## Email / OTP setup

Add Gmail SMTP details in `server/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_gmail_app_password
MAIL_FROM_NAME=Amyeka Veda
MAIL_FROM=yourgmail@gmail.com
```

Use a Gmail App Password, not your normal Gmail password.

Email endpoints:

- `POST /api/auth/request-otp` with `{ "email": "customer@email.com" }`
- `POST /api/auth/login-otp` with `{ "email": "customer@email.com", "otp": "123456" }`

## Local run

Server:

```bash
cd server
npm install
npm run dev
```

Client:

```bash
cd client
npm install
npm run dev
```

Admin:

```bash
cd admin
npm install
npm start
```

## Environment files

Copy each committed `.env.example` template to its adjacent `.env` file and fill in real values. Local `.env` files are intentionally ignored and must not be committed.

Client `.env`:

```env
VITE_API_BASE_URL=http://localhost:5005/api
```

Admin `.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:5005
```

Server additions:

```env
CORS_ORIGIN=https://legendbornnutrition.com,https://www.legendbornnutrition.com,https://admin.legendbornnutrition.com
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
CONTACT_TO=support@example.com
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=a_strong_unique_password
```

Create the first administrator from `server` using `npm run create-admin`. Public registration always creates customer accounts. Configure Razorpay's `payment.captured` webhook for `http://localhost:5005/api/orders/razorpay/webhook` with the configured webhook secret.

## Validation done

- Admin production build completed successfully.
- Client production build completed successfully after pinning Vite to a stable non-Rolldown version.
- Server app imports successfully and controller files pass syntax checks.
