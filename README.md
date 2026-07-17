# MERN Mini-CRM — Backend

Node.js + Express + MongoDB REST API for a contacts CRM, with JWT authentication
(access + rotating refresh tokens), protected routes, rate-limited login, and
Mongoose pagination.

**Live API:** https://mern-crm-backend-i9m0.onrender.com
**Health check:** https://mern-crm-backend-i9m0.onrender.com/api/health
**Frontend repo:** https://github.com/MAHESHBABUNERUSULA/mern-crm-frontend
**Live frontend:** https://mern-crm-frontend-amber.vercel.app

> Note: hosted on Render's free tier, which spins down after ~15 minutes of
> inactivity. The first request after idle time may take 30–50 seconds to
> respond while it wakes up.

---

## 1. Architecture
backend/
├── server.js              # app entry: middleware, routes, error handler
├── config/db.js            # Mongoose connection
├── models/                 # User, Contact, ActivityLog schemas
├── controllers/             # business logic per resource
├── routes/                  # route → controller wiring + validation chains
├── middleware/
│   ├── auth.js              # JWT verification + role-based authorize()
│   ├── errorHandler.js       # central error → HTTP status mapping
│   ├── rateLimiter.js        # 3 login attempts / 10 min per IP
│   └── validate.js           # express-validator error formatter
├── utils/generateTokens.js  # signs access (15m) + refresh (7d) JWTs
└── tests/                   # Jest + Supertest + mongodb-memory-server

### Auth flow
1. Signup/Login returns a short-lived **access token** (15 min) and a longer-lived
   **refresh token** (7 days), rotated on every use.
2. The frontend attaches the access token as `Authorization: Bearer <token>`.
3. On a `401` (expired token), the frontend calls `POST /api/auth/refresh` to get
   a new token pair and retries the request automatically.
4. Backend routes are protected by the `protect` middleware, which verifies the
   JWT and loads the user before allowing access.

### Data model
| Contact field | Type | Notes |
|---|---|---|
| name, email, phone, company | String | validated via regex + `express-validator` |
| status | Enum | `Lead` / `Prospect` / `Customer` |
| notes | String | max 2000 chars |
| owner | ObjectId → User | every contact is scoped to its creator |
| createdAt / updatedAt | Date | via Mongoose `timestamps` |

Every contact create/update/delete also writes an `ActivityLog` entry.

---

## 2. Local setup

```bash
git clone https://github.com/MAHESHBABUNERUSULA/mern-crm-backend.git
cd mern-crm-backend
cp .env.example .env      # fill in MONGO_URI and JWT secrets
npm install
npm run dev                 # http://localhost:5000
```

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run tests (needs internet on first run to download an in-memory MongoDB binary):
```bash
npm test
```

---

## 3. API overview

Base URL: `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Create account, returns token pair |
| POST | `/auth/login` | Public, rate-limited (3 / 10 min) | Returns token pair |
| POST | `/auth/refresh` | Public (valid refresh token) | Rotates and returns new tokens |
| POST | `/auth/logout` | Private | Invalidates the stored refresh token |
| GET | `/auth/me` | Private | Current user |
| GET | `/contacts?page=&limit=&search=&status=` | Private | Paginated, searchable, filterable list |
| POST | `/contacts` | Private | Create contact |
| GET | `/contacts/:id` | Private | Single contact |
| PUT | `/contacts/:id` | Private | Update contact |
| DELETE | `/contacts/:id` | Private | Delete contact |
| GET | `/activity-logs?page=&limit=` | Private | Paginated activity feed |
| GET | `/health` | Public | Health check |

Full request/response examples: import `docs/MERN-CRM.postman_collection.json`
into Postman (set the `baseUrl` collection variable to the live URL above;
tokens auto-populate from the Login/Signup requests).

Error responses: `{ "success": false, "message": "...", "errors": [...] }`
with correct HTTP status codes (400, 401, 403, 404, 409, 429, 500).

---

## 4. Deliverables checklist

- [x] Live frontend URL: https://mern-crm-frontend-amber.vercel.app
- [x] Live backend API URL: https://mern-crm-backend-i9m0.onrender.com
- [x] Postman collection: `docs/MERN-CRM.postman_collection.json`
- [x] GitHub repo (frontend): https://github.com/MAHESHBABUNERUSULA/mern-crm-frontend
- [x] GitHub repo (backend): https://github.com/MAHESHBABUNERUSULA/mern-crm-backend
- [x] README with setup + architecture (this file)

## 5. Feature checklist against the spec

**Auth:** Signup ✅ Login ✅ JWT ✅ bcrypt hashing ✅ backend route middleware ✅
frontend protected routes ✅ token stored (localStorage) ✅ rotating refresh
mechanism with auto-retry ✅

**CRM:** all required fields ✅ add/edit/delete/view ✅ search by name/email
**and** filter by status ✅ (spec required at least one, both implemented)

**Frontend:** responsive layout ✅ auth pages ✅ dashboard ✅ form validation ✅
protected routes ✅ pagination, 10/page ✅ activity logs ✅ unit tests
(Vitest + RTL) ✅ CSV export ✅ (optional) role-based access: `role` field
exists on `User` with an `authorize()` middleware ready server-side, no
admin-only UI wired up (optional, not implemented)

**Backend:** folder structure ✅ REST endpoints ✅ input validation
(`express-validator`) ✅ error handling with correct HTTP codes ✅ login rate
limit 3/10min ✅ Mongoose pagination (`mongoose-paginate-v2`) ✅ schema
validation (regex, enums, min/max) ✅ unit tests (Jest + Supertest) ✅
Dockerized backend ✅ (optional, `Dockerfile` included)
