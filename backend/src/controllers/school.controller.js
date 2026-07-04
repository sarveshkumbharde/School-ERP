const School = require('../models/school.model');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const Attendance = require('../models/attendance.model');
const AppError = require('../utils/AppError');

// @desc    Register a new school and school admin
// @route   POST /api/schools/register
// @access  Public
const registerSchool = async (req, res, next) => {
  try {
    const {
      name,
      schoolCode,
      email,
      phone,
      address,
      city,
      state,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    // Check if school code already exists
    const schoolCodeExists = await School.findOne({ schoolCode: schoolCode.toUpperCase() });
    if (schoolCodeExists) {
      return next(new AppError(`School with code '${schoolCode}' already exists.`, 409));
    }

    // Check if school email already exists
    const schoolEmailExists = await School.findOne({ email: email.toLowerCase() });
    if (schoolEmailExists) {
      return next(new AppError(`School with email '${email}' already exists.`, 409));
    }

    // Check if admin user email already exists
    const adminEmailExists = await User.findOne({ email: adminEmail.toLowerCase() });
    if (adminEmailExists) {
      return next(new AppError(`Admin user with email '${adminEmail}' already exists.`, 409));
    }

    // Create the School (starts with status pending)
    const school = await School.create({
      name,
      schoolCode: schoolCode.toUpperCase(),
      email: email.toLowerCase(),
      phone,
      address,
      city,
      state,
      status: 'pending',
    });

    // Create the School Admin
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'school_admin',
      school: school._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'School registration submitted successfully. Application is pending approval.',
      data: {
        school,
        admin: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all schools
// @route   GET /api/schools
// @access  Private (Super Admin Only)
const getSchools = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { schoolCode: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const schools = await School.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Schools fetched successfully',
      data: {
        schools,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get school by ID
// @route   GET /api/schools/:id
// @access  Private (Super Admin Only)
const getSchoolById = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return next(new AppError('School not found', 404));
    }

    // Find the associated School Admin
    const admin = await User.findOne({ school: school._id, role: 'school_admin' });

    res.status(200).json({
      success: true,
      message: 'School details fetched successfully',
      data: {
        school,
        admin: admin
          ? {
              id: admin._id,
              name: admin.name,
              email: admin.email,
              isActive: admin.isActive,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a school application
// @route   PATCH /api/schools/:id/approve
// @access  Private (Super Admin Only)
const approveSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return next(new AppError('School not found', 404));
    }

    if (school.status === 'approved') {
      return next(new AppError('School is already approved', 400));
    }

    school.status = 'approved';
    school.approvedBy = req.user._id;
    school.approvedAt = new Date();
    await school.save();

    res.status(200).json({
      success: true,
      message: `School '${school.name}' approved successfully.`,
      data: {
        school,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a school application
// @route   PATCH /api/schools/:id/reject
// @access  Private (Super Admin Only)
const rejectSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return next(new AppError('School not found', 404));
    }

    if (school.status === 'rejected') {
      return next(new AppError('School is already rejected', 400));
    }

    school.status = 'rejected';
    school.approvedBy = req.user._id;
    school.approvedAt = new Date();
    await school.save();

    res.status(200).json({
      success: true,
      message: `School '${school.name}' rejected.`,
      data: {
        school,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSchoolStats = async (req, res, next) => {
  try {
    const schoolId = req.user.school;

    // 1. Enrollment stats
    const studentCount = await Student.countDocuments({ school: schoolId });
    const teacherCount = await Teacher.countDocuments({ school: schoolId });

    // 2. Today's attendance summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.find({ school: schoolId, date: today });
    const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
    const absentToday = todayAttendance.filter((a) => a.status === 'absent').length;
    const lateToday = todayAttendance.filter((a) => a.status === 'late').length;

    // 3. Overall attendance percentage
    const totalRecords = await Attendance.countDocuments({ school: schoolId });
    const presentRecords = await Attendance.countDocuments({
      school: schoolId,
      status: { $in: ['present', 'late'] },
    });
    
    const overallPercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    res.status(200).json({
      success: true,
      message: 'School statistics fetched successfully',
      data: {
        stats: {
          studentCount,
          teacherCount,
          presentToday,
          absentToday,
          lateToday,
          overallPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerSchool,
  getSchools,
  getSchoolById,
  approveSchool,
  rejectSchool,
  getSchoolStats,
};
