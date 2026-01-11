const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const Teacher = require('./models/Teacher');
const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();

        const email = 'teacher@example.com';
        const password = '123456';
        const name = 'Demo Teacher';

        const teacherExists = await Teacher.findOne({ email });

        if (teacherExists) {
            console.log('Teacher already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await Teacher.create({
            name,
            email,
            password: hashedPassword,
        });

        console.log('Teacher Created Details:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
