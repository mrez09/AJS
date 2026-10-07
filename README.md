# PT Altisan Jaya Sinergi (AJS)

AJS is a B2B fish commodity trading and supply application. Public visitors can explore commodities and contact the company. Authenticated buyers can maintain a request cart and submit an order request. Admins manage commodity details and review those requests.

An order is a **request for review**, not a payment or completed retail checkout. An Admin must confirm or reject it. Stock is deducted when an order is confirmed.

## Implemented features

### Public

- Corporate Home page with company overview, journey, activities, commodity preview, sourcing and contact sections.
- Commodity preview, catalog, and product detail pages. Product details and availability are fetched from the backend API.
- Commodity images can use product image URLs/paths or uploaded product images. JPEG and PNG uploads are limited to 5 MB and stored on the backend's local upload directory.
- Public visitors who try to add a product to a cart are shown a login prompt.
- Contact links for WhatsApp and email.

### Buyer

- Login with a seeded demo account.
- Browse all listed commodities and see Available/Unavailable status, stock, and MOQ.
- Add an available product to the cart, remove cart items, and submit the cart as an order request.
- View the buyer's own submitted requests and their statuses.

### Admin

- Admin-only Dashboard, Commodities, Edit Commodity, and Order Requests pages.
- Review order requests and confirm or reject requests that are still `Requested`.
- Create commodities, upload an image, edit product details/image, and update stock and availability.
- Stock is deducted on confirmation; rejection does not deduct stock.

## Tech stack

- **Backend:** Go 1.27.1, `net/http`, GORM, PostgreSQL driver, JWT (`golang-jwt/jwt`), and bcrypt password hashing.
- **Database:** PostgreSQL. The application reads its connection string from `DATABASE_URL`; the project context uses Neon PostgreSQL.
- **Frontend:** React 19, React Router 7, Vite 8, Tailwind CSS 4, and ESLint.
- **Commodity images:** local disk storage served by the Go API. The upload directory can be configured; image binaries are not stored in PostgreSQL.

## Main project structure

```text
.
├── backend/
│   ├── config/       # PostgreSQL/GORM connection
│   ├── handlers/     # REST API handlers and Go tests
│   ├── middleware/   # JWT authentication and role checks
│   ├── models/       # GORM models: users, products, carts, orders
│   ├── routes/       # API and static upload routes
│   ├── seeders/      # Demo users and initial products
│   ├── .env          # Local-only configuration; do not submit
│   ├── go.mod
│   └── main.go       # AutoMigrate, seed, and start API
└── frontend/
    ├── public/        # Public static assets
    ├── src/
    │   ├── assets/    # Local seafood imagery and UI assets
    │   ├── components/
    │   ├── context/   # Authentication state
    │   ├── pages/     # Public, Buyer, and Admin pages
    │   └── services/  # API clients
    ├── package.json
    └── vite.config.js # Development proxy to Go API
```

The backend runs GORM `AutoMigrate` and seeds missing demo users/products at startup. Seeders skip records whose email or product name already exists; they do not reset existing accounts or product data.

## Configuration

There are no `.env.example` files in this checkout. The variable names below are taken from the current source. Create local files yourself; do not put real secrets in source control, screenshots, or the submission Drive.

### Backend: `backend/.env`

```dotenv
DATABASE_URL=postgres://<db-user>:<db-password>@<postgres-host>/<database>?sslmode=require
JWT_SECRET=<a-long-random-secret>
# Optional. Defaults to ./uploads relative to the backend working directory.
AJS_UPLOAD_DIR=uploads
```

Run the backend with `backend` as the working directory because the database config loads `.env` from the current working directory. Keep the upload directory persistent if uploaded images must remain available after a restart or deployment.

### Frontend

`VITE_API_BASE_URL` is optional. With it unset/empty, the frontend uses relative API URLs and Vite proxies `/api` and `/uploads` to `http://localhost:8080`.

For an API hosted at a separate origin, set `VITE_API_BASE_URL` in a local frontend env file to that API origin (without a trailing slash). Do not include credentials in this variable.

Integration tests can use `AJS_TEST_DATABASE_URL`. This is separate from the application's `DATABASE_URL`; use a test database/branch, not a production database.

## Run locally

Use two terminals. A PostgreSQL database must be reachable through `DATABASE_URL` before starting the backend.

### Backend

```powershell
cd backend
go mod download
go run .
```

The API listens on `http://localhost:8080`. On startup it creates/migrates tables, seeds missing demo users/products, creates the upload directory, then serves the API.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the development frontend (normally `http://localhost:5173`) and proxies API and uploaded image requests to the Go backend.

## Demo accounts

These development/demo credentials are seeded by `backend/seeders/user.go` when the corresponding email is not already in the database. Use them only with a demo database:

| Role | Email | Password |
|---|---|---|
| Buyer | `buyer@ajs.test` | `buyer123` |
| Admin | `admin@ajs.test` | `admin123` |

Existing records are left unchanged by the seeder, so these passwords may not work if the database already contains those email addresses with different passwords. Never use these demo passwords in production.

## Validation commands

### Backend

```powershell
cd backend
go test ./...
go build -buildvcs=false ./...
```

PostgreSQL integration tests are skipped unless `AJS_TEST_DATABASE_URL` is set. Set it to an isolated test database to run those tests.

### Frontend

```powershell
cd frontend
npm run lint
npm run build
```

## Current scope notes

- Buyers submit procurement requests; the app has no payment gateway or direct payment flow.
- Confirmation/rejection is an Admin decision. Confirming deducts the requested quantity from product stock; rejecting does not.
- Uploaded product images are stored on local disk under `AJS_UPLOAD_DIR` (default `backend/uploads` when launched from `backend`). This is not object storage.
- Product availability, MOQ, stock, and product details are application data and should be checked in the live demo database before presenting exact values.
