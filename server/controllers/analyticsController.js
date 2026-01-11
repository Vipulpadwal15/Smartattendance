const Class = require('../models/Class');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { startOfWeek, endOfWeek, eachDayOfInterval, format } = require('date-fns');

// @desc    Get Dashboard Statistics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // 1. Total Classes
        const classes = await Class.find({ teacher: teacherId });
        const classesCount = classes.length;
        const classIds = classes.map(c => c._id);

        // 2. Total Students
        // We'll calculate students per class map for later use
        const studentsPerClass = {};
        for (const cId of classIds) {
            studentsPerClass[cId] = await Student.countDocuments({ classId: cId });
        }
        const totalStudentsCount = Object.values(studentsPerClass).reduce((a, b) => a + b, 0);

        // 3. Overall Attendance Rate
        const attendanceRecords = await Attendance.find({ classId: { $in: classIds } });

        let totalPresent = 0;
        let totalPossible = 0;

        attendanceRecords.forEach(att => {
            // For each attendance session, potential = number of students in that class
            const classStudentCount = studentsPerClass[att.classId] || 0;
            if (classStudentCount > 0) {
                totalPossible += classStudentCount;

                // Count actual present
                if (att.records) {
                    const presentCount = att.records.filter(r => r.status === 'Present').length;
                    totalPresent += presentCount;
                }
            }
        });

        const attendanceRate = totalPossible > 0
            ? Math.round((totalPresent / totalPossible) * 100)
            : 0;

        // 4. Recent Activity
        const recentAttendance = await Attendance.find({ classId: { $in: classIds } })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('classId', 'subjectName');

        res.json({
            classesCount,
            studentsCount: totalStudentsCount,
            attendanceRate,
            recentActivity: recentAttendance.map(r => ({
                id: r._id,
                subject: r.classId.subjectName,
                date: r.date,
                presentCount: r.records ? r.records.filter(s => s.status === 'Present').length : 0,
                totalCount: studentsPerClass[r.classId] || 0, // Show Total Class Size
                updatedAt: r.updatedAt
            }))
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Reports Data
// @route   GET /api/analytics/reports
// @access  Private
const getReportData = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const classes = await Class.find({ teacher: teacherId });

        // 1. Class Performance
        const classPerformance = [];

        for (const cls of classes) {
            const studentCount = await Student.countDocuments({ classId: cls._id });
            const atts = await Attendance.find({ classId: cls._id });

            let p = 0;
            let totalSessions = atts.length;

            // Total Possible = sessions * students
            let t = totalSessions * studentCount;

            atts.forEach(a => {
                if (a.records) {
                    p += a.records.filter(r => r.status === 'Present').length;
                }
            });

            const avg = t > 0 ? Math.round((p / t) * 100) : 0;

            classPerformance.push({
                name: cls.subjectName,
                students: studentCount,
                avg
            });
        }

        // 2. Weekly Trend
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 });
        const end = endOfWeek(today, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });

        // Helper to get students count for a classId quickly
        // Rerun count or optimize? Loop is small (7 days x N classes)
        // Let's cache student counts
        const studentCountsMap = {};
        for (const cls of classes) {
            studentCountsMap[cls._id] = await Student.countDocuments({ classId: cls._id });
        }
        const classIds = classes.map(c => c._id);

        const weeklyTrend = [];

        for (const day of days) {
            const queryDate = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));

            const attToday = await Attendance.find({
                classId: { $in: classIds },
                date: queryDate
            });

            let dailyPresent = 0;
            let dailyPossible = 0;

            attToday.forEach(a => {
                const sCount = studentCountsMap[a.classId] || 0;
                dailyPossible += sCount;
                if (a.records) {
                    dailyPresent += a.records.filter(r => r.status === 'Present').length;
                }
            });

            weeklyTrend.push({
                day: format(day, 'EEE'),
                attendance: dailyPossible > 0 ? Math.round((dailyPresent / dailyPossible) * 100) : 0
            });
        }

        res.json({
            classPerformance,
            weeklyTrend
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getReportData
};
