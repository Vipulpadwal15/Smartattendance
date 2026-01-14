const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const dateFns = require('date-fns'); // Assuming date-fns is available or use native Date
const crypto = require('crypto');
const AttendanceSession = require('../models/AttendanceSession');
const Student = require('../models/Student');

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

// @desc    Start QR Session
// @route   POST /api/attendance/session/start
// @access  Private (Teacher)
const startSession = async (req, res) => {
    const { classId } = req.body;
    try {
        // Deactivate any existing active sessions for this class
        await AttendanceSession.updateMany(
            { classId, isActive: true },
            { isActive: false }
        );

        const sessionToken = crypto.randomBytes(32).toString('hex');
        const currentQrToken = crypto.randomBytes(16).toString('hex'); // Initial sub-token

        // Extended session time to 5 mins since we have rotation
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const session = await AttendanceSession.create({
            classId,
            teacherId: req.user.id,
            sessionToken,
            currentQrToken,
            isActive: true,
            expiresAt
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rotate QR Token (Called by Teacher Frontend)
// @route   PUT /api/attendance/session/:sessionId/rotate
// @access  Private (Teacher)
const rotateQrToken = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await AttendanceSession.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const newQrToken = crypto.randomBytes(16).toString('hex');

        // Move current to previous, set new current
        session.previousQrToken = session.currentQrToken;
        session.currentQrToken = newQrToken;
        session.lastRotation = Date.now();

        await session.save();

        res.json({ newQrToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    End QR Session
// @route   POST /api/attendance/session/end
// @access  Private (Teacher)
const endSession = async (req, res) => {
    const { sessionId } = req.body;
    try {
        await AttendanceSession.findByIdAndUpdate(sessionId, { isActive: false });
        res.json({ message: 'Session ended' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Active Session for Class
// @route   GET /api/attendance/session/:classId
// @access  Private (Teacher)
const getActiveSession = async (req, res) => {
    try {
        const session = await AttendanceSession.findOne({
            classId: req.params.classId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark Attendance via QR
// @route   POST /api/attendance/mark-qr
// @access  Public (Student)
const markAttendanceQR = async (req, res) => {
    const { sessionToken, rollNumber, qrToken } = req.body;

    try {
        // 1. Validate Session
        const session = await AttendanceSession.findOne({
            sessionToken,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (!session) {
            return res.status(400).json({ message: 'Invalid or Expired Session' });
        }

        // 2. Validate Rotating Token (Security Check with Grace Period)
        // We allow current token OR the immediately previous token (to handle latency/scan delay)
        const isValidToken =
            (session.currentQrToken && qrToken === session.currentQrToken) ||
            (session.previousQrToken && qrToken === session.previousQrToken);

        if (!isValidToken && session.currentQrToken) {
            // Only enforce if rotation is active (currentQrToken exists)
            return res.status(400).json({ message: 'QR Code Expired. Please rescan.' });
        }

        // 3. Find Student
        const student = await Student.findOne({
            rollNumber,
            classId: session.classId
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found in this class' });
        }

        // 4. Find or Create Attendance Logic
        const now = new Date();
        const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        let attendance = await Attendance.findOne({
            classId: session.classId,
            date: today
        });

        if (!attendance) {
            attendance = await Attendance.create({
                classId: session.classId,
                date: today,
                records: []
            });
        }

        // 5. Update Status for specific student
        const studentIndex = attendance.records.findIndex(r => r.studentId.toString() === student._id.toString());

        if (studentIndex > -1) {
            if (attendance.records[studentIndex].status === 'Present') {
                return res.status(200).json({ message: 'Attendance already marked' });
            }
            attendance.records[studentIndex].status = 'Present';
        } else {
            // Add new record
            attendance.records.push({
                studentId: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                status: 'Present'
            });
        }

        await attendance.save();

        // Socket.io Real-time Update
        if (req.io) {
            // Emitting to session room for QR page update
            req.io.to(sessionToken).emit('attendance_update', {
                studentName: student.name,
                rollNumber: student.rollNumber,
                timestamp: new Date()
            });

            // Fetch class to get teacher ID for Dashboard update
            const classDoc = await Class.findById(session.classId);
            if (classDoc && classDoc.teacher) {
                // Emitting to teacher's personal room for Dashboard update
                req.io.to(`teacher_${classDoc.teacher.toString()}`).emit('dashboard_update', {
                    type: 'new_attendance',
                    studentName: student.name,
                    subject: classDoc.subjectName,
                    timestamp: new Date()
                });
            }
        }

        res.json({ message: 'Attendance Marked Successfully', student: student.name });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getAttendance,
    startSession,
    endSession,
    getActiveSession,
    markAttendanceQR,
    rotateQrToken
};
