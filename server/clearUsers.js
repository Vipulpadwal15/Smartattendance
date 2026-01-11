const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const AttendanceSession = require('./models/AttendanceSession');

dotenv.config();

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear All Data
        await Teacher.deleteMany({});
        console.log('Teachers removed');

        await Class.deleteMany({});
        console.log('Classes removed');

        await Student.deleteMany({});
        console.log('Students removed');

        await Attendance.deleteMany({});
        console.log('Attendance records removed');

        await AttendanceSession.deleteMany({});
        console.log('Active Sessions removed');

        console.log('Database Completely Cleared!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

clearData();
