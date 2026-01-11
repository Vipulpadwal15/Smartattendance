# Smart Attendance Management System

A premium, production-ready SaaS application for attendance management, built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS + Framer Motion.

![Dashboard Preview](dashboard-preview.png) *ADD SCREENSHOT HERE*

## 🚀 Key Features

*   **Teacher-Centric Dashboard**: Modern UI with KPI cards and stats.
*   **Class Management**: Create, edit, and delete classes with subject and semester details.
*   **Smart Attendance**:
    *   Smooth toggle animations for Present/Absent.
    *   "Mark All Present" shortcut.
    *   Date-wise and Class-wise tracking.
*   **Analytics & Reports**: Visual charts using Recharts for attendance trends.
*   **Secure Authentication**: JWT-based teacher login system.
*   **Premium UX**: Glassmorphism effects, responsive design, and skeleton loading states.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, Lucide React, Context API.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose Schema).
*   **Arch**: RESTful API, MVC Pattern.

## 📂 Project Structure

```
c:/Coding/Smartattendance
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/ui/  # Reusable UI (Button, Input, Modal, Card)
│   │   ├── pages/          # Pages (Login, Dashboard, Classes, Attendance, Reports)
│   │   ├── context/        # Auth & Theme Contexts
│   │   └── ...
├── server/                 # Node.js Backend
│   ├── config/             # DB Connection
│   ├── controllers/        # Logic (Auth, Class, Student, Attendance)
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Routes
│   └── index.js            # Entry Point
└── README.md
```

## ⚡ Deployment & Setup

1.  **Clone Requirements**: Node.js, MongoDB installed locally.
2.  **Environment Variables**:
    *   Create `server/.env` with `MONGO_URI` and `JWT_SECRET`.
3.  **Install Dependencies**:
    *   Server: `cd server && npm install`
    *   Client: `cd client && npm install`
4.  **Run Locally**:
    *   Server: `npm run dev` (in server folder)
    *   Client: `npm run dev` (in client folder)
    *   Access UI at `http://localhost:5173`

## 🧠 Design Decisions

*   **Glassmorphism**: Used to create a modern, layered feel for cards vs the dark/light background.
*   **Separation of Concerns**: UI components are strictly separated from page logic.
*   **Optimistic UI**: Toggle switches animate instantly for better perceived performance.

## 🔮 Future Improvements

*   QR Code Scanning for auto-attendance.
*   Student Portal.
*   Email Notifications for low attendance.
