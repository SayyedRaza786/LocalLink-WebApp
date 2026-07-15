# LocalLink

> **"Connecting Local Services with Local People."**

LocalLink is a high-performance, two-sided marketplace designed to connect local customers seeking professional service experts (electricians, cleaners, tutors, photographers) with certified service providers. 

---

## 🚀 Key Features

*   **Premium Design System**: Structured with Material-UI (MUI) v5, featuring dynamic Indigo/Teal & Purple palettes, Inter/Outfit typography, micro-animations, glassmorphic headers, and full light/dark theme support.
*   **Role-Based Security**: Complete authentication flows with JWT access tokens and secure HttpOnly refresh token rotation/theft-detection.
*   **Structured Booking Workflows**: Clear transactional state machine ensuring reliable booking lifecycles (`PENDING` ➔ `ACCEPTED` / `REJECTED` / `CANCELLED` ➔ `ON_THE_WAY` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
*   **Location-First Discovery**: Proximity filtering using bounding-box database queries and exact Haversine distance calculations in TypeScript.
*   **Real-time Messaging**: Socket.IO integration supporting active typing indicators, read receipts, and system alerts.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 18 (TypeScript)
*   **Build Tool**: Vite 5
*   **Styling**: Material-UI (MUI) v5 & Emotion CSS
*   **Routing**: React Router DOM v6
*   **State / API**: TanStack Query (React Query) v5, Axios client with interceptors for silent token refresh
*   **Feedback**: React Hot Toast

### Backend
*   **Runtime**: Node.js (Express 5)
*   **Database**: MySQL
*   **ORM**: Prisma Client v6
*   **Validation**: Zod v4 schemas
*   **Scheduling**: Node-cron jobs for expiring stale bookings
*   **Logging**: Pino (Structured JSON logs)

---

## 📂 Project Structure

```
LocalLink/
├── client/                      # Frontend Application (Vite + React)
│   ├── src/
│   │   ├── components/ui/       # Shared design primitives (Button, Modal, etc.)
│   │   ├── config/              # Axios API clients and constants
│   │   ├── context/             # React authentication contexts
│   │   ├── layouts/             # Shared view shell configurations (Main, Dashboard)
│   │   ├── pages/               # Login, Register, Search, Dashboards
│   │   └── routes/              # Nested router definitions and auth guards
│   └── vite.config.ts
│
├── server/                      # Backend API Service (Express + Node)
│   ├── prisma/                  # Prisma Schemas and Seeding Scripts
│   └── src/
│       ├── config/              # Environment configurations & database singletons
│       ├── middleware/          # Role checkers, error handlers, and rate limiters
│       ├── modules/             # Domain-driven features (Auth, Booking, User)
│       └── utils/               # Haversine metrics and response helpers
```

---

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MySQL Server (v8.0+)

### Installation
1.  Clone the repository and enter the directory.
2.  Install server dependencies:
    ```bash
    cd server
    npm install
    ```
3.  Install client dependencies:
    ```bash
    cd ../client
    npm install
    ```

### Environment Variables
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
DATABASE_URL="mysql://root:password@localhost:3306/locallink"
JWT_SECRET="your-jwt-secret-here-at-least-32-characters-long"
JWT_REFRESH_SECRET="your-refresh-secret-here-at-least-32-characters-long"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

### Database Setup
Within the `server/` directory, execute:
1.  Run migrations:
    ```bash
    npx prisma migrate dev --name init
    ```
2.  Seed the database (creates admin user `admin@locallink.com` with password `adminSecurePassword123`):
    ```bash
    npx prisma db seed
    ```

### Running Locally
To launch both servers in development mode:
*   **Backend**: `cd server && npm run dev` (starts on `http://localhost:5000`)
*   **Frontend**: `cd client && npm run dev` (starts on `http://localhost:5173`)

---

## 🔒 Security Architecture
*   **Password Hashing**: Bcrypt hashing with a work factor of 12.
*   **Token Isolation**: JWT access tokens are persisted strictly in memory; refresh tokens are stored in HttpOnly cookies to mitigate XSS/CSRF vectors.
*   **SQL Injection Prevention**: Prisma uses parameterized queries natively.
*   **Rate Limiting**: Throttles route requests on critical endpoints to mitigate brute force attacks.

---

## 📜 License
This project is licensed under the MIT License.
