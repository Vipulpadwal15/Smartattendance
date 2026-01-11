const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const dateFns = require('date-fns'); // Assuming date-fns is available or use native Date

// @desc    Mark or Update attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
    const { date, classId, records } = req.body;

    if (!date || !classId || !records) {
        return res.status(400).json({ message: 'Please provide date, classId, and records' });
    }

    try {
        // Verify class ownership
        const classItem = await Class.findById(classId);
        if (!classItem || classItem.teacher.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check if attendance already exists for this date and class
        // We strictly look for the exact date (ignoring time if possible, but frontend usually sends ISO start of day)
        // Here we'll rely on the frontend sending normalized dates or range query, but strict equality is safer for upsert.
        // Better: parse date to start of day.
        const searchDate = new Date(date);

        // Find one
        let attendance = await Attendance.findOne({
            classId,
            date: searchDate,
        });

        if (attendance) {
            // Update existing
            attendance.records = records;
            await attendance.save();
            return res.status(200).json(attendance);
        } else {
            // Create new
            attendance = await Attendance.create({
                date: searchDate,
                classId,
                records,
            });
            return res.status(201).json(attendance);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance records
// @route   GET /api/attendance/:classId
// @access  Private
const getAttendance = async (req, res) => {
    const { classId } = req.params;
    const { date, month } = req.query;

    try {
        // Verify class ownership
        const classItem = await Class.findById(classId);
        if (!classItem || classItem.teacher.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let query = { classId };

        if (date) {
            query.date = new Date(date);
        } else if (month) {
            // month format "YYYY-MM"
            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0); // Last day of month

            query.date = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        const attendanceRecords = await Attendance.find(query).sort({ date: -1 });

        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getAttendance,
};
