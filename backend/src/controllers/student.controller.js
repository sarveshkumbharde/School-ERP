const Student = require('../models/student.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (School Admin Only)
const createStudent = catchAsync(async (req, res) => {
  const {
    name,
    email,
    password,
    rollNumber,
    class: className,
    section,
    dateOfBirth,
    gender,
    phone,
    address,
  } = req.body;

  const schoolId = req.user.school;

  // Check if email already exists globally in User model
  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    throw new AppError(`User with email '${email}' already exists.`, 409);
  }

  // Check if roll number is unique in this school
  const rollNumberExists = await Student.findOne({ school: schoolId, rollNumber });
  if (rollNumberExists) {
    throw new AppError(`Student with roll number '${rollNumber}' already exists in this school.`, 409);
  }

  // Create User account for student
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'student',
    school: schoolId,
    isActive: true,
  });

  // Create Student profile
  const student = await Student.create({
    user: user._id,
    school: schoolId,
    rollNumber,
    class: className,
    section: section.toUpperCase(),
    dateOfBirth: new Date(dateOfBirth),
    gender,
    phone,
    address,
  });

  // Populate user in response
  student.user = user;

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: {
      student,
    },
  });
});

// @desc    Get all students for school with filters & search
// @route   GET /api/students
// @access  Private (School Admin / Teacher / Student)
const getStudents = catchAsync(async (req, res) => {
  const schoolId = req.user.school;
  const { search, class: className, section } = req.query;

  // Build student query using basic MongoDB filters
  const studentQuery = { school: schoolId };

  if (className) {
    studentQuery.class = className;
  }

  if (section) {
    studentQuery.section = section.toUpperCase();
  }

  let students = await Student.find(studentQuery).populate('user').sort({ rollNumber: 1 });

  // Filter in JS memory if search term is provided
  if (search) {
    const term = search.toLowerCase();
    students = students.filter((student) => {
      const name = student.user?.name ? student.user.name.toLowerCase() : '';
      const email = student.user?.email ? student.user.email.toLowerCase() : '';
      return name.includes(term) || email.includes(term);
    });
  }

  res.status(200).json({
    success: true,
    message: 'Students fetched successfully',
    data: {
      students,
    },
  });
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private (School Admin / Teacher / Student)
const getStudentById = catchAsync(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user');
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify school isolation
  if (student.school.toString() !== req.user.school.toString()) {
    throw new AppError('Access denied: Student belongs to another school.', 403);
  }

  res.status(200).json({
    success: true,
    message: 'Student details fetched successfully',
    data: {
      student,
    },
  });
});

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (School Admin Only)
const updateStudent = catchAsync(async (req, res) => {
  const {
    name,
    email,
    rollNumber,
    class: className,
    section,
    dateOfBirth,
    gender,
    phone,
    address,
  } = req.body;

  const student = await Student.findById(req.params.id);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify school isolation
  if (student.school.toString() !== req.user.school.toString()) {
    throw new AppError('Access denied: Student belongs to another school.', 403);
  }

  // If email is changing, validate uniqueness
  if (email && email.toLowerCase() !== student.user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists && emailExists._id.toString() !== student.user.toString()) {
      throw new AppError(`User with email '${email}' already exists.`, 409);
    }
  }

  // If roll number is changing, validate uniqueness within school
  if (rollNumber && rollNumber !== student.rollNumber) {
    const rollNumberExists = await Student.findOne({ school: req.user.school, rollNumber });
    if (rollNumberExists && rollNumberExists._id.toString() !== student._id.toString()) {
      throw new AppError(`Student with roll number '${rollNumber}' already exists in this school.`, 409);
    }
  }

  // Update User details
  const userUpdate = {};
  if (name) userUpdate.name = name;
  if (email) userUpdate.email = email.toLowerCase();
  
  if (Object.keys(userUpdate).length > 0) {
    await User.findByIdAndUpdate(student.user, userUpdate, { new: true });
  }

  // Update Student details
  if (rollNumber) student.rollNumber = rollNumber;
  if (className) student.class = className;
  if (section) student.section = section.toUpperCase();
  if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);
  if (gender) student.gender = gender;
  if (phone) student.phone = phone;
  if (address) student.address = address;

  await student.save();
  const updatedStudent = await Student.findById(student._id).populate('user');

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: {
      student: updatedStudent,
    },
  });
});

// @desc    Delete student profile and user account
// @route   DELETE /api/students/:id
// @access  Private (School Admin Only)
const deleteStudent = catchAsync(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify school isolation
  if (student.school.toString() !== req.user.school.toString()) {
    throw new AppError('Access denied: Student belongs to another school.', 403);
  }

  // Delete corresponding User account
  await User.findByIdAndDelete(student.user);
  // Delete Student profile
  await Student.findByIdAndDelete(student._id);

  res.status(200).json({
    success: true,
    message: 'Student and associated user account deleted successfully',
    data: {},
  });
});

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
