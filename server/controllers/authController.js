const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new teacher
// @route   POST /api/auth/register
// @access  Public
const registerTeacher = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if teacher exists
    const teacherExists = await Teacher.findOne({ email });
    if (teacherExists) {
        return res.status(400).json({ message: 'Teacher already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create teacher
    const teacher = await Teacher.create({
        name,
        email,
        password: hashedPassword,
    });

    if (teacher) {
        res.status(201).json({
            _id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            token: generateToken(teacher.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid teacher data' });
    }
};

// @desc    Authenticate a teacher
// @route   POST /api/auth/login
// @access  Public
const loginTeacher = async (req, res) => {
    const { email, password } = req.body;

    // Check for teacher email
    const teacher = await Teacher.findOne({ email });

    if (teacher && (await bcrypt.compare(password, teacher.password))) {
        res.json({
            _id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            token: generateToken(teacher.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get teacher data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    registerTeacher,
    loginTeacher,
    getMe,
};
