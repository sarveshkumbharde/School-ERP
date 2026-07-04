const { z } = require('zod');

const createStudentSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
    rollNumber: z.string({ required_error: 'Roll number is required' }).trim(),
    class: z.string({ required_error: 'Class is required' }).trim(),
    section: z.string({ required_error: 'Section is required' }).trim().toUpperCase(),
    dateOfBirth: z.string({ required_error: 'Date of birth is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender must be male, female, or other' }),
    phone: z.string({ required_error: 'Phone number is required' }).trim(),
    address: z.string({ required_error: 'Address is required' }).trim(),
  }),
});

const updateStudentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    rollNumber: z.string().trim().optional(),
    class: z.string().trim().optional(),
    section: z.string().trim().toUpperCase().optional(),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
  }),
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
};
