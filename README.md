# 🧭 SideQuest

<p align="center">
  <strong>Break the routine. Discover engaging micro-adventures, swipe through personalized activities, conquer weekly challenges, and level up your life.</strong>
</p>

<p align="center">
  <a href="https://your-sidequest.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-your--sidequest.vercel.app-6366F1?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://sidequest-51sy.onrender.com/api/health" target="_blank">
    <img src="https://img.shields.io/badge/API_Status-Online-10B981?style=for-the-badge&logo=render&logoColor=white" alt="API Status" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Redux%20Toolkit-2.6-764ABC?style=flat-square&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose%208.x-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Tests-41%20Passed-success?style=flat-square&logo=jest&logoColor=white" alt="Jest Tests" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## 🌐 Live Deployments

- **Frontend Application (Vercel)**: [https://your-sidequest.vercel.app](https://your-sidequest.vercel.app)
- **Backend REST API (Render)**: [https://sidequest-51sy.onrender.com/api](https://sidequest-51sy.onrender.com/api)
- **API Health Endpoint**: [https://sidequest-51sy.onrender.com/api/health](https://sidequest-51sy.onrender.com/api/health)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Installation](#local-installation)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [REST API Contract](#-rest-api-contract)
  - [Authentication](#auth)
  - [Suggestions](#suggestions)
  - [Activities](#activities)
  - [Weekly Challenges](#challenges)
  - [Statistics & Badges](#stats)
- [Performance & Resilience Highlights](#-performance--resilience-highlights)
- [License](#-license)

---

## 💡 Overview

**SideQuest** (formerly *Boredom Buster*) is a full-stack MERN application engineered to solve decision paralysis when you're looking for something engaging to do. 

Drawing from curated external activity engines, SideQuest packages activities into an interactive **Tinder-style deck**, where users can swipe through micro-adventures with real-time feedback, add custom entries, track weekly completion streaks, and unlock achievements on a personalized analytics dashboard.

---

## ✨ Key Features

- **🃏 Tinder-Style Swiping Deck**:
  - **Swipe Right**: Accept quest and save it into your personal backlog.
  - **Swipe Left**: Skip card cleanly to reveal the next adventure.
  - **Smooth Physics**: Velocity-based tilt animations with mouse, touch, or arrow key controls.
  - **Circular Quick Controls**: Prominent central **Roll / Generate** button with quick Skip (`✕`) and Save (`♥`) buttons.
- **⚡ Smart Filtering & Instant Mode**:
  - Filter across 7 categories: `education`, `recreational`, `social`, `charity`, `cooking`, `relaxation`, `busywork`.
  - Filter by group size (solo to 8 people).
  - Quick pill filter: *"I only have 15–30 minutes"*.
- **📋 Backlog Management ("Your Adventures")**:
  - Organised tabs: **Accepted** and **Completed**.
  - Rate activities with a 5-star rating system and add personal reflections or equipment notes.
  - **Custom Activity Creator**: Create and track your own offline adventures.
  - **Decision Spinner (Wheel of Fate)**: Let the built-in fortune wheel randomly choose from your accepted quests when you can't decide.
- **🏆 Weekly Challenges**:
  - Automatically or manually generate a weekly challenge (3–5 tasks) with deadline countdowns.
  - Earning **+50 Bonus XP** and unlocking the exclusive `Challenge Champion` badge upon finishing.
- **📊 Visual Analytics Dashboard**:
  - Recharts bar chart showing daily activity completions over the past 7 days.
  - Category distribution pie chart with dynamic tooltips.
  - Trophy case with locked/unlocked achievement badges.
- **🌓 Native Dark / Light Mode**:
  - Custom Tailwind CSS v4 theming supporting system defaults and user toggles, persisted in `localStorage`.

---

## 🛠 Architecture & Tech Stack

### Frontend (`client/`)
- **Framework**: React 19 + Vite 6
- **State Management**: Redux Toolkit (RTK) (`store.js`, slices with `createAsyncThunk`)
- **Routing**: React Router DOM v7 with `ProtectedRoute` guards
- **Styling**: Tailwind CSS v4 with custom `@custom-variant dark` support
- **Data Visualization**: Recharts 2.x
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized request interceptors (Bearer JWT) and error response normalization

### Backend (`server/`)
- **Runtime**: Node.js 22.x (ES Modules)
- **Framework**: Express 4.x
- **Database**: MongoDB with Mongoose 8.x
- **Authentication**: JWT (`jsonwebtoken`) with `bcryptjs` password hashing
- **Validation**: Schema validation via `Zod`
- **Caching**: `node-cache` (10-minute cache for external Bored API queries) + in-memory Set deduplication
- **Security & Logging**: Helmet, CORS with auto-protocol normalization, Morgan

---

## 📂 Project Structure

```
sidequest/
├── server/
│   ├── src/
│   │   ├── config/             # DB connection & environment variables
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── models/             # Mongoose schemas (User, Activity, Challenge)
│   │   │   ├── User.js
│   │   │   ├── Activity.js
│   │   │   └── Challenge.js
│   │   ├── routes/             # Express route definitions
│   │   │   ├── auth.js
│   │   │   ├── suggestions.js
│   │   │   ├── activities.js
│   │   │   ├── challenges.js
│   │   │   └── stats.js
│   │   ├── controllers/        # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── suggestionController.js
│   │   │   ├── activityController.js
│   │   │   └── challengeController.js
│   │   ├── services/           # Business logic & 3rd party APIs
│   │   │   ├── boredApi.js     # External Bored API service with in-memory caching
│   │   │   ├── seenKeys.js     # Fast seen-keys deduplicator with fallback circuit-breaker
│   │   │   ├── challengeService.js
│   │   │   └── statsService.js
│   │   ├── middleware/         # Custom Express middlewares
│   │   │   ├── auth.js         # JWT sentinel verification
│   │   │   ├── error.js        # Central error & 404 handlers
│   │   │   └── validate.js     # Zod request validators
│   │   ├── app.js              # Express app definition & CORS policy
│   │   └── server.js           # Server bootstrap
│   ├── tests/                  # Automated integration & resilience tests (41 tests)
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js  # Central Axios instance with Bearer token interceptor
│   │   ├── redux/              # Centralized Redux Toolkit store and slices
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   ├── activitiesSlice.js
│   │   │   ├── challengeSlice.js
│   │   │   ├── statsSlice.js
│   │   │   ├── suggestionSlice.js
│   │   │   └── uiSlice.js
│   │   ├── components/         # Shared UI components
│   │   │   ├── brand/
│   │   │   ├── ActivityItemCard.jsx
│   │   │   ├── CustomActivityModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Filters.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── QuestCard.jsx
│   │   │   ├── questMeta.js
│   │   │   ├── Toaster.jsx
│   │   │   └── WheelModal.jsx
│   │   ├── pages/              # Route views
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── MyListPage.jsx
│   │   │   ├── ChallengesPage.jsx
│   │   │   └── StatsPage.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── PLAN.md                     # Agent build plan and phase checklist
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (`v22.x` recommended)
- **npm**: `v10.x` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

### Environment Variables

#### 1. Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sidequest
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Production note on Render**: Set `CLIENT_URL=https://your-sidequest.vercel.app` (always include `https://`).

#### 2. Frontend (`client/.env.production` or Vercel Environment Variables)
```env
VITE_API_URL=https://sidequest-51sy.onrender.com/api
```

---

### Local Installation

#### Start the Server
```bash
cd server
npm install
npm run dev
```
Backend will start on **`http://localhost:5000`** with live reloading.

#### Start the Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Frontend will launch on **`http://localhost:5173`**.

---

## 🧪 Testing & Quality Assurance

The backend features a comprehensive test suite (41 tests) covering unit operations, authentication, Zod validation, weekly challenges, and database failover resilience:

```bash
cd server
npm test
```

```text
PASS tests/resilience.test.js
PASS tests/stats.test.js
PASS tests/suggestions.test.js
PASS tests/challenges.test.js
PASS tests/activities.test.js
PASS tests/auth.test.js
PASS tests/health.test.js

Test Suites: 7 passed, 7 total
Tests:       41 passed, 41 total
Snapshots:   0 total
Time:        16.1 s
```

---

## 📡 REST API Contract

All protected endpoints require the header:  
`Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `GET` | `/api/auth/me` | Protected | Fetch current profile, XP, streak, badges |

### Suggestions
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/suggestions/random` | Protected/Public | Get random suggestion (auto-skips seen keys) |
| `GET` | `/api/suggestions/browse` | Protected/Public | Fetch full filtered list of available activities |

### Activities
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities` | Protected | Fetch user's activities (query: `status`, `type`) |
| `POST` | `/api/activities` | Protected | Save suggestion or create custom activity |
| `PATCH` | `/api/activities/:id` | Protected | Update status (`saved`, `done`), notes, or 1–5 rating |
| `DELETE` | `/api/activities/:id` | Protected | Remove activity from user's backlog |

### Challenges
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/challenges/current` | Protected | Get active weekly challenge with progress |
| `POST` | `/api/challenges` | Protected | Create challenge (manual or auto-generated) |

### Stats
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stats` | Protected | Retrieve weekly analytics, category breakdown & badges |

---

## ⚡ Performance & Resilience Highlights

1. **Zero Client-Side API Keys**: Third-party APIs are proxied and sanitized through Express.
2. **Circuit-Breaker & Seen-Key Caching** ([`seenKeys.js`](server/src/services/seenKeys.js)):
   - Avoids repetitive Mongo queries on swiping with a 60-second in-memory Set.
   - Enforces a **1.5s query timeout**: if MongoDB Atlas sleeps or responds slowly, suggestions never hang.
3. **Compound Sparse Indexes**:
   - `{ user: 1, apiKey: 1 }` prevents duplicate saves of external activities while allowing unlimited custom entries.
4. **Adaptive CORS Engine**:
   - Automatically normalizes protocols, strips trailing slashes, and accepts Vercel preview branch deployments without manual reconfiguration.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
