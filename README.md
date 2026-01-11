# Smart Attendance Management System

A premium, production-ready SaaS application for attendance management, built with the MERN stack (MongoDB, Express, React, Node.js) and styled with **Tailwind CSS + Framer Motion**.

## 🚀 Key Features

### 🎓 For Teachers
*   **Intuitive Dashboard**: Real-time statistics, class overview, and recent activity feed.
*   **Smart Attendance Marking**: 
    *   Manual Mode: Smooth toggle animations for Present/Absent.
    *   **QR Mode**: Dynamic QR code generation for self-attendance.
*   **Bulk Student Management**: 
    *   **Import via CSV**: Add hundreds of students in seconds.
    *   **Copy Class**: One-click import from existing batches.
*   **Analytics & Reports**: 
    *   Weekly Attendance Trends (Live Data).
    *   Class Performance comparison.
*   **Security**: Device-level locking to prevent proxy attendance.

### 📱 For Students
*   **QR Scanner**: Built-in QR scanner to mark attendance instantly.
*   **Anti-Proxy**: "One Device, One Vote" security ensures students cant mark for friends.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Recharts, Lucide React, Context API.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose).
*   **Security**: JWT Authentication, Device Fingerprinting (LocalStorage Lock).

## 📂 Project Structure

```
c:/Coding/Smartattendance
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI & Feature Components
│   │   ├── pages/          # Dashboard, Classes, Reports, QR Generator
│   │   ├── context/        # Auth & Theme Contexts
│   │   └── ...
├── server/                 # Node.js Backend
│   ├── config/             # DB Connection
│   ├── controllers/        # Logic (Auth, Class, Student, Analytics)
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Routes
│   └── index.js            # Entry Point
└── README.md
```

## ⚡ Deployment & Setup

1.  **Clone Requirements**: Node.js, MongoDB installed locally.
2.  **Environment Variables**:
    *   Create `server/.env` with:
        ```env
        MONGO_URI=your_mongodb_uri
        JWT_SECRET=your_jwt_secret
        PORT=5000
        ```
3.  **Install Dependencies**:
    *   Server: `cd server && npm install`
    *   Client: `cd client && npm install`
4.  **Run Locally**:
    *   Server: `npm run dev` (in server folder)
    *   Client: `npm run dev` (in client folder)
    *   Access UI at `http://localhost:5173`

## 🧠 Design Decisions

*   **Glassmorphism**: Used to create a modern, layered feel for cards vs the dark/light background.
*   **Optimistic UI**: Toggle switches animate instantly for better perceived performance.
*   **Separation of Concerns**: Dedicated controllers for Analytics separate from core CRUD logic.

## 🔮 Future Improvements

*   Student Portal (View own attendance history).
*   Email Notifications for low attendance.
*   Export Reports to PDF/Excel.
