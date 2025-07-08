# SyncUp

**Meet Your Match for Moments That Matter**

SyncUp is a full-stack web platform that helps people find like-minded individuals who are free at the same time for shared interests. Whether it’s going on a trip, forming a hackathon team, or organizing a local event, SyncUp enables purposeful, real-time connections through Pods — time-bound micro-communities formed around specific activities.

---

## 🚀 Features

* 🔍 Smart Matching: Based on availability, interests, location, and preferences
* 🧩 Pods: Create or join focused activity groups
* 📆 Availability Heatmap: Know when others are free
* 💬 Real-Time Chat: Pod-based messaging system (coming soon)
* 📌 RSVP & Polls: Confirm participation and schedule with ease
* 🧭 Location Integration: Discover Pods nearby (coming soon)
* 🔐 Authentication: Secure login/signup with Firebase Auth or NextAuth

---

## 🛠️ Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS
* shadcn/ui
* TypeScript

### Backend

* Next.js API Routes
* MongoDB + Mongoose
* Firebase Auth / NextAuth.js
* Socket.io (for real-time features)

### Integrations

* Google Calendar API (availability sync)
* Google Maps API (location-aware Pods)

---

## 📦 Project Structure

```
📦app
 ┣ 📂auth
 ┃ ┗ 📜page.tsx
 ┣ 📂create-pod
 ┃ ┗ 📜page.tsx
 ┣ 📂dashboard
 ┃ ┣ 📂calendar
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂pods
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📜layout.tsx
 ┃ ┗ 📜page.tsx
 ┣ 📂pod
 ┃ ┗ 📂[id]
 ┃ ┃ ┗ 📜page.tsx
 ┣ 📂profile
 ┃ ┗ 📜page.tsx
 ┣ 📜globals.css
 ┣ 📜layout.tsx
 ┗ 📜page.tsx
```

This is a modular, route-based layout using the Next.js App Router, designed for scalability.

---

## 🎬 Demo Video

Watch a walkthrough of SyncUp in action:

https://github.com/user-attachments/assets/45a41e0e-fa41-4c8e-a310-fe1b3e834e18

---

## 📦 Getting Started

### Prerequisites

* Node.js v18+
* pnpm (recommended) or npm

### Installation

```bash
pnpm install
pnpm run dev
```

Then visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Development Plan

### ✅ Month 1: Backend & Database

* Set up MongoDB Atlas and connect via Mongoose
* Create models for Users and Pods
* Build API routes for creating, reading, and deleting Pods
* Implement secure API structure using TypeScript and schema validation

### ✅ Month 2: Authentication & Access Control

* Integrate Firebase Auth or NextAuth.js
* Create signup/login UI and session management
* Restrict Pod creation and profile pages to logged-in users

### ⏳ Month 3: Real-Time & Integrations

* Implement real-time Pod chat with Socket.io
* Add RSVP & availability poll features
* Integrate Google Calendar API for scheduling
* Add Google Maps API for location-based Pod discovery

### ⏳ Month 4: Polishing & Production Deployment

* Add error handling, loading states, and UI feedback
* Refactor code for modularity and scalability
* Deploy on Vercel and connect to MongoDB Atlas
* Add CI/CD and .env configuration for secure production setup

---

## 📄 License

[MIT License](https://github.com/fjiolla/SyncUp---Find-Your-Perfect-Pod?tab=MIT-1-ov-file#)

---

## 🙋‍♀️ Author

**Leena Shah** – [@fjiolla](https://github.com/fjiolla)

---

## 📢 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 💡 One-liner Pitch

“SyncUp helps you stop waiting and start living — find people who are free when you are, for the things you love.”
