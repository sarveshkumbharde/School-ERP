const express = require('express');
const {
  registerSchool,
  getSchools,
  getSchoolById,
  approveSchool,
  rejectSchool,
  getSchoolStats,
} = require('../controllers/school.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { registerSchoolSchema } = require('../validators/school.validator');

const router = express.Router();

// Public registration route
router.post('/register', validate(registerSchoolSchema), registerSchool);

// Stats route (accessible to School Admins & Teachers of approved schools)
router.get('/stats', protect, authorize('school_admin', 'teacher'), getSchoolStats);

// Super Admin protected management routes
router.use(protect);
router.use(authorize('super_admin'));

router.get('/', getSchools);
router.post('/', validate(registerSchoolSchema), registerSchool);
router.get('/:id', getSchoolById);
router.patch('/:id/approve', approveSchool);
router.patch('/:id/reject', rejectSchool);

module.exports = router;
