const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School reference is required'],
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    subjects: {
      type: [String],
      required: [true, 'Subjects are required'],
      default: [],
    },
    assignedClasses: {
      type: [String], // Array of class-section strings, e.g. ["10-A", "9-B"]
      required: [true, 'Assigned classes are required'],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee employee ID is unique within the same school
teacherSchema.index({ school: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
