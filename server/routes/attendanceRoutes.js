const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendance,
    startSession,
    endSession,
    getActiveSession,
    markAttendanceQR
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, markAttendance);
router.route('/:classId').get(protect, getAttendance);

// QR Session Routes
router.post('/session/start', protect, startSession);
router.post('/session/end', protect, endSession);
router.get('/session/:classId', protect, getActiveSession);

// Student Route (Public or separate auth)
router.post('/mark-qr', markAttendanceQR);

module.exports = router;
