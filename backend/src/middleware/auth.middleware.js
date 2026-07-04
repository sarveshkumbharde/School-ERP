const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const School = require('../models/school.model');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token = null;

    // Read token from cookies (preferred) or Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route. Please log in.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('User account is deactivated.', 403));
    }

    // If user is not super admin, check if their school is active/approved
    if (user.role !== 'super_admin') {
      if (!user.school) {
        return next(new AppError('User is not associated with any school.', 403));
      }

      const school = await School.findById(user.school);
      if (!school) {
        return next(new AppError('Associated school not found.', 404));
      }

      if (school.status !== 'approved') {
        return next(
          new AppError(
            `Your school onboarding is ${school.status}. Please contact the Super Admin.`,
            403
          )
        );
      }
    }

    // Grant access and attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this route.`, 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
