/**
 * Wraps asynchronous Express route handlers to catch rejected promises
 * and automatically forward errors to the global error handler middleware.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
