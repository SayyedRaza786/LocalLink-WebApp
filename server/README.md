# ⚙️ LocalLink Backend API Service

This is the server-side REST API for the LocalLink platform. It is built using Node.js, Express, and Prisma ORM to connect secure authentication routes, location proximity calculations, and active booking queues with a MySQL database.

🔗 **Live Demo**: [local-link-fronted.vercel.app](https://local-link-fronted.vercel.app/)

---

## 🛠️ Key Architectural Decisions

*   **🔒 Double JWT Auth Protocol**:
    - **Access Token**: Short-lived (15 minutes), passed in the Authorization header to verify role scopes.
    - **Refresh Token**: Long-lived (7 days), stored in an HttpOnly cookie. The server processes silent automatic refresh rotation and includes detection mechanics for token reuse.
*   **📍 Spatial Geographic Queries**:
    - Calculates distance between customers and service providers.
    - Implements direct database bounding-box optimizations to filter out distant records before executing high-precision Haversine math inside Node.js.
*   **📈 Transactional State Machine**:
    - Manage booking lifecycles with strict status transitions: `PENDING` ➔ `ACCEPTED` / `REJECTED` ➔ `ON_THE_WAY` ➔ `IN_PROGRESS` ➔ `COMPLETED`.
    - Leverages Prisma database transactions (`prisma.$transaction`) to guarantee consistency during updates.
*   **🗂️ Clean Modular Modules**:
    - Code is divided by domain models (`auth`, `users`, `providers`, `bookings`, `reviews`, `categories`).
    - Each module encapsulates its controllers, routes, and validation checks.
*   **⏱️ Cron Cron Job Expirations**:
    - A node-cron scheduler automatically sweeps the database periodically to expire unaccepted requests or update stale items.
*   **🛡️ Express Rate Limiter & Helmet**:
    - Security headers and endpoint rate-limiting rules prevent raw scripting or credentials attacks on auth routes.

---

## 📂 Server Structure Overview

```
server/
├── prisma/                  # Schema specifications and seed fixtures
└── src/
    ├── config/              # Environment options & database client setup
    ├── middleware/          # JWT authenticators, RBAC rules, rate limiters
    ├── modules/             # Controllers, routers, validators (domain modules)
    └── utils/               # Coordinate calculations & structured outputs
```

---

## 🚀 Running Locally

Ensure your MySQL instance is running and configuration details are updated in your `.env` file, then launch:

```bash
# Install dependencies
npm install

# Migrate database
npx prisma migrate dev --name init

# Seed mock database data
npx prisma db seed

# Run local development server
npm run dev
```

The API will start on `http://localhost:5000`.
