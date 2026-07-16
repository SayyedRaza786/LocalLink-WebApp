# 💻 LocalLink Frontend Application

This is the client-side single-page application (SPA) for the LocalLink platform. It's built on a modern, responsive React stack designed to feel fast, secure, and visually premium.

🔗 **Live Demo**: [local-link-fronted.vercel.app](https://local-link-fronted.vercel.app/)

---

## 🛠️ The Architecture & Architecture Choices

*   **⚡ Bundling with Vite & TypeScript**: I chose Vite to get instant hot module replacement (HMR) and fast build packaging. The entire codebase is strongly typed in TypeScript to catch errors at compile time and make onboarding or modifications safe.
*   **🎨 Material-UI (MUI) v5 + Custom Theme**: Dynamic dark/light mode toggle utilizing custom overrides. All cards, dialogs, and navigation elements feature high-end styling details: glassmorphism backdrop-filters, clean box shadows, rounded corners, and premium gradients.
*   **📱 Responsive Layouts**: Fully mobile-first design systems. Includes a slide-out hamburger navigation menu drawer, a bottom-sheet filters drawer for service searching, and auto-scrollable tab panels for dashboard tracking.
*   **🔄 API Syncing with TanStack Query (React Query)**: Replaced legacy useEffect data fetching with react-query. This handles loading/error skeletons, automatic cache invalidation on edits, and request polling out of the box.
*   **🔒 Route Guards & Auth Context**: Leverages React Context for login states. Routes are dynamically wrapped in protection guards to separate public pages, customer actions, provider options, and administrator controls.
*   **📝 Validation with React Hook Form & Zod**: Form handlers are backed by Zod resolvers, validating fields like password strength checklists and date validity bounds prior to submission.

---

## 📂 Core Folder Breakdown

```
client/src/
├── components/          # Shared views, alerts, and loading spinners
├── context/             # App Contexts (AuthContext, ThemeContext)
├── layouts/             # Navigation bars, Footers, and Dashboard wrappers
├── pages/               # Main pages
│   ├── auth/            # Login & Register views (multi-step forms)
│   ├── public/          # Home, Search, and Provider details views
│   ├── customer/        # Customer dashboard, booking views, favorites
│   ├── provider/        # Provider planner, galleries, bookings queues
│   └── admin/           # Platform metrics & category lists managers
├── services/            # Axios API instances with refresh token interceptors
└── theme.ts             # Custom palette styling options and button configs
```

---

## 🚀 Running Locally

Ensure the backend server is running, then launch the client:

```bash
# Install dependencies
npm install

# Start local server
npm run dev
```

The application will run on `http://localhost:5173`.
