const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, markAttendance);
router.route('/:classId').get(protect, getAttendance);

module.exports = router;
