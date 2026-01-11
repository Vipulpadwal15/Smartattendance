const mongoose = require('mongoose');

const classSchema = mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: true,
        },
        semester: {
            type: String,
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true,
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Class', classSchema);
