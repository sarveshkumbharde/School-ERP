const { z } = require('zod');

const markAttendanceSchema = z.object({
  body: z.object({
    class: z.string({ required_error: 'Class is required' }).trim(),
    section: z.string({ required_error: 'Section is required' }).trim().toUpperCase(),
    date: z.string({ required_error: 'Date is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    records: z
      .array(
        z.object({
          student: z.string({ required_error: 'Student ID is required' }),
          status: z.enum(['present', 'absent', 'late'], {
            required_error: 'Status must be present, absent, or late',
          }),
        })
      )
      .min(1, 'At least one student record is required to mark attendance'),
  }),
});

module.exports = {
  markAttendanceSchema,
};
