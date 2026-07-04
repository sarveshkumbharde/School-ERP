const { z } = require('zod');

const registerSchoolSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'School name is required' }).trim().min(2, 'School name must be at least 2 characters'),
    schoolCode: z.string({ required_error: 'School code is required' }).trim().min(3, 'School code must be at least 3 characters'),
    email: z.string({ required_error: 'School email is required' }).email('Invalid school email format'),
    phone: z.string({ required_error: 'School phone number is required' }).trim(),
    address: z.string({ required_error: 'School address is required' }).trim(),
    city: z.string({ required_error: 'City is required' }).trim(),
    state: z.string({ required_error: 'State is required' }).trim(),
    adminName: z.string({ required_error: 'Admin name is required' }).trim().min(2, 'Admin name must be at least 2 characters'),
    adminEmail: z.string({ required_error: 'Admin email is required' }).email('Invalid admin email format'),
    adminPassword: z.string({ required_error: 'Admin password is required' }).min(6, 'Admin password must be at least 6 characters long'),
  }),
});

module.exports = {
  registerSchoolSchema,
};
