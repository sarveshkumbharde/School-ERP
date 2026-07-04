const express = require('express');
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createStudentSchema, updateStudentSchema } = require('../validators/student.validator');

const router = express.Router();

router.use(protect);

// School Admins, Teachers, and Students can view lists and individual profiles
router.get('/', authorize('school_admin', 'teacher', 'student'), getStudents);
router.get('/:id', authorize('school_admin', 'teacher', 'student'), getStudentById);

// Only School Admin can modify student records
router.post('/', authorize('school_admin'), validate(createStudentSchema), createStudent);
router.put('/:id', authorize('school_admin'), validate(updateStudentSchema), updateStudent);
router.delete('/:id', authorize('school_admin'), deleteStudent);

module.exports = router;
