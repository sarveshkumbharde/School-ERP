const { z } = require('zod');

const createTeacherSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
    employeeId: z.string({ required_error: 'Employee ID is required' }).trim(),
    phone: z.string({ required_error: 'Phone number is required' }).trim(),
    gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender must be male, female, or other' }),
    qualification: z.string({ required_error: 'Qualification is required' }).trim(),
    subjects: z.array(z.string()).min(1, 'At least one subject must be specified'),
    assignedClasses: z.array(z.string()).min(1, 'At least one assigned class must be specified'),
  }),
});

const updateTeacherSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    employeeId: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    qualification: z.string().trim().optional(),
    subjects: z.array(z.string()).min(1).optional(),
    assignedClasses: z.array(z.string()).min(1).optional(),
  }),
});

module.exports = {
  createTeacherSchema,
  updateTeacherSchema,
};
