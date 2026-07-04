const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.slice(1).join('.'), // path is like ['body', 'email'], slice(1) joins 'email'
      message: err.message,
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
};

module.exports = validate;
