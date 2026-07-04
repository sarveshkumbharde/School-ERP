require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const User = require('../models/user.model');
const School = require('../models/school.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const Attendance = require('../models/attendance.model');

const seedData = async () => {
  try {
    // 1. Connect to Database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database.');

    // 2. Clear Database
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await School.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Collections cleared.');

    // 3. Create Super Admin
    console.log('Creating default Super Admin...');
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@schoolerp.com',
      password: 'Admin@123',
      role: 'super_admin',
      isActive: true,
    });
    console.log('Super Admin created successfully.');

    // 4. Create Approved School
    console.log('Creating Greenwood High School...');
    const school = await School.create({
      name: 'Greenwood High School',
      schoolCode: 'GHS001',
      email: 'contact@greenwood.edu',
      phone: '+1 555-0199',
      address: '777 Forest Hills Ave',
      city: 'Seattle',
      state: 'WA',
      status: 'approved',
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
    });
    console.log('Greenwood High School created successfully.');

    // 5. Create School Admin user
    console.log('Creating School Admin account...');
    const schoolAdminUser = await User.create({
      name: 'Greenwood Admin',
      email: 'admin@greenwood.com',
      password: 'Admin@123',
      role: 'school_admin',
      school: school._id,
      isActive: true,
    });
    console.log('School Admin created.');

    // 6. Create 2 Teachers
    console.log('Creating Teachers...');
    const teacher1User = await User.create({
      name: 'Alice Smith',
      email: 'alice@greenwood.com',
      password: 'Teacher@123',
      role: 'teacher',
      school: school._id,
      isActive: true,
    });

    const teacher1Profile = await Teacher.create({
      user: teacher1User._id,
      school: school._id,
      employeeId: 'EMP001',
      phone: '+1 555-0211',
      gender: 'female',
      qualification: 'M.Sc. in Mathematics',
      subjects: ['Mathematics', 'Physics'],
      assignedClasses: ['10-A', '9-B'],
    });

    const teacher2User = await User.create({
      name: 'Bob Johnson',
      email: 'bob@greenwood.com',
      password: 'Teacher@123',
      role: 'teacher',
      school: school._id,
      isActive: true,
    });

    const teacher2Profile = await Teacher.create({
      user: teacher2User._id,
      school: school._id,
      employeeId: 'EMP002',
      phone: '+1 555-0222',
      gender: 'male',
      qualification: 'M.A. in English Literature',
      subjects: ['English', 'History'],
      assignedClasses: ['10-B', '8-A'],
    });
    console.log('Teachers created.');

    // 7. Create 5 Students
    console.log('Creating Students...');
    const studentsData = [
      { name: 'Charlie Brown', email: 'charlie@greenwood.com', rollNumber: 'R001', class: '10-A', section: 'A', dob: '2010-05-12', gender: 'male', phone: '+1 555-0301' },
      { name: 'Diana Prince', email: 'diana@greenwood.com', rollNumber: 'R002', class: '10-A', section: 'A', dob: '2010-08-22', gender: 'female', phone: '+1 555-0302' },
      { name: 'Evan Wright', email: 'evan@greenwood.com', rollNumber: 'R003', class: '10-A', section: 'A', dob: '2010-11-05', gender: 'male', phone: '+1 555-0303' },
      { name: 'Fiona Gallagher', email: 'fiona@greenwood.com', rollNumber: 'R004', class: '9-B', section: 'B', dob: '2011-02-14', gender: 'female', phone: '+1 555-0304' },
      { name: 'George Costanza', email: 'george@greenwood.com', rollNumber: 'R005', class: '9-B', section: 'B', dob: '2011-06-30', gender: 'male', phone: '+1 555-0305' },
    ];

    const students = [];
    for (const data of studentsData) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: 'Student@123',
        role: 'student',
        school: school._id,
        isActive: true,
      });

      const student = await Student.create({
        user: user._id,
        school: school._id,
        rollNumber: data.rollNumber,
        class: data.class,
        section: data.section,
        dateOfBirth: new Date(data.dob),
        gender: data.gender,
        phone: data.phone,
        address: '123 Greenwood Lane, Seattle, WA',
      });
      students.push(student);
    }
    console.log('Students created.');

    // 8. Create Attendance records
    console.log('Marking sample attendance...');
    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecords = [
      // Yesterday 10-A
      { student: students[0]._id, school: school._id, class: '10-A', section: 'A', date: yesterday, status: 'present', markedBy: teacher1User._id },
      { student: students[1]._id, school: school._id, class: '10-A', section: 'A', date: yesterday, status: 'present', markedBy: teacher1User._id },
      { student: students[2]._id, school: school._id, class: '10-A', section: 'A', date: yesterday, status: 'absent', markedBy: teacher1User._id },
      // Today 10-A
      { student: students[0]._id, school: school._id, class: '10-A', section: 'A', date: today, status: 'present', markedBy: teacher1User._id },
      { student: students[1]._id, school: school._id, class: '10-A', section: 'A', date: today, status: 'late', markedBy: teacher1User._id },
      { student: students[2]._id, school: school._id, class: '10-A', section: 'A', date: today, status: 'present', markedBy: teacher1User._id },
    ];

    await Attendance.create(attendanceRecords);
    console.log('Attendance records added.');

    console.log('\n=============================================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('DEMO CREDENTIALS:');
    console.log('\n1. Super Admin:');
    console.log('   Email:    superadmin@schoolerp.com');
    console.log('   Password: Admin@123');
    console.log('\n2. Greenwood School Admin:');
    console.log('   Email:    admin@greenwood.com');
    console.log('   Password: Admin@123');
    console.log('\n3. Teachers (Greenwood High):');
    console.log('   Email 1:  alice@greenwood.com (Class Teacher 10-A, 9-B)');
    console.log('   Email 2:  bob@greenwood.com (Class Teacher 10-B, 8-A)');
    console.log('   Password: Teacher@123');
    console.log('\n4. Students (Greenwood High):');
    console.log('   Email 1:  charlie@greenwood.com (10-A)');
    console.log('   Email 2:  diana@greenwood.com (10-A)');
    console.log('   Password: Student@123');
    console.log('=============================================================\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
