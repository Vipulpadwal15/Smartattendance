const express = require('express');
const router = express.Router();
const {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkCreateStudents,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createStudent);
router.route('/class/:classId').get(protect, getStudents);
router.post('/bulk', protect, bulkCreateStudents);
router.route('/:id').put(protect, updateStudent).delete(protect, deleteStudent);

module.exports = router;
