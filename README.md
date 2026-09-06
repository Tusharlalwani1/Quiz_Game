# 🏆 APEX IT SOLUTION — Timed Examination Platform

An institutional-grade, full-stack timed MCQ assessment application built for **APEX IT SOLUTION**. Features candidate authentication, strict per-question countdown timers, proctored anti-cheat audit tracking, confidential score handling, and an administrative control panel with real-time analytics and CSV export.

---

## 📸 Key Features

- 🏢 **Corporate APEX IT SOLUTION Branding**: Integrated header, candidate login portal, instruction cards, and completion certificates.
- 🔐 **Dual-Role Authentication**:
  - **Candidate Access**: Shared access credentials (`quiz2026` / `play123`) paired with candidate name tracking per unique session UUID.
  - **Administrator Access**: JWT-based authentication for administrative supervision (`admin` / `adminSecret2026`).
- ⏱️ **Per-Question 15-Second Timer**: Circular SVG depletion countdown and linear progress indicator with automatic page progression upon expiration.
- 🔒 **Score Confidentiality**: Answer choices are registered immediately without revealing scores or correct choices to candidates during the test.
- 🛡️ **Anti-Cheat Audit & Deterrents**:
  - Disabled right-click context menus.
  - Disabled text selection (`user-select: none`).
  - Intercepted developer shortcuts (`F12`, `Ctrl+Shift+I`, `Ctrl+U`, `Ctrl+S`).
  - Window blur & tab-switch monitoring (`visibilitychange`) with warning alerts and live audit counters logged to candidate records.
- 📊 **Administrator Control Dashboard (`/admin`)**:
  - Real-time KPI analytics (Total Candidates, Completion Rates, Average Score, Avg Duration).
  - Expandable per-candidate question audit breakdown (selected vs. correct options, question timing).
  - CSV export for reporting.
  - Candidate search & sorting options.
  - Single record deletion and database purge controls.
- 🔊 **Interactive Audio Feedback**: Synthesized Web Audio API sound effects for button clicks, selections, timer alerts, and quiz completion.

---

## 🛠️ Tech Stack

| Layer                | Technology                                                                          |
| -------------------- | ----------------------------------------------------------------------------------- |
| **Frontend**         | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti          |
| **Backend**          | Node.js, Express.js, JSON Web Tokens (JWT)                                          |
| **Database**         | SQLite (using native Node.js `node:sqlite` engine — zero native build dependencies) |
| **Styling & Assets** | Custom CSS design tokens, APEX IT SOLUTION Brand Assets                             |

---

## 🚦 Quick Start & Backend Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or `yarn`

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory (or rename `.env.example`):

```env
# Server Port
PORT=5000

# Shared Candidate Credentials
QUIZ_USERNAME=quiz2026
QUIZ_PASSWORD=play123

# Administrator Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminSecret2026

# JWT Secret Key
JWT_SECRET=quiz_app_jwt_secret_key_2026_super_secure

# Neon Postgres connection string (required for Vercel deployment)
DATABASE_URL=postgresql://...
```

For Vercel deployment, create a Neon Postgres database and add its connection string as the `DATABASE_URL` environment variable in the Vercel project settings. The application creates its tables automatically and seeds the default 15 questions only when the questions table is empty. After that, all question changes made by an administrator are stored in Neon and remain available to candidates after restarts and redeployments.

### 4. Seed Assessment Questions

Populate the SQLite database with the 15 examination questions:

```bash
npm run seed
```

### 5. Start Development Server

Run frontend (Vite on port 3000) and backend (Express on port 5000) concurrently:

```bash
npm run dev
```

- **Frontend Client**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 🔑 Default Access Credentials

| User Type         | Route    | Username   | Password          | Notes                                 |
| ----------------- | -------- | ---------- | ----------------- | ------------------------------------- |
| **Candidate**     | `/`      | `quiz2026` | `play123`         | Requires entering Full Candidate Name |
| **Administrator** | `/admin` | `admin`    | `adminSecret2026` | Full administrative control           |

---

## 📁 Project Structure

```text
Quiz Game/
├── public/                  # Public brand assets & icons
│   ├── apex-logo.png        # APEX IT SOLUTION transparent logo
│   ├── apex-icon.png        # APEX IT icon mark / favicon
│   └── apex-logo-white.png  # Solid background logo
├── server/                  # Express API Backend
│   ├── index.js             # API routes & JWT Auth
│   ├── db.js                # SQLite database setup & tables
│   └── seed.js              # 15-question dataset seeder
├── src/                     # React Frontend
│   ├── components/          # Reusable UI components (Header, TimerRing, AntiCheatGuard)
│   ├── context/             # AuthContext & SoundContext
│   ├── pages/               # Views (Login, Instructions, Quiz, Completion, Admin)
│   ├── utils/               # CSV exporter & utility functions
│   └── index.css            # Custom CSS & Tailwind styles
├── .env.example             # Example environment configuration
├── package.json             # NPM package scripts & dependencies
├── vite.config.js           # Vite dev server configuration
└── README.md                # Documentation
```

---

## 📤 How to Upload to GitHub (Step-by-Step)

Follow these steps in your terminal to publish this repository to GitHub:

### Step 1: Initialize Git Repository

In your project directory:

```bash
git init
git branch -M main
```

### Step 2: Add Files & Commit

```bash
git add .
git commit -m "Initial commit: APEX IT SOLUTION Timed Assessment Engine"
```

### Step 3: Create GitHub Repository

1. Go to [GitHub New Repository](https://github.com/new).
2. Name your repository (e.g. `apex-it-quiz-game` or `timed-assessment-platform`).
3. Keep it **Public** or **Private**, and **DO NOT** check "Add a README file", ".gitignore", or "License" (since we already created them).
4. Click **Create repository**.

### Step 4: Link Remote & Push

Copy your remote URL from GitHub and run:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

---

## 📜 License

This project is created for **APEX IT SOLUTION**. All rights reserved.
