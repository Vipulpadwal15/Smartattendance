const mongoose = require('mongoose');

const studentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        rollNumber: {
            type: String, // String to handle alphanumeric roll numbers if needed
            required: true,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        // Optional additional details
        email: { type: String },
        phone: { type: String },
    },
    {
        timestamps: true,
    }
);

// Ensure roll number is unique per class
studentSchema.index({ rollNumber: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
