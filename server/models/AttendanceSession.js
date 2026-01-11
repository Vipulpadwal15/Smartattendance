const mongoose = require('mongoose');

const attendanceSessionSchema = mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true,
        },
        sessionToken: {
            type: String,
            required: true,
            unique: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        currentQrToken: {
            type: String,
        },
        previousQrToken: {
            type: String,
        },
        lastRotation: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
