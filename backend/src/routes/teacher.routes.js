const express = require('express');
const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacher.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createTeacherSchema, updateTeacherSchema } = require('../validators/teacher.validator');

const router = express.Router();

router.use(protect);

// School Admins, Teachers, and Students can view lists and profiles
router.get('/', authorize('school_admin', 'teacher', 'student'), getTeachers);
router.get('/:id', authorize('school_admin', 'teacher', 'student'), getTeacherById);

// Only School Admin can modify teacher profiles
router.post('/', authorize('school_admin'), validate(createTeacherSchema), createTeacher);
router.put('/:id', authorize('school_admin'), validate(updateTeacherSchema), updateTeacher);
router.delete('/:id', authorize('school_admin'), deleteTeacher);

module.exports = router;
