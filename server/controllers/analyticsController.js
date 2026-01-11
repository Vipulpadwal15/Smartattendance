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
        const studentsCount = await Student.countDocuments({ classId: { $in: classIds } });

        // 3. Overall Attendance Rate (Average of all time)
        // This can be heavy, for now let's calculate based on Attendance records found
        const attendanceRecords = await Attendance.find({ classId: { $in: classIds } });

        let totalPresent = 0;
        let totalRecords = 0;

        attendanceRecords.forEach(att => {
            if (att.records) {
                att.records.forEach(studentStatus => {
                    totalRecords++;
                    if (studentStatus.status === 'Present') {
                        totalPresent++;
                    }
                });
            }
        });

        const attendanceRate = totalRecords > 0
            ? Math.round((totalPresent / totalRecords) * 100)
            : 0;

        // 4. Recent Activity (Last 5 scan sessions or updates)
        // We'll return the last 5 updated attendance docs
        const recentAttendance = await Attendance.find({ classId: { $in: classIds } })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('classId', 'subjectName');

        res.json({
            classesCount,
            studentsCount,
            attendanceRate,
            recentActivity: recentAttendance.map(r => ({
                id: r._id,
                subject: r.classId.subjectName,
                date: r.date,
                presentCount: r.records.filter(s => s.status === 'Present').length,
                totalCount: r.records.length,
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
        const classIds = classes.map(c => c._id);

        // 1. Class Performance (Avg Attendance per Class)
        // We need to aggregate attendance per class
        const classPerformance = [];

        for (const cls of classes) {
            const atts = await Attendance.find({ classId: cls._id });
            let p = 0;
            let t = 0;
            atts.forEach(a => {
                a.records.forEach(r => {
                    t++;
                    if (r.status === 'Present') p++;
                });
            });
            const avg = t > 0 ? Math.round((p / t) * 100) : 0;

            classPerformance.push({
                name: cls.subjectName,
                students: cls.students.length,
                avg
            });
        }

        // 2. Weekly Trend (Last 7 Days)
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        const end = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

        const days = eachDayOfInterval({ start, end });
        const weeklyTrend = [];

        for (const day of days) {
            // Normalize day to query format (UTC midnight usually)
            // But our db stores UTC midnight. Let's create a range or match expected stored date.
            // Since we stored date as UTC Midnight, we match that.
            const queryDate = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));

            const attToday = await Attendance.find({
                classId: { $in: classIds },
                date: queryDate
            });

            let p = 0;
            let t = 0;
            attToday.forEach(a => {
                a.records.forEach(r => {
                    t++;
                    if (r.status === 'Present') p++;
                });
            });

            weeklyTrend.push({
                day: format(day, 'EEE'), // "Mon", "Tue"
                attendance: t > 0 ? Math.round((p / t) * 100) : 0
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
