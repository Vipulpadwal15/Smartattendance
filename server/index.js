require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now (dev/prod)
        methods: ["GET", "POST", "PUT"]
    }
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_session', (sessionId) => {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Middleware
app.use(express.json());
app.use(cors());

// Attach IO to request for controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
