const Attendance = require('../models/attendance.model');
const Student = require('../models/student.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Mark attendance for students in a class & section
// @route   POST /api/attendance
// @access  Private (Teacher Only)
const markAttendance = catchAsync(async (req, res) => {
  const { class: className, section, date, records } = req.body;
  const schoolId = req.user.school;

  // Normalize date to midnight to make date-only comparisons robust
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // Get all student IDs to verify they belong to this school
  const studentIds = records.map((r) => r.student);

  // Verify all students belong to the teacher's school
  const studentsInSchool = await Student.find({
    _id: { $in: studentIds },
    school: schoolId,
  });

  if (studentsInSchool.length !== studentIds.length) {
    throw new AppError(
      'One or more student IDs are invalid or belong to a different school.',
      400
    );
  }

  // Build Mongoose bulkWrite operations to upsert attendance records
  // This resolves the student+date compound unique constraint and avoids duplicates
  const bulkOps = records.map((record) => ({
    updateOne: {
      filter: { student: record.student, date: normalizedDate },
      update: {
        $set: {
          student: record.student,
          school: schoolId,
          class: className,
          section: section.toUpperCase(),
          date: normalizedDate,
          status: record.status,
          markedBy: req.user._id,
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(bulkOps);

  res.status(200).json({
    success: true,
    message: 'Attendance marked successfully',
    data: {},
  });
});

// @desc    Get attendance records for a school (with filters)
// @route   GET /api/attendance
// @access  Private (School Admin / Teacher)
const getAttendance = catchAsync(async (req, res) => {
  const schoolId = req.user.school;
  const { date, class: className, section, student } = req.query;

  const query = { school: schoolId };

  if (date) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    query.date = normalizedDate;
  }

  if (className) {
    query.class = className;
  }

  if (section) {
    query.section = section.toUpperCase();
  }

  if (student) {
    query.student = student;
  }

  const attendanceRecords = await Attendance.find(query)
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    })
    .populate('markedBy', 'name role')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    message: 'Attendance records fetched successfully',
    data: {
      attendance: attendanceRecords,
    },
  });
});

// @desc    Get attendance history for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Private (School Admin / Teacher / Student)
const getStudentAttendance = catchAsync(async (req, res) => {
  const { studentId } = req.params;

  // If role is student, they must only view their own profile attendance
  if (req.user.role === 'student') {
    const studentProfile = await Student.findOne({ user: req.user._id });
    if (!studentProfile || studentProfile._id.toString() !== studentId) {
      throw new AppError('Access denied: You can only view your own attendance history.', 403);
    }
  }

  // Load student and verify school isolation
  const student = await Student.findById(studentId);
  if (!student) {
    throw new AppError('Student profile not found', 404);
  }

  if (student.school.toString() !== req.user.school.toString()) {
    throw new AppError('Access denied: Student belongs to another school.', 403);
  }

  const records = await Attendance.find({ student: studentId })
    .populate('markedBy', 'name role')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    message: 'Student attendance history fetched successfully',
    data: {
      records,
    },
  });
});

// @desc    Get class attendance summary statistics
// @route   GET /api/attendance/class
// @access  Private (School Admin / Teacher)
const getClassAttendanceSummary = catchAsync(async (req, res) => {
  const schoolId = req.user.school;
  const { date, class: className, section } = req.query;

  if (!date) {
    throw new AppError('Date query parameter is required.', 400);
  }

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const query = { school: schoolId, date: normalizedDate };
  if (className) query.class = className;
  if (section) query.section = section.toUpperCase();

  const records = await Attendance.find(query);

  const summary = {
    total: records.length,
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
  };

  res.status(200).json({
    success: true,
    message: 'Class attendance summary statistics fetched',
    data: {
      summary,
    },
  });
});

module.exports = {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getClassAttendanceSummary,
};
