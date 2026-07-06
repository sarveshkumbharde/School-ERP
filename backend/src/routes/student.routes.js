const express = require('express');
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect);

// School Admins, Teachers, and Students can view lists and individual profiles
router.get('/', authorize('school_admin', 'teacher', 'student'), getStudents);
router.get('/:id', authorize('school_admin', 'teacher', 'student'), getStudentById);

router.post('/upload-csv', upload.single('students.csv'), (req, res)=>{
   if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

})

// Only School Admin can modify student records
router.post('/', authorize('school_admin'), createStudent);
router.put('/:id', authorize('school_admin'), updateStudent);
router.delete('/:id', authorize('school_admin'), deleteStudent);

module.exports = router;
