# 🏠 LocalLink - Neighborhood Service Marketplace

Welcome to **LocalLink**, a complete two-sided marketplace designed to connect local customers with independent service providers in their area (electricians, clean-up crews, home tutors, photographers, etc.). 

I built this project to tackle the real-world complexities of service-based marketplaces. It handles everything from location-first radius searches, secure role-based access control, a state-machine-driven booking workflow, and responsive dashboards for both service providers and customers.

🔗 **Live Demo**: [local-link-fronted.vercel.app](https://local-link-fronted.vercel.app/)

---

## ✨ Features I Focused On

*   **📱 Fully Responsive Design**: Built mobile-first with Material-UI (MUI) v5. The navigation bar switches to an interactive mobile drawer menu, filter panels collapse into elegant bottom sheets, long multi-step registration forms scroll cleanly, and data tables respond perfectly to screen boundaries.
*   **🎨 Custom Premium Theme**: Dynamic dark/light mode toggle with custom MUI components. Uses custom gradient button variants, glassmorphic headers (`backdrop-filter`), slate/indigo aesthetics, and clean typography (Inter & Outfit).
*   **🔒 Complete Auth Security**: Role-based access control (RBAC) separating `CUSTOMER`, `PROVIDER`, and `ADMIN`. Uses double JWT security (short-lived access tokens in memory and HttpOnly cookies for refresh token rotation/theft detection).
*   **📍 Location-First Discovery**: Search results prioritize proximity. Providers define their serving radius, and searches calculate exact physical distances using bounding-box queries and Haversine formula calculations.
*   **🔄 Structured Booking State Machine**: Bookings move through a strict, reliable status pipeline:
    `PENDING` ➔ `ACCEPTED` / `REJECTED` ➔ `ON_THE_WAY` ➔ `IN_PROGRESS` ➔ `COMPLETED`. Customers can cancel at early stages, and providers can invoice adjustments at completion.
*   **✉️ Notifications & Real-Time Alerts**: Integrated alerts keep both sides updated when booking statuses change.

---

## 🛠️ The Tech Stack

### Frontend (Client-side)
*   **React 18** with **TypeScript** & **Vite** (extremely fast hot module replacement).
*   **Material-UI (MUI) v5** & Emotion for theme-based layouts.
*   **TanStack Query v5** (React Query) for smart client caching, polling, and mutations.
*   **React Hook Form** + **Zod** for robust client-side validation schemas.
*   **React Router DOM v6** for nested dashboard routing and layout guards.

### Backend (Server-side)
*   **Node.js** with **Express 5** for REST API endpoints.
*   **MySQL** database.
*   **Prisma Client v6** (ORM) for typed queries and clean schema migrations.
*   **Zod** on the backend to enforce strict payload schemas before processing database queries.
*   **Pino** for structured JSON application logging.

---

## 📂 Project Structure Overview

Here's how I organized the codebase to keep it clean and modular:

```
LocalLink/
├── client/                      # Frontend App
│   ├── src/
│   │   ├── components/          # Reusable UI elements & state spinners
│   │   ├── context/             # Authentication & custom theme providers
│   │   ├── layouts/             # Dashboard and navigation shells
│   │   ├── pages/               # Views (Home, Search, Auth, and Dashboard modules)
│   │   ├── services/            # API client configurations (Axios wrappers)
│   │   └── theme.ts             # Custom light/dark theme options
│   └── vite.config.ts
│
├── server/                      # Backend API Service
│   ├── prisma/                  # Database schema & initial seeding scripts
│   └── src/
│       ├── config/              # Server options & db instantiation
│       ├── middleware/          # Security checkers, RBAC, error handlers
│       ├── modules/             # Features (Auth, Bookings, Categories, Reviews)
│       └── utils/               # Math/Distance helpers & generic API responses
```

---

## ⚡ Getting Started Locally

### Prerequisites
- Install **Node.js** (v18 or higher)
- A running **MySQL** instance

### Step 1: Clone and Install
First, clone the project files and run npm install in both directories:

```bash
# Set up backend
cd server
npm install

# Set up frontend
cd ../client
npm install
```

### Step 2: Configure Environments
Create a `.env` file inside the `server/` folder:

```env
PORT=5000
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/locallink"
JWT_SECRET="use-a-long-random-string-for-access-token"
JWT_REFRESH_SECRET="use-another-long-random-string-for-refresh-token"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Run Database Migrations & Seeds
With MySQL running, generate the database tables and seed sample data:

```bash
cd server

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```
*Note: Seeding creates an Admin account (`admin@locallink.com` / `adminSecurePassword123`) plus sample customer and provider accounts.*

### Step 4: Run Services
Run both development servers simultaneously:

*   **Backend API**: Run `npm run dev` in the `server` directory (spins up on `http://localhost:5000`)
*   **Frontend Client**: Run `npm run dev` in the `client` directory (spins up on `http://localhost:5173`)

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
