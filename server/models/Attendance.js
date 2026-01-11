const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        records: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Student',
                    required: true,
                },
                status: {
                    type: String,
                    enum: ['Present', 'Absent'],
                    default: 'Absent',
                },
                name: String, // Snapshot of student name for easy display
                rollNumber: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one attendance record per class per day
attendanceSchema.index({ date: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
