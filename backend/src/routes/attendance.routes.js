const express = require('express');
const {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getClassAttendanceSummary,
} = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { markAttendanceSchema } = require('../validators/attendance.validator');

const router = express.Router();

router.use(protect);

// Mark attendance (Teacher only)
router.post('/', authorize('teacher'), validate(markAttendanceSchema), markAttendance);

// General attendance queries & class reports (School Admin and Teacher)
router.get('/', authorize('school_admin', 'teacher'), getAttendance);
router.get('/class', authorize('school_admin', 'teacher'), getClassAttendanceSummary);

// Student attendance logs (School Admin, Teacher, and the individual Student)
router.get('/student/:studentId', authorize('school_admin', 'teacher', 'student'), getStudentAttendance);

module.exports = router;
