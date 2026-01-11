const Class = require('../models/Class');

// @desc    Get all classes for logged in teacher
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.id });
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private
const createClass = async (req, res) => {
    const { subjectName, semester } = req.body;

    if (!subjectName || !semester) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const newClass = await Class.create({
            subjectName,
            semester,
            teacher: req.user.id,
        });
        res.status(201).json(newClass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private
const updateClass = async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id);

        if (!classItem) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in teacher matches the class teacher
        if (classItem.teacher.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private
const deleteClass = async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id);

        if (!classItem) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in teacher matches the class teacher
        if (classItem.teacher.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await classItem.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getClasses,
    createClass,
    updateClass,
    deleteClass,
};
