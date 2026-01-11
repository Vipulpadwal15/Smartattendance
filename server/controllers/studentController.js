const Student = require('../models/Student');
const Class = require('../models/Class');

// @desc    Get all students for a specific class
// @route   GET /api/students/class/:classId
// @access  Private
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({ classId: req.params.classId });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a student to a class
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
    const { name, rollNumber, classId, email, phone } = req.body;

    if (!name || !rollNumber || !classId) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        // Check if class exists and belongs to teacher
        const classItem = await Class.findById(classId);
        if (!classItem) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Authorization check
        if (classItem.teacher.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to add student to this class' });
        }

        const student = await Student.create({
            name,
            rollNumber,
            classId,
            email,
            phone,
        });

        // Add student to class's students array
        classItem.students.push(student._id);
        await classItem.save();

        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check authorization (via class)
        const classItem = await Class.findById(student.classId);
        if (!classItem || classItem.teacher.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Create Students
// @route   POST /api/students/bulk
// @access  Private
const bulkCreateStudents = async (req, res) => {
    const { students, classId } = req.body; // students: [{name, rollNumber}, ...]

    if (!students || !Array.isArray(students) || !classId) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    try {
        const classItem = await Class.findById(classId);
        if (!classItem) return res.status(404).json({ message: 'Class not found' });
        if (classItem.teacher.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Prepare data
        const studentsToInsert = students.map(s => ({
            name: s.name,
            rollNumber: String(s.rollNumber), // Ensure string
            classId,
        }));

        // Insert Many
        const createdStudents = await Student.insertMany(studentsToInsert, { ordered: false });

        // Update Class with new IDs
        const newIds = createdStudents.map(s => s._id);
        classItem.students.push(...newIds);
        await classItem.save();

        res.status(201).json({ count: createdStudents.length, students: createdStudents });

    } catch (error) {
        // Handle partial success/failure if needed, but for now standard error
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check authorization
        const classItem = await Class.findById(student.classId);
        if (!classItem || classItem.teacher.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Remove from class
        classItem.students = classItem.students.filter(
            (id) => id.toString() !== student._id.toString()
        );
        await classItem.save();

        await student.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkCreateStudents,
};
