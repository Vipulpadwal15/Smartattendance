const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardStats, getReportData } = require('../controllers/analyticsController');

router.get('/dashboard', protect, getDashboardStats);
router.get('/reports', protect, getReportData);

module.exports = router;
