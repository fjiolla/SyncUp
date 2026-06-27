# 🎯 SyncUp

<div align="center">

![SyncUp](https://img.shields.io/badge/SyncUp-Live-4a6741?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)

**A modern activity and community platform — find hackathons, treks, workshops, and more. Think Meetup, but built for India.**

</div>

---

## ✨ What is SyncUp?

SyncUp connects people through shared activities. Hosts create **pods** (events like a hackathon, sunrise trek, or coding workshop). Anyone can browse, join, and attend. Think of it like Eventbrite or Meetup — but with a social layer on top.

---

## 🚀 Features

- 🗓️ **Activity hosting** — Create events with date, time, location (map picker), virtual/in-person/hybrid format
- 🔍 **Browse & discover** — Filter by category, search by name or tag
- 👥 **Attendee management** — Hosts can approve/reject requests, manage roles
- 🔔 **Notifications** — Follow requests, join requests, and approvals show up in real time
- 💬 **Messages** — Instagram-style message requests; only accepted connections can freely message
- 👤 **Profiles** — Bios, locations, activities, follow/unfollow with request approval
- 📅 **Calendar view** — See all activities by date
- ⭐ **Reviews** — Attendees can review past activities
- 🛡️ **Admin dashboard** — Stats and user management
- 🔐 **Auth** — Email/password + Google + GitHub OAuth, JWT refresh tokens
- 📸 **Image uploads** — Cloudinary-backed profile photos and activity banners
- 🗺️ **Map integration** — OpenStreetMap / Leaflet for venue picking and display
- 🏷️ **Private activities** — Hidden from browse, shareable via direct link

---

## 🛠️ Tech Stack

### Backend
- **Node.js + Express** — REST API
- **MongoDB Atlas** — Database
- **Upstash Redis** — Session caching, token store
- **Cloudinary** — Image uploads
- **SendGrid** — Transactional email
- **Passport.js** — Google + GitHub OAuth
- **JWT** — Access + refresh token auth
- **Joi** — Request validation
- **Helmet, CORS, mongo-sanitize** — Security

### Frontend
- **React 19** — UI
- **Vite** — Build tool
- **Tailwind CSS v4** — Styling
- **Zustand** — State management
- **React Query** — Server state
- **React Hook Form + Zod** — Forms and validation
- **Framer Motion** — Animations
- **Leaflet + React Leaflet** — Maps
- **Sonner** — Toast notifications
- **Lottie** — Animations

---

## 📂 Project Structure

```
SyncUp2/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Cloudinary, Passport
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth, rate limiter, error handler, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/v1/       # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Response formatter
│   │   ├── validators/      # Joi schemas
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Entry point + graceful shutdown
│   ├── .env                 # Never commit this
│   └── .env.example         # Safe template
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios API clients
    │   ├── assets/          # Lottie animations, icons
    │   ├── components/      # Reusable UI components
    │   ├── hooks/           # Custom React hooks
    │   ├── layouts/         # App + Auth layouts
    │   ├── pages/           # Route-level page components
    │   ├── router/          # React Router config
    │   ├── store/           # Zustand stores
    │   └── main.jsx         # Entry point
    ├── public/              # Static assets (favicon, etc.)
    ├── .env                 # Never commit this
    └── .env.example         # Safe template
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Upstash Redis account
- Cloudinary account
- SendGrid account
- Google + GitHub OAuth credentials

### 1. Clone the repo

```bash
git clone https://github.com/your-username/syncup.git
cd syncup
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in all values in .env
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000/api/v1
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

---

## 🔐 Environment Variables

See `backend/.env.example` for the full list. Required:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | Upstash Redis URL |
| `JWT_ACCESS_SECRET` | Long random string |
| `JWT_REFRESH_SECRET` | Different long random string |
| `CLOUDINARY_*` | Cloudinary credentials |
| `SENDGRID_API_KEY` | SendGrid API key |
| `GOOGLE_CLIENT_*` | Google OAuth credentials |
| `GITHUB_CLIENT_*` | GitHub OAuth credentials |
| `CORS_ORIGIN` | Frontend URL (e.g. `https://syncup.vercel.app`) |

---

## 🚢 Deployment

### Backend (e.g. Railway, Render, Fly.io)
```bash
npm install
node src/server.js
```
Set `NODE_ENV=production` and all env vars on the platform.

### Frontend (e.g. Vercel, Netlify)
```bash
npm run build
# Serve the dist/ folder
```
Set `VITE_API_URL=https://your-api-domain/api/v1` in the platform's environment settings.

### OAuth callback URLs
Update Google + GitHub OAuth consoles to point to your deployed API:
```
https://your-api-domain/api/v1/auth/google/callback
https://your-api-domain/api/v1/auth/github/callback
```

---

## 📡 API Overview

All routes are prefixed with `/api/v1/`.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/google`, `GET /auth/github` |
| Pods | `GET /pods/discover`, `POST /pods`, `GET /pods/:slug`, `PATCH /pods/:podId` |
| Users | `GET /users/:username` |
| Follow | `POST /users/:userId/follow`, `POST /users/:userId/follow/accept` |
| Chat | `POST /chat/conversations/:targetUserId`, `POST /chat/conversations/:id/messages` |
| Notifications | `GET /notifications`, `PATCH /notifications/read-all` |
| Search | `GET /search?q=...` |

---

## 🔗 Connect

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-leenashah-181717?style=for-the-badge&logo=github)](https://github.com/fjiolla)
[![Email](https://img.shields.io/badge/Email-shah.leena.287-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:shah.leena.287@gmail.com)

</div>

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by [Leena Shah](https://fjiolla.vercel.app)

</div>
