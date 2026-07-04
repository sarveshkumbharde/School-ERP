const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

// @desc    Create a new teacher
// @route   POST /api/teachers
// @access  Private (School Admin Only)
const createTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      phone,
      gender,
      qualification,
      subjects,
      assignedClasses,
    } = req.body;

    const schoolId = req.user.school;

    // Check if email already exists globally
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return next(new AppError(`User with email '${email}' already exists.`, 409));
    }

    // Check if employee ID is unique within school
    const employeeIdExists = await Teacher.findOne({ school: schoolId, employeeId });
    if (employeeIdExists) {
      return next(new AppError(`Teacher with employee ID '${employeeId}' already exists in this school.`, 409));
    }

    // Create User account for teacher
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'teacher',
      school: schoolId,
      isActive: true,
    });

    // Create Teacher profile
    const teacher = await Teacher.create({
      user: user._id,
      school: schoolId,
      employeeId,
      phone,
      gender,
      qualification,
      subjects,
      assignedClasses,
    });

    // Populate user in response
    teacher.user = user;

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: {
        teacher,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teachers in school with optional search
// @route   GET /api/teachers
// @access  Private (School Admin / Teacher / Student)
const getTeachers = async (req, res, next) => {
  try {
    const schoolId = req.user.school;
    const { search } = req.query;

    const userQuery = { role: 'teacher' };
    if (schoolId) {
      userQuery.school = schoolId;
    }

    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const matchingUsers = await User.find(userQuery).select('_id');
    const userIds = matchingUsers.map((u) => u._id);

    const query = {
      school: schoolId,
      user: { $in: userIds },
    };

    const teachers = await Teacher.find(query).populate('user').sort({ employeeId: 1 });

    res.status(200).json({
      success: true,
      message: 'Teachers fetched successfully',
      data: {
        teachers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher details
// @route   GET /api/teachers/:id
// @access  Private (School Admin / Teacher / Student)
const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('user');
    if (!teacher) {
      return next(new AppError('Teacher not found', 404));
    }

    // Verify school isolation
    if (teacher.school.toString() !== req.user.school.toString()) {
      return next(new AppError('Access denied: Teacher belongs to another school.', 403));
    }

    res.status(200).json({
      success: true,
      message: 'Teacher details fetched successfully',
      data: {
        teacher,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private (School Admin Only)
const updateTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      employeeId,
      phone,
      gender,
      qualification,
      subjects,
      assignedClasses,
    } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return next(new AppError('Teacher not found', 404));
    }

    // Verify school isolation
    if (teacher.school.toString() !== req.user.school.toString()) {
      return next(new AppError('Access denied: Teacher belongs to another school.', 403));
    }

    // If email is changing, validate uniqueness
    if (email && email.toLowerCase() !== teacher.user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists && emailExists._id.toString() !== teacher.user.toString()) {
        return next(new AppError(`User with email '${email}' already exists.`, 409));
      }
    }

    // If employee ID is changing, validate uniqueness within school
    if (employeeId && employeeId !== teacher.employeeId) {
      const employeeIdExists = await Teacher.findOne({ school: req.user.school, employeeId });
      if (employeeIdExists && employeeIdExists._id.toString() !== teacher._id.toString()) {
        return next(new AppError(`Teacher with employee ID '${employeeId}' already exists in this school.`, 409));
      }
    }

    // Update User details
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email.toLowerCase();

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(teacher.user, userUpdate, { new: true });
    }

    // Update Teacher details
    if (employeeId) teacher.employeeId = employeeId;
    if (phone) teacher.phone = phone;
    if (gender) teacher.gender = gender;
    if (qualification) teacher.qualification = qualification;
    if (subjects) teacher.subjects = subjects;
    if (assignedClasses) teacher.assignedClasses = assignedClasses;

    await teacher.save();
    const updatedTeacher = await Teacher.findById(teacher._id).populate('user');

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: {
        teacher: updatedTeacher,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher profile and user account
// @route   DELETE /api/teachers/:id
// @access  Private (School Admin Only)
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return next(new AppError('Teacher not found', 404));
    }

    // Verify school isolation
    if (teacher.school.toString() !== req.user.school.toString()) {
      return next(new AppError('Access denied: Teacher belongs to another school.', 403));
    }

    // Delete corresponding User account
    await User.findByIdAndDelete(teacher.user);
    // Delete Teacher profile
    await Teacher.findByIdAndDelete(teacher._id);

    res.status(200).json({
      success: true,
      message: 'Teacher and associated user account deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
};
