# 🎯 Boredom Buster

<p align="center">
  <strong>A modern, full-stack MERN application that turns boredom into memorable moments with smart activity recommendations, interactive card swiping, weekly challenges, and gamified progress tracking.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Redux%20Toolkit-2.6-764ABC?style=flat-square&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose%208.x-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## 📖 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation & Running Locally](#installation--running-locally)
- [Testing](#-testing)
- [API Reference](#-api-reference)
  - [Authentication](#auth)
  - [Suggestions](#suggestions)
  - [Activities](#activities)
  - [Weekly Challenges](#challenges)
  - [User Statistics](#stats)
- [Data Models](#-data-models)
- [Security & Best Practices](#-security--best-practices)
- [License](#-license)

---

## ✨ Key Features

- **🔥 Tinder-Style Discovery**: Swipe right to save an activity to your personal backlog, or swipe left to skip. Fully animated with touch, drag, and circular action buttons (`Skip`, `Generate`, `Save`).
- **🎯 Smart Filtering & 15-Minute Mode**: Filter by category (`education`, `recreational`, `social`, `charity`, `cooking`, `relaxation`, `busywork`), group size (1 to 8), or toggle the instant *"I only have 15–30 minutes"* pill.
- **🔐 Secure Authentication & Persistence**: Stateless JWT authentication with bcrypt password hashing. Session state survives refreshes through Redux state rehydration and `localStorage`.
- **📋 Backlog Management ("My List")**:
  - Filter across **Saved**, **Done**, and **Skipped** tabs.
  - Personal notes editor and 5-star rating system.
  - Custom Activity modal for tracking offline, custom experiences.
  - **Decision Spinner (Fortune Wheel)**: Let fate pick when you can't choose what to do!
- **🏆 Weekly Challenges**:
  - Commit to 3–5 activities per week with dynamic progress bars and countdown timers.
  - Auto-generate challenges directly from your saved backlog.
  - Earn **+50 Bonus XP** and unlock exclusive achievement trophies upon completion.
- **📊 Visual Analytics Dashboard**:
  - Interactive Recharts bar chart showing daily activity completion over the last 7 days.
  - Category distribution pie chart.
  - Trophy case highlighting unlocked achievements and active streaks.
- **🌓 Flawless Dark/Light Mode**: Full custom dark mode theming configured for Tailwind CSS v4 with persisted user preference.

---

## 🛠 Architecture & Tech Stack

### Frontend (`client/`)
- **Framework**: React 19 + Vite 6
- **State Management**: Redux Toolkit (RTK) (`createSlice`, `createAsyncThunk`)
- **Routing**: React Router DOM v7 with `ProtectedRoute` guards
- **Styling**: Tailwind CSS v4 with `@custom-variant dark` support
- **Data Visualization**: Recharts 2.x
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized request/response interceptors for Bearer JWT injection

### Backend (`server/`)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 4.x
- **Database & ODM**: MongoDB with Mongoose 8.x
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Validation**: Schema validation via `Zod`
- **Caching**: `node-cache` (10-minute cache for external Bored API queries)
- **Security & Logging**: Helmet, CORS, Morgan

---

## 📂 Project Structure

```
react-project-ds/
├── server/
│   ├── src/
│   │   ├── config/             # DB connection & environment variables
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Activity.js
│   │   │   └── Challenge.js
│   │   ├── routes/             # Express API routes
│   │   │   ├── auth.js
│   │   │   ├── suggestions.js
│   │   │   ├── activities.js
│   │   │   ├── challenges.js
│   │   │   └── stats.js
│   │   ├── controllers/        # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── suggestionController.js
│   │   │   ├── activityController.js
│   │   │   └── challengeController.js
│   │   ├── services/           # Business logic & 3rd party APIs
│   │   │   ├── boredApi.js     # Bored API proxy with in-memory caching
│   │   │   ├── challengeService.js
│   │   │   └── statsService.js
│   │   ├── middleware/         # Custom Express middlewares
│   │   │   ├── auth.js         # JWT verification sentinel
│   │   │   ├── error.js        # Central error & 404 handlers
│   │   │   └── validate.js     # Zod request validators
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # Server entry point
│   ├── tests/                  # Automated integration & unit tests
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js  # Preconfigured Axios instance with JWT interceptors
│   │   ├── redux/              # Centralized Redux store and slices
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   ├── activitiesSlice.js
│   │   │   ├── challengeSlice.js
│   │   │   ├── statsSlice.js
│   │   │   ├── suggestionSlice.js
│   │   │   └── uiSlice.js
│   │   ├── components/         # Shared UI & feature components
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
- **MongoDB**: A running local instance (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

---

### Environment Configuration

Create a `.env` file inside the `server/` directory:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/boredom-buster
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

### Installation & Running Locally

#### 1. Start the Backend API
```bash
cd server
npm install
npm run dev
```
The server will start on **`http://localhost:5000`** with live reloading.

#### 2. Start the Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
The client will launch on **`http://localhost:5173`**.

---

## 🧪 Testing

The backend includes a comprehensive Jest test suite verifying routing, authentication, Zod validation, deduplication, weekly challenges, and analytics.

```bash
cd server
npm test
```

**Results:**
```text
PASS tests/stats.test.js
PASS tests/challenges.test.js
PASS tests/activities.test.js
PASS tests/suggestions.test.js
PASS tests/health.test.js
PASS tests/auth.test.js

Test Suites: 6 passed, 6 total
Tests:       20 passed, 20 total
```

---

## 📡 API Reference

All protected endpoints require the HTTP header:  
`Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated profile, XP, streak |

### Suggestions
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/suggestions/random` | Protected | Get single suggestion (excluding seen items) |
| `GET` | `/api/suggestions/browse` | Protected | Get full filtered list of available activities |

### Activities
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities` | Protected | Fetch user's activities (query: `status`, `type`) |
| `POST` | `/api/activities` | Protected | Save suggestion or create custom activity |
| `PATCH` | `/api/activities/:id` | Protected | Update activity status, notes, or 1–5 rating |
| `DELETE` | `/api/activities/:id` | Protected | Remove an activity from user's list |

### Challenges
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/challenges/current` | Protected | Get active weekly challenge with progress |
| `POST` | `/api/challenges` | Protected | Create manual or auto-generated challenge |

### Stats
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stats` | Protected | Returns 7-day completion timeline, category breakdown & badges |

---

## 📊 Data Models

### User Schema
```typescript
{
  name: string;
  email: string;            // unique, lowercase
  passwordHash: string;     // bcrypt hashed
  xp: number;               // awarded on activity (+15) and challenge (+50)
  streak: number;           // consecutive active days
  lastActiveDate: Date;
  badges: string[];         // e.g. ["First Step", "Challenge Champion"]
}
```

### Activity Schema
```typescript
{
  user: ObjectId;           // Ref -> User
  apiKey: string | null;    // External Bored API key (null for custom)
  activity: string;         // Title / description
  type: string;             // education | recreational | social | etc.
  participants: number;
  price: number;            // 0.0 to 1.0 (Mapped to Free / Cheap / Moderate / Pricey)
  availability: number;     // 0.0 to 1.0 (Mapped to Rare / Moderate / Common)
  duration: string;         // "minutes" | "hours" | "days"
  status: "saved" | "done" | "skipped";
  notes: string;
  rating: number;           // 1 to 5 stars
  completedAt: Date | null;
  isCustom: boolean;
}
```
> **Deduplication**: Features a partial unique compound index `{ user: 1, apiKey: 1 }` to guarantee no duplicate external API saves per user.

---

## 🛡 Security & Best Practices

- **Zero Client-Side API Keys**: Browser never calls third-party APIs directly; all requests flow through Express.
- **Strict Input Sanitization**: Server-side validation via `Zod` blocks injection attacks and malformed payloads.
- **Stateless Authorization**: JWT headers are verified per request using standardized status codes (`401 Unauthorized`, `403 Forbidden`).
- **HTTP Security Headers**: `helmet` and constrained `cors` policies configured out-of-the-box.
- **Centralized Error Handling**: Uncaught rejections and errors return predictable `{ message: string }` payloads without leaking stack traces in production.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
